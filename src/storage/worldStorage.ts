/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AvatarConfig, BrickWorldData, PlayerStats, UserSettings } from '../types/game';
import { ALL_BUILTIN_WORLDS, classicBaseplateWorld } from '../games/builtInWorlds';

const STORAGE_KEY_CUSTOM_WORLDS = 'brickverse_custom_worlds_v1';
const STORAGE_KEY_AVATAR = 'brickverse_avatar_v1';
const STORAGE_KEY_SETTINGS = 'brickverse_settings_v1';
const STORAGE_KEY_STATS = 'brickverse_player_stats_v1';

export const DEFAULT_AVATAR_CONFIG: AvatarConfig = {
  headColor: '#facc15', // Classic yellow
  torsoColor: '#0284c7', // Classic blue
  leftArmColor: '#facc15',
  rightArmColor: '#facc15',
  leftLegColor: '#16a34a', // Classic green pants
  rightLegColor: '#16a34a',
  face: 'smile',
  hat: 'cap',
  backAccessory: 'sword',
  shirtPattern: 'classic',
  scale: 1.0,
};

export const DEFAULT_USER_SETTINGS: UserSettings = {
  graphicsQuality: 'high',
  shadowsEnabled: true,
  soundVolume: 0.7,
  musicEnabled: true,
  mouseSensitivity: 1.0,
  fov: 70,
  invertY: false,
  showTouchControls: false,
};

export const DEFAULT_PLAYER_STATS: PlayerStats = {
  coins: 150,
  gamesPlayed: 0,
  obbyBestTime: 0,
  speedRunBestTime: 0,
  disasterWins: 0,
  pizzasDelivered: 0,
  swordKills: 0,
  mansionEscapes: 0,
  hideAndSeekWins: 0,
  ragdollScore: 0,
  lavaEscapes: 0,
};

export class StorageManager {
  // Worlds
  public static getCustomWorlds(): BrickWorldData[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_WORLDS);
      if (!raw) return [];
      return JSON.parse(raw) as BrickWorldData[];
    } catch {
      return [];
    }
  }

  public static saveCustomWorld(world: BrickWorldData) {
    try {
      const worlds = this.getCustomWorlds();
      const existingIdx = worlds.findIndex((w) => w.id === world.id);
      world.updated = Date.now();

      if (existingIdx >= 0) {
        worlds[existingIdx] = world;
      } else {
        worlds.unshift(world);
      }
      localStorage.setItem(STORAGE_KEY_CUSTOM_WORLDS, JSON.stringify(worlds));
    } catch (err) {
      console.error('Failed to save world to localStorage', err);
    }
  }

  public static deleteCustomWorld(worldId: string) {
    try {
      const worlds = this.getCustomWorlds().filter((w) => w.id !== worldId);
      localStorage.setItem(STORAGE_KEY_CUSTOM_WORLDS, JSON.stringify(worlds));
    } catch (err) {
      console.error('Failed to delete world', err);
    }
  }

  public static createNewWorld(name: string, templateType: 'blank' | 'island' = 'blank'): BrickWorldData {
    const id = `world_custom_${Date.now()}`;
    const base = JSON.parse(JSON.stringify(classicBaseplateWorld)) as BrickWorldData;
    base.id = id;
    base.name = name.trim() || 'My Creative World';
    base.description = 'A custom built world created with the BrickVerse Studio.';
    base.author = 'You';
    base.created = Date.now();
    base.updated = Date.now();

    this.saveCustomWorld(base);
    return base;
  }

  // JSON File Export (download)
  public static exportWorldToJson(world: BrickWorldData) {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(world, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    const safeName = world.name.toLowerCase().replace(/[^a-z0-9]/gi, '_');
    downloadAnchor.setAttribute('download', `${safeName}.brickverse.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  // JSON File Import (upload)
  public static async importWorldFromJson(file: File): Promise<BrickWorldData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsed = JSON.parse(content) as BrickWorldData;
          if (!parsed.parts || !Array.isArray(parsed.parts)) {
            throw new Error('Invalid BrickVerse world format: missing parts array');
          }
          parsed.id = `imported_${Date.now()}`;
          parsed.updated = Date.now();
          StorageManager.saveCustomWorld(parsed);
          resolve(parsed);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  // Avatar Config
  public static getAvatarConfig(): AvatarConfig {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_AVATAR);
      if (!raw) return DEFAULT_AVATAR_CONFIG;
      return { ...DEFAULT_AVATAR_CONFIG, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_AVATAR_CONFIG;
    }
  }

  public static saveAvatarConfig(config: AvatarConfig) {
    try {
      localStorage.setItem(STORAGE_KEY_AVATAR, JSON.stringify(config));
    } catch (err) {
      console.error('Failed to save avatar', err);
    }
  }

  // Settings
  public static getUserSettings(): UserSettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (!raw) return DEFAULT_USER_SETTINGS;
      return { ...DEFAULT_USER_SETTINGS, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_USER_SETTINGS;
    }
  }

  public static saveUserSettings(settings: UserSettings) {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (err) {
      console.error('Failed to save settings', err);
    }
  }

  // Player Stats
  public static getPlayerStats(): PlayerStats {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_STATS);
      if (!raw) return DEFAULT_PLAYER_STATS;
      return { ...DEFAULT_PLAYER_STATS, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_PLAYER_STATS;
    }
  }

  public static updatePlayerStats(partial: Partial<PlayerStats>) {
    try {
      const current = this.getPlayerStats();
      const updated = { ...current, ...partial };
      localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(updated));
      return updated;
    } catch {
      return DEFAULT_PLAYER_STATS;
    }
  }

  public static findWorldById(id: string): BrickWorldData | undefined {
    const builtin = ALL_BUILTIN_WORLDS.find((w) => w.id === id);
    if (builtin) return JSON.parse(JSON.stringify(builtin));
    const custom = this.getCustomWorlds().find((w) => w.id === id);
    if (custom) return JSON.parse(JSON.stringify(custom));
    return undefined;
  }
}
