/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import confetti from 'canvas-confetti';
import { AvatarConfig, BrickWorldData, UserSettings } from '../types/game';
import { buildCharacter, CharacterRig, EmoteType, EquippedItemType } from './characterBuilder';
import { WorldRenderer } from './worldRenderer';
import { CameraController } from './cameraController';
import { sound } from '../audio/soundEngine';
import { StorageManager } from '../storage/worldStorage';

interface GameViewportProps {
  worldData: BrickWorldData;
  avatarConfig: AvatarConfig;
  userSettings: UserSettings;
  onExitToMenu: () => void;
  onOpenAvatar?: () => void;
  isStudioTestPlay?: boolean;
}

interface SimulatedBot {
  rig: CharacterRig;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  targetPos: THREE.Vector3;
  health: number;
  maxHealth: number;
  team: 'red' | 'blue' | 'impostor' | 'seeker';
  name: string;
  attackCooldown: number;
  isGiant?: boolean;
}

interface PaintballProjectile {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;
}

export const GameViewport: React.FC<GameViewportProps> = ({
  worldData,
  avatarConfig,
  userSettings,
  onExitToMenu,
  onOpenAvatar,
  isStudioTestPlay = false,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

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

  // Mobile touch controls state
  const touchJoystickRef = useRef<{ active: boolean; dx: number; dy: number }>({ active: false, dx: 0, dy: 0 });
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const playerRigRef = useRef<CharacterRig | null>(null);
  const currentItemRef = useRef<EquippedItemType>(
    worldData.gameMode === 'sword' ? 'sword' : 'none'
  );

  // Trigger emote on character
  const triggerEmote = (emote: EmoteType) => {
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
    }

    // Disaster tornado state
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

    // Respawn helper
    const respawnPlayer = () => {
      sound.playOof();
      playerPos.copy(spawnCheckpoint);
      playerVelocity.set(0, 0, 0);
      currentHealth = 100;
      setHealth(100);
      setGameMessage('OOF! Respawned at checkpoint.');
      window.setTimeout(() => setGameMessage(''), 2500);
    };

    // Primary Action (Sword slash, slap, or paintball shot)
    const triggerAction = () => {
      if (attackCooldown > 0) return;
      attackCooldown = 0.35;
      attackProgress = 0.01;
      const currentItem = currentItemRef.current;

      if (currentItem === 'paintball_gun') {
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
          velocity: dir.multiplyScalar(45),
          life: 3.0,
        });
        scene.add(pMesh);
        return;
      }

      if (currentItem === 'slap_hand') {
        sound.playHit();
      } else {
        sound.playSlash();
      }

      // Check hit on bots
      const attackRange = currentItem === 'slap_hand' ? 7.0 : 5.5;
      const attackBox = new THREE.Box3().setFromCenterAndSize(
        playerPos.clone().add(new THREE.Vector3(0, 1.5, 0)),
        new THREE.Vector3(attackRange, 4, attackRange)
      );

      bots.forEach((bot) => {
        if (bot.health <= 0) return;
        if (attackBox.containsPoint(bot.position)) {
          const damage = currentItem === 'slap_hand' ? 20 : 35;
          bot.health -= damage;
          sound.playHit();

          // Knockback
          const knockScalar = currentItem === 'slap_hand' ? 32 : 14;
          const knock = bot.position.clone().sub(playerPos).normalize().multiplyScalar(knockScalar);
          knock.y = 8;
          bot.velocity.add(knock);

          if (bot.health <= 0) {
            sound.playCoin();
            if (worldData.gameMode === 'sword') {
              setSwordKills((k) => {
                const newKills = k + 1;
                StorageManager.updatePlayerStats({ swordKills: newKills });
                return newKills;
              });
              setKillFeed((kf) => [`You eliminated ${bot.name}! ⚔️`, ...kf.slice(0, 3)]);
              setCoins((c) => {
                const nc = c + 50;
                StorageManager.updatePlayerStats({ coins: nc });
                return nc;
              });
              window.setTimeout(() => {
                bot.health = 100;
                bot.position.set((Math.random() - 0.5) * 40, 3, (Math.random() - 0.5) * 40);
              }, 5000);
            } else if (worldData.gameMode === 'murder') {
              setGameMessage('VICTORY! You defeated the Impostor!');
              confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
              setCoins((c) => {
                const nc = c + 120;
                StorageManager.updatePlayerStats({ coins: nc, mansionEscapes: (StorageManager.getPlayerStats().mansionEscapes || 0) + 1 });
                return nc;
              });
            }
          }
        }
      });
    };

    // Tycoon station interaction
    const triggerInteract = () => {
      if (worldData.gameMode === 'pizza') {
        const distDough = playerPos.distanceTo(new THREE.Vector3(-12, 2.2, -6));
        const distTopping = playerPos.distanceTo(new THREE.Vector3(-12, 2.2, -13));
        const distOven = playerPos.distanceTo(new THREE.Vector3(2, 2.5, -12));
        const distRegister = playerPos.distanceTo(new THREE.Vector3(0, 2.2, 2));

        if (distDough < 4.5) {
          setHeldPizzaState('dough');
          sound.playBuildPlace();
          setGameMessage('Picked up fresh dough! Walk to Topping Bar.');
        } else if (distTopping < 4.5) {
          if (heldPizzaState === 'dough') {
            setHeldPizzaState('prepared');
            sound.playBuildPlace();
            setGameMessage('Added Sauce, Mozzarella & Pepperoni! Place into Conveyor Oven.');
          } else {
            setGameMessage('Grab dough from the table first!');
          }
        } else if (distOven < 4.5) {
          if (heldPizzaState === 'prepared') {
            setHeldPizzaState('none');
            sound.playBuildPlace();
            setGameMessage('Baking in conveyor oven... 4s!');
            setOvenTimer(4);
          } else {
            setGameMessage('Prepare pizza toppings first!');
          }
        } else if (distRegister < 5.0) {
          if (heldPizzaState === 'baked') {
            setHeldPizzaState('none');
            sound.playCoin();
            sound.playCheckpoint();
            confetti({ particleCount: 30, spread: 60, origin: { y: 0.7 } });
            setCoins((c) => {
              const nc = c + 40;
              StorageManager.updatePlayerStats({
                coins: nc,
                pizzasDelivered: (StorageManager.getPlayerStats().pizzasDelivered || 0) + 1,
              });
              return nc;
            });
            setGameMessage('Order delivered! +40 BloxCoins!');
          } else {
            setGameMessage('Bake a pizza to complete customer order!');
          }
        }
      }
    };

    // Keyboard handlers
    const onKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = true;

      if (e.code === 'KeyE') {
        triggerInteract();
      }
      if (e.code === 'KeyQ') {
        triggerAction();
      }
      if (e.code === 'KeyB') {
        // Toggle emote dance
        triggerEmote('breakdance');
      }
      if (e.code === 'Digit1') triggerEmote('breakdance');
      if (e.code === 'Digit2') triggerEmote('wave');
      if (e.code === 'Digit3') triggerEmote('backflip');
      if (e.code === 'Digit4') triggerEmote('robot');
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

      const baseSpeed = (worldData.gameMode === 'speed_run' ? 26 : 16) * speedMultiplier;
      playerVelocity.x = THREE.MathUtils.damp(playerVelocity.x, moveVec.x * baseSpeed, isGrounded ? 18 : 6, delta);
      playerVelocity.z = THREE.MathUtils.damp(playerVelocity.z, moveVec.z * baseSpeed, isGrounded ? 18 : 6, delta);

      // Jump
      if ((keys['Space'] || keys['KeyK']) && isGrounded) {
        playerVelocity.y = 19 * gravityMultiplier;
        sound.playJump();
        isGrounded = false;
      }

      // Gravity
      playerVelocity.y -= 48 * delta;

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
      playerRig.updateAnimation(playerVelocity, isGrounded, !isGrounded && playerVelocity.y > 0, attackProgress, delta);

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
      }

      // Update AI Bots
      bots.forEach((bot) => {
        if (bot.health <= 0) return;

        const distToPlayer = bot.position.distanceTo(playerPos);

        if (bot.team === 'seeker') {
          // Seeker patrols playroom and chases if close
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
        } else {
          // Red / Blue Knights
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

        if (bot.position.y < (bot.isGiant ? 3.0 : 1.5)) {
          bot.position.y = bot.isGiant ? 3.0 : 1.5;
          bot.velocity.y = 0;
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

        // Check bot hit
        bots.forEach((b) => {
          if (b.health > 0 && pb.mesh.position.distanceTo(b.position) < (b.isGiant ? 4 : 2)) {
            b.health -= 25;
            sound.playHit();
            pb.life = 0;
          }
        });

        if (pb.life <= 0) {
          scene.remove(pb.mesh);
          pb.mesh.geometry.dispose();
          paintballs.splice(i, 1);
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

    if (isSoftwareGl) afterDraw(tick);
    else frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      sound.stopBGM();
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('contextmenu', onContextMenu);
      window.removeEventListener('resize', onResize);

      worldRenderer.clear();
      paintballs.forEach((p) => {
        scene.remove(p.mesh);
        p.mesh.geometry.dispose();
      });
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [worldData, avatarConfig, userSettings]);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    touchJoystickRef.current = {
      active: true,
      dx: (touch.clientX - centerX) / (rect.width / 2),
      dy: (touch.clientY - centerY) / (rect.height / 2),
    };
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchJoystickRef.current.active) return;
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = Math.max(-1, Math.min(1, (touch.clientX - centerX) / (rect.width / 2)));
    const dy = Math.max(-1, Math.min(1, (touch.clientY - centerY) / (rect.height / 2)));
    touchJoystickRef.current = { active: true, dx, dy };
  };

  const handleTouchEnd = () => {
    touchJoystickRef.current = { active: false, dx: 0, dy: 0 };
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-slate-950">
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Low-Occlusion Top Game HUD */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-20">
        <div className="flex items-center gap-3 bg-slate-900/80 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-xs pointer-events-auto shadow-lg">
          <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
          <span className="font-bold text-sm tracking-wide text-white">{worldData.name}</span>
          <span className="text-xs text-slate-400 font-mono">
            {worldData.gameMode ? worldData.gameMode.toUpperCase() : 'SANDBOX'}
          </span>
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

        {/* Right Action Tools: Music, Emotes, Menu */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* BGM Toggle */}
          <button
            onClick={toggleMusic}
            title={isMusicPlaying ? 'Mute Music' : 'Play Music'}
            className="bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-200 px-3 py-2 rounded-xl text-xs font-semibold backdrop-blur-xs transition-colors shadow-lg cursor-pointer"
          >
            {isMusicPlaying ? '🎵 BGM: ON' : '🔇 BGM: OFF'}
          </button>

          {/* Emotes Trigger */}
          <button
            onClick={() => setShowEmotesMenu((e) => !e)}
            className="bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-amber-300 px-3.5 py-2 rounded-xl text-xs font-semibold backdrop-blur-xs transition-colors shadow-lg cursor-pointer"
          >
            🕺 Dances (B)
          </button>

          <button
            onClick={() => setIsPaused(true)}
            className="bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold backdrop-blur-xs transition-colors shadow-lg cursor-pointer"
          >
            Menu (Esc)
          </button>
        </div>
      </div>

      {/* Emotes Floating Wheel / Bar */}
      {showEmotesMenu && (
        <div className="absolute top-16 right-4 z-40 bg-slate-900/95 border border-white/20 p-3 rounded-2xl shadow-2xl flex flex-col gap-2 min-w-[200px] backdrop-blur-sm animate-in fade-in">
          <div className="text-[11px] font-bold text-slate-400 px-2 tracking-wider">CHOOSE EMOTE</div>
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

      {/* Bottom Gear Quick-Bar */}
      <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-900/80 border border-white/10 p-1.5 rounded-2xl backdrop-blur-xs z-20 shadow-xl">
        <span className="text-[10px] font-bold text-slate-400 px-2 tracking-wider">GEAR</span>
        {[
          { id: 'sword', label: '⚔️ Sword' },
          { id: 'slap_hand', label: '✋ Slap Hand' },
          { id: 'paintball_gun', label: '🔫 Paintball' },
          { id: 'speed_coil', label: '⚡ Speed Coil' },
          { id: 'gravity_coil', label: '🔮 Gravity Coil' },
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
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              equippedItem === item.id
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Minimal Bottom Controls Line */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/75 border border-white/10 px-5 py-2 rounded-full text-xs text-slate-300 backdrop-blur-xs pointer-events-none z-20 flex items-center gap-4">
        <span><kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-white border border-white/10">WASD</kbd> Move</span>
        <span>·</span>
        <span><kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-white border border-white/10">Space</kbd> Jump</span>
        <span>·</span>
        <span><kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-white border border-white/10">Right Drag</kbd> Orbit</span>
        <span>·</span>
        <span><kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-white border border-white/10">Q / Click</kbd> Action</span>
        <span>·</span>
        <span><kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-white border border-white/10">1-4</kbd> Dances</span>
      </div>

      {/* Touch Joystick & Actions */}
      {userSettings.showTouchControls && (
        <div className="absolute inset-x-6 bottom-6 flex justify-between pointer-events-none z-20">
          <div
            className="w-32 h-32 rounded-full bg-slate-900/60 border border-white/20 pointer-events-auto flex items-center justify-center relative touch-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className="w-12 h-12 rounded-full bg-sky-500/80 shadow-lg pointer-events-none transform"
              style={{
                transform: `translate(${touchJoystickRef.current.dx * 30}px, ${touchJoystickRef.current.dy * 30}px)`,
              }}
            />
          </div>

          <div className="flex gap-4 pointer-events-auto items-end">
            <button
              onTouchStart={() => {
                keysPressed.current['KeyE'] = true;
              }}
              onTouchEnd={() => {
                keysPressed.current['KeyE'] = false;
              }}
              className="w-16 h-16 rounded-full bg-amber-500/80 hover:bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center border border-white/20 shadow-xl active:scale-95 transition-transform"
            >
              Action
            </button>
            <button
              onTouchStart={() => {
                keysPressed.current['Space'] = true;
              }}
              onTouchEnd={() => {
                keysPressed.current['Space'] = false;
              }}
              className="w-20 h-20 rounded-full bg-emerald-500/80 hover:bg-emerald-400 text-slate-950 font-black text-base flex items-center justify-center border border-white/20 shadow-xl active:scale-95 transition-transform"
            >
              JUMP
            </button>
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

            <div className="flex flex-col gap-3">
              <button
                onClick={() => setIsPaused(false)}
                className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg cursor-pointer text-sm"
              >
                Resume Game
              </button>
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
    </div>
  );
};
