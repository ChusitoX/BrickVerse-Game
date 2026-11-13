/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { BrickWorldData, UserSettings, AvatarConfig, PlayerStats, PlayMode } from '../types/game';
import { ALL_BUILTIN_WORLDS } from '../games/builtInWorlds';
import { WORLD_CATALOG, WORLD_CATEGORIES, WorldCategory } from '../games/worldCatalog';
import { StorageManager } from '../storage/worldStorage';
import { sound } from '../audio/soundEngine';
import { DailyMissionsModal } from './DailyMissionsModal';

interface MainMenuProps {
  onPlayWorld: (world: BrickWorldData) => void;
  onOpenStudio: (world: BrickWorldData) => void;
  onOpenAvatar: () => void;
  avatarConfig: AvatarConfig;
  userSettings: UserSettings;
  onUpdateSettings: (settings: UserSettings) => void;
  playerStats: PlayerStats;
  playMode: PlayMode;
  onChangePlayMode: (mode: PlayMode) => void;
  playerNickname: string;
  onChangeNickname: (name: string) => void;
  onOpenJoinRoom: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onPlayWorld,
  onOpenStudio,
  onOpenAvatar,
  avatarConfig,
  userSettings,
  onUpdateSettings,
  playerStats,
  playMode,
  onChangePlayMode,
  playerNickname,
  onChangeNickname,
  onOpenJoinRoom,
}) => {
  const [activeTab, setActiveTab] = useState<'discover' | 'studio' | 'settings'>('discover');
  const [customWorlds, setCustomWorlds] = useState<BrickWorldData[]>(() => StorageManager.getCustomWorlds());
  const [newWorldName, setNewWorldName] = useState('');
  const [showNewWorldModal, setShowNewWorldModal] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [showMissionsModal, setShowMissionsModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<WorldCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredCatalog = WORLD_CATALOG.filter((card) => {
    const matchesCategory = selectedCategory === 'All' || card.category === selectedCategory;
    if (!matchesCategory) return false;
    if (!normalizedQuery) return true;
    return (
      card.name.toLowerCase().includes(normalizedQuery) ||
      card.desc.toLowerCase().includes(normalizedQuery) ||
      card.category.toLowerCase().includes(normalizedQuery)
    );
  });

  const handleLaunchRandomWorld = () => {
    sound.playClick();
    const pool = filteredCatalog.length > 0 ? filteredCatalog : WORLD_CATALOG;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    const target = ALL_BUILTIN_WORLDS.find((w) => w.id === pick.id) || ALL_BUILTIN_WORLDS[0];
    onPlayWorld(target);
  };

  const handleCreateNewWorld = () => {
    if (!newWorldName.trim()) return;
    sound.playBuildPlace();
    const created = StorageManager.createNewWorld(newWorldName);
    setCustomWorlds(StorageManager.getCustomWorlds());
    setShowNewWorldModal(false);
    setNewWorldName('');
    onOpenStudio(created);
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setImportError(null);
      const imported = await StorageManager.importWorldFromJson(file);
      sound.playCoin();
      setCustomWorlds(StorageManager.getCustomWorlds());
      onOpenStudio(imported);
    } catch (err: any) {
      setImportError(err.message || 'Failed to import world file');
    }
  };

  const handleDeleteCustomWorld = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playDelete();
    StorageManager.deleteCustomWorld(id);
    setCustomWorlds(StorageManager.getCustomWorlds());
  };

  const handleExportCustomWorld = (world: BrickWorldData, e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playCoin();
    StorageManager.exportWorldToJson(world);
  };

  return (
    <div className="flex flex-col w-full h-full bg-slate-950 text-slate-100 select-none overflow-y-auto">
      {/* Top Bar Contract: Brand Wordmark — Nav Links — Avatar Profile */}
      <header className="h-16 px-6 md:px-10 border-b border-white/10 bg-slate-900/90 backdrop-blur-md flex items-center justify-between gap-8 sticky top-0 z-40 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center font-black text-white text-base shadow-md shadow-sky-600/30">
            B
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white whitespace-nowrap shrink-0">
            BrickVerse
          </span>
        </div>

        <nav className="flex items-center gap-6 text-sm font-medium">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('discover');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'discover' ? 'text-white font-bold border-b-2 border-sky-500 py-4' : 'text-slate-400 hover:text-white'
            }`}
          >
            Discover Games ({ALL_BUILTIN_WORLDS.length})
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('studio');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'studio' ? 'text-white font-bold border-b-2 border-sky-500 py-4' : 'text-slate-400 hover:text-white'
            }`}
          >
            World Studio
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('settings');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'settings' ? 'text-white font-bold border-b-2 border-sky-500 py-4' : 'text-slate-400 hover:text-white'
            }`}
          >
            Settings
          </button>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          {/* Daily Quests Button */}
          <button
            onClick={() => {
              sound.playClick();
              setShowMissionsModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-amber-500/30 text-amber-300 font-mono text-xs font-bold cursor-pointer transition-colors shadow-sm"
          >
            <span>📜</span>
            <span className="hidden sm:inline">Quests</span>
          </button>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950 border border-white/10 text-amber-400 font-mono text-xs font-bold">
            <span>🪙</span>
            <span>{playerStats.coins}</span>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onOpenAvatar();
            }}
            className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-xl transition-colors cursor-pointer group"
          >
            <div
              className="w-6 h-6 rounded-md shadow-inner border border-white/20 flex items-center justify-center text-xs"
              style={{ backgroundColor: avatarConfig.headColor }}
            >
              😊
            </div>
            <span className="text-xs font-semibold text-slate-200 group-hover:text-white whitespace-nowrap shrink-0">
              Avatar Editor
            </span>
          </button>
        </div>
      </header>

      {/* TAB 1: DISCOVER GAMES */}
      {activeTab === 'discover' && (
        <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-10 flex flex-col gap-8">
          {/* Play Mode Switcher & Friend Room Toolbar */}
          <section className="rounded-2xl bg-slate-900/90 border border-white/10 p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="inline-flex items-center p-1 bg-slate-950 border border-white/10 rounded-xl self-start">
                <button
                  onClick={() => {
                    sound.playClick();
                    onChangePlayMode('offline');
                  }}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    playMode === 'offline'
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Offline Singleplayer
                </button>
                <button
                  onClick={() => {
                    sound.playClick();
                    onChangePlayMode('online');
                  }}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    playMode === 'online'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Online Multiplayer
                </button>
              </div>
              <span className="text-xs text-slate-400">
                {playMode === 'online'
                  ? 'Pick any game to host a private room or join a friend with a room code.'
                  : 'Play solo immediately with AI bots and zero internet required.'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-2 bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5">
                <span className="text-xs text-slate-400 whitespace-nowrap">Nickname</span>
                <input
                  type="text"
                  maxLength={18}
                  value={playerNickname}
                  onChange={(e) => onChangeNickname(e.target.value)}
                  placeholder="Player name"
                  className="bg-transparent text-xs font-semibold text-white w-28 sm:w-32 focus:outline-none"
                />
              </div>

              {playMode === 'online' && (
                <button
                  onClick={() => {
                    sound.playClick();
                    onOpenJoinRoom();
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer whitespace-nowrap shrink-0 shadow-md shadow-emerald-950/40"
                >
                  Join Friend Code
                </button>
              )}
            </div>
          </section>

          {/* Spotlight Hero Banner */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-sky-900 via-slate-900 to-indigo-950 border border-white/10 p-8 md:p-12 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col gap-3 max-w-xl">
              <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 tracking-wider">
                <span>OFFICIAL SPOTLIGHT</span>
                <span>·</span>
                <span>{playMode === 'online' ? 'PRIVATE FRIEND ROOMS' : 'OFFLINE CREATIVE PLATFORM'}</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight text-balance">
                Speed Run: Neon Galaxy
              </h1>
              <p className="text-sm md:text-base text-slate-300 leading-relaxed">
                Experience high-octane parkour through cosmic loops and speed boosters! Hit launch rings, master high-speed jumps, and claim the fastest time record.
              </p>
              <div className="flex items-center gap-4 pt-3">
                <button
                  onClick={() => {
                    sound.playClick();
                    const world = ALL_BUILTIN_WORLDS.find((w) => w.id === 'game_speed_run')!;
                    onPlayWorld(world);
                  }}
                  className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-7 py-3 rounded-xl transition-all shadow-lg shadow-sky-950/50 cursor-pointer flex items-center gap-2 text-sm whitespace-nowrap"
                >
                  <span>▶</span> {playMode === 'online' ? 'Host / Join Speed Run' : 'Play Speed Run'}
                </button>
                <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                  <span>★ 99% Rating</span>
                  <span>·</span>
                  <span>{playMode === 'online' ? 'Up to 16 Friends' : 'Solo & AI Bots'}</span>
                </div>
              </div>
            </div>

            <div className="w-48 h-48 rounded-2xl bg-slate-950/60 border border-white/10 flex flex-col items-center justify-center gap-2 shadow-inner">
              <span className="text-6xl">⚡</span>
              <span className="text-xs font-bold text-slate-300 tracking-wide">PARKOUR RUSH</span>
            </div>
          </div>

          {/* Grid of Experiences */}
          <section className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                    All Experiences ({WORLD_CATALOG.length} Games)
                  </h2>
                  <p className="text-xs text-slate-400">
                    Sumo knockouts, colossal Titan Boss raids, BrickBall soccer, Zero-G space battles, Wipeout obbys, racing & more
                  </p>
                </div>

                {/* Search + Random Surprise Launcher */}
                <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
                  <div className="flex items-center gap-2 bg-slate-900 border border-white/10 focus-within:border-sky-500/60 rounded-xl px-3.5 py-2 w-full sm:w-64 transition-colors">
                    <span className="text-slate-400 text-xs">🔍</span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={`Search ${WORLD_CATALOG.length} games...`}
                      className="bg-transparent text-xs text-white placeholder-slate-500 flex-1 focus:outline-none"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="text-slate-400 hover:text-white text-xs cursor-pointer"
                        title="Clear search"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <button
                    onClick={handleLaunchRandomWorld}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md shadow-amber-950/40 cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0"
                  >
                    <span>🎲</span>
                    <span>Surprise Me</span>
                  </button>
                </div>
              </div>

              {/* Category Filter Tabs */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-white/10 rounded-xl overflow-x-auto max-w-full">
                  {WORLD_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        sound.playClick();
                        setSelectedCategory(cat);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                        selectedCategory === cat
                          ? 'bg-sky-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {(selectedCategory !== 'All' || normalizedQuery) && (
                  <span className="text-xs text-slate-400 font-mono">
                    Showing {filteredCatalog.length} of {WORLD_CATALOG.length}
                  </span>
                )}
              </div>
            </div>

            {filteredCatalog.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/15 p-12 text-center flex flex-col items-center justify-center gap-3">
                <span className="text-4xl">🔎</span>
                <h3 className="font-bold text-white text-base">No Matching Games Found</h3>
                <p className="text-xs text-slate-400 max-w-sm">
                  Try another search keyword or switch back to all {WORLD_CATALOG.length} experiences.
                </p>
                <button
                  onClick={() => {
                    sound.playClick();
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                  className="mt-1 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-5 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  Show All {WORLD_CATALOG.length} Games
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCatalog.map((card) => (
                  <div
                    key={card.id}
                    onClick={() => {
                      sound.playClick();
                      const w = ALL_BUILTIN_WORLDS.find((x) => x.id === card.id);
                      if (w) onPlayWorld(w);
                    }}
                    className="group rounded-2xl bg-slate-900 border border-white/10 hover:border-sky-500/50 p-5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 shadow-xl cursor-pointer"
                  >
                    <div className="flex flex-col gap-3">
                      <div
                        className={`h-36 rounded-xl bg-gradient-to-b ${card.color} border border-white/5 flex items-center justify-center text-5xl shadow-inner group-hover:scale-[1.02] transition-transform`}
                      >
                        {card.badgeEmoji}
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                        <span>{card.category}</span>
                        <span className="text-amber-400">{card.rating}</span>
                      </div>

                      <h3 className="font-bold text-base text-white group-hover:text-sky-300 transition-colors">
                        {card.name}
                      </h3>

                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                        {card.desc}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-white/5 flex items-center justify-between mt-4">
                      <span className="text-xs font-semibold text-sky-400 group-hover:underline">
                        {playMode === 'online' ? 'Host / Join Room →' : 'Play Experience →'}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {playMode === 'online' ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      )}

      {/* TAB 2: WORLD STUDIO (CUSTOM WORLDS) */}
      {activeTab === 'studio' && (
        <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-10 flex flex-col gap-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">World Studio</h1>
              <p className="text-xs text-slate-400 mt-1">
                Build custom 3D sandbox worlds, test play immediately, and export/import `.brickverse.json` files.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Import JSON World
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  setShowNewWorldModal(true);
                }}
                className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors shadow-lg shadow-sky-950/40 cursor-pointer flex items-center gap-2"
              >
                <span>+</span> Create New World
              </button>
            </div>
          </div>

          {importError && (
            <div className="p-3 bg-red-950/50 border border-red-500/30 text-red-300 text-xs rounded-xl">
              {importError}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">Saved Creations</span>

            {customWorlds.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/15 p-12 text-center flex flex-col items-center justify-center gap-3">
                <span className="text-4xl">🛠️</span>
                <h3 className="font-bold text-white text-base">No Custom Worlds Yet</h3>
                <p className="text-xs text-slate-400 max-w-sm">
                  Click &ldquo;Create New World&rdquo; to build your own obstacle courses, arenas, or sandbox islands with custom bricks and physics!
                </p>
                <button
                  onClick={() => setShowNewWorldModal(true)}
                  className="mt-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-5 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  Create First World
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {customWorlds.map((w) => (
                  <div
                    key={w.id}
                    className="rounded-2xl bg-slate-900 border border-white/10 p-5 flex flex-col justify-between gap-4 shadow-xl hover:border-sky-500/40 transition-all"
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-sky-400">{w.parts.length} parts</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(w.updated || w.created).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg text-white">{w.name}</h3>
                      <p className="text-xs text-slate-400 line-clamp-2">{w.description}</p>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                      <button
                        onClick={() => {
                          sound.playClick();
                          onOpenStudio(w);
                        }}
                        className="flex-1 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold py-2 rounded-lg transition-colors cursor-pointer"
                      >
                        Edit in Studio
                      </button>
                      <button
                        onClick={() => {
                          sound.playClick();
                          onPlayWorld(w);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors cursor-pointer"
                      >
                        Play
                      </button>
                      <button
                        onClick={(e) => handleExportCustomWorld(w, e)}
                        title="Export JSON"
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer"
                      >
                        JSON
                      </button>
                      <button
                        onClick={(e) => handleDeleteCustomWorld(w.id, e)}
                        title="Delete World"
                        className="bg-red-600/20 hover:bg-red-600/40 text-red-400 px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      )}

      {/* TAB 3: SETTINGS */}
      {activeTab === 'settings' && (
        <main className="flex-1 max-w-3xl w-full mx-auto p-6 md:p-10 flex flex-col gap-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Settings</h1>
            <p className="text-xs text-slate-400 mt-1">Configure graphics, audio volume, controls, and performance.</p>
          </div>

          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 flex flex-col gap-6 shadow-xl">
            {/* Chiptune Music */}
            <div className="flex items-center justify-between pb-5 border-b border-white/10">
              <div>
                <div className="font-bold text-sm text-white">Chiptune Background Music</div>
                <div className="text-xs text-slate-400">Catchy procedural 8-bit game melodies</div>
              </div>
              <input
                type="checkbox"
                checked={userSettings.musicEnabled}
                onChange={(e) => {
                  sound.playClick();
                  onUpdateSettings({ ...userSettings, musicEnabled: e.target.checked });
                }}
                className="w-5 h-5 rounded bg-slate-950 border-white/20 text-sky-500 focus:ring-0 cursor-pointer"
              />
            </div>

            {/* Graphics Quality */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-white/10">
              <div>
                <div className="font-bold text-sm text-white">Graphics Quality</div>
                <div className="text-xs text-slate-400">Adjust rendering detail and anti-aliasing</div>
              </div>
              <div className="flex gap-1.5 bg-slate-950 p-1 rounded-xl border border-white/10 text-xs">
                {(['low', 'medium', 'high'] as const).map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      sound.playClick();
                      onUpdateSettings({ ...userSettings, graphicsQuality: q });
                    }}
                    className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-colors cursor-pointer ${
                      userSettings.graphicsQuality === q
                        ? 'bg-sky-600 text-white font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Shadows */}
            <div className="flex items-center justify-between pb-5 border-b border-white/10">
              <div>
                <div className="font-bold text-sm text-white">PCF Soft Shadows</div>
                <div className="text-xs text-slate-400">Realistic directional sun shadow maps</div>
              </div>
              <input
                type="checkbox"
                checked={userSettings.shadowsEnabled}
                onChange={(e) => {
                  sound.playClick();
                  onUpdateSettings({ ...userSettings, shadowsEnabled: e.target.checked });
                }}
                className="w-5 h-5 rounded bg-slate-950 border-white/20 text-sky-500 focus:ring-0 cursor-pointer"
              />
            </div>

            {/* Sound Volume Slider */}
            <div className="flex flex-col gap-2 pb-5 border-b border-white/10">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-white text-sm">Master Sound Volume</span>
                <span className="font-mono text-slate-400">{Math.round(userSettings.soundVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={userSettings.soundVolume}
                onChange={(e) => {
                  const vol = parseFloat(e.target.value);
                  sound.setVolume(vol);
                  onUpdateSettings({ ...userSettings, soundVolume: vol });
                }}
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>

            {/* Field of View (FOV) */}
            <div className="flex flex-col gap-2 pb-5 border-b border-white/10">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-white text-sm">Field of View (FOV)</span>
                <span className="font-mono text-slate-400">{userSettings.fov}°</span>
              </div>
              <input
                type="range"
                min={60}
                max={95}
                step={1}
                value={userSettings.fov}
                onChange={(e) => {
                  onUpdateSettings({ ...userSettings, fov: parseInt(e.target.value) });
                }}
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>

            {/* Mouse Sensitivity */}
            <div className="flex flex-col gap-2 pb-5 border-b border-white/10">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-white text-sm">Mouse Camera Sensitivity</span>
                <span className="font-mono text-slate-400">{userSettings.mouseSensitivity.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min={0.3}
                max={2.5}
                step={0.1}
                value={userSettings.mouseSensitivity}
                onChange={(e) => {
                  onUpdateSettings({ ...userSettings, mouseSensitivity: parseFloat(e.target.value) });
                }}
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>

            {/* Touch / Virtual Joystick Overlay */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-sm text-white">Onscreen Touch Controls</div>
                <div className="text-xs text-slate-400">Display virtual joystick and jump buttons</div>
              </div>
              <input
                type="checkbox"
                checked={userSettings.showTouchControls}
                onChange={(e) => {
                  sound.playClick();
                  onUpdateSettings({ ...userSettings, showTouchControls: e.target.checked });
                }}
                className="w-5 h-5 rounded bg-slate-950 border-white/20 text-sky-500 focus:ring-0 cursor-pointer"
              />
            </div>
          </div>
        </main>
      )}

      {/* New World Modal */}
      {showNewWorldModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 p-6 md:p-8 rounded-2xl max-w-md w-full shadow-2xl flex flex-col gap-5">
            <div>
              <h3 className="text-xl font-bold text-white">Create New World</h3>
              <p className="text-xs text-slate-400 mt-1">
                Name your world to open the 3D Studio editor.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-300">World Name</label>
              <input
                type="text"
                placeholder="e.g. Neon City Parkour"
                value={newWorldName}
                onChange={(e) => setNewWorldName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateNewWorld();
                }}
                autoFocus
                className="bg-slate-950 border border-white/10 px-3.5 py-2.5 rounded-xl text-sm text-white focus:border-sky-500 outline-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowNewWorldModal(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNewWorld}
                disabled={!newWorldName.trim()}
                className="flex-1 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-lg shadow-sky-950/40"
              >
                Open Studio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Daily Missions Modal */}
      <DailyMissionsModal
        isOpen={showMissionsModal}
        onClose={() => setShowMissionsModal(false)}
        onCoinsAwarded={() => {}}
      />
    </div>
  );
};
