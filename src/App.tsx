/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AvatarConfig, BrickWorldData, PlayerStats, UserSettings } from './types/game';
import { StorageManager } from './storage/worldStorage';
import { MainMenu } from './components/MainMenu';
import { GameViewport } from './engine/GameViewport';
import { AvatarEditor } from './components/AvatarEditor';
import { WorldStudio } from './studio/WorldStudio';
import { sound } from './audio/soundEngine';
import { recordMissionAction } from './utils/dailyMissions';

type AppMode = 'menu' | 'game' | 'studio' | 'avatar';

export default function App() {
  const [appMode, setAppMode] = useState<AppMode>('menu');
  const [activeWorld, setActiveWorld] = useState<BrickWorldData | null>(null);
  const [isStudioTestPlay, setIsStudioTestPlay] = useState<boolean>(false);

  // Persistent user data
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(() => StorageManager.getAvatarConfig());
  const [userSettings, setUserSettings] = useState<UserSettings>(() => StorageManager.getUserSettings());
  const [playerStats, setPlayerStats] = useState<PlayerStats>(() => StorageManager.getPlayerStats());

  // Initialize sound settings on load
  useEffect(() => {
    sound.setVolume(userSettings.soundVolume);
    sound.setMusicEnabled(userSettings.musicEnabled);
  }, [userSettings]);

  // Handler: Launch Game
  const handlePlayWorld = (world: BrickWorldData) => {
    setActiveWorld(world);
    setIsStudioTestPlay(false);
    setAppMode('game');
    recordMissionAction('play_game', 1, world.gameMode);
    setPlayerStats(StorageManager.updatePlayerStats({ gamesPlayed: playerStats.gamesPlayed + 1 }));
  };

  // Handler: Enter Studio
  const handleOpenStudio = (world: BrickWorldData) => {
    setActiveWorld(world);
    setIsStudioTestPlay(false);
    setAppMode('studio');
  };

  // Handler: Test Play from Studio
  const handleStudioTestPlay = (world: BrickWorldData) => {
    setActiveWorld(world);
    setIsStudioTestPlay(true);
    setAppMode('game');
  };

  // Handler: Exit Game Viewport
  const handleExitGame = () => {
    setPlayerStats(StorageManager.getPlayerStats());
    if (isStudioTestPlay && activeWorld) {
      setAppMode('studio');
    } else {
      setAppMode('menu');
      setActiveWorld(null);
    }
  };

  // Handler: Update Avatar
  const handleSaveAvatar = (newConfig: AvatarConfig) => {
    setAvatarConfig(newConfig);
  };

  // Handler: Update Settings
  const handleUpdateSettings = (newSettings: UserSettings) => {
    setUserSettings(newSettings);
    StorageManager.saveUserSettings(newSettings);
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-col font-sans">
      {appMode === 'menu' && (
        <MainMenu
          onPlayWorld={handlePlayWorld}
          onOpenStudio={handleOpenStudio}
          onOpenAvatar={() => setAppMode('avatar')}
          avatarConfig={avatarConfig}
          userSettings={userSettings}
          onUpdateSettings={handleUpdateSettings}
          playerStats={playerStats}
        />
      )}

      {appMode === 'game' && activeWorld && (
        <GameViewport
          worldData={activeWorld}
          avatarConfig={avatarConfig}
          userSettings={userSettings}
          onExitToMenu={handleExitGame}
          onOpenAvatar={() => setAppMode('avatar')}
          isStudioTestPlay={isStudioTestPlay}
        />
      )}

      {appMode === 'studio' && activeWorld && (
        <WorldStudio
          initialWorld={activeWorld}
          onTestPlay={handleStudioTestPlay}
          onExit={() => {
            setAppMode('menu');
            setActiveWorld(null);
          }}
        />
      )}

      {appMode === 'avatar' && (
        <AvatarEditor
          currentConfig={avatarConfig}
          onSave={handleSaveAvatar}
          onBack={() => setAppMode(activeWorld && isStudioTestPlay ? 'studio' : 'menu')}
        />
      )}
    </div>
  );
}
