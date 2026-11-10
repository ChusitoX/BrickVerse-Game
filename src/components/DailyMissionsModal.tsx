/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { DailyMissionsState, DailyMission } from '../types/game';
import { loadDailyMissions, claimMission } from '../utils/dailyMissions';
import { sound } from '../audio/soundEngine';

interface DailyMissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCoinsAwarded: (coins: number) => void;
}

export const DailyMissionsModal: React.FC<DailyMissionsModalProps> = ({
  isOpen,
  onClose,
  onCoinsAwarded,
}) => {
  const [state, setState] = useState<DailyMissionsState | null>(null);
  const [claimToast, setClaimToast] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setState(loadDailyMissions());
    }
  }, [isOpen]);

  if (!isOpen || !state) return null;

  const handleClaim = (mission: DailyMission) => {
    const coins = claimMission(mission.id);
    if (coins > 0) {
      sound.playCoin();
      sound.playFanfare();
      onCoinsAwarded(coins);
      setState(loadDailyMissions());
      setClaimToast(`+${coins} BloxCoins Claimed! 🎉`);
      setTimeout(() => setClaimToast(null), 2500);
    }
  };

  const completedCount = state.missions.filter((m) => m.completed).length;
  const claimedCount = state.missions.filter((m) => m.claimed).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-950/40 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-xl shadow-inner">
              📜
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-wide">Daily Missions</h2>
                <span className="px-2 py-0.5 text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
                  🔥 Day {state.streak} Streak
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Completed {completedCount}/{state.missions.length} · Resets midnight
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Claim Toast Banner */}
        {claimToast && (
          <div className="px-6 py-2.5 bg-emerald-500/20 border-b border-emerald-500/40 text-emerald-300 text-sm font-semibold flex items-center justify-center gap-2 animate-pulse">
            <span>✨</span>
            <span>{claimToast}</span>
          </div>
        )}

        {/* Mission Cards List */}
        <div className="p-6 space-y-3.5 overflow-y-auto">
          {state.missions.map((m) => {
            const pct = Math.min(100, Math.round((m.currentCount / m.targetCount) * 100));
            return (
              <div
                key={m.id}
                className={`p-4 rounded-xl border transition-all ${
                  m.claimed
                    ? 'bg-slate-900/40 border-slate-800 opacity-60'
                    : m.completed
                    ? 'bg-cyan-950/30 border-cyan-500/50 shadow-lg shadow-cyan-950/50'
                    : 'bg-slate-800/60 border-slate-700/60 hover:border-slate-600'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl select-none p-1.5 bg-slate-800/80 rounded-lg border border-slate-700/50">
                      {m.icon}
                    </span>
                    <div>
                      <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                        {m.title}
                        {m.claimed && (
                          <span className="text-[10px] text-emerald-400 font-mono uppercase bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                            Claimed ✓
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{m.description}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-amber-400 font-mono">
                      +{m.rewardCoins} 🪙
                    </span>
                  </div>
                </div>

                {/* Progress bar & Action button */}
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex-1 bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        m.completed ? 'bg-emerald-500' : 'bg-cyan-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap min-w-12 text-right">
                    {m.currentCount} / {m.targetCount}
                  </span>

                  {m.completed && !m.claimed && (
                    <button
                      onClick={() => handleClaim(m)}
                      className="px-3 py-1 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold text-xs rounded-lg shadow-md hover:scale-105 active:scale-95 transition-transform"
                    >
                      Claim!
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3.5 bg-slate-950/70 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Complete all daily missions to maximize your streak bonus!</span>
          <span className="font-mono text-slate-400">
            {claimedCount}/{state.missions.length} Claimed
          </span>
        </div>
      </div>
    </div>
  );
};
