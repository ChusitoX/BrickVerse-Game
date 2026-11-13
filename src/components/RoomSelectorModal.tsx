/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AvatarConfig, BrickWorldData, RoomSessionInfo } from '../types/game';
import { multiplayerClient } from '../multiplayer/multiplayerClient';
import { sound } from '../audio/soundEngine';

interface RoomSelectorModalProps {
  isOpen: boolean;
  selectedWorld: BrickWorldData | null;
  playerNickname: string;
  onChangeNickname: (name: string) => void;
  avatarConfig: AvatarConfig;
  onJoinedRoom: (session: RoomSessionInfo) => void;
  onPlayOfflineFallback: (world: BrickWorldData) => void;
  onClose: () => void;
}

export const RoomSelectorModal: React.FC<RoomSelectorModalProps> = ({
  isOpen,
  selectedWorld,
  playerNickname,
  onChangeNickname,
  avatarConfig,
  onJoinedRoom,
  onPlayOfflineFallback,
  onClose,
}) => {
  const [joinCode, setJoinCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const cleanNick = playerNickname.trim() || 'BrickPlayer';

  const handleHostRoom = async () => {
    if (!selectedWorld || isLoading) return;
    sound.playClick();
    setErrorMsg(null);
    setIsLoading(true);
    try {
      const session = await multiplayerClient.createRoom(selectedWorld, cleanNick, avatarConfig);
      sound.playCheckpoint();
      onJoinedRoom(session);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to create multiplayer room.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isLoading) return;
    const code = joinCode.trim().toUpperCase();
    if (code.length < 4) {
      setErrorMsg('Enter the 6-character invite code shared by your friend.');
      return;
    }
    sound.playClick();
    setErrorMsg(null);
    setIsLoading(true);
    try {
      const session = await multiplayerClient.joinRoom(code, cleanNick, avatarConfig);
      sound.playCheckpoint();
      onJoinedRoom(session);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Could not join room. Check the code and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/10 p-6 md:p-8 rounded-2xl max-w-lg w-full shadow-2xl flex flex-col gap-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-emerald-400 tracking-wide">
              ONLINE MULTIPLAYER · PRIVATE ROOMS
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-white mt-1">
              {selectedWorld ? selectedWorld.name : 'Join Friend Room'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {selectedWorld
                ? 'Host a private room with a 6-character invite code or enter a friend’s code to join them.'
                : 'Enter a 6-character friend invite code to drop straight into their active world.'}
            </p>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Nickname field */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-300">Your Display Name</label>
          <input
            type="text"
            maxLength={18}
            value={playerNickname}
            onChange={(e) => onChangeNickname(e.target.value)}
            placeholder="Enter nickname..."
            className="bg-slate-950 border border-white/10 px-3.5 py-2.5 rounded-xl text-sm text-white focus:border-sky-500 outline-none"
          />
        </div>

        {/* Host Private Room Option (when a world was selected) */}
        {selectedWorld && (
          <div className="p-4 rounded-xl bg-slate-950/70 border border-white/10 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-bold text-white">Host Private Room</div>
                <div className="text-xs text-slate-400">
                  Creates a fresh room for {selectedWorld.name} with a shareable invite code.
                </div>
              </div>
            </div>
            <button
              onClick={handleHostRoom}
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-colors cursor-pointer shadow-lg shadow-emerald-950/40 whitespace-nowrap"
            >
              {isLoading ? 'Creating Room...' : 'Host & Get Invite Code'}
            </button>
          </div>
        )}

        {/* Join by Invite Code */}
        <form onSubmit={handleJoinRoom} className="p-4 rounded-xl bg-slate-950/70 border border-white/10 flex flex-col gap-3">
          <div>
            <div className="text-sm font-bold text-white">Join with Friend Code</div>
            <div className="text-xs text-slate-400">
              Ask your friend for the 6-character code shown at the top of their screen.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              maxLength={8}
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
              placeholder="e.g. X7K9M2"
              className="flex-1 bg-slate-900 border border-white/15 px-3.5 py-2.5 rounded-xl text-sm font-mono tracking-widest uppercase text-white focus:border-sky-500 outline-none"
            />
            <button
              type="submit"
              disabled={isLoading || joinCode.trim().length < 4}
              className="bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              {isLoading ? 'Joining...' : 'Join Room'}
            </button>
          </div>
        </form>

        {/* Error Banner + Offline Fallback */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-500/30 text-xs text-red-200 flex flex-col gap-2">
            <span>{errorMsg}</span>
            {selectedWorld && (
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onPlayOfflineFallback(selectedWorld);
                }}
                className="self-start px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold cursor-pointer transition-colors"
              >
                Play Offline Singleplayer Instead →
              </button>
            )}
          </div>
        )}

        {/* Footer quick offline bypass if a world is selected */}
        {selectedWorld && !errorMsg && (
          <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
            <span className="text-slate-400">Want to play by yourself right now?</span>
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onPlayOfflineFallback(selectedWorld);
              }}
              className="text-sky-400 hover:text-sky-300 font-semibold cursor-pointer whitespace-nowrap"
            >
              Launch Offline Solo →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
