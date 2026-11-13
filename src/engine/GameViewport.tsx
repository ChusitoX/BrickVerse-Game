/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import confetti from 'canvas-confetti';
import {
  AvatarConfig,
  BrickWorldData,
  ChatMessage,
  OnlinePlayerState,
  PlayMode,
  RoomSessionInfo,
  UserSettings,
} from '../types/game';
import { buildCharacter, CharacterRig, EmoteType, EquippedItemType } from './characterBuilder';
import { WorldRenderer } from './worldRenderer';
import { CameraController } from './cameraController';
import { sound } from '../audio/soundEngine';
import { StorageManager } from '../storage/worldStorage';
import { DailyMissionsModal } from '../components/DailyMissionsModal';
import { recordMissionAction } from '../utils/dailyMissions';
import { ConnectionStatus, multiplayerClient } from '../multiplayer/multiplayerClient';

interface GameViewportProps {
  worldData: BrickWorldData;
  avatarConfig: AvatarConfig;
  userSettings: UserSettings;
  onExitToMenu: () => void;
  onOpenAvatar?: () => void;
  isStudioTestPlay?: boolean;
  playMode?: PlayMode;
  playerNickname?: string;
  roomSession?: RoomSessionInfo | null;
  onSwitchToOffline?: () => void;
}

interface SimulatedBot {
  rig: CharacterRig;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  targetPos: THREE.Vector3;
  health: number;
  maxHealth: number;
  team: 'red' | 'blue' | 'impostor' | 'seeker' | 'zombie' | 'laser' | 'sumo' | 'boss' | 'soccer';
  name: string;
  attackCooldown: number;
  isGiant?: boolean;
}

interface PaintballProjectile {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;
  isLocal?: boolean;
}

interface RocketProjectile {
  mesh: THREE.Group;
  velocity: THREE.Vector3;
  life: number;
  isLocal?: boolean;
}

interface RemotePeer {
  id: string;
  nickname: string;
  team: 'red' | 'blue' | 'none';
  rig: CharacterRig;
  position: THREE.Vector3;
  targetPosition: THREE.Vector3;
  targetRotationY: number;
  velocity: THREE.Vector3;
  equippedItem: string;
  emote: string;
  isRagdolling: boolean;
  isGhost: boolean;
  health: number;
  score: number;
}

function createNameTagSprite(nickname: string, team: 'red' | 'blue' | 'none'): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const bgColor =
      team === 'red'
        ? 'rgba(185, 28, 28, 0.85)'
        : team === 'blue'
        ? 'rgba(29, 78, 216, 0.85)'
        : 'rgba(15, 23, 42, 0.82)';
    ctx.fillStyle = bgColor;
    ctx.beginPath();
    ctx.roundRect(16, 10, 224, 44, 14);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(nickname.slice(0, 16), 128, 32);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(mat);
  sprite.position.set(0, 4.9, 0);
  sprite.scale.set(4.2, 1.05, 1);
  return sprite;
}

export const GameViewport: React.FC<GameViewportProps> = ({
  worldData,
  avatarConfig,
  userSettings,
  onExitToMenu,
  onOpenAvatar,
  isStudioTestPlay = false,
  playMode = 'offline',
  playerNickname = 'Player',
  roomSession = null,
  onSwitchToOffline,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const isOnlineRoom = playMode === 'online' && !!roomSession;

  // Common HUD states
  const [health, setHealth] = useState(100);
  const [maxHealth] = useState(100);
  const [coins, setCoins] = useState(() => StorageManager.getPlayerStats().coins);
  const [isPaused, setIsPaused] = useState(false);
  const [gameMessage, setGameMessage] = useState<string>('');
  const [isMusicPlaying, setIsMusicPlaying] = useState(userSettings.musicEnabled);
  const [equippedItem, setEquippedItem] = useState<EquippedItemType>(
    worldData.gameMode === 'sword' ? 'sword' : 'none'
  );
  const [showEmotesMenu, setShowEmotesMenu] = useState(false);

  // Obby states
  const [obbyStage, setObbyStage] = useState(1);
  const [obbyTimer, setObbyTimer] = useState(0);
  const [isObbyComplete, setIsObbyComplete] = useState(false);

  // Disaster states
  const [disasterTimer, setDisasterTimer] = useState(60);

  // Pizza states
  const [pizzaOrder] = useState<'Cheese Pizza' | 'Pepperoni Pizza'>('Pepperoni Pizza');
  const [heldPizzaState, setHeldPizzaState] = useState<'none' | 'dough' | 'prepared' | 'baked'>('none');
  const [ovenTimer, setOvenTimer] = useState<number>(0);

  // Sword Arena states
  const [swordKills, setSwordKills] = useState(0);
  const [killFeed, setKillFeed] = useState<string[]>([]);

  // Speed Run states
  const [speedRunTimer, setSpeedRunTimer] = useState(0);
  const [isSpeedRunFinished, setIsSpeedRunFinished] = useState(false);

  // Mystery Mansion states
  const [mansionKeysFound, setMansionKeysFound] = useState(0);
  const [isMansionEscaped, setIsMansionEscaped] = useState(false);

  // Hide & Seek states
  const [hideSeekTimer, setHideSeekTimer] = useState(60);
  const [isHideSeekWon, setIsHideSeekWon] = useState(false);

  // Ragdoll & Floor is Lava states
  const [isRagdolling, setIsRagdolling] = useState(worldData.gameMode === 'ragdoll');
  const isRagdollingRef = useRef(worldData.gameMode === 'ragdoll');
  const [ragdollScore, setRagdollScore] = useState(0);
  const [lavaHeight, setLavaHeight] = useState(0);
  const [isLavaEscaped, setIsLavaEscaped] = useState(false);

  // Daily Missions modal state
  const [isDailyMissionsOpen, setIsDailyMissionsOpen] = useState(false);

  // Mega Expansion: Zombie Defense states
  const [zombieWave, setZombieWave] = useState(1);
  const [, setZombiesKilledCount] = useState(0);

  // Mega Expansion: Paintball CTF states
  const [ctfScore, setCtfScore] = useState({ red: 0, blue: 0 });
  const [hasFlag, setHasFlag] = useState<'none' | 'red' | 'blue'>('none');
  const hasFlagRef = useRef<'none' | 'red' | 'blue'>('none');

  // Mega Expansion: Rollercoaster states
  const [isCoasterRiding, setIsCoasterRiding] = useState(false);
  const isCoasterRidingRef = useRef(false);

  // Mega Expansion: Prop Hunt states
  const [propDisguise, setPropDisguise] = useState<'none' | 'crate' | 'barrel' | 'locker'>('none');
  const propDisguiseRef = useRef<'none' | 'crate' | 'barrel' | 'locker'>('none');

  // Mega Expansion: Kart Speedway states
  const [kartLap, setKartLap] = useState(1);
  const [kartLapTimer, setKartLapTimer] = useState(0);
  const [kartBestTime, setKartBestTime] = useState(() => StorageManager.getPlayerStats().kartBestTime || 0);
  const passedHalfwayRef = useRef(false);

  // Mega Expansion: Laser Tag states
  const [laserHits, setLaserHits] = useState(0);

  // Mega Expansion: Jetpack & Ghost states
  const [jetpackFuel, setJetpackFuel] = useState(100);
  const [, setIsGhostActive] = useState(false);
  const isGhostRef = useRef(false);

  // Mega 42-Game Expansion states
  const [soccerScore, setSoccerScore] = useState({ red: 0, blue: 0 });
  const [bossHealth, setBossHealth] = useState(500);
  const [sumoKnockouts, setSumoKnockouts] = useState(0);

  // Online Multiplayer HUD states
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(() =>
    isOnlineRoom ? multiplayerClient.getStatus() : 'disconnected'
  );
  const [roomPlayers, setRoomPlayers] = useState<OnlinePlayerState[]>(() => roomSession?.players || []);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => roomSession?.chatMessages || []);
  const [chatInput, setChatInput] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(isOnlineRoom && !userSettings.showTouchControls);
  const [showPlayersDrawer, setShowPlayersDrawer] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const chatLogRef = useRef<HTMLDivElement>(null);
  const isChatFocusedRef = useRef(false);

  // Mobile touch controls state
  const touchJoystickRef = useRef<{ active: boolean; dx: number; dy: number }>({ active: false, dx: 0, dy: 0 });
  const [joystickKnob, setJoystickKnob] = useState<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });
  const [showMobileGear, setShowMobileGear] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFirstPerson, setIsFirstPerson] = useState(false);

  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const playerRigRef = useRef<CharacterRig | null>(null);
  const cameraControllerRef = useRef<CameraController | null>(null);
  const triggerActionRef = useRef<() => void>(() => {});
  const triggerInteractRef = useRef<() => void>(() => {});

  const currentItemRef = useRef<EquippedItemType>(
    worldData.gameMode === 'sword' ? 'sword' : 'none'
  );

  useEffect(() => {
    if (!isOnlineRoom) return;
    const unsubStatus = multiplayerClient.onStatus(setConnectionStatus);
    return () => {
      unsubStatus();
    };
  }, [isOnlineRoom]);

  useEffect(() => {
    if (chatLogRef.current) {
      chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
    }
  }, [chatMessages, isChatOpen]);

  const handleCopyRoomCode = () => {
    if (!roomSession?.roomCode) return;
    sound.playClick();
    navigator.clipboard?.writeText(roomSession.roomCode).catch(() => {});
    setCodeCopied(true);
    window.setTimeout(() => setCodeCopied(false), 1800);
  };

  const handleSendChat = (e?: React.FormEvent) => {
    e?.preventDefault();
    const cleaned = chatInput.trim();
    if (!cleaned || !isOnlineRoom) return;
    multiplayerClient.sendChat(cleaned);
    setChatInput('');
  };

  // Toggle Ragdoll Tumble
  const toggleRagdoll = () => {
    try {
      navigator?.vibrate?.(20);
    } catch {
      // ignore
    }
    setIsRagdolling((prev) => {
      const next = !prev;
      isRagdollingRef.current = next;
      if (next) {
        sound.playSlideWhistle();
        setGameMessage('Ragdoll Floppy Mode: ON! (R to stand up) 🤸');
      } else {
        sound.playJump();
        setGameMessage('Standing back up! 🧍');
      }
      window.setTimeout(() => setGameMessage(''), 2500);
      return next;
    });
  };

  // Toggle Camera 1st / 3rd Person
  const toggleCameraPerspective = () => {
    try {
      navigator?.vibrate?.(12);
    } catch {
      // ignore
    }
    if (cameraControllerRef.current) {
      const is1st = cameraControllerRef.current.togglePerspective();
      setIsFirstPerson(is1st);
      setGameMessage(is1st ? 'View: 1st Person POV 👁️' : 'View: 3rd Person Orbit 🎥');
      window.setTimeout(() => setGameMessage(''), 1800);
    }
  };

  // Toggle Fullscreen for native mobile app feel
  const toggleFullscreen = () => {
    try {
      navigator?.vibrate?.(15);
    } catch {
      // ignore
    }
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Trigger emote on character
  const triggerEmote = (emote: EmoteType) => {
    try {
      navigator?.vibrate?.(15);
    } catch {
      // ignore
    }
    sound.playClick();
    if (playerRigRef.current) {
      playerRigRef.current.playEmote(emote);
      setGameMessage(`Emote: ${emote.toUpperCase()}! 🕺`);
      window.setTimeout(() => setGameMessage(''), 2000);
    }
    setShowEmotesMenu(false);
  };

  // Toggle BGM
  const toggleMusic = () => {
    const next = !isMusicPlaying;
    setIsMusicPlaying(next);
    sound.setMusicEnabled(next);
  };

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 1. Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl && userSettings.shadowsEnabled;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const onContextLost = (e: Event) => {
      e.preventDefault();
    };
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);

    // 2. Scene & Lighting
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(worldData.environment.skyColor);
    scene.fog = new THREE.FogExp2(worldData.environment.skyColor, worldData.environment.fogDensity);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    const hemisphereLight = new THREE.HemisphereLight(
      new THREE.Color(worldData.environment.ambientColor),
      new THREE.Color('#334155'),
      0.9
    );
    scene.add(hemisphereLight);

    const sunLight = new THREE.DirectionalLight(0xfffbeb, worldData.environment.sunIntensity);
    sunLight.position.set(...worldData.environment.sunPosition);
    if (renderer.shadowMap.enabled) {
      sunLight.castShadow = true;
      sunLight.shadow.mapSize.width = 1024;
      sunLight.shadow.mapSize.height = 1024;
      sunLight.shadow.camera.near = 5;
      sunLight.shadow.camera.far = 180;
      const d = 45;
      sunLight.shadow.camera.left = -d;
      sunLight.shadow.camera.right = d;
      sunLight.shadow.camera.top = d;
      sunLight.shadow.camera.bottom = -d;
      sunLight.shadow.bias = -0.0005;
      sunLight.shadow.normalBias = 0.02;
    }
    scene.add(sunLight);

    // 3. Camera & Controller
    const camera = new THREE.PerspectiveCamera(userSettings.fov, width / height, 0.1, 1000);
    const cameraController = new CameraController(camera);
    cameraController.sensitivity = userSettings.mouseSensitivity;
    cameraController.invertY = userSettings.invertY;
    cameraControllerRef.current = cameraController;

    // 4. World Renderer
    const worldRenderer = new WorldRenderer(scene);
    worldRenderer.loadWorld(worldData.parts);

    // 5. Player Character Rig
    const playerRig = buildCharacter(avatarConfig);
    scene.add(playerRig.root);
    playerRigRef.current = playerRig;

    if (worldData.gameMode === 'sword') {
      playerRig.setEquippedItem('sword');
    }

    // Player Physics State
    const playerPos = new THREE.Vector3(...worldData.spawnPoint);
    playerRig.root.position.copy(playerPos);
    let playerVelocity = new THREE.Vector3();
    let isGrounded = false;
    let spawnCheckpoint = new THREE.Vector3(...worldData.spawnPoint);
    let attackCooldown = 0;
    let attackProgress = 0;
    let currentHealth = 100;
    let speedMultiplier = 1.0;
    let gravityMultiplier = 1.0;

    // Remote Multiplayer Peers Registry
    const remotePeers = new Map<string, RemotePeer>();

    const spawnOrUpdatePeer = (p: OnlinePlayerState) => {
      if (!roomSession || p.id === roomSession.playerId) return;
      let existing = remotePeers.get(p.id);
      if (!existing) {
        const peerRig = buildCharacter({ ...avatarConfig, ...(p.avatarConfig || {}) });
        const tag = createNameTagSprite(p.nickname, p.team);
        peerRig.root.add(tag);
        if (p.equippedItem && p.equippedItem !== 'none') {
          peerRig.setEquippedItem(p.equippedItem as EquippedItemType);
        }
        const startPos = new THREE.Vector3(p.position[0] || 0, p.position[1] || 2, p.position[2] || 0);
        peerRig.root.position.copy(startPos);
        peerRig.root.rotation.y = p.rotationY || 0;
        scene.add(peerRig.root);

        existing = {
          id: p.id,
          nickname: p.nickname,
          team: p.team || 'none',
          rig: peerRig,
          position: startPos.clone(),
          targetPosition: startPos.clone(),
          targetRotationY: p.rotationY || 0,
          velocity: new THREE.Vector3(p.velocity?.[0] || 0, p.velocity?.[1] || 0, p.velocity?.[2] || 0),
          equippedItem: p.equippedItem || 'none',
          emote: p.emote || 'none',
          isRagdolling: !!p.isRagdolling,
          isGhost: !!p.isGhost,
          health: p.health ?? 100,
          score: p.score ?? 0,
        };
        remotePeers.set(p.id, existing);
      } else {
        existing.targetPosition.set(p.position[0] || 0, p.position[1] || 2, p.position[2] || 0);
        existing.targetRotationY = p.rotationY || 0;
        existing.velocity.set(p.velocity?.[0] || 0, p.velocity?.[1] || 0, p.velocity?.[2] || 0);
        if (p.equippedItem !== existing.equippedItem) {
          existing.equippedItem = p.equippedItem;
          existing.rig.setEquippedItem((p.equippedItem || 'none') as EquippedItemType);
        }
        if (p.emote && p.emote !== 'none' && p.emote !== existing.emote) {
          existing.rig.playEmote(p.emote as EmoteType);
        }
        existing.emote = p.emote || 'none';
        existing.isRagdolling = !!p.isRagdolling;
        existing.isGhost = !!p.isGhost;
        existing.rig.root.visible = !existing.isGhost;
        existing.health = p.health ?? 100;
        existing.score = p.score ?? 0;
      }
    };

    const removePeer = (playerId: string) => {
      const peer = remotePeers.get(playerId);
      if (peer) {
        scene.remove(peer.rig.root);
        remotePeers.delete(playerId);
      }
    };

    if (isOnlineRoom && roomSession) {
      roomSession.players.forEach((p) => spawnOrUpdatePeer(p));
      setCtfScore({ red: roomSession.scores.ctfRed, blue: roomSession.scores.ctfBlue });
      setZombieWave(roomSession.scores.zombieWave || 1);
    }

    // Start background music
    if (userSettings.musicEnabled) {
      sound.startBGM();
    }

    // Paintballs in scene
    const paintballs: PaintballProjectile[] = [];

    // Bots array
    const bots: SimulatedBot[] = [];

    // Spawn AI bots based on game mode
    if (worldData.gameMode === 'sword') {
      const botConfigs = [
        { name: 'Knight_Blaze', color: '#dc2626' },
        { name: 'Shadow_Brick', color: '#0284c7' },
        { name: 'Blue_Duelist', color: '#0284c7' },
        { name: 'Red_Champion', color: '#dc2626' },
      ];
      botConfigs.forEach((b, idx) => {
        const bRig = buildCharacter({
          ...avatarConfig,
          headColor: '#facc15',
          torsoColor: b.color,
          face: 'evil',
          hat: 'valkyrie',
          backAccessory: 'sword',
          shirtPattern: 'armor',
        });
        bRig.setEquippedItem('sword');
        scene.add(bRig.root);
        const bPos = new THREE.Vector3((idx - 1.5) * 14, 2.0, idx % 2 === 0 ? 12 : -12);
        bRig.root.position.copy(bPos);
        bots.push({
          rig: bRig,
          position: bPos,
          velocity: new THREE.Vector3(),
          targetPos: bPos.clone(),
          health: 100,
          maxHealth: 100,
          team: idx % 2 === 0 ? 'red' : 'blue',
          name: b.name,
          attackCooldown: 0,
        });
      });
    } else if (worldData.gameMode === 'murder') {
      // Impostor Bot stalking the mansion
      const impRig = buildCharacter({
        ...avatarConfig,
        headColor: '#1e293b',
        torsoColor: '#dc2626',
        face: 'evil',
        hat: 'fedora',
        backAccessory: 'sword',
        shirtPattern: 'classic',
      });
      impRig.setEquippedItem('sword');
      scene.add(impRig.root);
      const bPos = new THREE.Vector3(0, 2.0, -10);
      impRig.root.position.copy(bPos);
      bots.push({
        rig: impRig,
        position: bPos,
        velocity: new THREE.Vector3(),
        targetPos: bPos.clone(),
        health: 120,
        maxHealth: 120,
        team: 'impostor',
        name: 'The Impostor',
        attackCooldown: 0,
      });
    } else if (worldData.gameMode === 'hide_seek') {
      // Giant Seeker Bot roaming the playroom
      const seekerRig = buildCharacter({
        ...avatarConfig,
        headColor: '#dc2626',
        torsoColor: '#1e293b',
        face: 'stare',
        hat: 'viking',
        backAccessory: 'wings',
        shirtPattern: 'stripes',
      });
      seekerRig.root.scale.set(2.4, 2.4, 2.4); // Giant scale!
      scene.add(seekerRig.root);
      const bPos = new THREE.Vector3(0, 4.0, -25);
      seekerRig.root.position.copy(bPos);
      bots.push({
        rig: seekerRig,
        position: bPos,
        velocity: new THREE.Vector3(),
        targetPos: bPos.clone(),
        health: 500,
        maxHealth: 500,
        team: 'seeker',
        name: 'Giant Seeker',
        attackCooldown: 0,
        isGiant: true,
      });
    } else if (worldData.gameMode === 'zombie_defense') {
      // 6 Mutant Zombie bots outside fort perimeter
      for (let i = 0; i < 6; i++) {
        const zRig = buildCharacter({
          ...avatarConfig,
          headColor: '#16a34a',
          torsoColor: '#15803d',
          face: 'evil',
          hat: 'none',
          backAccessory: 'none',
          shirtPattern: 'classic',
        });
        scene.add(zRig.root);
        const ang = (i / 6) * Math.PI * 2;
        const dist = 28 + (i % 2) * 8;
        const bPos = new THREE.Vector3(Math.cos(ang) * dist, 1.5, Math.sin(ang) * dist);
        zRig.root.position.copy(bPos);
        bots.push({
          rig: zRig,
          position: bPos,
          velocity: new THREE.Vector3(),
          targetPos: bPos.clone(),
          health: 80,
          maxHealth: 80,
          team: 'zombie',
          name: `Zombie_${i + 1}`,
          attackCooldown: 0,
        });
      }
    } else if (worldData.gameMode === 'paintball_ctf') {
      // 2 Red Defenders & 2 Blue Defenders
      const ctfBots = [
        { name: 'Red_Defender', team: 'red' as const, pos: [-24, 2, 8] },
        { name: 'Red_Striker', team: 'red' as const, pos: [-18, 2, -8] },
        { name: 'Blue_Defender', team: 'blue' as const, pos: [24, 2, 8] },
        { name: 'Blue_Striker', team: 'blue' as const, pos: [18, 2, -8] },
      ];
      ctfBots.forEach((cb) => {
        const cRig = buildCharacter({
          ...avatarConfig,
          headColor: '#facc15',
          torsoColor: cb.team === 'red' ? '#dc2626' : '#2563eb',
          face: 'chill',
          hat: 'cap',
          backAccessory: 'none',
          shirtPattern: 'classic',
        });
        cRig.setEquippedItem('paintball_gun');
        scene.add(cRig.root);
        const bPos = new THREE.Vector3(...cb.pos);
        cRig.root.position.copy(bPos);
        bots.push({
          rig: cRig,
          position: bPos,
          velocity: new THREE.Vector3(),
          targetPos: bPos.clone(),
          health: 100,
          maxHealth: 100,
          team: cb.team,
          name: cb.name,
          attackCooldown: 0,
        });
      });
    } else if (worldData.gameMode === 'laser_tag') {
      // 4 Cyber Bots in neon labyrinth
      const colors = ['#06b6d4', '#ec4899', '#facc15', '#10b981'];
      for (let i = 0; i < 4; i++) {
        const ltRig = buildCharacter({
          ...avatarConfig,
          headColor: '#0f172a',
          torsoColor: colors[i],
          face: 'cyborg',
          hat: 'halo',
          backAccessory: 'wings',
          shirtPattern: 'cyber',
        });
        ltRig.setEquippedItem('laser_katana');
        scene.add(ltRig.root);
        const ang = (i / 4) * Math.PI * 2;
        const bPos = new THREE.Vector3(Math.cos(ang) * 20, 1.5, Math.sin(ang) * 20);
        ltRig.root.position.copy(bPos);
        bots.push({
          rig: ltRig,
          position: bPos,
          velocity: new THREE.Vector3(),
          targetPos: bPos.clone(),
          health: 100,
          maxHealth: 100,
          team: 'laser',
          name: `CyberBot_${i + 1}`,
          attackCooldown: 0,
        });
      }
    } else if (worldData.gameMode === 'prop_hunt') {
      // 2 Seeker bots searching the warehouse/school
      for (let i = 0; i < 2; i++) {
        const sRig = buildCharacter({
          ...avatarConfig,
          headColor: '#1e293b',
          torsoColor: '#eab308',
          face: 'stare',
          hat: 'fedora',
          backAccessory: 'none',
          shirtPattern: 'police',
        });
        sRig.setEquippedItem('slap_hand');
        scene.add(sRig.root);
        const bPos = new THREE.Vector3(i === 0 ? -16 : 16, 1.5, -18);
        sRig.root.position.copy(bPos);
        bots.push({
          rig: sRig,
          position: bPos,
          velocity: new THREE.Vector3(),
          targetPos: bPos.clone(),
          health: 150,
          maxHealth: 150,
          team: 'seeker',
          name: `Seeker_${i + 1}`,
          attackCooldown: 0,
        });
      }
    } else if (worldData.gameMode === 'sumo') {
      // 4 Sumo Rival Bots on the Dohyo Ring
      const sumoColors = ['#dc2626', '#2563eb', '#16a34a', '#9333ea'];
      for (let i = 0; i < 4; i++) {
        const smRig = buildCharacter({
          ...avatarConfig,
          headColor: '#facc15',
          torsoColor: sumoColors[i],
          face: 'evil',
          hat: 'viking',
          backAccessory: 'none',
          shirtPattern: 'stripes',
        });
        smRig.setEquippedItem('slap_hand');
        scene.add(smRig.root);
        const ang = (i / 4) * Math.PI * 2;
        const bPos = new THREE.Vector3(Math.cos(ang) * 12, 3.0, Math.sin(ang) * 12);
        smRig.root.position.copy(bPos);
        bots.push({
          rig: smRig,
          position: bPos,
          velocity: new THREE.Vector3(),
          targetPos: bPos.clone(),
          health: 400,
          maxHealth: 400,
          team: 'sumo',
          name: `SumoBot_${i + 1}`,
          attackCooldown: 0,
        });
      }
    } else if (worldData.gameMode === 'boss_raid') {
      // 1 Colossal Titan Mech Boss + 3 Cyber Guards
      const bossRig = buildCharacter({
        ...avatarConfig,
        headColor: '#991b1b',
        torsoColor: '#1e293b',
        face: 'cyborg',
        hat: 'valkyrie',
        backAccessory: 'wings',
        shirtPattern: 'armor',
      });
      bossRig.setEquippedItem('laser_katana');
      bossRig.root.scale.set(2.8, 2.8, 2.8);
      scene.add(bossRig.root);
      const bossPos = new THREE.Vector3(0, 4.0, -18);
      bossRig.root.position.copy(bossPos);
      bots.push({
        rig: bossRig,
        position: bossPos,
        velocity: new THREE.Vector3(),
        targetPos: bossPos.clone(),
        health: 500,
        maxHealth: 500,
        team: 'boss',
        name: 'Titan Mech Boss',
        attackCooldown: 0,
        isGiant: true,
      });

      for (let i = 0; i < 3; i++) {
        const gRig = buildCharacter({
          ...avatarConfig,
          headColor: '#0f172a',
          torsoColor: '#dc2626',
          face: 'cyborg',
          hat: 'halo',
          backAccessory: 'none',
          shirtPattern: 'cyber',
        });
        gRig.setEquippedItem('sword');
        scene.add(gRig.root);
        const bPos = new THREE.Vector3((i - 1) * 14, 2.0, -10);
        gRig.root.position.copy(bPos);
        bots.push({
          rig: gRig,
          position: bPos,
          velocity: new THREE.Vector3(),
          targetPos: bPos.clone(),
          health: 100,
          maxHealth: 100,
          team: 'laser',
          name: `MechGuard_${i + 1}`,
          attackCooldown: 0,
        });
      }
    } else if (worldData.gameMode === 'moon_gravity') {
      // 4 Orbital Cyber Bots in Zero-G
      const colors = ['#06b6d4', '#a855f7', '#38bdf8', '#f472b6'];
      for (let i = 0; i < 4; i++) {
        const mgRig = buildCharacter({
          ...avatarConfig,
          headColor: '#e2e8f0',
          torsoColor: colors[i],
          face: 'cyborg',
          hat: 'halo',
          backAccessory: 'jetpack',
          shirtPattern: 'cyber',
        });
        mgRig.setEquippedItem('laser_katana');
        scene.add(mgRig.root);
        const ang = (i / 4) * Math.PI * 2;
        const bPos = new THREE.Vector3(Math.cos(ang) * 18, 2.5, Math.sin(ang) * 18);
        mgRig.root.position.copy(bPos);
        bots.push({
          rig: mgRig,
          position: bPos,
          velocity: new THREE.Vector3(),
          targetPos: bPos.clone(),
          health: 100,
          maxHealth: 100,
          team: 'laser',
          name: `AstroBot_${i + 1}`,
          attackCooldown: 0,
        });
      }
    } else if (worldData.gameMode === 'soccer') {
      // 2 Playful Soccer Bots
      const sTeams = [
        { name: 'Red_Striker', color: '#dc2626', pos: [0, 2, 16] },
        { name: 'Blue_Keeper', color: '#2563eb', pos: [0, 2, -24] },
      ];
      sTeams.forEach((sb) => {
        const sRig = buildCharacter({
          ...avatarConfig,
          headColor: '#facc15',
          torsoColor: sb.color,
          face: 'chill',
          hat: 'cap',
          backAccessory: 'none',
          shirtPattern: 'stripes',
        });
        scene.add(sRig.root);
        const bPos = new THREE.Vector3(...sb.pos);
        sRig.root.position.copy(bPos);
        bots.push({
          rig: sRig,
          position: bPos,
          velocity: new THREE.Vector3(),
          targetPos: bPos.clone(),
          health: 999,
          maxHealth: 999,
          team: 'soccer',
          name: sb.name,
          attackCooldown: 0,
        });
      });
    }

    // Track timers & coin orientation cleanup
    let isDisposed = false;
    const activeTimers: number[] = [];
    const safeTimeout = (fn: () => void, ms: number) => {
      const id = window.setTimeout(() => {
        if (!isDisposed) fn();
      }, ms);
      activeTimers.push(id);
      return id;
    };

    // Orient coin pickups upright
    worldRenderer.renderedParts.forEach((rp) => {
      if (rp.partData.metadata?.isCoinPickup) {
        rp.mesh.rotation.x = Math.PI / 2;
      }
    });

    // Interactive 3D Soccer Ball
    let soccerBallMesh: THREE.Mesh | null = null;
    const soccerBallPos = new THREE.Vector3(0, 2.55, 0);
    const soccerBallVel = new THREE.Vector3(0, 0, 0);
    let soccerGoalCooldown = 0;

    if (worldData.gameMode === 'soccer') {
      const ballCanvas = document.createElement('canvas');
      ballCanvas.width = 128;
      ballCanvas.height = 128;
      const bctx = ballCanvas.getContext('2d');
      if (bctx) {
        bctx.fillStyle = '#ffffff';
        bctx.fillRect(0, 0, 128, 128);
        bctx.fillStyle = '#0f172a';
        for (let row = 0; row < 4; row++) {
          for (let col = 0; col < 4; col++) {
            if ((row + col) % 2 === 0) {
              bctx.fillRect(col * 32 + 4, row * 32 + 4, 24, 24);
            }
          }
        }
      }
      const ballTex = new THREE.CanvasTexture(ballCanvas);
      ballTex.colorSpace = THREE.SRGBColorSpace;
      soccerBallMesh = new THREE.Mesh(
        new THREE.SphereGeometry(1.5, 20, 16),
        new THREE.MeshStandardMaterial({ map: ballTex, roughness: 0.4, metalness: 0.1 })
      );
      soccerBallMesh.position.copy(soccerBallPos);
      soccerBallMesh.castShadow = true;
      scene.add(soccerBallMesh);
    }

    // Rollercoaster Train
    const coasterTrain = new THREE.Group();
    if (worldData.gameMode === 'rollercoaster') {
      for (let c = 0; c < 3; c++) {
        const car = new THREE.Mesh(
          new THREE.BoxGeometry(3.2, 1.4, 4),
          new THREE.MeshStandardMaterial({
            color: c === 0 ? 0xef4444 : 0x0284c7,
            metalness: 0.7,
            roughness: 0.2,
          })
        );
        car.position.set(0, 0, c * -4.5);
        coasterTrain.add(car);
      }
      scene.add(coasterTrain);
    }
    let coasterT = 0;

    // Rockets array
    const rockets: RocketProjectile[] = [];
    let disasterRoundTime = 60;
    let tornadoAngle = 0;
    const tornadoPos = new THREE.Vector3(0, 0, 0);

    const tornadoGroup = new THREE.Group();
    const tornadoFunnel = new THREE.Mesh(
      new THREE.CylinderGeometry(14, 2, 28, 16, 4, true),
      new THREE.MeshStandardMaterial({
        color: 0x475569,
        wireframe: true,
        transparent: true,
        opacity: 0.5,
      })
    );
    tornadoGroup.add(tornadoFunnel);
    scene.add(tornadoGroup);
    tornadoGroup.visible = worldData.gameMode === 'disaster';

    // Rising Lava / Flood Mesh for Floor is Lava & Tsunami Flood Escape
    const isFloodWorld = worldData.id === 'game_flood_escape';
    let currentLavaY = 0;
    const lavaMesh = new THREE.Mesh(
      new THREE.BoxGeometry(120, 2, 120),
      new THREE.MeshStandardMaterial({
        color: isFloodWorld ? 0x0284c7 : 0xdc2626,
        emissive: isFloodWorld ? 0x0ea5e9 : 0xf97316,
        emissiveIntensity: isFloodWorld ? 0.55 : 0.95,
        roughness: isFloodWorld ? 0.15 : 0.3,
        transparent: isFloodWorld,
        opacity: isFloodWorld ? 0.82 : 1.0,
      })
    );
    lavaMesh.position.set(0, 0, 0);
    lavaMesh.visible = worldData.gameMode === 'floor_lava';
    scene.add(lavaMesh);

    // Banana peels array
    const bananaPeels: { mesh: THREE.Group; position: THREE.Vector3; life: number }[] = [];

    // Respawn helper
    const respawnPlayer = () => {
      sound.playOof();
      playerPos.copy(spawnCheckpoint);
      playerVelocity.set(0, 0, 0);
      currentHealth = 100;
      setHealth(100);
      if (worldData.gameMode === 'floor_lava') {
        currentLavaY = 0;
        setLavaHeight(0);
      }
      setGameMessage('OOF! Respawned at checkpoint.');
      safeTimeout(() => setGameMessage(''), 2500);
    };

    // Unified Bot Defeat / Knockout Handler (Melee, Paintball, Rockets, Sumo Ring-outs)
    const handleBotDefeated = (bot: SimulatedBot, verb = 'Eliminated') => {
      sound.playCoin();
      sound.playOof();
      bot.health = 0;
      bot.rig.root.visible = false;
      confetti({ particleCount: bot.team === 'boss' ? 140 : 40, spread: 80, origin: { y: 0.6 } });

      if (worldData.gameMode === 'zombie_defense') {
        setCoins((c) => {
          const nc = c + 25;
          StorageManager.updatePlayerStats({
            coins: nc,
            zombiesKilled: (StorageManager.getPlayerStats().zombiesKilled || 0) + 1,
          });
          return nc;
        });
        setZombiesKilledCount((zc) => {
          const next = zc + 1;
          if (next % 6 === 0) {
            setZombieWave((w) => {
              const nw = w + 1;
              sound.playFanfare();
              setGameMessage(`WAVE ${nw} INCOMING! 🧟 High alert!`);
              return nw;
            });
          }
          return next;
        });
        setKillFeed((kf) => [`${verb} ${bot.name}! 🧟 +25 Coins`, ...kf.slice(0, 3)]);
        recordMissionAction('zombies', 1, 'zombie_defense');
        if (isOnlineRoom) multiplayerClient.sendScoreEvent('zombie_kill');
        safeTimeout(() => {
          bot.health = 80;
          const ang = Math.random() * Math.PI * 2;
          bot.position.set(Math.cos(ang) * 32, 1.5, Math.sin(ang) * 32);
          bot.velocity.set(0, 0, 0);
          bot.rig.root.position.copy(bot.position);
          bot.rig.root.visible = true;
        }, 5000);
      } else if (worldData.gameMode === 'laser_tag' || worldData.gameMode === 'moon_gravity') {
        setCoins((c) => {
          const nc = c + 35;
          StorageManager.updatePlayerStats({
            coins: nc,
            laserTagHits: (StorageManager.getPlayerStats().laserTagHits || 0) + 1,
          });
          return nc;
        });
        setLaserHits((h) => h + 1);
        setKillFeed((kf) => [`Tagged ${bot.name}! ⚡ +35 Coins`, ...kf.slice(0, 3)]);
        recordMissionAction('lasers', 1, 'laser_tag');
        if (isOnlineRoom) multiplayerClient.sendScoreEvent('point', { amount: 1 });
        safeTimeout(() => {
          bot.health = 100;
          bot.position.set((Math.random() - 0.5) * 30, 2.5, (Math.random() - 0.5) * 30);
          bot.velocity.set(0, 0, 0);
          bot.rig.root.position.copy(bot.position);
          bot.rig.root.visible = true;
        }, 4000);
      } else if (worldData.gameMode === 'sumo') {
        setSumoKnockouts((k) => k + 1);
        setCoins((c) => {
          const nc = c + 40;
          StorageManager.updatePlayerStats({ coins: nc });
          return nc;
        });
        setKillFeed((kf) => [`Knocked out ${bot.name}! 🥋 +40 Coins`, ...kf.slice(0, 3)]);
        if (isOnlineRoom) multiplayerClient.sendScoreEvent('point', { amount: 1 });
        safeTimeout(() => {
          bot.health = 400;
          bot.position.set((Math.random() - 0.5) * 10, 4.0, (Math.random() - 0.5) * 10);
          bot.velocity.set(0, 0, 0);
          bot.rig.root.position.copy(bot.position);
          bot.rig.root.visible = true;
        }, 3500);
      } else if (worldData.gameMode === 'boss_raid') {
        if (bot.team === 'boss') {
          sound.playFanfare();
          setBossHealth(0);
          setGameMessage('TITAN MECH DEFEATED! 🤖🏆 +300 BloxCoins!');
          setKillFeed((kf) => ['DESTROYED TITAN MECH BOSS! +300 Coins', ...kf.slice(0, 3)]);
          setCoins((c) => {
            const nc = c + 300;
            StorageManager.updatePlayerStats({
              coins: nc,
              bossesDefeated: (StorageManager.getPlayerStats().bossesDefeated || 0) + 1,
            });
            return nc;
          });
          if (isOnlineRoom) {
            multiplayerClient.sendScoreEvent('point', {
              amount: 5,
              announcement: `${playerNickname} destroyed the Titan Mech Boss!`,
            });
          }
          safeTimeout(() => {
            bot.health = 500;
            setBossHealth(500);
            bot.position.set(0, 4.0, -18);
            bot.velocity.set(0, 0, 0);
            bot.rig.root.position.copy(bot.position);
            bot.rig.root.visible = true;
            setGameMessage('A new Titan Mech Boss has entered the Colosseum! 🤖');
            safeTimeout(() => setGameMessage(''), 2500);
          }, 10000);
        } else {
          setCoins((c) => {
            const nc = c + 30;
            StorageManager.updatePlayerStats({ coins: nc });
            return nc;
          });
          setKillFeed((kf) => [`${verb} ${bot.name}! +30 Coins`, ...kf.slice(0, 3)]);
          safeTimeout(() => {
            bot.health = 100;
            bot.position.set((Math.random() - 0.5) * 28, 2.0, -14);
            bot.velocity.set(0, 0, 0);
            bot.rig.root.position.copy(bot.position);
            bot.rig.root.visible = true;
          }, 5000);
        }
      } else if (worldData.gameMode === 'paintball_ctf') {
        setCoins((c) => {
          const nc = c + 30;
          StorageManager.updatePlayerStats({ coins: nc });
          return nc;
        });
        setKillFeed((kf) => [`Splatted ${bot.name}! 🔫 +30 Coins`, ...kf.slice(0, 3)]);
        safeTimeout(() => {
          bot.health = 100;
          const spawnX = bot.team === 'red' ? -26 : 26;
          bot.position.set(spawnX, 2, (Math.random() - 0.5) * 16);
          bot.velocity.set(0, 0, 0);
          bot.rig.root.position.copy(bot.position);
          bot.rig.root.visible = true;
        }, 5000);
      } else if (worldData.gameMode === 'sword') {
        setSwordKills((k) => {
          const newKills = k + 1;
          StorageManager.updatePlayerStats({ swordKills: newKills });
          return newKills;
        });
        setKillFeed((kf) => [`${verb} ${bot.name}! ⚔️ +50 Coins`, ...kf.slice(0, 3)]);
        setCoins((c) => {
          const nc = c + 50;
          StorageManager.updatePlayerStats({ coins: nc });
          return nc;
        });
        safeTimeout(() => {
          bot.health = 100;
          bot.position.set((Math.random() - 0.5) * 32, 4, (Math.random() - 0.5) * 32);
          bot.velocity.set(0, 0, 0);
          bot.rig.root.position.copy(bot.position);
          bot.rig.root.visible = true;
        }, 5000);
      } else if (worldData.gameMode === 'murder') {
        setGameMessage('VICTORY! You defeated the Impostor! 🏆');
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
        setCoins((c) => {
          const nc = c + 150;
          StorageManager.updatePlayerStats({
            coins: nc,
            mansionEscapes: (StorageManager.getPlayerStats().mansionEscapes || 0) + 1,
          });
          return nc;
        });
      }
    };

    // Primary Action (Sword slash, slap, paintball shot, banana peel, or rubber chicken)
    const triggerAction = () => {
      if (attackCooldown > 0) return;
      attackCooldown = 0.35;
      attackProgress = 0.01;
      const currentItem = currentItemRef.current;

      if (currentItem === 'banana_peel') {
        sound.playClick();
        const peelGroup = new THREE.Group();
        peelGroup.position.copy(playerPos).add(new THREE.Vector3(0, 0.15, 0));
        const peelMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4 });
        for (let i = 0; i < 4; i++) {
          const petal = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.7, 6), peelMat);
          const ang = (i / 4) * Math.PI * 2;
          petal.position.set(Math.cos(ang) * 0.25, 0.1, Math.sin(ang) * 0.25);
          petal.rotation.z = Math.cos(ang) * 0.5;
          petal.rotation.x = Math.sin(ang) * 0.5;
          peelGroup.add(petal);
        }
        scene.add(peelGroup);
        bananaPeels.push({ mesh: peelGroup, position: peelGroup.position.clone(), life: 35 });
        setGameMessage('Banana peel dropped! Watch out for slips! 🍌');
        window.setTimeout(() => setGameMessage(''), 2500);
        return;
      }

      if (currentItem === 'rocket_launcher') {
        sound.playRocketBoom();
        const rGroup = new THREE.Group();
        rGroup.position.copy(playerPos).add(new THREE.Vector3(0, 1.8, 0));
        const dir = new THREE.Vector3();
        camera.getWorldDirection(dir);

        const rBody = new THREE.Mesh(
          new THREE.CylinderGeometry(0.18, 0.18, 1.2, 8),
          new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.8 })
        );
        rBody.rotation.x = Math.PI / 2;
        rGroup.add(rBody);
        const rNose = new THREE.Mesh(
          new THREE.ConeGeometry(0.2, 0.4, 8),
          new THREE.MeshStandardMaterial({ color: 0xfacc15 })
        );
        rNose.rotation.x = Math.PI / 2;
        rNose.position.set(0, 0, 0.7);
        rGroup.add(rNose);

        scene.add(rGroup);
        rockets.push({
          mesh: rGroup,
          velocity: dir.clone().multiplyScalar(42),
          life: 3.5,
          isLocal: true,
        });
        if (isOnlineRoom) {
          multiplayerClient.sendAttack(
            'rocket_launcher',
            [rGroup.position.x, rGroup.position.y, rGroup.position.z],
            [dir.x, dir.y, dir.z]
          );
        }
        return;
      }

      if (currentItem === 'grappling_hook') {
        sound.playSpeedBoost();
        const dir = new THREE.Vector3();
        camera.getWorldDirection(dir);
        playerVelocity.copy(dir.clone().multiplyScalar(42));
        playerVelocity.y = Math.max(playerVelocity.y + 18, 20);
        isGrounded = false;
        setGameMessage('Grapple Reeled! 🪝');
        window.setTimeout(() => setGameMessage(''), 1500);
        return;
      }

      if (currentItem === 'ghost_cloak') {
        sound.playSecretKey();
        setIsGhostActive(true);
        isGhostRef.current = true;
        setGameMessage('Ghost Cloak Active! 👻 Invisible to bots for 10s!');
        window.setTimeout(() => {
          setIsGhostActive(false);
          isGhostRef.current = false;
          setGameMessage('Ghost Cloak faded.');
          window.setTimeout(() => setGameMessage(''), 1500);
        }, 10000);
        return;
      }

      if (currentItem === 'super_pogo') {
        sound.playPogoBounce();
        playerVelocity.y = 35;
        isGrounded = false;
        return;
      }

      if (currentItem === 'rubber_chicken') {
        sound.playSqueak();
        window.setTimeout(() => sound.playBonk(), 120);
      } else if (currentItem === 'laser_katana') {
        sound.playLaserBeam();
        attackCooldown = 0.22;
      } else if (currentItem === 'paintball_gun') {
        sound.playPaintballShot();
        // Spawn bouncing paintball sphere
        const pGeom = new THREE.SphereGeometry(0.3, 8, 8);
        const pColors = [0xef4444, 0x06b6d4, 0x22c55e, 0xf59e0b, 0xec4899];
        const pMat = new THREE.MeshStandardMaterial({
          color: pColors[Math.floor(Math.random() * pColors.length)],
          emissive: 0xffffff,
          emissiveIntensity: 0.2,
        });
        const pMesh = new THREE.Mesh(pGeom, pMat);
        pMesh.position.copy(playerPos).add(new THREE.Vector3(0, 1.8, 0));

        // Direction forward from camera
        const dir = new THREE.Vector3();
        camera.getWorldDirection(dir);
        paintballs.push({
          mesh: pMesh,
          velocity: dir.clone().multiplyScalar(45),
          life: 3.0,
          isLocal: true,
        });
        scene.add(pMesh);
        if (isOnlineRoom) {
          multiplayerClient.sendAttack(
            'paintball_gun',
            [pMesh.position.x, pMesh.position.y, pMesh.position.z],
            [dir.x, dir.y, dir.z]
          );
        }
        return;
      } else if (currentItem === 'slap_hand') {
        sound.playHit();
      } else {
        sound.playSlash();
      }

      if (isOnlineRoom) {
        const dir = new THREE.Vector3();
        camera.getWorldDirection(dir);
        multiplayerClient.sendAttack(
          currentItem,
          [playerPos.x, playerPos.y + 1.5, playerPos.z],
          [dir.x, dir.y, dir.z]
        );
      }

      // Power-kick Soccer Ball when attacking near it
      if (worldData.gameMode === 'soccer' && soccerBallMesh) {
        const distBall = playerPos.distanceTo(soccerBallPos);
        if (distBall < 5.5) {
          const kickDir = soccerBallPos.clone().sub(playerPos);
          kickDir.y = 0;
          if (kickDir.lengthSq() < 0.01) kickDir.set(0, 0, 1);
          kickDir.normalize();
          soccerBallVel.addScaledVector(kickDir, 34);
          soccerBallVel.y = Math.max(soccerBallVel.y, 11);
          sound.playBounce();
        }
      }

      // Check hit on bots
      const attackRange =
        currentItem === 'slap_hand' || currentItem === 'rubber_chicken'
          ? 7.0
          : currentItem === 'laser_katana'
          ? 6.5
          : 5.5;
      const attackBox = new THREE.Box3().setFromCenterAndSize(
        playerPos.clone().add(new THREE.Vector3(0, 1.5, 0)),
        new THREE.Vector3(attackRange, 4, attackRange)
      );

      bots.forEach((bot) => {
        if (bot.health <= 0 || bot.team === 'soccer') return;
        const hitDist = bot.isGiant ? 6.0 : attackRange * 0.65;
        if (attackBox.containsPoint(bot.position) || bot.position.distanceTo(playerPos) < hitDist) {
          const damage =
            currentItem === 'slap_hand'
              ? 20
              : currentItem === 'rubber_chicken'
              ? 25
              : currentItem === 'laser_katana'
              ? 55
              : 35;
          bot.health -= damage;
          if (bot.team === 'boss') {
            setBossHealth(Math.max(0, Math.round(bot.health)));
          }
          if (currentItem === 'rubber_chicken') {
            sound.playBonk();
          } else if (currentItem === 'laser_katana') {
            sound.playLaserBeam();
          } else {
            sound.playHit();
          }

          // Knockback (boosted in Sumo Royale!)
          const sumoBoost = worldData.gameMode === 'sumo' ? 1.55 : 1.0;
          const knockScalar =
            (currentItem === 'slap_hand' ? 32 : currentItem === 'rubber_chicken' ? 38 : 18) * sumoBoost;
          const knock = bot.position.clone().sub(playerPos);
          if (knock.lengthSq() < 0.01) knock.set(0, 0, 1);
          knock.normalize().multiplyScalar(knockScalar);
          knock.y = currentItem === 'rubber_chicken' ? 14 : 9;
          bot.velocity.add(knock);

          if (bot.health <= 0) {
            handleBotDefeated(bot, 'Eliminated');
          }
        }
      });

      // Check melee hits on online remote players
      if (isOnlineRoom) {
        remotePeers.forEach((peer) => {
          if (peer.health <= 0) return;
          if (attackBox.containsPoint(peer.position)) {
            const damage =
              currentItem === 'slap_hand'
                ? 20
                : currentItem === 'rubber_chicken'
                ? 25
                : currentItem === 'laser_katana'
                ? 55
                : 35;
            const knockScalar =
              currentItem === 'slap_hand' ? 32 : currentItem === 'rubber_chicken' ? 38 : 18;
            const knock = peer.position.clone().sub(playerPos);
            if (knock.lengthSq() < 0.01) knock.set(0, 0, 1);
            knock.normalize().multiplyScalar(knockScalar);
            knock.y = currentItem === 'rubber_chicken' ? 14 : 8;
            sound.playHit();
            multiplayerClient.sendHit(peer.id, damage, [knock.x, knock.y, knock.z], currentItem);
          }
        });
      }
    };

    // Tycoon station interaction
    const triggerInteract = () => {
      if (worldData.gameMode === 'pizza') {
        const distDough = playerPos.distanceTo(new THREE.Vector3(-12, 2.2, -6));
        const distTopping = playerPos.distanceTo(new THREE.Vector3(-12, 2.2, -13));
        const distOven = playerPos.distanceTo(new THREE.Vector3(2, 2.5, -12));
        const distRegister = playerPos.distanceTo(new THREE.Vector3(0, 2.2, 2));

        if (distDough < 5.5) {
          setHeldPizzaState('dough');
          sound.playBuildPlace();
          setGameMessage('Picked up fresh dough! Walk to Topping Bar 🧀');
        } else if (distTopping < 5.5) {
          if (heldPizzaState === 'dough') {
            setHeldPizzaState('prepared');
            sound.playBuildPlace();
            setGameMessage('Added Sauce, Mozzarella & Pepperoni! Place into Conveyor Oven 🍕');
          } else {
            setGameMessage('Grab dough from the prep table first!');
          }
        } else if (distOven < 6.0) {
          if (heldPizzaState === 'prepared') {
            setHeldPizzaState('none');
            sound.playBuildPlace();
            setGameMessage('Baking in conveyor oven... 4s! 🔥');
            setOvenTimer(4);
          } else if (heldPizzaState === 'baked') {
            setGameMessage('Pizza is baked and boxed! Walk to the Front Desk to deliver! 📦');
          } else {
            setGameMessage('Prepare pizza toppings first!');
          }
        } else if (distRegister < 6.0) {
          if (heldPizzaState === 'baked') {
            setHeldPizzaState('none');
            sound.playCoin();
            sound.playCheckpoint();
            confetti({ particleCount: 35, spread: 70, origin: { y: 0.7 } });
            setCoins((c) => {
              const nc = c + 40;
              StorageManager.updatePlayerStats({
                coins: nc,
                pizzasDelivered: (StorageManager.getPlayerStats().pizzasDelivered || 0) + 1,
              });
              return nc;
            });
            setGameMessage('Order delivered! +40 BloxCoins! 🪙🎉');
          } else {
            setGameMessage('Bake a pizza to complete customer order!');
          }
        }
      }

      // Rollercoaster Boarding
      if (worldData.gameMode === 'rollercoaster') {
        const distToStation = playerPos.distanceTo(new THREE.Vector3(0, 4.3, 20));
        if (distToStation < 9.0) {
          setIsCoasterRiding((r) => {
            const next = !r;
            isCoasterRidingRef.current = next;
            if (next) {
              sound.playFanfare();
              setGameMessage('Boarded Coaster! Enjoy the sky loops! 🎢 Press E or Interact to Exit');
              recordMissionAction('coaster', 1, 'rollercoaster');
            } else {
              sound.playJump();
              playerPos.set(0, 4.5, 20);
              setGameMessage('Exited Coaster.');
            }
            return next;
          });
        } else {
          setGameMessage('Walk up to the Coaster Platform to board! 🎢');
        }
      }

      // Prop Hunt Disguise stations
      if (worldData.gameMode === 'prop_hunt') {
        const distCrate = playerPos.distanceTo(new THREE.Vector3(-6, 1.2, -6));
        const distBarrel = playerPos.distanceTo(new THREE.Vector3(6, 1.2, -6));
        const distLocker = playerPos.distanceTo(new THREE.Vector3(0, 2.0, -12));

        if (distCrate < 6.0) {
          sound.playDisguisePop();
          setPropDisguise('crate');
          propDisguiseRef.current = 'crate';
          setGameMessage('Disguised as: Wooden Crate! 📦 Stand still to fool seekers!');
          recordMissionAction('props', 1, 'prop_hunt');
        } else if (distBarrel < 6.0) {
          sound.playDisguisePop();
          setPropDisguise('barrel');
          propDisguiseRef.current = 'barrel';
          setGameMessage('Disguised as: Bio Barrel! 🛢️ Stand still to fool seekers!');
          recordMissionAction('props', 1, 'prop_hunt');
        } else if (distLocker < 6.0) {
          sound.playDisguisePop();
          setPropDisguise('locker');
          propDisguiseRef.current = 'locker';
          setGameMessage('Disguised as: Metal Locker! 🚪 Stand still to fool seekers!');
          recordMissionAction('props', 1, 'prop_hunt');
        }
      }
    };

    triggerActionRef.current = triggerAction;
    triggerInteractRef.current = triggerInteract;

    // Mobile touch look & pinch-to-zoom controls
    let lookTouchId: number | null = null;
    let prevLookPos = { x: 0, y: 0 };
    let initialPinchDist = 0;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        const rect = container.getBoundingClientRect();
        const relX = touch.clientX - rect.left;
        const relY = touch.clientY - rect.top;
        // Don't capture touches on bottom-left quadrant (where virtual joystick is)
        const isLeftBottom = relX < rect.width * 0.45 && relY > rect.height * 0.52;
        if (!isLeftBottom) {
          lookTouchId = touch.identifier;
          prevLookPos = { x: touch.clientX, y: touch.clientY };
        }
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        initialPinchDist = Math.hypot(dx, dy);
        lookTouchId = null;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && initialPinchDist > 0) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        const deltaDist = dist - initialPinchDist;
        cameraController.pinchZoom(deltaDist * 0.65);
        initialPinchDist = dist;
      } else if (lookTouchId !== null) {
        for (let i = 0; i < e.touches.length; i++) {
          const touch = e.touches[i];
          if (touch.identifier === lookTouchId) {
            const dx = touch.clientX - prevLookPos.x;
            const dy = touch.clientY - prevLookPos.y;
            prevLookPos = { x: touch.clientX, y: touch.clientY };
            cameraController.addTouchDelta(dx, dy);
            break;
          }
        }
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (lookTouchId !== null) {
        let stillActive = false;
        for (let i = 0; i < e.touches.length; i++) {
          if (e.touches[i].identifier === lookTouchId) {
            stillActive = true;
            break;
          }
        }
        if (!stillActive) {
          lookTouchId = null;
        }
      }
      if (e.touches.length < 2) {
        initialPinchDist = 0;
      }
    };

    // Keyboard handlers
    const onKeyDown = (e: KeyboardEvent) => {
      if (isChatFocusedRef.current) {
        if (e.code === 'Escape') {
          chatInputRef.current?.blur();
          isChatFocusedRef.current = false;
        }
        return;
      }

      if (e.code === 'KeyT' && isOnlineRoom) {
        e.preventDefault();
        setIsChatOpen(true);
        window.setTimeout(() => chatInputRef.current?.focus(), 30);
        return;
      }

      keysPressed.current[e.code] = true;

      if (e.code === 'KeyE') {
        triggerInteract();
      }
      if (e.code === 'KeyQ') {
        triggerAction();
      }
      if (e.code === 'KeyR') {
        toggleRagdoll();
      }
      if (e.code === 'KeyB') {
        // Toggle emote dance
        triggerEmote('breakdance');
      }
      if (e.code === 'Digit1') triggerEmote('breakdance');
      if (e.code === 'Digit2') triggerEmote('wave');
      if (e.code === 'Digit3') triggerEmote('backflip');
      if (e.code === 'Digit4') triggerEmote('robot');
      if (e.code === 'Digit5') triggerEmote('floss');
      if (e.code === 'Digit6') triggerEmote('worm');
      if (e.code === 'Digit7') triggerEmote('chicken_dance');
      if (e.code === 'Escape') {
        setIsPaused((p) => !p);
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = false;
    };

    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        triggerAction();
        triggerInteract();
      }
      cameraController.onPointerDown(e, e.button === 2);
    };

    const onMouseMove = (e: MouseEvent) => {
      cameraController.onPointerMove(e);
    };

    const onMouseUp = (e: MouseEvent) => {
      cameraController.onPointerUp();
    };

    const onWheel = (e: WheelEvent) => {
      cameraController.onWheel(e.deltaY);
    };

    const onContextMenu = (e: MouseEvent) => e.preventDefault();

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('wheel', onWheel, { passive: true });
    container.addEventListener('contextmenu', onContextMenu);
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: true });
    container.addEventListener('touchend', onTouchEnd, { passive: true });
    container.addEventListener('touchcancel', onTouchEnd, { passive: true });

    const onResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    const clock = new THREE.Clock();
    let frameId = 0;
    let timerAccumulator = 0;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 60);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    // ---------------------------------------------
    // MAIN 60FPS SIMULATION LOOP
    // ---------------------------------------------
    const tick = () => {
      const delta = Math.min(clock.getDelta(), 0.05);

      if (attackCooldown > 0) {
        attackCooldown -= delta;
        attackProgress += delta * 3.5;
        if (attackProgress > 1.0) attackProgress = 0;
      } else {
        attackProgress = 0;
      }

      // 1. Movement
      const moveVec = new THREE.Vector3();
      const keys = keysPressed.current;

      let forward = 0;
      let strafe = 0;
      if (keys['KeyW'] || keys['ArrowUp']) forward += 1;
      if (keys['KeyS'] || keys['ArrowDown']) forward -= 1;
      if (keys['KeyA'] || keys['ArrowLeft']) strafe -= 1;
      if (keys['KeyD'] || keys['ArrowRight']) strafe += 1;

      if (touchJoystickRef.current.active) {
        forward -= touchJoystickRef.current.dy;
        strafe += touchJoystickRef.current.dx;
      }

      if (forward !== 0 || strafe !== 0) {
        const camYaw = cameraController.yaw;
        const forwardVector = new THREE.Vector3(-Math.sin(camYaw), 0, -Math.cos(camYaw));
        const rightVector = new THREE.Vector3(Math.cos(camYaw), 0, -Math.sin(camYaw));

        moveVec.addScaledVector(forwardVector, forward);
        moveVec.addScaledVector(rightVector, strafe);
        moveVec.normalize();

        const targetRotation = Math.atan2(moveVec.x, moveVec.z);
        playerRig.root.rotation.y = THREE.MathUtils.damp(playerRig.root.rotation.y, targetRotation, 16, delta);
      }

      // Coils & Gear active stats
      const activeItem = currentItemRef.current;
      const isSpeedCoil = activeItem === 'speed_coil';
      const isGravityCoil = activeItem === 'gravity_coil';
      const isJetpack = activeItem === 'jetpack';
      const isSuperPogo = activeItem === 'super_pogo';

      speedMultiplier = isSpeedCoil ? 2.15 : 1.0;
      gravityMultiplier = isGravityCoil ? 1.55 : 1.0;

      const baseSpeed =
        (worldData.gameMode === 'kart_speedway'
          ? 38
          : worldData.gameMode === 'speed_run'
          ? 26
          : 16) * speedMultiplier;
      playerVelocity.x = THREE.MathUtils.damp(playerVelocity.x, moveVec.x * baseSpeed, isGrounded ? 18 : 6, delta);
      playerVelocity.z = THREE.MathUtils.damp(playerVelocity.z, moveVec.z * baseSpeed, isGrounded ? 18 : 6, delta);

      // Jetpack Thruster Flight
      if (isJetpack && (keys['Space'] || keys['KeyK'])) {
        if (jetpackFuel > 0) {
          playerVelocity.y = Math.min(playerVelocity.y + 38 * delta, 24);
          setJetpackFuel((f) => Math.max(0, f - delta * 25));
          sound.playJetpackHiss();
          isGrounded = false;
        }
      } else if (isGrounded) {
        setJetpackFuel((f) => Math.min(100, f + delta * 45));
      }

      // Super Pogo automatic bounce
      if (isSuperPogo && isGrounded) {
        playerVelocity.y = 35;
        sound.playPogoBounce();
        isGrounded = false;
      }

      // Jump (with Gravity Coil springiness)
      if ((keys['Space'] || keys['KeyK']) && isGrounded && !isJetpack) {
        playerVelocity.y = (isGravityCoil ? 26 : 19) * gravityMultiplier;
        sound.playJump();
        isGrounded = false;
      }

      // Gravity (floaty low gravity in Moon Gravity mode or when Gravity Coil is held)
      const currentGravity = worldData.gameMode === 'moon_gravity' ? 20 : isGravityCoil ? 22 : 48;
      playerVelocity.y -= currentGravity * delta;

      // Integrate
      playerPos.addScaledVector(playerVelocity, delta);

      // 2. Physics & AABB Collisions
      const col = worldRenderer.checkPlayerCollision(playerPos, 0.9, 3.2);
      playerPos.copy(col.correctedPos);
      isGrounded = col.isGrounded;

      if (isGrounded && playerVelocity.y < 0) {
        playerVelocity.y = 0;
      }

      // Check special blocks
      if (col.standingOnKill) {
        respawnPlayer();
      } else if (col.standingOnBounce && col.bounceForce) {
        playerVelocity.y = col.bounceForce;
        sound.playBounce();
        isGrounded = false;
        if (col.conveyorSpeed) {
          playerVelocity.x += col.conveyorSpeed[0];
          playerVelocity.z += col.conveyorSpeed[1];
        }
      } else if (col.conveyorSpeed) {
        playerVelocity.x += col.conveyorSpeed[0] * delta * 5;
        playerVelocity.z += col.conveyorSpeed[1] * delta * 5;
      } else if (col.standingOnCheckpoint !== undefined) {
        if (worldData.gameMode === 'obby') {
          if (col.standingOnCheckpoint > obbyStage) {
            setObbyStage(col.standingOnCheckpoint);
            spawnCheckpoint.copy(col.correctedPos).add(new THREE.Vector3(0, 1.2, 0));
            sound.playCheckpoint();
            setGameMessage(`Stage ${col.standingOnCheckpoint} Reached!`);
            window.setTimeout(() => setGameMessage(''), 2500);

            if (col.standingOnCheckpoint === 6) {
              setIsObbyComplete(true);
              confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
              sound.playCoin();
              setCoins((c) => {
                const nc = c + 100;
                StorageManager.updatePlayerStats({ coins: nc, obbyBestTime: Math.round(obbyTimer) });
                return nc;
              });
            }
          }
        } else if (worldData.gameMode === 'speed_run' && col.standingOnCheckpoint === 99) {
          if (!isSpeedRunFinished) {
            setIsSpeedRunFinished(true);
            sound.playCheckpoint();
            confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 } });
            setGameMessage(`COURSE CLEARED in ${speedRunTimer.toFixed(2)}s! ⚡ +80 Coins!`);
            setCoins((c) => {
              const nc = c + 80;
              StorageManager.updatePlayerStats({ coins: nc, speedRunBestTime: Math.round(speedRunTimer) });
              return nc;
            });
          }
        } else if (worldData.gameMode === 'floor_lava' && col.standingOnCheckpoint === 99) {
          if (!isLavaEscaped) {
            setIsLavaEscaped(true);
            sound.playCheckpoint();
            sound.playCoin();
            confetti({ particleCount: 130, spread: 90, origin: { y: 0.6 } });
            setGameMessage('VOLCANO ESCAPE SUCCESSFUL! 🌋🚁 +100 Coins!');
            setCoins((c) => {
              const nc = c + 100;
              StorageManager.updatePlayerStats({
                coins: nc,
                lavaEscapes: (StorageManager.getPlayerStats().lavaEscapes || 0) + 1,
              });
              return nc;
            });
          }
        } else if (worldData.gameMode === 'kart_speedway') {
          if (col.standingOnCheckpoint === 2) {
            passedHalfwayRef.current = true;
          } else if (col.standingOnCheckpoint === 1 && passedHalfwayRef.current) {
            passedHalfwayRef.current = false;
            sound.playCheckpoint();
            sound.playEngineRev();
            confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
            const lapTime = kartLapTimer;
            setKartLapTimer(0);
            setKartLap((l) => l + 1);
            setGameMessage(`LAP COMPLETED: ${lapTime.toFixed(1)}s! 🏎️ +50 Coins!`);
            setCoins((c) => {
              const nc = c + 50;
              const best = kartBestTime === 0 ? Math.round(lapTime) : Math.min(kartBestTime, Math.round(lapTime));
              setKartBestTime(best);
              StorageManager.updatePlayerStats({ coins: nc, kartBestTime: best });
              return nc;
            });
            recordMissionAction('laps', 1, 'kart_speedway');
            if (isOnlineRoom) {
              multiplayerClient.sendScoreEvent('point', {
                amount: 1,
                announcement: `${playerNickname} finished a lap in ${lapTime.toFixed(1)}s!`,
              });
            }
          }
        } else if (worldData.gameMode === 'ragdoll' && col.standingOnCheckpoint === 100) {
          sound.playCheckpoint();
          sound.playCoin();
          confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
          setGameMessage(`BULLSEYE LANDING! Ragdoll Score: ${ragdollScore}! +150 Coins! 🎯`);
          setCoins((c) => {
            const nc = c + 150;
            StorageManager.updatePlayerStats({
              coins: nc,
              ragdollScore: Math.max(ragdollScore, StorageManager.getPlayerStats().ragdollScore || 0),
            });
            return nc;
          });
        }
      }

      // Coaster Train continuous loop traversal
      if (worldData.gameMode === 'rollercoaster') {
        coasterT = (coasterT + delta * 0.08) % 1;
        const loopX = Math.sin(coasterT * Math.PI * 2) * 25;
        const loopZ = Math.cos(coasterT * Math.PI * 2) * 45 + 30;
        const loopY = 8 + Math.sin(coasterT * Math.PI * 4) * 12 + (Math.sin(coasterT * Math.PI * 2) > 0 ? 8 : 0);
        coasterTrain.position.set(loopX, loopY, loopZ);
        coasterTrain.rotation.y = coasterT * Math.PI * 2 + Math.PI / 2;

        if (isCoasterRidingRef.current) {
          playerPos.copy(coasterTrain.position).add(new THREE.Vector3(0, 1.2, 0));
          playerVelocity.set(0, 0, 0);
        }
      }

      // CTF Flag pickup & scoring
      if (worldData.gameMode === 'paintball_ctf') {
        const distToRedFlag = playerPos.distanceTo(new THREE.Vector3(-32, 2.7, 0));
        const distToBlueBase = playerPos.distanceTo(new THREE.Vector3(30, 2, 0));

        if (distToRedFlag < 5.0 && hasFlagRef.current === 'none') {
          hasFlagRef.current = 'red';
          setHasFlag('red');
          sound.playSecretKey();
          setGameMessage('YOU HAVE THE RED FLAG! Sprint back to Blue Base! 🚩');
        }

        if (distToBlueBase < 6.0 && hasFlagRef.current === 'red') {
          hasFlagRef.current = 'none';
          setHasFlag('none');
          sound.playFanfare();
          sound.playCoin();
          confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
          setCtfScore((s) => ({ ...s, blue: s.blue + 1 }));
          setGameMessage('FLAG SCORED! +100 BloxCoins! 🏆');
          setCoins((c) => {
            const nc = c + 100;
            StorageManager.updatePlayerStats({
              ctfCaptures: (StorageManager.getPlayerStats().ctfCaptures || 0) + 1,
              coins: nc,
            });
            return nc;
          });
          recordMissionAction('ctf', 1, 'paintball_ctf');
          if (isOnlineRoom) {
            multiplayerClient.sendScoreEvent('ctf_capture', { team: 'blue' });
          }
        }
      }

      // Kart Speedway Lap Timer
      if (worldData.gameMode === 'kart_speedway') {
        setKartLapTimer((t) => t + delta);
      }

      // Universal Spinning Golden Coin Pickups across all 42 worlds
      worldRenderer.renderedParts.forEach((rp) => {
        if (rp.partData.metadata?.isCoinPickup && rp.mesh.visible) {
          rp.mesh.rotation.z += delta * 2.8;
          if (playerPos.distanceTo(rp.mesh.position) < 2.6) {
            rp.mesh.visible = false;
            sound.playCoin();
            setCoins((c) => {
              const nc = c + 15;
              StorageManager.updatePlayerStats({ coins: nc });
              return nc;
            });
            recordMissionAction('coins', 1);
            setGameMessage('+15 BloxCoins! 🪙');
            safeTimeout(() => setGameMessage(''), 1400);
            safeTimeout(() => {
              rp.mesh.visible = true;
            }, 20000);
          }
        }
      });

      // BrickBall Soccer Physics & Goal Scoring
      if (worldData.gameMode === 'soccer' && soccerBallMesh) {
        if (soccerGoalCooldown > 0) soccerGoalCooldown -= delta;

        // Player dribble / kick impulse
        const pDist = playerPos.distanceTo(soccerBallPos);
        if (pDist < 2.6) {
          const kickDir = soccerBallPos.clone().sub(playerPos);
          kickDir.y = 0;
          if (kickDir.lengthSq() < 0.001) kickDir.set(0, 0, 1);
          kickDir.normalize();
          const kickPower = Math.max(18, playerVelocity.length() * 1.45);
          soccerBallVel.x = kickDir.x * kickPower;
          soccerBallVel.z = kickDir.z * kickPower;
          soccerBallVel.y = Math.max(soccerBallVel.y, 5.5);
          sound.playBounce();
        }

        // Integrate ball motion
        soccerBallVel.y -= 32 * delta;
        soccerBallPos.addScaledVector(soccerBallVel, delta);

        // Floor bounce & turf friction
        if (soccerBallPos.y < 2.55) {
          soccerBallPos.y = 2.55;
          if (soccerBallVel.y < -2) {
            soccerBallVel.y *= -0.55;
          } else {
            soccerBallVel.y = 0;
          }
          soccerBallVel.x *= Math.pow(0.45, delta);
          soccerBallVel.z *= Math.pow(0.45, delta);
        }

        // Sideline wall bounce
        if (soccerBallPos.x > 26.5) {
          soccerBallPos.x = 26.5;
          soccerBallVel.x *= -0.75;
        } else if (soccerBallPos.x < -26.5) {
          soccerBallPos.x = -26.5;
          soccerBallVel.x *= -0.75;
        }

        // Goal Detection vs Endline bounce
        if (soccerBallPos.z > 36.5 && Math.abs(soccerBallPos.x) < 9 && soccerGoalCooldown <= 0) {
          soccerGoalCooldown = 2.5;
          sound.playFanfare();
          sound.playCoin();
          confetti({ particleCount: 110, spread: 90, origin: { y: 0.6 } });
          setSoccerScore((s) => ({ ...s, blue: s.blue + 1 }));
          setCoins((c) => {
            const nc = c + 50;
            StorageManager.updatePlayerStats({
              coins: nc,
              soccerGoals: (StorageManager.getPlayerStats().soccerGoals || 0) + 1,
            });
            return nc;
          });
          setGameMessage('GOOOAAAL! BLUE SCORED ON RED! ⚽🎉 +50 Coins!');
          soccerBallPos.set(0, 4.5, 0);
          soccerBallVel.set(0, 0, 0);
        } else if (soccerBallPos.z < -36.5 && Math.abs(soccerBallPos.x) < 9 && soccerGoalCooldown <= 0) {
          soccerGoalCooldown = 2.5;
          sound.playFanfare();
          sound.playCoin();
          confetti({ particleCount: 110, spread: 90, origin: { y: 0.6 } });
          setSoccerScore((s) => ({ ...s, red: s.red + 1 }));
          setCoins((c) => {
            const nc = c + 50;
            StorageManager.updatePlayerStats({
              coins: nc,
              soccerGoals: (StorageManager.getPlayerStats().soccerGoals || 0) + 1,
            });
            return nc;
          });
          setGameMessage('GOOOAAAL! RED SCORED ON BLUE! ⚽🎉 +50 Coins!');
          soccerBallPos.set(0, 4.5, 0);
          soccerBallVel.set(0, 0, 0);
        } else if (Math.abs(soccerBallPos.z) > 38.5) {
          soccerBallPos.z = Math.sign(soccerBallPos.z) * 38.5;
          soccerBallVel.z *= -0.75;
        }

        soccerBallMesh.position.copy(soccerBallPos);
        soccerBallMesh.rotation.x += soccerBallVel.z * delta * 0.4;
        soccerBallMesh.rotation.z -= soccerBallVel.x * delta * 0.4;
      }

      // Rockets update & detonation
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.mesh.position.addScaledVector(r.velocity, delta);
        r.life -= delta;

        let hit = r.life <= 0 || r.mesh.position.y <= 0.5;
        if (!hit) {
          for (const b of bots) {
            if (b.health > 0 && r.mesh.position.distanceTo(b.position) < 3.2) {
              hit = true;
              break;
            }
          }
        }
        if (!hit && isOnlineRoom && r.isLocal) {
          remotePeers.forEach((peer) => {
            if (!hit && peer.health > 0 && r.mesh.position.distanceTo(peer.position) < 3.2) {
              hit = true;
            }
          });
        }

        if (hit) {
          sound.playRocketBoom();
          // AOE blast on soccer ball
          if (worldData.gameMode === 'soccer' && soccerBallMesh && soccerBallPos.distanceTo(r.mesh.position) < 10) {
            const bPush = soccerBallPos.clone().sub(r.mesh.position).normalize().multiplyScalar(38);
            bPush.y = 14;
            soccerBallVel.add(bPush);
          }
          // AOE blast on bots
          bots.forEach((b) => {
            if (b.health <= 0 || b.team === 'soccer') return;
            const dist = b.position.distanceTo(r.mesh.position);
            if (dist < (b.isGiant ? 15 : 12)) {
              b.health -= 75;
              if (b.team === 'boss') setBossHealth(Math.max(0, Math.round(b.health)));
              const sumoBoost = worldData.gameMode === 'sumo' ? 1.5 : 1.0;
              const push = b.position.clone().sub(r.mesh.position);
              if (push.lengthSq() < 0.01) push.set(0, 0, 1);
              push.normalize().multiplyScalar(32 * sumoBoost);
              push.y = 12;
              b.velocity.add(push);
              if (b.health <= 0) {
                handleBotDefeated(b, 'Rocketed');
              }
            }
          });
          // AOE blast on remote players
          if (isOnlineRoom && r.isLocal) {
            remotePeers.forEach((peer) => {
              if (peer.health <= 0) return;
              const dist = peer.position.distanceTo(r.mesh.position);
              if (dist < 12) {
                const push = peer.position.clone().sub(r.mesh.position);
                if (push.lengthSq() < 0.01) push.set(0, 0, 1);
                push.normalize().multiplyScalar(32);
                push.y = 12;
                multiplayerClient.sendHit(peer.id, 65, [push.x, push.y, push.z], 'rocket_launcher');
              }
            });
          }
          scene.remove(r.mesh);
          rockets.splice(i, 1);
        }
      }

      // Check Mansion Clues / Keys collection
      if (worldData.gameMode === 'murder') {
        worldRenderer.renderedParts.forEach((rp) => {
          if (rp.partData.metadata?.isClue && rp.mesh.visible) {
            if (playerPos.distanceTo(rp.mesh.position) < 2.5) {
              rp.mesh.visible = false;
              sound.playSecretKey();
              setMansionKeysFound((k) => {
                const nk = k + 1;
                setGameMessage(`Key Found! (${nk} / 6) 🗝️`);
                if (nk >= 6 && !isMansionEscaped) {
                  setIsMansionEscaped(true);
                  confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
                  setCoins((c) => {
                    const nc = c + 150;
                    StorageManager.updatePlayerStats({ coins: nc, mansionEscapes: (StorageManager.getPlayerStats().mansionEscapes || 0) + 1 });
                    return nc;
                  });
                  setGameMessage('ALL KEYS FOUND! Escape Vault Unlocked! +150 Coins!');
                }
                return nk;
              });
            }
          }
        });
      }

      // Void death plane
      if (playerPos.y < -15) {
        respawnPlayer();
      }

      // Update player rig
      playerRig.root.position.copy(playerPos);
      playerRig.updateAnimation(
        playerVelocity,
        isGrounded,
        !isGrounded && playerVelocity.y > 0,
        attackProgress,
        delta,
        isRagdollingRef.current
      );

      // 3. Camera
      cameraController.update(playerPos, delta);

      // 4. Update Game Modes
      if (worldData.gameMode === 'disaster') {
        tornadoAngle += delta * 0.8;
        tornadoPos.set(Math.sin(tornadoAngle) * 25, 0, Math.cos(tornadoAngle * 1.3) * 25);
        tornadoGroup.position.copy(tornadoPos);
        tornadoFunnel.rotation.y += delta * 6;

        const distToTornado = playerPos.distanceTo(tornadoPos);
        if (distToTornado < 18) {
          const pull = tornadoPos.clone().sub(playerPos).normalize().multiplyScalar((18 - distToTornado) * 1.5);
          playerPos.addScaledVector(pull, delta);
          currentHealth -= delta * 15;
          setHealth(Math.max(0, Math.round(currentHealth)));
          if (currentHealth <= 0) respawnPlayer();
        }

        worldRenderer.updatePhysics(delta, true, tornadoPos);

        disasterRoundTime -= delta;
        if (disasterRoundTime <= 0) {
          disasterRoundTime = 60;
          sound.playAlarm();
          sound.playCoin();
          confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
          setCoins((c) => {
            const nc = c + 60;
            StorageManager.updatePlayerStats({
              coins: nc,
              disasterWins: (StorageManager.getPlayerStats().disasterWins || 0) + 1,
            });
            return nc;
          });
          setGameMessage('VICTORY! You survived the disaster! +60 BloxCoins!');
          window.setTimeout(() => setGameMessage(''), 4000);
        }
        setDisasterTimer(Math.max(0, Math.round(disasterRoundTime)));
      } else if (worldData.gameMode === 'pizza') {
        setOvenTimer((ot) => {
          if (ot <= 0) return 0;
          const next = ot - delta;
          if (next <= 0) {
            setHeldPizzaState('baked');
            sound.playCoin();
            setGameMessage('Pizza baked to perfection! Deliver to front desk.');
            return 0;
          }
          return next;
        });
      } else if (worldData.gameMode === 'speed_run') {
        if (!isSpeedRunFinished) {
          timerAccumulator += delta;
          setSpeedRunTimer(timerAccumulator);
        }
      } else if (worldData.gameMode === 'hide_seek') {
        if (!isHideSeekWon) {
          setHideSeekTimer((t) => {
            const next = t - delta;
            if (next <= 0) {
              setIsHideSeekWon(true);
              sound.playCheckpoint();
              confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
              setGameMessage('YOU HID SUCCESSFULLY! +75 Coins! 🏆');
              setCoins((c) => {
                const nc = c + 75;
                StorageManager.updatePlayerStats({
                  coins: nc,
                  hideAndSeekWins: (StorageManager.getPlayerStats().hideAndSeekWins || 0) + 1,
                });
                return nc;
              });
              return 0;
            }
            return next;
          });
        }
      } else if (worldData.gameMode === 'floor_lava') {
        if (!isLavaEscaped) {
          currentLavaY += delta * 1.05;
          lavaMesh.position.y = currentLavaY;
          setLavaHeight(Math.round(currentLavaY));

          // Touching lava burns!
          if (playerPos.y <= currentLavaY + 1.2) {
            currentHealth -= delta * 55;
            sound.playHit();
            setHealth(Math.max(0, Math.round(currentHealth)));
            if (currentHealth <= 0) {
              respawnPlayer();
            }
          }
        }
      } else if (worldData.gameMode === 'ragdoll') {
        // Accumulate ragdoll tumble points when moving fast or airborne
        if (isRagdollingRef.current) {
          const speed = playerVelocity.length();
          if (speed > 4) {
            const addedPoints = Math.round(speed * delta * 15);
            setRagdollScore((s) => s + addedPoints);
          }
          if (playerVelocity.y < -22 && isGrounded) {
            sound.playBonk();
          }
        }
      }

      // Update AI Bots
      bots.forEach((bot) => {
        if (bot.health <= 0) return;

        const distToPlayer = bot.position.distanceTo(playerPos);

        if (bot.team === 'soccer') {
          // Soccer bots dribble toward the BrickBall
          const distBall = bot.position.distanceTo(soccerBallPos);
          const dir = soccerBallPos.clone().sub(bot.position);
          dir.y = 0;
          if (dir.lengthSq() > 0.01) {
            dir.normalize();
            bot.velocity.x = dir.x * 11;
            bot.velocity.z = dir.z * 11;
            bot.rig.root.rotation.y = Math.atan2(dir.x, dir.z);
          }
          if (distBall < 2.6) {
            const kick = new THREE.Vector3(
              (Math.random() - 0.5) * 8,
              5,
              bot.name.includes('Red') ? 18 : -18
            );
            soccerBallVel.add(kick);
          }
        } else if (isGhostRef.current) {
          // Player is invisible with Ghost Cloak! Bots wander aimlessly
          bot.velocity.x = Math.sin(clock.getElapsedTime() + bot.name.length) * 5;
          bot.velocity.z = Math.cos(clock.getElapsedTime() + bot.name.length) * 5;
        } else if (bot.team === 'seeker') {
          // Seeker patrols playroom/school and chases if close
          if (distToPlayer < 28) {
            const dir = playerPos.clone().sub(bot.position);
            dir.y = 0;
            dir.normalize();
            bot.velocity.x = dir.x * 14;
            bot.velocity.z = dir.z * 14;
            bot.rig.root.rotation.y = Math.atan2(dir.x, dir.z);

            if (distToPlayer < 7.0) {
              sound.playHit();
              currentHealth -= delta * 30;
              setHealth(Math.max(0, Math.round(currentHealth)));
              if (currentHealth <= 0) respawnPlayer();
            }
          } else {
            bot.velocity.x = Math.sin(clock.getElapsedTime() * 0.7) * 8;
            bot.velocity.z = Math.cos(clock.getElapsedTime() * 0.7) * 8;
          }
        } else if (bot.team === 'impostor') {
          // Stalks corridors
          if (distToPlayer < 20) {
            const dir = playerPos.clone().sub(bot.position);
            dir.y = 0;
            dir.normalize();
            bot.velocity.x = dir.x * 13;
            bot.velocity.z = dir.z * 13;
            bot.rig.root.rotation.y = Math.atan2(dir.x, dir.z);

            if (distToPlayer < 4.5) {
              bot.attackCooldown -= delta;
              if (bot.attackCooldown <= 0) {
                bot.attackCooldown = 1.0;
                sound.playSlash();
                currentHealth -= 25;
                setHealth(Math.max(0, Math.round(currentHealth)));
                sound.playHit();
                if (currentHealth <= 0) respawnPlayer();
              }
            }
          } else {
            bot.velocity.x = Math.sin(clock.getElapsedTime() * 0.5) * 6;
            bot.velocity.z = Math.cos(clock.getElapsedTime() * 0.5) * 6;
          }
        } else if (bot.team === 'boss') {
          // Giant Titan Mech Boss
          const dir = playerPos.clone().sub(bot.position);
          dir.y = 0;
          if (dir.lengthSq() > 0.01) {
            dir.normalize();
            bot.velocity.x = dir.x * 10.5;
            bot.velocity.z = dir.z * 10.5;
            bot.rig.root.rotation.y = Math.atan2(dir.x, dir.z);
          }
          if (distToPlayer < 7.5) {
            bot.attackCooldown -= delta;
            if (bot.attackCooldown <= 0) {
              bot.attackCooldown = 1.6;
              sound.playRocketBoom();
              currentHealth -= 28;
              playerVelocity.y = 14;
              playerVelocity.addScaledVector(dir, 22);
              setHealth(Math.max(0, Math.round(currentHealth)));
              if (currentHealth <= 0) respawnPlayer();
            }
          }
        } else if (bot.team === 'sumo') {
          // Sumo bots lunge & try to knock player off the Dohyo Ring!
          const dir = playerPos.clone().sub(bot.position);
          dir.y = 0;
          if (dir.lengthSq() > 0.01) {
            dir.normalize();
            bot.velocity.x = THREE.MathUtils.damp(bot.velocity.x, dir.x * 11, 5, delta);
            bot.velocity.z = THREE.MathUtils.damp(bot.velocity.z, dir.z * 11, 5, delta);
            bot.rig.root.rotation.y = Math.atan2(dir.x, dir.z);
          }
          if (distToPlayer < 4.5) {
            bot.attackCooldown -= delta;
            if (bot.attackCooldown <= 0) {
              bot.attackCooldown = 1.1;
              sound.playHit();
              const knock = playerPos.clone().sub(bot.position);
              knock.y = 0;
              if (knock.lengthSq() < 0.01) knock.set(0, 0, 1);
              knock.normalize().multiplyScalar(22);
              playerVelocity.add(knock);
              playerVelocity.y = Math.max(playerVelocity.y, 10);
            }
          }
        } else {
          // Red / Blue Knights / Zombies / CyberBots
          if (distToPlayer < 24) {
            const dir = playerPos.clone().sub(bot.position);
            dir.y = 0;
            dir.normalize();
            bot.velocity.x = dir.x * 12;
            bot.velocity.z = dir.z * 12;
            bot.rig.root.rotation.y = Math.atan2(dir.x, dir.z);

            if (distToPlayer < 4.5) {
              bot.attackCooldown -= delta;
              if (bot.attackCooldown <= 0) {
                bot.attackCooldown = 1.2;
                sound.playSlash();
                currentHealth -= 20;
                setHealth(Math.max(0, Math.round(currentHealth)));
                sound.playHit();
                if (currentHealth <= 0) respawnPlayer();
              }
            }
          } else {
            bot.velocity.x = Math.sin(clock.getElapsedTime() + bot.name.length) * 4;
            bot.velocity.z = Math.cos(clock.getElapsedTime() + bot.name.length) * 4;
          }
        }

        bot.velocity.y -= 40 * delta;
        bot.position.addScaledVector(bot.velocity, delta);

        // In Sumo mode, bots outside the 22-unit ring radius fall off into the abyss!
        const offSumoRing = worldData.gameMode === 'sumo' && Math.hypot(bot.position.x, bot.position.z) > 22.5;
        if (!offSumoRing && bot.position.y < (bot.isGiant ? 3.0 : 1.5)) {
          bot.position.y = bot.isGiant ? 3.0 : 1.5;
          bot.velocity.y = 0;
        }
        if (worldData.gameMode === 'sumo' && bot.position.y < -8) {
          handleBotDefeated(bot, 'Knocked out');
        }

        bot.rig.root.position.copy(bot.position);
        bot.rig.updateAnimation(bot.velocity, bot.position.y <= (bot.isGiant ? 3.2 : 1.6), false, 0, delta);
      });

      // Update Paintballs
      for (let i = paintballs.length - 1; i >= 0; i--) {
        const pb = paintballs[i];
        pb.life -= delta;
        pb.velocity.y -= 25 * delta;
        pb.mesh.position.addScaledVector(pb.velocity, delta);

        if (pb.mesh.position.y < 0.2) {
          pb.mesh.position.y = 0.2;
          pb.velocity.y *= -0.5;
        }

        // Check soccer ball hit by paintball
        if (worldData.gameMode === 'soccer' && soccerBallMesh && pb.mesh.position.distanceTo(soccerBallPos) < 2.2) {
          const push = pb.velocity.clone().normalize().multiplyScalar(14);
          push.y = 5;
          soccerBallVel.add(push);
          pb.life = 0;
          sound.playBounce();
        }

        // Check bot hit
        bots.forEach((b) => {
          if (b.health > 0 && b.team !== 'soccer' && pb.mesh.position.distanceTo(b.position) < (b.isGiant ? 4.5 : 2)) {
            b.health -= 35;
            if (b.team === 'boss') setBossHealth(Math.max(0, Math.round(b.health)));
            sound.playHit();
            pb.life = 0;
            const knock = pb.velocity.clone().normalize().multiplyScalar(worldData.gameMode === 'sumo' ? 24 : 10);
            knock.y = 6;
            b.velocity.add(knock);
            if (b.health <= 0) {
              handleBotDefeated(b, 'Paintballed');
            }
          }
        });

        // Check remote peer hit
        if (isOnlineRoom && pb.isLocal && pb.life > 0) {
          remotePeers.forEach((peer) => {
            if (peer.health > 0 && pb.mesh.position.distanceTo(peer.position) < 2.2) {
              sound.playHit();
              pb.life = 0;
              const knock = pb.velocity.clone().normalize().multiplyScalar(14);
              knock.y = 6;
              multiplayerClient.sendHit(peer.id, 30, [knock.x, knock.y, knock.z], 'paintball_gun');
            }
          });
        }

        if (pb.life <= 0) {
          scene.remove(pb.mesh);
          pb.mesh.geometry.dispose();
          paintballs.splice(i, 1);
        }
      }

      // Update Banana Peels (Slips!)
      for (let i = bananaPeels.length - 1; i >= 0; i--) {
        const bp = bananaPeels[i];
        bp.life -= delta;

        // Check bot slip
        bots.forEach((bot) => {
          if (bot.health > 0 && bot.position.distanceTo(bp.position) < 2.5) {
            sound.playSlip();
            bot.velocity.y = 12;
            bot.velocity.x = (Math.random() - 0.5) * 22;
            bot.velocity.z = (Math.random() - 0.5) * 22;
            bp.life = 0;
          }
        });

        // Check player slip
        if (playerPos.distanceTo(bp.position) < 2.2) {
          sound.playSlip();
          playerVelocity.y = 15;
          playerVelocity.x += (Math.random() - 0.5) * 18;
          playerVelocity.z += (Math.random() - 0.5) * 18;
          setIsRagdolling(true);
          isRagdollingRef.current = true;
          setGameMessage('SLIPPED ON A BANANA PEEL! 🍌😂');
          window.setTimeout(() => setGameMessage(''), 2500);
          bp.life = 0;
        }

        if (bp.life <= 0) {
          scene.remove(bp.mesh);
          bananaPeels.splice(i, 1);
        }
      }

      // Interpolate remote multiplayer avatars & stream local state (~20Hz)
      if (isOnlineRoom) {
        remotePeers.forEach((peer) => {
          const alpha = Math.min(1, delta * 14);
          peer.position.lerp(peer.targetPosition, alpha);
          peer.rig.root.position.copy(peer.position);

          // Shortest-angle rotation interpolation
          let diff = peer.targetRotationY - peer.rig.root.rotation.y;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          peer.rig.root.rotation.y += diff * alpha;

          const peerGrounded = Math.abs(peer.velocity.y) < 0.8;
          peer.rig.updateAnimation(
            peer.velocity,
            peerGrounded,
            !peerGrounded && peer.velocity.y > 0.5,
            0,
            delta,
            peer.isRagdolling
          );
        });

        networkSyncAccumulator += delta;
        if (networkSyncAccumulator >= 0.05) {
          networkSyncAccumulator = 0;
          multiplayerClient.sendPlayerState({
            position: [playerPos.x, playerPos.y, playerPos.z],
            rotationY: playerRig.root.rotation.y,
            velocity: [playerVelocity.x, playerVelocity.y, playerVelocity.z],
            equippedItem: currentItemRef.current,
            emote: playerRig.currentEmote,
            isRagdolling: isRagdollingRef.current,
            isGhost: isGhostRef.current,
            propDisguise: propDisguiseRef.current,
            health: Math.round(currentHealth),
          });
        }
      }

      // Obby timer
      if (worldData.gameMode === 'obby' && !isObbyComplete) {
        timerAccumulator += delta;
        setObbyTimer(timerAccumulator);
      }

      renderer.render(scene, camera);

      if (isSoftwareGl) afterDraw(tick);
      else frameId = requestAnimationFrame(tick);
    };

    let networkSyncAccumulator = 0;

    // Subscribe to real-time WebSocket multiplayer events
    const unsubMultiplayer = isOnlineRoom
      ? multiplayerClient.onEvent((evt) => {
          if (evt.type === 'room:joined') {
            evt.players.forEach((p) => spawnOrUpdatePeer(p));
            setRoomPlayers(evt.players);
            setChatMessages(evt.chatMessages);
            setCtfScore({ red: evt.scores.ctfRed, blue: evt.scores.ctfBlue });
            setZombieWave(evt.scores.zombieWave || 1);
          } else if (evt.type === 'player:joined') {
            spawnOrUpdatePeer(evt.player);
            setRoomPlayers((prev) =>
              prev.some((x) => x.id === evt.player.id) ? prev : [...prev, evt.player]
            );
          } else if (evt.type === 'player:state') {
            spawnOrUpdatePeer(evt.player);
          } else if (evt.type === 'player:left') {
            removePeer(evt.playerId);
            setRoomPlayers((prev) => prev.filter((x) => x.id !== evt.playerId));
          } else if (evt.type === 'combat:attack') {
            const origin = new THREE.Vector3(...evt.origin);
            const dir = new THREE.Vector3(...evt.dir).normalize();
            if (evt.item === 'paintball_gun') {
              sound.playPaintballShot();
              const pMesh = new THREE.Mesh(
                new THREE.SphereGeometry(0.3, 8, 8),
                new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0xffffff, emissiveIntensity: 0.2 })
              );
              pMesh.position.copy(origin);
              scene.add(pMesh);
              paintballs.push({ mesh: pMesh, velocity: dir.multiplyScalar(45), life: 3.0, isLocal: false });
            } else if (evt.item === 'rocket_launcher') {
              sound.playRocketBoom();
              const rGroup = new THREE.Group();
              rGroup.position.copy(origin);
              const rBody = new THREE.Mesh(
                new THREE.CylinderGeometry(0.18, 0.18, 1.2, 8),
                new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.8 })
              );
              rBody.rotation.x = Math.PI / 2;
              rGroup.add(rBody);
              scene.add(rGroup);
              rockets.push({ mesh: rGroup, velocity: dir.multiplyScalar(42), life: 3.5, isLocal: false });
            } else if (evt.item === 'laser_katana') {
              sound.playLaserBeam();
            } else if (evt.item === 'rubber_chicken') {
              sound.playSqueak();
            } else {
              sound.playSlash();
            }
          } else if (evt.type === 'combat:hit') {
            if (roomSession && evt.targetId === roomSession.playerId) {
              sound.playHit();
              playerVelocity.add(new THREE.Vector3(...evt.knockback));
              currentHealth = Math.max(0, currentHealth - evt.damage);
              setHealth(Math.round(currentHealth));
              if (currentHealth <= 0) {
                setKillFeed((kf) => [`Tagged by ${evt.attackerName}!`, ...kf.slice(0, 3)]);
                respawnPlayer();
              }
            }
          } else if (evt.type === 'scores:update') {
            setCtfScore({ red: evt.scores.ctfRed, blue: evt.scores.ctfBlue });
            setZombieWave(evt.scores.zombieWave || 1);
            setRoomPlayers((prev) =>
              prev.map((p) => {
                const updated = evt.playerScores.find((ps) => ps.id === p.id);
                return updated ? { ...p, score: updated.score, team: updated.team } : p;
              })
            );
          } else if (evt.type === 'chat:message') {
            setChatMessages((prev) => {
              if (prev.some((m) => m.id === evt.message.id)) return prev;
              const next = [...prev, evt.message];
              return next.length > 50 ? next.slice(next.length - 50) : next;
            });
            if (!evt.message.isSystem && evt.message.senderId !== roomSession?.playerId) {
              sound.playClick();
            }
          }
        })
      : () => {};

    if (isSoftwareGl) afterDraw(tick);
    else frameId = requestAnimationFrame(tick);

    return () => {
      isDisposed = true;
      activeTimers.forEach((id) => clearTimeout(id));
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      unsubMultiplayer();
      sound.stopBGM();
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('contextmenu', onContextMenu);
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
      container.removeEventListener('touchcancel', onTouchEnd);
      window.removeEventListener('resize', onResize);

      remotePeers.forEach((peer) => {
        scene.remove(peer.rig.root);
      });
      remotePeers.clear();
      worldRenderer.clear();
      paintballs.forEach((p) => {
        scene.remove(p.mesh);
        p.mesh.geometry.dispose();
      });
      rockets.forEach((r) => {
        scene.remove(r.mesh);
      });
      if (soccerBallMesh) {
        scene.remove(soccerBallMesh);
        soccerBallMesh.geometry.dispose();
      }
      bananaPeels.forEach((bp) => {
        scene.remove(bp.mesh);
      });
      scene.remove(lavaMesh);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [worldData, avatarConfig, userSettings, isOnlineRoom, roomSession?.roomCode]);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const radius = rect.width / 2;
    const rawDx = (touch.clientX - (rect.left + radius)) / radius;
    const rawDy = (touch.clientY - (rect.top + radius)) / radius;
    const dist = Math.hypot(rawDx, rawDy);
    const clampedDist = Math.min(1.0, dist);
    const angle = Math.atan2(rawDy, rawDx);
    const dx = clampedDist * Math.cos(angle);
    const dy = clampedDist * Math.sin(angle);

    touchJoystickRef.current = { active: true, dx, dy };
    setJoystickKnob({ x: dx * 38, y: dy * 38, active: true });
    try {
      navigator?.vibrate?.(10);
    } catch {
      // ignore
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!touchJoystickRef.current.active) return;
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const radius = rect.width / 2;
    const rawDx = (touch.clientX - (rect.left + radius)) / radius;
    const rawDy = (touch.clientY - (rect.top + radius)) / radius;
    const dist = Math.hypot(rawDx, rawDy);
    const clampedDist = Math.min(1.0, dist);
    const angle = Math.atan2(rawDy, rawDx);
    const dx = clampedDist * Math.cos(angle);
    const dy = clampedDist * Math.sin(angle);

    touchJoystickRef.current = { active: true, dx, dy };
    setJoystickKnob({ x: dx * 38, y: dy * 38, active: true });
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    touchJoystickRef.current = { active: false, dx: 0, dy: 0 };
    setJoystickKnob({ x: 0, y: 0, active: false });
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-slate-950">
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Low-Occlusion Top Game HUD */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 pointer-events-none z-20">
        <div className="flex items-center gap-2.5 bg-slate-900/85 border border-white/10 px-3.5 py-2 rounded-xl backdrop-blur-sm pointer-events-auto shadow-lg">
          <span className="font-bold text-xs sm:text-sm tracking-wide text-white truncate max-w-[140px] sm:max-w-xs">
            {worldData.name}
          </span>
          <span className="text-slate-500">·</span>
          {isOnlineRoom && roomSession ? (
            <div className="flex items-center gap-2 text-xs font-mono tabular-nums">
              <span className="text-emerald-400 font-bold">ROOM {roomSession.roomCode}</span>
              <button
                onClick={handleCopyRoomCode}
                className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-sans font-semibold cursor-pointer transition-colors"
                title="Copy Invite Code"
              >
                {codeCopied ? 'Copied' : 'Copy'}
              </button>
              <span className="hidden md:inline text-slate-400">
                {connectionStatus === 'reconnecting'
                  ? 'Reconnecting...'
                  : `${roomPlayers.length} ${roomPlayers.length === 1 ? 'Player' : 'Players'}`}
              </span>
            </div>
          ) : (
            <span className="text-xs text-slate-400 font-mono">Offline Solo</span>
          )}
        </div>

        {/* Center: Dynamic Game Readouts */}
        <div className="flex items-center gap-4 bg-slate-900/85 border border-white/10 px-5 py-2 rounded-xl backdrop-blur-xs pointer-events-auto shadow-lg">
          {worldData.gameMode === 'obby' && (
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-slate-300">
                STAGE <strong className="text-emerald-400 text-sm">{obbyStage} / 6</strong>
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-300">
                TIME <strong className="text-amber-400 text-sm">{obbyTimer.toFixed(1)}s</strong>
              </span>
            </div>
          )}

          {worldData.gameMode === 'speed_run' && (
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-cyan-400 font-bold">⚡ SPEED RUN</span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-300">
                TIME <strong className="text-amber-400 text-sm">{speedRunTimer.toFixed(2)}s</strong>
              </span>
            </div>
          )}

          {worldData.gameMode === 'murder' && (
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-red-400 font-bold">🗝️ KEYS: {mansionKeysFound} / 6</span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-300">EVADE IMPOSTOR</span>
            </div>
          )}

          {worldData.gameMode === 'hide_seek' && (
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-amber-400 font-bold">🫣 HIDE TIME: {Math.round(hideSeekTimer)}s</span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-300">EVADE GIANT</span>
            </div>
          )}

          {worldData.gameMode === 'disaster' && (
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-amber-400 font-bold">🌪️ TORNADO INCOMING</span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-300">
                SURVIVE <strong className="text-emerald-400 text-sm">{disasterTimer}s</strong>
              </span>
            </div>
          )}

          {worldData.gameMode === 'pizza' && (
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-slate-300">
                ORDER: <strong className="text-amber-400">{pizzaOrder}</strong>
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-300">
                HELD:{' '}
                <strong className="text-sky-400">
                  {heldPizzaState === 'none'
                    ? 'Empty Hands'
                    : heldPizzaState === 'dough'
                    ? 'Raw Dough'
                    : heldPizzaState === 'prepared'
                    ? 'Topped Pizza'
                    : 'Baked Boxed Pizza!'}
                </strong>
              </span>
              {ovenTimer > 0 && (
                <span className="text-orange-400 animate-pulse">OVEN: {ovenTimer.toFixed(1)}s</span>
              )}
            </div>
          )}

          {worldData.gameMode === 'sword' && (
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-slate-300">
                KILLS: <strong className="text-red-400 text-sm">{swordKills}</strong>
              </span>
            </div>
          )}

          {worldData.gameMode === 'ragdoll' && (
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-amber-400 font-bold">🤸 RAGDOLL MAYHEM</span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-300">
                SCORE: <strong className="text-emerald-400 text-sm">{ragdollScore}</strong>
              </span>
              <span className="text-slate-400">·</span>
              <span className={isRagdolling ? 'text-pink-400 font-bold animate-pulse' : 'text-slate-400'}>
                {isRagdolling ? 'FLOPPING!' : 'STANDING (R to tumble)'}
              </span>
            </div>
          )}

          {worldData.gameMode === 'floor_lava' && (
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className={worldData.id === 'game_flood_escape' ? 'text-cyan-400 font-bold' : 'text-orange-500 font-bold'}>
                {worldData.id === 'game_flood_escape' ? `🌊 FLOOD LEVEL: ${lavaHeight}m` : `🌋 LAVA HEIGHT: ${lavaHeight}m`}
              </span>
              <span className="text-slate-400">·</span>
              <span className={isLavaEscaped ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold animate-pulse'}>
                {isLavaEscaped ? 'RESCUED! 🚁' : 'CLIMB UP!'}
              </span>
            </div>
          )}

          {worldData.gameMode === 'zombie_defense' && (
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-emerald-400 font-bold">🧟 WAVE {zombieWave}</span>
              <span className="text-slate-400">·</span>
              <span className="text-amber-300">DEFEND OUTPOST</span>
            </div>
          )}

          {worldData.gameMode === 'paintball_ctf' && (
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-red-400 font-bold">RED: {ctfScore.red}</span>
              <span className="text-slate-400">vs</span>
              <span className="text-blue-400 font-bold">BLUE: {ctfScore.blue}</span>
              {hasFlag === 'red' && (
                <span className="text-amber-300 font-bold animate-pulse">· 🚩 SPRINT HOME!</span>
              )}
            </div>
          )}

          {worldData.gameMode === 'rollercoaster' && (
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-pink-400 font-bold">🎢 LOOP ROLLERCOASTER</span>
              <span className="text-slate-400">·</span>
              <span className={isCoasterRiding ? 'text-emerald-400 font-bold animate-pulse' : 'text-slate-300'}>
                {isCoasterRiding ? 'RIDING! (E to Exit)' : 'Press E on cart to ride'}
              </span>
            </div>
          )}

          {worldData.gameMode === 'prop_hunt' && (
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-amber-400 font-bold">📦 DISGUISE:</span>
              <span className={propDisguise === 'none' ? 'text-slate-400' : 'text-emerald-400 font-bold'}>
                {propDisguise === 'none' ? 'None (Press E on props)' : propDisguise.toUpperCase()}
              </span>
            </div>
          )}

          {worldData.gameMode === 'kart_speedway' && (
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-cyan-400 font-bold">🏎️ LAP {kartLap}</span>
              <span className="text-slate-400">·</span>
              <span className="text-amber-300">{kartLapTimer.toFixed(1)}s</span>
              {kartBestTime > 0 && <span className="text-slate-400">(Best: {kartBestTime}s)</span>}
            </div>
          )}

          {worldData.gameMode === 'laser_tag' && (
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-cyan-400 font-bold">⚡ LASER MATRIX</span>
              <span className="text-slate-400">·</span>
              <span className="text-pink-400 font-bold">HITS: {laserHits}</span>
            </div>
          )}

          {worldData.gameMode === 'sumo' && (
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-amber-400 font-bold">🥋 SUMO RING</span>
              <span className="text-slate-400">·</span>
              <span className="text-emerald-400 font-bold">KNOCKOUTS: {sumoKnockouts}</span>
            </div>
          )}

          {worldData.gameMode === 'boss_raid' && (
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-red-400 font-bold">🤖 TITAN HP:</span>
              <div className="w-20 h-2.5 bg-slate-800 rounded-full overflow-hidden border border-red-500/40">
                <div
                  className="h-full bg-red-500 transition-all duration-200"
                  style={{ width: `${(bossHealth / 500) * 100}%` }}
                />
              </div>
              <span className="text-amber-300 font-bold">{bossHealth}</span>
            </div>
          )}

          {worldData.gameMode === 'soccer' && (
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-red-400 font-bold">⚽ RED: {soccerScore.red}</span>
              <span className="text-slate-400">-</span>
              <span className="text-blue-400 font-bold">BLUE: {soccerScore.blue}</span>
            </div>
          )}

          {worldData.gameMode === 'moon_gravity' && (
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-cyan-300 font-bold">🛸 ZERO-G ORBIT</span>
              <span className="text-slate-400">·</span>
              <span className="text-pink-400 font-bold">HITS: {laserHits}</span>
            </div>
          )}

          {/* Jetpack Fuel Indicator when Jetpack equipped */}
          {equippedItem === 'jetpack' && (
            <div className="flex items-center gap-2 pl-2 border-l border-white/10 text-xs font-mono text-cyan-300">
              <span>🚀 FUEL</span>
              <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden border border-cyan-500/30">
                <div
                  className="h-full bg-cyan-400 transition-all"
                  style={{ width: `${jetpackFuel}%` }}
                />
              </div>
            </div>
          )}

          {/* Health Bar */}
          <div className="flex items-center gap-2 pl-2 border-l border-white/10">
            <span className="text-xs text-slate-400">HP</span>
            <div className="w-24 h-2.5 bg-slate-800 rounded-full overflow-hidden border border-white/10">
              <div
                className={`h-full transition-all duration-200 ${
                  health > 50 ? 'bg-emerald-500' : health > 25 ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${(health / maxHealth) * 100}%` }}
              />
            </div>
            <span className="text-xs font-mono text-slate-300">{health}</span>
          </div>

          {/* BloxCoins */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-white/10 text-amber-400 text-xs font-bold font-mono">
            <span>🪙</span>
            <span>{coins}</span>
          </div>
        </div>

        {/* Right Action Tools: Players, Chat, Fullscreen, Perspective, Ragdoll, Music, Quests, Emotes, Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
          {isOnlineRoom && (
            <>
              <button
                onClick={() => {
                  sound.playClick();
                  setShowPlayersDrawer((v) => !v);
                }}
                title="Connected Players & Scores"
                className="bg-slate-900/80 hover:bg-slate-800 border border-emerald-500/40 text-emerald-300 px-3 py-2 rounded-xl text-xs font-semibold backdrop-blur-xs transition-colors shadow-lg cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
              >
                <span>👥</span>
                <span className="hidden sm:inline tabular-nums">Players ({roomPlayers.length})</span>
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  setIsChatOpen((v) => !v);
                }}
                title="Toggle Room Chat (T)"
                className="bg-slate-900/80 hover:bg-slate-800 border border-sky-500/40 text-sky-300 px-3 py-2 rounded-xl text-xs font-semibold backdrop-blur-xs transition-colors shadow-lg cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
              >
                <span>💬</span>
                <span className="hidden sm:inline">Chat</span>
              </button>
            </>
          )}

          {/* Daily Quests Trigger */}
          <button
            onClick={() => {
              sound.playClick();
              setIsDailyMissionsOpen(true);
            }}
            title="Daily Missions & Quests"
            className="bg-slate-900/80 hover:bg-slate-800 border border-amber-500/40 text-amber-300 px-3 py-2 rounded-xl text-xs font-semibold backdrop-blur-xs transition-colors shadow-lg cursor-pointer flex items-center gap-1.5"
          >
            <span>📜</span>
            <span className="hidden sm:inline">Quests</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            className="bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-200 px-2.5 py-2 rounded-xl text-xs font-semibold backdrop-blur-xs transition-colors shadow-lg cursor-pointer flex items-center gap-1"
          >
            <span>{isFullscreen ? '↙' : '⛶'}</span>
            <span className="hidden sm:inline">{isFullscreen ? 'Exit' : 'Full'}</span>
          </button>

          {/* Perspective Toggle (1st / 3rd person) */}
          <button
            onClick={toggleCameraPerspective}
            title={isFirstPerson ? 'Switch to 3rd Person Orbit' : 'Switch to 1st Person POV'}
            className="bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-cyan-300 px-2.5 py-2 rounded-xl text-xs font-semibold backdrop-blur-xs transition-colors shadow-lg cursor-pointer flex items-center gap-1"
          >
            <span>{isFirstPerson ? '👁️' : '🎥'}</span>
            <span className="hidden sm:inline">{isFirstPerson ? '1st' : '3rd'}</span>
          </button>

          {/* Ragdoll Toggle Button */}
          <button
            onClick={toggleRagdoll}
            className={`border px-3 py-2 rounded-xl text-xs font-bold backdrop-blur-xs transition-all shadow-lg cursor-pointer flex items-center gap-1.5 ${
              isRagdolling
                ? 'bg-pink-600 text-white border-pink-400 shadow-pink-900/50 scale-105'
                : 'bg-slate-900/80 hover:bg-slate-800 text-pink-300 border-white/10'
            }`}
          >
            <span>🤸</span> <span className="hidden md:inline">{isRagdolling ? 'Stand Up (R)' : 'Ragdoll (R)'}</span>
          </button>

          {/* BGM Toggle */}
          <button
            onClick={toggleMusic}
            title={isMusicPlaying ? 'Mute Music' : 'Play Music'}
            className="bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-200 px-2.5 py-2 rounded-xl text-xs font-semibold backdrop-blur-xs transition-colors shadow-lg cursor-pointer"
          >
            {isMusicPlaying ? '🎵' : '🔇'}
          </button>

          {/* Emotes Trigger */}
          <button
            onClick={() => setShowEmotesMenu((e) => !e)}
            className="bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-amber-300 px-3 py-2 rounded-xl text-xs font-semibold backdrop-blur-xs transition-colors shadow-lg cursor-pointer flex items-center gap-1"
          >
            <span>🕺</span> <span className="hidden sm:inline">Dances</span>
          </button>

          <button
            onClick={() => setIsPaused(true)}
            className="bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-200 px-3 py-2 rounded-xl text-xs font-semibold backdrop-blur-xs transition-colors shadow-lg cursor-pointer"
          >
            Menu
          </button>
        </div>
      </div>

      {/* Emotes Floating Wheel / Bar */}
      {showEmotesMenu && (
        <div className="absolute top-16 right-4 z-40 bg-slate-900/95 border border-white/20 p-3 rounded-2xl shadow-2xl flex flex-col gap-1.5 min-w-[210px] backdrop-blur-sm animate-in fade-in">
          <div className="text-[11px] font-bold text-slate-400 px-2 tracking-wider">CHOOSE EMOTE DANCE</div>
          <button
            onClick={() => triggerEmote('floss')}
            className="text-left px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-pink-600 text-xs font-semibold text-white transition-colors cursor-pointer flex items-center gap-2"
          >
            <span>💃</span> 5. The Floss Dance
          </button>
          <button
            onClick={() => triggerEmote('chicken_dance')}
            className="text-left px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-amber-600 text-xs font-semibold text-white transition-colors cursor-pointer flex items-center gap-2"
          >
            <span>🐔</span> 7. Chicken Dance
          </button>
          <button
            onClick={() => triggerEmote('worm')}
            className="text-left px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-emerald-600 text-xs font-semibold text-white transition-colors cursor-pointer flex items-center gap-2"
          >
            <span>🐛</span> 6. The Worm Crawl
          </button>
          <button
            onClick={() => triggerEmote('breakdance')}
            className="text-left px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-sky-600 text-xs font-semibold text-white transition-colors cursor-pointer flex items-center gap-2"
          >
            <span>🕺</span> 1. Breakdance Spin
          </button>
          <button
            onClick={() => triggerEmote('wave')}
            className="text-left px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-sky-600 text-xs font-semibold text-white transition-colors cursor-pointer flex items-center gap-2"
          >
            <span>👋</span> 2. Cheerful Wave
          </button>
          <button
            onClick={() => triggerEmote('backflip')}
            className="text-left px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-sky-600 text-xs font-semibold text-white transition-colors cursor-pointer flex items-center gap-2"
          >
            <span>🤸</span> 3. Backflip Stunt
          </button>
          <button
            onClick={() => triggerEmote('robot')}
            className="text-left px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-sky-600 text-xs font-semibold text-white transition-colors cursor-pointer flex items-center gap-2"
          >
            <span>🤖</span> 4. Robot Groove
          </button>
        </div>
      )}

      {/* Floating Notification */}
      {gameMessage && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-white/20 text-white px-6 py-2.5 rounded-full text-sm font-medium shadow-2xl backdrop-blur-xs pointer-events-none z-30 transition-all">
          {gameMessage}
        </div>
      )}

      {/* Kill feed */}
      {killFeed.length > 0 && (
        <div className="absolute top-20 right-4 flex flex-col gap-1.5 pointer-events-none z-20">
          {killFeed.map((kf, i) => (
            <div
              key={i}
              className="bg-slate-900/80 border border-red-500/30 text-red-200 px-3 py-1 rounded-md text-xs font-mono shadow-md backdrop-blur-xs"
            >
              {kf}
            </div>
          ))}
        </div>
      )}

      {/* Desktop Gear Quick-Bar (Always visible on desktop screens) */}
      <div
        className={`absolute bottom-14 left-1/2 -translate-x-1/2 items-center gap-1.5 bg-slate-900/85 border border-white/10 p-1.5 rounded-2xl backdrop-blur-xs z-20 shadow-xl max-w-[95vw] overflow-x-auto ${
          userSettings.showTouchControls ? 'hidden md:flex' : 'flex'
        }`}
      >
        <span className="text-[10px] font-bold text-slate-400 px-2 tracking-wider shrink-0">GEAR</span>
        {[
          { id: 'rocket_launcher', label: '🚀 Rocket Launcher' },
          { id: 'grappling_hook', label: '🪝 Grappling Hook' },
          { id: 'jetpack', label: '🚀 Jetpack' },
          { id: 'laser_katana', label: '⚡ Laser Katana' },
          { id: 'super_pogo', label: '🦘 Super Pogo' },
          { id: 'ghost_cloak', label: '👻 Ghost Cloak' },
          { id: 'sword', label: '⚔️ Sword' },
          { id: 'paintball_gun', label: '🔫 Paintball' },
          { id: 'speed_coil', label: '⚡ Speed Coil' },
          { id: 'gravity_coil', label: '🔮 Gravity Coil' },
          { id: 'rubber_chicken', label: '🐔 Rubber Chicken' },
          { id: 'banana_peel', label: '🍌 Banana Peel' },
          { id: 'slap_hand', label: '✋ Slap Hand' },
          { id: 'none', label: '✕ Bare Hands' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => {
              sound.playClick();
              const it = item.id as EquippedItemType;
              setEquippedItem(it);
              currentItemRef.current = it;
              if (playerRigRef.current) {
                playerRigRef.current.setEquippedItem(it);
              }
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              equippedItem === item.id
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Desktop Controls Legend (Always visible on desktop screens) */}
      <div
        className={`absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/75 border border-white/10 px-5 py-2 rounded-full text-xs text-slate-300 backdrop-blur-xs pointer-events-none z-20 items-center gap-4 ${
          userSettings.showTouchControls ? 'hidden md:flex' : 'flex'
        }`}
      >
        <span><kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-white border border-white/10">WASD</kbd> Move</span>
        <span>·</span>
        <span><kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-white border border-white/10">Space</kbd> Jump</span>
        <span>·</span>
        <span><kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-white border border-white/10">R</kbd> Ragdoll</span>
        <span>·</span>
        <span><kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-white border border-white/10">Right Drag</kbd> Orbit</span>
        <span>·</span>
        <span><kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-white border border-white/10">Q / Click</kbd> Action</span>
        <span>·</span>
        <span><kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-white border border-white/10">E</kbd> Interact</span>
        <span>·</span>
        <span><kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-white border border-white/10">1-7</kbd> Dances</span>
      </div>

      {/* Mobile Floating Gear Trigger & Popup (Shown on small screens) */}
      {userSettings.showTouchControls && (
        <div className="md:hidden">
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
            <button
              onClick={() => {
                try {
                  navigator?.vibrate?.(12);
                } catch {
                  // ignore
                }
                setShowMobileGear((g) => !g);
              }}
              className="bg-slate-900/90 hover:bg-slate-800 border border-white/20 text-white px-4 py-2 rounded-full text-xs font-bold backdrop-blur-md shadow-2xl flex items-center gap-1.5 active:scale-95 transition-transform"
            >
              <span>🎒</span>
              <span>
                {equippedItem === 'none'
                  ? 'Gear: Bare Hands'
                  : `Gear: ${equippedItem.replace('_', ' ').toUpperCase()}`}
              </span>
              <span className="text-[10px] text-sky-400 font-mono">
                {showMobileGear ? '▼' : '▲'}
              </span>
            </button>
          </div>

          {showMobileGear && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 border border-white/20 p-3 rounded-2xl shadow-2xl backdrop-blur-md flex flex-wrap gap-2 max-w-[92vw] justify-center animate-in fade-in zoom-in-95 pointer-events-auto">
              <div className="w-full text-center text-[10px] font-bold text-slate-400 tracking-wider">
                SELECT EQUIPPED ITEM
              </div>
              {[
                { id: 'rocket_launcher', label: '🚀 Rocket Launcher' },
                { id: 'grappling_hook', label: '🪝 Grappling Hook' },
                { id: 'jetpack', label: '🚀 Jetpack' },
                { id: 'laser_katana', label: '⚡ Laser Katana' },
                { id: 'super_pogo', label: '🦘 Super Pogo' },
                { id: 'ghost_cloak', label: '👻 Ghost Cloak' },
                { id: 'sword', label: '⚔️ Sword' },
                { id: 'paintball_gun', label: '🔫 Paintball' },
                { id: 'speed_coil', label: '⚡ Speed Coil' },
                { id: 'gravity_coil', label: '🔮 Gravity Coil' },
                { id: 'rubber_chicken', label: '🐔 Rubber Chicken' },
                { id: 'banana_peel', label: '🍌 Banana Peel' },
                { id: 'slap_hand', label: '✋ Slap Hand' },
                { id: 'none', label: '✕ Bare Hands' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    try {
                      navigator?.vibrate?.(15);
                    } catch {
                      // ignore
                    }
                    sound.playClick();
                    const it = item.id as EquippedItemType;
                    setEquippedItem(it);
                    currentItemRef.current = it;
                    if (playerRigRef.current) {
                      playerRigRef.current.setEquippedItem(it);
                    }
                    setShowMobileGear(false);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                    equippedItem === item.id
                      ? 'bg-sky-500 text-white shadow-lg'
                      : 'bg-slate-800/80 text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Touch Joystick & Actions Cluster */}
      {userSettings.showTouchControls && (
        <div className="absolute inset-x-4 sm:inset-x-8 bottom-6 flex justify-between items-end pointer-events-none z-25">
          {/* Left: Virtual Analog Joystick */}
          <div
            className="w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-slate-900/70 border-2 border-white/20 pointer-events-auto flex items-center justify-center relative touch-none shadow-2xl backdrop-blur-xs"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
          >
            {/* Subtle compass guide dots */}
            <div className="absolute top-2 w-1.5 h-1.5 rounded-full bg-white/20" />
            <div className="absolute bottom-2 w-1.5 h-1.5 rounded-full bg-white/20" />
            <div className="absolute left-2 w-1.5 h-1.5 rounded-full bg-white/20" />
            <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white/20" />

            {/* Analog Thumb Knob */}
            <div
              className={`w-14 h-14 rounded-full border-2 transition-shadow shadow-xl pointer-events-none ${
                joystickKnob.active
                  ? 'bg-gradient-to-tr from-sky-500 to-cyan-300 border-white shadow-sky-500/50 scale-105'
                  : 'bg-slate-700/80 border-white/30'
              }`}
              style={{
                transform: `translate(${joystickKnob.x}px, ${joystickKnob.y}px)`,
                transition: joystickKnob.active ? 'none' : 'transform 0.15s ease-out',
              }}
            />
          </div>

          {/* Right: Ergonomic Action Button Cluster */}
          <div className="flex flex-col items-end gap-3 pointer-events-auto">
            {/* Upper quick toggles row */}
            <div className="flex items-center gap-2 mb-1">
              {/* Perspective POV */}
              <button
                onTouchStart={(e) => {
                  e.stopPropagation();
                  toggleCameraPerspective();
                }}
                className="w-11 h-11 rounded-full bg-slate-900/80 hover:bg-slate-800 text-cyan-300 font-bold border border-white/20 shadow-lg flex items-center justify-center text-xs active:scale-90 transition-transform"
                title="Camera View"
              >
                {isFirstPerson ? '👁️' : '🎥'}
              </button>

              {/* Emotes Dance */}
              <button
                onTouchStart={(e) => {
                  e.stopPropagation();
                  try {
                    navigator?.vibrate?.(12);
                  } catch {
                    // ignore
                  }
                  setShowEmotesMenu((m) => !m);
                }}
                className="w-11 h-11 rounded-full bg-slate-900/80 hover:bg-slate-800 text-amber-300 font-bold border border-white/20 shadow-lg flex items-center justify-center text-xs active:scale-90 transition-transform"
                title="Dance"
              >
                🕺
              </button>

              {/* Flop / Stand Ragdoll */}
              <button
                onTouchStart={(e) => {
                  e.stopPropagation();
                  toggleRagdoll();
                }}
                className={`px-3 py-1.5 rounded-full font-bold text-xs shadow-lg border flex items-center gap-1 active:scale-95 transition-transform ${
                  isRagdolling
                    ? 'bg-pink-600 border-pink-300 text-white'
                    : 'bg-slate-900/80 border-white/20 text-pink-300'
                }`}
              >
                <span>🤸</span>
                <span>{isRagdolling ? 'Stand' : 'Flop'}</span>
              </button>
            </div>

            {/* Lower Main Action Buttons */}
            <div className="flex items-end gap-3">
              {/* Interact Button (KeyE / station / door / clue) */}
              <button
                onTouchStart={(e) => {
                  e.stopPropagation();
                  try {
                    navigator?.vibrate?.(15);
                  } catch {
                    // ignore
                  }
                  keysPressed.current['KeyE'] = true;
                  triggerInteractRef.current();
                }}
                onTouchEnd={(e) => {
                  e.stopPropagation();
                  keysPressed.current['KeyE'] = false;
                }}
                className="w-14 h-14 rounded-full bg-sky-600 hover:bg-sky-500 active:bg-sky-400 text-white font-bold text-xs flex flex-col items-center justify-center border-2 border-white/30 shadow-xl active:scale-95 transition-transform"
              >
                <span>⚡</span>
                <span className="text-[10px] font-black tracking-tight">USE</span>
              </button>

              {/* Action / Attack Button (KeyQ / sword / paintball / chicken) */}
              <button
                onTouchStart={(e) => {
                  e.stopPropagation();
                  try {
                    navigator?.vibrate?.(25);
                  } catch {
                    // ignore
                  }
                  triggerActionRef.current();
                }}
                className="w-16 h-16 rounded-full bg-amber-500 hover:bg-amber-400 active:bg-amber-300 text-slate-950 font-black text-xs flex flex-col items-center justify-center border-2 border-white/40 shadow-2xl active:scale-95 transition-transform"
              >
                <span>⚔️</span>
                <span className="text-[11px] font-black tracking-tight">ACTION</span>
              </button>

              {/* JUMP Button (Space) */}
              <button
                onTouchStart={(e) => {
                  e.stopPropagation();
                  try {
                    navigator?.vibrate?.(18);
                  } catch {
                    // ignore
                  }
                  keysPressed.current['Space'] = true;
                }}
                onTouchEnd={(e) => {
                  e.stopPropagation();
                  keysPressed.current['Space'] = false;
                }}
                className="w-20 h-20 rounded-full bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-300 text-slate-950 font-black text-sm flex flex-col items-center justify-center border-2 border-white/50 shadow-2xl active:scale-95 transition-transform shadow-emerald-500/30"
              >
                <span>⬆️</span>
                <span className="text-xs font-black tracking-wider">JUMP</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pause Menu Modal */}
      {isPaused && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 p-8 rounded-2xl max-w-md w-full shadow-2xl flex flex-col gap-6 text-center">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-bold text-white tracking-tight">{worldData.name}</h2>
              <p className="text-xs text-slate-400">Game paused. Ready to continue your adventure?</p>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-xl border border-white/5 flex justify-around text-xs font-mono text-slate-300">
              <div>
                <div className="text-slate-500">Coins</div>
                <div className="text-base font-bold text-amber-400">🪙 {coins}</div>
              </div>
              <div>
                <div className="text-slate-500">Health</div>
                <div className="text-base font-bold text-emerald-400">{health} / 100</div>
              </div>
            </div>

            {/* Quick Touch Controls Toggle */}
            <div className="flex items-center justify-between bg-slate-950/40 p-3 rounded-xl border border-white/5 text-xs text-slate-300">
              <div className="text-left">
                <div className="font-semibold text-white">On-Screen Touch Buttons</div>
                <div className="text-[11px] text-slate-400">Virtual analog stick & jump buttons</div>
              </div>
              <button
                onClick={() => {
                  sound.playClick();
                  userSettings.showTouchControls = !userSettings.showTouchControls;
                  StorageManager.saveUserSettings(userSettings);
                  setIsPaused(false);
                }}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer transition-colors ${
                  userSettings.showTouchControls
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {userSettings.showTouchControls ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {isOnlineRoom && roomSession && (
                <div className="bg-slate-950/70 border border-emerald-500/30 rounded-xl p-3 flex items-center justify-between text-xs">
                  <div className="text-left">
                    <div className="text-slate-400">Friend Invite Code</div>
                    <div className="font-mono font-bold text-emerald-400 text-sm tracking-widest">
                      {roomSession.roomCode}
                    </div>
                  </div>
                  <button
                    onClick={handleCopyRoomCode}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                  >
                    {codeCopied ? 'Copied!' : 'Copy Code'}
                  </button>
                </div>
              )}

              <button
                onClick={() => setIsPaused(false)}
                className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg cursor-pointer text-sm"
              >
                Resume Game
              </button>

              {isOnlineRoom && onSwitchToOffline && (
                <button
                  onClick={() => {
                    sound.playClick();
                    setIsPaused(false);
                    onSwitchToOffline();
                  }}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold py-2.5 rounded-xl transition-colors cursor-pointer text-sm border border-amber-500/20"
                >
                  Switch to Offline Singleplayer
                </button>
              )}

              {onOpenAvatar && (
                <button
                  onClick={() => {
                    setIsPaused(false);
                    onOpenAvatar();
                  }}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-2.5 rounded-xl transition-colors cursor-pointer text-sm"
                >
                  Edit Avatar Look
                </button>
              )}
              <button
                onClick={onExitToMenu}
                className="w-full bg-red-600/20 hover:bg-red-600/30 text-red-400 font-semibold py-2.5 rounded-xl transition-colors cursor-pointer text-sm border border-red-500/20"
              >
                {isStudioTestPlay ? 'Stop Test & Return to Studio' : 'Exit to Discover Hub'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Online Multiplayer: Players / Leaderboard Drawer */}
      {isOnlineRoom && showPlayersDrawer && (
        <div className="absolute top-16 right-4 z-40 w-64 bg-slate-900/95 border border-white/15 rounded-2xl p-3.5 shadow-2xl backdrop-blur-sm flex flex-col gap-2.5 pointer-events-auto">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-xs font-bold text-white">Room Players ({roomPlayers.length})</span>
            <button
              onClick={() => setShowPlayersDrawer(false)}
              className="text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              ✕
            </button>
          </div>
          <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto">
            {roomPlayers.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-950/60 text-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  {p.team !== 'none' && (
                    <span className={`font-bold ${p.team === 'red' ? 'text-red-400' : 'text-blue-400'}`}>
                      {p.team === 'red' ? 'RED' : 'BLUE'}
                    </span>
                  )}
                  <span className="text-slate-100 font-medium truncate">
                    {p.nickname}
                    {p.id === roomSession?.playerId ? ' (You)' : ''}
                  </span>
                </div>
                <span className="font-mono text-amber-300 tabular-nums shrink-0">{p.score} pts</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Online Multiplayer: Live Room Chat Panel */}
      {isOnlineRoom && isChatOpen && (
        <div
          className={`absolute z-30 pointer-events-auto bg-slate-900/85 border border-white/15 rounded-2xl shadow-2xl backdrop-blur-sm flex flex-col overflow-hidden ${
            userSettings.showTouchControls
              ? 'top-16 left-4 w-72 max-w-[calc(100vw-2rem)]'
              : 'bottom-28 left-4 w-80 max-w-[calc(100vw-2rem)]'
          }`}
        >
          <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-200">Room Chat</span>
            <button
              onClick={() => setIsChatOpen(false)}
              className="text-slate-400 hover:text-white cursor-pointer text-xs"
            >
              Hide
            </button>
          </div>
          <div
            ref={chatLogRef}
            className="h-36 overflow-y-auto px-3 py-2 flex flex-col gap-1.5 text-xs"
          >
            {chatMessages.map((m) => (
              <div key={m.id} className={m.isSystem ? 'text-emerald-300/90 italic' : 'text-slate-200'}>
                {!m.isSystem && (
                  <span className="font-bold text-sky-300 mr-1.5">{m.senderName}:</span>
                )}
                <span className="break-words">{m.text}</span>
              </div>
            ))}
          </div>
          <form onSubmit={handleSendChat} className="p-2 border-t border-white/10 flex items-center gap-1.5">
            <input
              ref={chatInputRef}
              type="text"
              maxLength={160}
              value={chatInput}
              onFocus={() => {
                isChatFocusedRef.current = true;
              }}
              onBlur={() => {
                isChatFocusedRef.current = false;
              }}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Say something (T)..."
              className="flex-1 bg-slate-950/90 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-sky-500 outline-none"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold cursor-pointer shrink-0"
            >
              Send
            </button>
          </form>
        </div>
      )}

      {/* Daily Missions Modal */}
      <DailyMissionsModal
        isOpen={isDailyMissionsOpen}
        onClose={() => setIsDailyMissionsOpen(false)}
        onCoinsAwarded={(amt) => setCoins((c) => c + amt)}
      />
    </div>
  );
};
