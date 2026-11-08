/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PartType =
  | 'block'
  | 'cylinder'
  | 'wedge'
  | 'sphere'
  | 'kill'
  | 'bounce'
  | 'conveyor'
  | 'checkpoint'
  | 'light'
  | 'spawn';

export type PartMaterial = 'plastic' | 'studs' | 'neon' | 'glass' | 'metal' | 'wood';

export interface BrickPart {
  id: string;
  type: PartType;
  name: string;
  position: [number, number, number];
  size: [number, number, number];
  rotation: [number, number, number]; // Euler angles in radians or degrees
  color: string;
  material: PartMaterial;
  anchored: boolean;
  canCollide: boolean;
  transparency?: number;
  metadata?: {
    bounceForce?: number;
    conveyorSpeed?: [number, number];
    checkpointIndex?: number;
    lightColor?: string;
    lightIntensity?: number;
    lightDistance?: number;
    damage?: number;
    isDestructible?: boolean;
    respawnTime?: number;
    isCoinPickup?: boolean;
    isClue?: boolean;
  };
}

export type GameModeType =
  | 'sandbox'
  | 'obby'
  | 'disaster'
  | 'pizza'
  | 'sword'
  | 'speed_run'
  | 'murder'
  | 'hide_seek'
  | 'ragdoll'
  | 'floor_lava';

export interface BrickWorldData {
  id: string;
  name: string;
  description: string;
  author: string;
  version: number;
  created: number;
  updated: number;
  gameMode?: GameModeType;
  environment: {
    skyColor: string;
    fogDensity: number;
    ambientColor: string;
    sunPosition: [number, number, number];
    sunIntensity: number;
  };
  spawnPoint: [number, number, number];
  parts: BrickPart[];
}

export type AvatarFace =
  | 'smile'
  | 'chill'
  | 'epic'
  | 'evil'
  | 'cyborg'
  | 'stare'
  | 'wink'
  | 'chad'
  | 'derp'
  | 'screaming'
  | 'clown'
  | 'mustache';

export type AvatarHat =
  | 'none'
  | 'cap'
  | 'fedora'
  | 'headphones'
  | 'valkyrie'
  | 'crown'
  | 'ninja'
  | 'halo'
  | 'viking'
  | 'propeller'
  | 'traffic_cone'
  | 'cheese'
  | 'chicken';

export type AvatarBackAccessory =
  | 'none'
  | 'sword'
  | 'wings'
  | 'jetpack'
  | 'dragon_wings'
  | 'skateboard'
  | 'boombox'
  | 'balloons'
  | 'pizza_jet'
  | 'toilet_paper';

export type AvatarShirt = 'classic' | 'tuxedo' | 'hoodie' | 'stripes' | 'armor' | 'police' | 'cyber' | 'ninja' | 'retro';

export interface AvatarConfig {
  headColor: string;
  torsoColor: string;
  leftArmColor: string;
  rightArmColor: string;
  leftLegColor: string;
  rightLegColor: string;
  face: AvatarFace;
  hat: AvatarHat;
  backAccessory: AvatarBackAccessory;
  shirtPattern: AvatarShirt;
  scale: number;
}

export interface UserSettings {
  graphicsQuality: 'low' | 'medium' | 'high';
  shadowsEnabled: boolean;
  soundVolume: number; // 0 to 1
  musicEnabled: boolean;
  mouseSensitivity: number; // 0.2 to 2.0
  fov: number; // 60 to 95
  invertY: boolean;
  showTouchControls: boolean;
}

export interface PlayerStats {
  coins: number;
  gamesPlayed: number;
  obbyBestTime: number; // in seconds (0 = none)
  speedRunBestTime: number;
  disasterWins: number;
  pizzasDelivered: number;
  swordKills: number;
  mansionEscapes: number;
  hideAndSeekWins: number;
  ragdollScore: number;
  lavaEscapes: number;
}
