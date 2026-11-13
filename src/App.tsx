/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AvatarConfig, BrickWorldData, PlayerStats, PlayMode, RoomSessionInfo, UserSettings } from './types/game';
import { StorageManager } from './storage/worldStorage';
import { MainMenu } from './components/MainMenu';
import { GameViewport } from './engine/GameViewport';
import { AvatarEditor } from './components/AvatarEditor';
import { WorldStudio } from './studio/WorldStudio';
import { RoomSelectorModal } from './components/RoomSelectorModal';
import { multiplayerClient } from './multiplayer/multiplayerClient';
import { sound } from './audio/soundEngine';
import { recordMissionAction } from './utils/dailyMissions';

type AppMode = 'menu' | 'game' | 'studio' | 'avatar';

export default function App() {
  const [appMode, setAppMode] = useState<AppMode>('menu');
  const [activeWorld, setActiveWorld] = useState<BrickWorldData | null>(null);
  const [isStudioTestPlay, setIsStudioTestPlay] = useState<boolean>(false);

  // Play Mode & Online Multiplayer Session
  const [playMode, setPlayMode] = useState<PlayMode>(() => StorageManager.getPlayMode());
  const [playerNickname, setPlayerNickname] = useState<string>(() => StorageManager.getPlayerNickname());
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [pendingOnlineWorld, setPendingOnlineWorld] = useState<BrickWorldData | null>(null);
  const [activeRoomSession, setActiveRoomSession] = useState<RoomSessionInfo | null>(null);

  // Persistent user data
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(() => StorageManager.getAvatarConfig());
  const [userSettings, setUserSettings] = useState<UserSettings>(() => StorageManager.getUserSettings());
  const [playerStats, setPlayerStats] = useState<PlayerStats>(() => StorageManager.getPlayerStats());

  // Initialize sound settings on load
  useEffect(() => {
    sound.setVolume(userSettings.soundVolume);
    sound.setMusicEnabled(userSettings.musicEnabled);
  }, [userSettings]);

  const handleChangePlayMode = (mode: PlayMode) => {
    setPlayMode(mode);
    StorageManager.savePlayMode(mode);
  };

  const handleChangeNickname = (name: string) => {
    setPlayerNickname(name);
    StorageManager.savePlayerNickname(name);
  };

  const launchOfflineSolo = (world: BrickWorldData) => {
    multiplayerClient.leaveRoom();
    setActiveRoomSession(null);
    setRoomModalOpen(false);
    setPendingOnlineWorld(null);
    setActiveWorld(world);
    setIsStudioTestPlay(false);
    setAppMode('game');
    recordMissionAction('play_game', 1, world.gameMode);
    setPlayerStats(StorageManager.updatePlayerStats({ gamesPlayed: playerStats.gamesPlayed + 1 }));
  };

  // Handler: Launch Game (respects Offline vs Online mode)
  const handlePlayWorld = (world: BrickWorldData) => {
    if (playMode === 'online') {
      setPendingOnlineWorld(world);
      setRoomModalOpen(true);
      return;
    }
    launchOfflineSolo(world);
  };

  const handleOpenJoinRoomModal = () => {
    setPendingOnlineWorld(null);
    setRoomModalOpen(true);
  };

  const handleJoinedRoom = (session: RoomSessionInfo) => {
    setRoomModalOpen(false);
    setPendingOnlineWorld(null);
    setActiveRoomSession(session);
    setActiveWorld(session.worldData);
    setIsStudioTestPlay(false);
    setAppMode('game');
    recordMissionAction('play_game', 1, session.worldData.gameMode);
    setPlayerStats(StorageManager.updatePlayerStats({ gamesPlayed: playerStats.gamesPlayed + 1 }));
  };

  // Handler: Enter Studio
  const handleOpenStudio = (world: BrickWorldData) => {
    multiplayerClient.leaveRoom();
    setActiveRoomSession(null);
    setActiveWorld(world);
    setIsStudioTestPlay(false);
    setAppMode('studio');
  };

  // Handler: Test Play from Studio (always immediate solo test play)
  const handleStudioTestPlay = (world: BrickWorldData) => {
    multiplayerClient.leaveRoom();
    setActiveRoomSession(null);
    setActiveWorld(world);
    setIsStudioTestPlay(true);
    setAppMode('game');
  };

  // Handler: Exit Game Viewport
  const handleExitGame = () => {
    multiplayerClient.leaveRoom();
    setActiveRoomSession(null);
    setPlayerStats(StorageManager.getPlayerStats());
    if (isStudioTestPlay && activeWorld) {
      setAppMode('studio');
    } else {
      setAppMode('menu');
      setActiveWorld(null);
    }
  };

  // Handler: Switch from Online session to Offline Singleplayer in-game
  const handleSwitchToOffline = () => {
    multiplayerClient.leaveRoom();
    setActiveRoomSession(null);
    handleChangePlayMode('offline');
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
          playMode={playMode}
          onChangePlayMode={handleChangePlayMode}
          playerNickname={playerNickname}
          onChangeNickname={handleChangeNickname}
          onOpenJoinRoom={handleOpenJoinRoomModal}
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
          playMode={activeRoomSession ? 'online' : 'offline'}
          playerNickname={playerNickname}
          roomSession={activeRoomSession}
          onSwitchToOffline={handleSwitchToOffline}
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
          onBack={() => setAppMode(activeWorld && isStudioTestPlay ? 'studio' : activeWorld ? 'game' : 'menu')}
        />
      )}

      <RoomSelectorModal
        isOpen={roomModalOpen}
        selectedWorld={pendingOnlineWorld}
        playerNickname={playerNickname}
        onChangeNickname={handleChangeNickname}
        avatarConfig={avatarConfig}
        onJoinedRoom={handleJoinedRoom}
        onPlayOfflineFallback={(w) => {
          handleChangePlayMode('offline');
          launchOfflineSolo(w);
        }}
        onClose={() => {
          setRoomModalOpen(false);
          setPendingOnlineWorld(null);
        }}
      />
    </div>
  );
}
