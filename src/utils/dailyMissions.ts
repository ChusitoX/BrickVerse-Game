/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DailyMission, DailyMissionsState } from '../types/game';

const STORAGE_KEY = 'brickverse_daily_missions';

const MISSION_POOL: Omit<DailyMission, 'currentCount' | 'completed' | 'claimed'>[] = [
  {
    id: 'm_zombies',
    title: 'Zombie Hunter',
    description: 'Eliminate 6 zombies in Zombie Defense Outpost',
    targetCount: 6,
    rewardCoins: 120,
    icon: '🧟',
    gameMode: 'zombie_defense',
    actionKey: 'zombies',
  },
  {
    id: 'm_speedway',
    title: 'Speedway Racer',
    description: 'Complete 2 high-speed laps in Kart Speedway',
    targetCount: 2,
    rewardCoins: 100,
    icon: '🏎️',
    gameMode: 'kart_speedway',
    actionKey: 'laps',
  },
  {
    id: 'm_coaster',
    title: 'Thrill Seeker',
    description: 'Ride the looping track in Rollercoaster Park',
    targetCount: 1,
    rewardCoins: 80,
    icon: '🎢',
    gameMode: 'rollercoaster',
    actionKey: 'coaster',
  },
  {
    id: 'm_ctf',
    title: 'Flag Runner',
    description: 'Capture 1 enemy flag in Paintball CTF',
    targetCount: 1,
    rewardCoins: 150,
    icon: '🚩',
    gameMode: 'paintball_ctf',
    actionKey: 'ctf',
  },
  {
    id: 'm_lasers',
    title: 'Laser Master',
    description: 'Tag 5 opponents in Laser Tag Arena',
    targetCount: 5,
    rewardCoins: 110,
    icon: '🔫',
    gameMode: 'laser_tag',
    actionKey: 'lasers',
  },
  {
    id: 'm_props',
    title: 'Master of Disguise',
    description: 'Find 3 disguised props in Prop Hunt Mystery',
    targetCount: 3,
    rewardCoins: 130,
    icon: '📦',
    gameMode: 'prop_hunt',
    actionKey: 'props',
  },
  {
    id: 'm_coins',
    title: 'Coin Hoarder',
    description: 'Collect 100 BloxCoins across any game',
    targetCount: 100,
    rewardCoins: 90,
    icon: '🪙',
    actionKey: 'coins',
  },
  {
    id: 'm_explorer',
    title: 'World Explorer',
    description: 'Play 3 different games in BrickVerse',
    targetCount: 3,
    rewardCoins: 75,
    icon: '🗺️',
    actionKey: 'play_game',
  },
];

function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function loadDailyMissions(): DailyMissionsState {
  const today = getTodayString();
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    raw = null;
  }

  if (raw) {
    try {
      const parsed: DailyMissionsState = JSON.parse(raw);
      if (parsed.dateStr === today && parsed.missions && parsed.missions.length > 0) {
        return parsed;
      }
      // Date changed - update streak
      const lastDate = new Date(parsed.dateStr);
      const currDate = new Date(today);
      const diffDays = Math.round((currDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
      const streak = diffDays === 1 ? (parsed.streak || 0) + 1 : 1;

      return createFreshMissions(today, streak);
    } catch {
      // Fallback
    }
  }

  return createFreshMissions(today, 1);
}

function createFreshMissions(dateStr: string, streak: number): DailyMissionsState {
  // Deterministic seed based on date string
  let seed = 0;
  for (let i = 0; i < dateStr.length; i++) {
    seed = (seed * 31 + dateStr.charCodeAt(i)) >>> 0;
  }

  // Shuffle pool deterministically
  const shuffled = [...MISSION_POOL];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = (seed + i * 17) % (i + 1);
    const temp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = temp;
  }

  // Pick top 4 missions
  const selected = shuffled.slice(0, 4).map((m) => ({
    ...m,
    currentCount: 0,
    completed: false,
    claimed: false,
  }));

  const state: DailyMissionsState = {
    dateStr,
    streak,
    missions: selected,
  };

  saveDailyMissions(state);
  return state;
}

export function saveDailyMissions(state: DailyMissionsState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage errors
  }
}

export function recordMissionAction(
  actionKey: DailyMission['actionKey'],
  amount = 1,
  gameMode?: string
): { updated: boolean; completedAny: boolean } {
  const state = loadDailyMissions();
  let updated = false;
  let completedAny = false;

  for (const m of state.missions) {
    if (m.actionKey === actionKey && !m.completed) {
      if (!m.gameMode || m.gameMode === gameMode) {
        m.currentCount = Math.min(m.targetCount, m.currentCount + amount);
        updated = true;
        if (m.currentCount >= m.targetCount) {
          m.completed = true;
          completedAny = true;
        }
      }
    }
  }

  if (updated) {
    saveDailyMissions(state);
  }

  return { updated, completedAny };
}

export function claimMission(missionId: string): number {
  const state = loadDailyMissions();
  const mission = state.missions.find((m) => m.id === missionId);
  if (!mission || !mission.completed || mission.claimed) {
    return 0;
  }

  mission.claimed = true;
  saveDailyMissions(state);
  return mission.rewardCoins;
}
