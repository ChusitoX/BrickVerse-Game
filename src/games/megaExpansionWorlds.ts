/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrickPart, BrickWorldData } from '../types/game';

function part(
  id: string,
  type: BrickPart['type'],
  name: string,
  pos: [number, number, number],
  size: [number, number, number],
  color: string,
  material: BrickPart['material'] = 'plastic',
  anchored = true,
  canCollide = true,
  metadata?: BrickPart['metadata']
): BrickPart {
  return {
    id,
    type,
    name,
    position: pos,
    size,
    rotation: [0, 0, 0],
    color,
    material,
    anchored,
    canCollide,
    metadata,
  };
}

function coin(id: string, pos: [number, number, number]): BrickPart {
  return part(id, 'cylinder', 'Golden BloxCoin', pos, [1.5, 0.35, 1.5], '#facc15', 'neon', true, false, {
    isCoinPickup: true,
  });
}

// ==========================================
// 17. MEGA WIPEOUT: BOUNCE GAUNTLET
// ==========================================
export const megaWipeoutWorld: BrickWorldData = {
  id: 'game_mega_wipeout',
  name: 'Mega Wipeout: Bounce Gauntlet',
  description: 'Leap over Big Red Bounce Balls, dodge sweeper beams, sprint across slippery conveyor bridges, and claim the Wipeout Trophy!',
  author: 'BrickVerse Official',
  version: 1,
  created: 1700000000000,
  updated: 1700000000000,
  gameMode: 'obby',
  environment: { skyColor: '#0ea5e9', fogDensity: 0.004, ambientColor: '#e0f2fe', sunPosition: [40, 70, 20], sunIntensity: 1.4 },
  spawnPoint: [0, 2.2, 0],
  parts: [
    part('wo_water', 'kill', 'Wipeout Pool', [0, -1, 70], [90, 1, 200], '#0284c7', 'glass'),
    part('wo_s1', 'block', 'Start Dock', [0, 0.5, 0], [14, 1.2, 12], '#f8fafc'),
    part('wo_c1', 'checkpoint', 'Stage 1', [0, 1.2, 2], [4, 0.1, 4], '#10b981', 'neon', true, true, { checkpointIndex: 1 }),
    part('wo_b1', 'bounce', 'Big Red Ball 1', [0, 1.8, 13], [6, 2.2, 6], '#ef4444', 'neon', true, true, { bounceForce: 34 }),
    part('wo_b2', 'bounce', 'Big Red Ball 2', [0, 2.2, 25], [6, 2.2, 6], '#ef4444', 'neon', true, true, { bounceForce: 34 }),
    part('wo_b3', 'bounce', 'Big Red Ball 3', [0, 2.6, 37], [6, 2.2, 6], '#ef4444', 'neon', true, true, { bounceForce: 34 }),
    part('wo_s2', 'block', 'Stage 2 Deck', [0, 3.0, 50], [14, 1.2, 12], '#334155'),
    part('wo_c2', 'checkpoint', 'Stage 2', [0, 3.7, 48], [4, 0.1, 4], '#10b981', 'neon', true, true, { checkpointIndex: 2 }),
    part('wo_conv1', 'block', 'Sideways Conveyor 1', [0, 3.2, 63], [10, 0.8, 8], '#f59e0b', 'metal', true, true, { conveyorSpeed: [12, 0] }),
    part('wo_conv2', 'block', 'Sideways Conveyor 2', [0, 3.2, 74], [10, 0.8, 8], '#f59e0b', 'metal', true, true, { conveyorSpeed: [-12, 0] }),
    coin('wo_coin1', [0, 5.0, 63]),
    part('wo_s3', 'block', 'Stage 3 Island', [0, 3.5, 88], [14, 1.2, 12], '#1e293b'),
    part('wo_c3', 'checkpoint', 'Stage 3', [0, 4.2, 86], [4, 0.1, 4], '#10b981', 'neon', true, true, { checkpointIndex: 3 }),
    part('wo_pad1', 'block', 'Punch Wall Ledge', [0, 3.8, 102], [4, 0.8, 14], '#38bdf8'),
    part('wo_k1', 'kill', 'Sweeper Bar 1', [0, 4.8, 99], [4.5, 0.6, 0.8], '#dc2626', 'neon'),
    part('wo_k2', 'kill', 'Sweeper Bar 2', [0, 4.8, 105], [4.5, 0.6, 0.8], '#dc2626', 'neon'),
    part('wo_s4', 'block', 'Stage 4 Launch Pad', [0, 4.2, 118], [12, 1.2, 10], '#475569'),
    part('wo_c4', 'checkpoint', 'Stage 4', [0, 4.9, 116], [4, 0.1, 4], '#10b981', 'neon', true, true, { checkpointIndex: 4 }),
    part('wo_launch', 'bounce', 'Mega Launch Ring', [0, 5.0, 121], [6, 0.4, 6], '#eab308', 'neon', true, true, { bounceForce: 54 }),
    part('wo_s5', 'block', 'Sky Platform', [0, 18, 134], [14, 1.2, 14], '#ec4899'),
    part('wo_c5', 'checkpoint', 'Stage 5', [0, 18.7, 131], [4, 0.1, 4], '#10b981', 'neon', true, true, { checkpointIndex: 5 }),
    part('wo_step1', 'block', 'Final Ring 1', [-4, 19, 145], [4, 0.8, 4], '#22d3ee'),
    part('wo_step2', 'block', 'Final Ring 2', [4, 20, 154], [4, 0.8, 4], '#22d3ee'),
    coin('wo_coin2', [4, 21.8, 154]),
    part('wo_finish', 'block', 'Wipeout Champion Stage', [0, 21, 168], [18, 2, 18], '#facc15', 'metal'),
    part('wo_c6', 'checkpoint', 'Wipeout Victory Trophy', [0, 22.1, 168], [6, 0.3, 6], '#fbbf24', 'neon', true, true, { checkpointIndex: 6 }),
  ],
};

// ==========================================
// 18. SKYLINE ROOFTOP PARKOUR
// ==========================================
export const skylineParkourWorld: BrickWorldData = {
  id: 'game_skyline_parkour',
  name: 'Skyline Rooftop Parkour',
  description: 'Sprint across skyscraper roofs, crane girders, and neon AC vents high above the city to reach the rescue helipad!',
  author: 'BrickVerse Official',
  version: 1,
  created: 1700000000000,
  updated: 1700000000000,
  gameMode: 'speed_run',
  environment: { skyColor: '#1e1b4b', fogDensity: 0.004, ambientColor: '#818cf8', sunPosition: [50, 70, -30], sunIntensity: 1.2 },
  spawnPoint: [0, 22, 0],
  parts: [
    part('sky_r1', 'block', 'Tower 1 Roof', [0, 20, 0], [16, 40, 16], '#334155', 'metal'),
    part('sky_boost1', 'block', 'Rooftop Turbo Strip', [0, 40.1, 4], [5, 0.2, 6], '#06b6d4', 'neon', true, true, { conveyorSpeed: [0, 32] }),
    part('sky_ramp1', 'wedge', 'AC Vent Jump', [0, 41.2, 8], [6, 2.5, 4], '#94a3b8', 'metal'),
    part('sky_r2', 'block', 'Tower 2 Roof', [0, 22, 26], [14, 44, 14], '#1e293b', 'metal'),
    coin('sky_c1', [0, 45.5, 26]),
    part('sky_crane', 'block', 'Steel Crane Girder', [6, 45, 43], [3, 1.2, 22], '#eab308', 'metal'),
    part('sky_r3', 'block', 'Glass Penthouse', [10, 24, 64], [16, 48, 16], '#0284c7', 'glass'),
    part('sky_b1', 'bounce', 'Ventilation Fan Updraft', [10, 48.3, 68], [5, 0.5, 5], '#38bdf8', 'neon', true, true, { bounceForce: 40 }),
    part('sky_r4', 'block', 'Neon Penthouse Deck', [0, 32, 88], [18, 52, 18], '#0f172a', 'metal'),
    coin('sky_c2', [0, 59.5, 88]),
    part('sky_bridge', 'block', 'Neon Skybridge', [0, 58, 112], [6, 0.8, 30], '#ec4899', 'neon', true, true, { conveyorSpeed: [0, 36] }),
    part('sky_heli', 'block', 'Skyscraper Helipad', [0, 35, 140], [22, 50, 22], '#475569', 'metal'),
    part('sky_fin', 'checkpoint', 'Helipad Finish H', [0, 60.2, 140], [8, 0.3, 8], '#facc15', 'neon', true, true, { checkpointIndex: 99 }),
  ],
};

// ==========================================
// 19. IMPOSSIBLE GLASS BRIDGE
// ==========================================
export const glassBridgeWorld: BrickWorldData = {
  id: 'game_glass_bridge',
  name: 'Impossible Glass Bridge',
  description: 'Cross the sky-high tempered glass panels without stepping on decoy red laser traps underneath!',
  author: 'BrickVerse Official',
  version: 1,
  created: 1700000000000,
  updated: 1700000000000,
  gameMode: 'obby',
  environment: { skyColor: '#0f172a', fogDensity: 0.006, ambientColor: '#f472b6', sunPosition: [20, 60, 20], sunIntensity: 1.1 },
  spawnPoint: [0, 2.2, 0],
  parts: [
    part('gb_start', 'block', 'Start Chamber', [0, 0.5, 0], [16, 1.5, 12], '#1e293b', 'metal'),
    part('gb_c1', 'checkpoint', 'Stage 1', [0, 1.4, 2], [4, 0.1, 4], '#10b981', 'neon', true, true, { checkpointIndex: 1 }),
    part('gb_p1l', 'block', 'Glass 1 Left', [-3.5, 1.2, 12], [5, 0.5, 5], '#38bdf8', 'glass'),
    part('gb_p1r', 'kill', 'Trap 1 Right', [3.5, 1.2, 12], [5, 0.5, 5], '#ef4444', 'glass'),
    part('gb_p2l', 'kill', 'Trap 2 Left', [-3.5, 1.2, 20], [5, 0.5, 5], '#ef4444', 'glass'),
    part('gb_p2r', 'block', 'Glass 2 Right', [3.5, 1.2, 20], [5, 0.5, 5], '#38bdf8', 'glass'),
    part('gb_mid1', 'block', 'Checkpoint Balcony 1', [0, 1.4, 30], [14, 1.2, 8], '#334155', 'metal'),
    part('gb_c2', 'checkpoint', 'Stage 2', [0, 2.1, 30], [4, 0.1, 4], '#10b981', 'neon', true, true, { checkpointIndex: 2 }),
    part('gb_p3l', 'block', 'Glass 3 Left', [-3.5, 1.8, 40], [5, 0.5, 5], '#38bdf8', 'glass'),
    part('gb_p3r', 'kill', 'Trap 3 Right', [3.5, 1.8, 40], [5, 0.5, 5], '#ef4444', 'glass'),
    part('gb_p4l', 'block', 'Glass 4 Left', [-3.5, 2.2, 48], [5, 0.5, 5], '#38bdf8', 'glass'),
    part('gb_p4r', 'kill', 'Trap 4 Right', [3.5, 2.2, 48], [5, 0.5, 5], '#ef4444', 'glass'),
    coin('gb_coin1', [-3.5, 3.8, 48]),
    part('gb_mid2', 'block', 'Checkpoint Balcony 2', [0, 2.6, 58], [14, 1.2, 8], '#334155', 'metal'),
    part('gb_c3', 'checkpoint', 'Stage 3', [0, 3.3, 58], [4, 0.1, 4], '#10b981', 'neon', true, true, { checkpointIndex: 3 }),
    part('gb_p5l', 'kill', 'Trap 5 Left', [-3.5, 3.2, 68], [5, 0.5, 5], '#ef4444', 'glass'),
    part('gb_p5r', 'block', 'Glass 5 Right', [3.5, 3.2, 68], [5, 0.5, 5], '#38bdf8', 'glass'),
    part('gb_p6l', 'block', 'Glass 6 Left', [-3.5, 3.8, 76], [5, 0.5, 5], '#38bdf8', 'glass'),
    part('gb_p6r', 'kill', 'Trap 6 Right', [3.5, 3.8, 76], [5, 0.5, 5], '#ef4444', 'glass'),
    part('gb_c4', 'checkpoint', 'Stage 4', [0, 4.6, 86], [4, 0.1, 4], '#10b981', 'neon', true, true, { checkpointIndex: 4 }),
    part('gb_mid3', 'block', 'Elevated Bridge Hub', [0, 4.0, 86], [14, 1.2, 8], '#475569', 'metal'),
    part('gb_b1', 'bounce', 'Jump Pad', [0, 4.7, 94], [5, 0.4, 5], '#facc15', 'neon', true, true, { bounceForce: 32 }),
    part('gb_c5', 'checkpoint', 'Stage 5', [0, 10.6, 104], [4, 0.1, 4], '#10b981', 'neon', true, true, { checkpointIndex: 5 }),
    part('gb_mid4', 'block', 'Upper Sky Deck', [0, 10.0, 104], [14, 1.2, 10], '#ec4899', 'metal'),
    part('gb_end', 'block', 'Golden Vault Prize Deck', [0, 11, 122], [18, 2, 16], '#facc15', 'metal'),
    part('gb_c6', 'checkpoint', 'Bridge Victory Trophy', [0, 12.1, 122], [6, 0.3, 6], '#fbbf24', 'neon', true, true, { checkpointIndex: 6 }),
  ],
};

// ==========================================
// 20. CANDY LAND MEGA OBBY
// ==========================================
export const candyObbyWorld: BrickWorldData = {
  id: 'game_candy_obby',
  name: 'Candy Land Mega Obby',
  description: 'Bounce on giant pastel marshmallows, cross wafer bridges, and dodge sour-apple laser beams across Sugar Kingdom!',
  author: 'BrickVerse Official',
  version: 1,
  created: 1700000000000,
  updated: 1700000000000,
  gameMode: 'obby',
  environment: { skyColor: '#fbcfe8', fogDensity: 0.004, ambientColor: '#fdf2f8', sunPosition: [30, 60, 20], sunIntensity: 1.3 },
  spawnPoint: [0, 2.2, 0],
  parts: [
    part('cn_s1', 'block', 'Strawberry Waffle Pad', [0, 0.5, 0], [14, 1.2, 14], '#f472b6'),
    part('cn_c1', 'checkpoint', 'Stage 1', [0, 1.2, 2], [4, 0.1, 4], '#10b981', 'neon', true, true, { checkpointIndex: 1 }),
    part('cn_m1', 'bounce', 'Marshmallow 1', [0, 1.5, 13], [6, 1.6, 6], '#ffffff', 'plastic', true, true, { bounceForce: 32 }),
    part('cn_m2', 'bounce', 'Marshmallow 2', [4, 3.5, 24], [6, 1.6, 6], '#ffffff', 'plastic', true, true, { bounceForce: 36 }),
    part('cn_s2', 'block', 'Mint Wafer Island', [0, 6.0, 38], [14, 1.2, 12], '#34d399'),
    part('cn_c2', 'checkpoint', 'Stage 2', [0, 6.7, 36], [4, 0.1, 4], '#10b981', 'neon', true, true, { checkpointIndex: 2 }),
    part('cn_riv', 'block', 'Chocolate Bridge', [0, 6.2, 54], [6, 0.8, 18], '#78350f'),
    part('cn_k1', 'kill', 'Sour Gummy Beam 1', [0, 7.0, 50], [6.5, 0.5, 1], '#84cc16', 'neon'),
    part('cn_k2', 'kill', 'Sour Gummy Beam 2', [0, 7.0, 58], [6.5, 0.5, 1], '#84cc16', 'neon'),
    coin('cn_coin1', [0, 8.2, 54]),
    part('cn_s3', 'block', 'Blueberry Cake Plaza', [0, 6.8, 70], [14, 1.2, 12], '#60a5fa'),
    part('cn_c3', 'checkpoint', 'Stage 3', [0, 7.5, 68], [4, 0.1, 4], '#10b981', 'neon', true, true, { checkpointIndex: 3 }),
    part('cn_lol1', 'cylinder', 'Giant Lollipop 1', [-4, 8.0, 82], [6, 0.8, 6], '#ec4899'),
    part('cn_lol2', 'cylinder', 'Giant Lollipop 2', [4, 9.0, 92], [6, 0.8, 6], '#a855f7'),
    part('cn_s4', 'block', 'Vanilla Frosting Deck', [0, 10.0, 104], [14, 1.2, 10], '#fef08a'),
    part('cn_c4', 'checkpoint', 'Stage 4', [0, 10.7, 102], [4, 0.1, 4], '#10b981', 'neon', true, true, { checkpointIndex: 4 }),
    part('cn_b_up', 'bounce', 'Cotton Candy Trampoline', [0, 10.8, 108], [6, 0.5, 6], '#f472b6', 'neon', true, true, { bounceForce: 48 }),
    part('cn_s5', 'block', 'Rainbow Sugar Loft', [0, 22.0, 120], [14, 1.2, 12], '#38bdf8'),
    part('cn_c5', 'checkpoint', 'Stage 5', [0, 22.7, 118], [4, 0.1, 4], '#10b981', 'neon', true, true, { checkpointIndex: 5 }),
    part('cn_end', 'block', 'Golden Candy Castle', [0, 23.0, 138], [18, 2, 18], '#facc15', 'metal'),
    part('cn_c6', 'checkpoint', 'Candy Crown Trophy', [0, 24.1, 138], [6, 0.3, 6], '#fbbf24', 'neon', true, true, { checkpointIndex: 6 }),
  ],
};

// ==========================================
// 21. TEMPLE RUN: JUNGLE RUINS
// ==========================================
export const jungleRuinsWorld: BrickWorldData = {
  id: 'game_jungle_ruins',
  name: 'Temple Run: Jungle Ruins',
  description: 'Dash through ancient mossy ruins, dodge temple spike traps, grab golden coins, and escape with the Emerald Idol!',
  author: 'BrickVerse Official',
  version: 1,
  created: 1700000000000,
  updated: 1700000000000,
  gameMode: 'speed_run',
  environment: { skyColor: '#064e3b', fogDensity: 0.007, ambientColor: '#6ee7b7', sunPosition: [30, 60, 10], sunIntensity: 1.2 },
  spawnPoint: [0, 2.2, 0],
  parts: [
    part('jr_start', 'block', 'Ruins Gate', [0, 0.5, 0], [16, 1.2, 16], '#57534e'),
    part('jr_path1', 'block', 'Stone Causeway', [0, 0.5, 28], [8, 1.2, 40], '#78716c', 'plastic', true, true, { conveyorSpeed: [0, 24] }),
    part('jr_trap1', 'kill', 'Spike Pit 1', [0, 1.1, 22], [7, 0.3, 1.5], '#dc2626', 'neon'),
    coin('jr_c1', [-2, 2.5, 28]),
    coin('jr_c2', [2, 2.5, 36]),
    part('jr_trap2', 'kill', 'Spike Pit 2', [0, 1.1, 42], [7, 0.3, 1.5], '#dc2626', 'neon'),
    part('jr_plaza', 'block', 'Vine Courtyard', [0, 1.2, 60], [20, 1.4, 20], '#15803d'),
    part('jr_b1', 'bounce', 'Ancient Spring Tile', [0, 2.0, 66], [5, 0.4, 5], '#10b981', 'neon', true, true, { bounceForce: 38 }),
    part('jr_upper', 'block', 'Temple Ziggurat Top', [0, 12.0, 84], [18, 2, 18], '#a8a29e'),
    coin('jr_c3', [0, 14.5, 84]),
    part('jr_bridge', 'block', 'Bamboo Log Bridge', [0, 12.0, 108], [5, 0.8, 30], '#92400e', 'wood'),
    part('jr_idol_plaza', 'block', 'Emerald Sanctuary', [0, 12.5, 134], [20, 2, 20], '#065f46'),
    part('jr_fin', 'checkpoint', 'Emerald Idol Finish', [0, 13.7, 134], [6, 0.3, 6], '#34d399', 'neon', true, true, { checkpointIndex: 99 }),
  ],
};

// ==========================================
// 22. NINJA DOJO ROOFTOPS
// ==========================================
export const ninjaDojoWorld: BrickWorldData = {
  id: 'game_ninja_dojo',
  name: 'Ninja Dojo Rooftops',
  description: 'Race across crimson pagoda roofs, bamboo balance beams, and cherry blossom courtyards to claim the Golden Shinobi Scroll!',
  author: 'BrickVerse Official',
  version: 1,
  created: 1700000000000,
  updated: 1700000000000,
  gameMode: 'speed_run',
  environment: { skyColor: '#fda4af', fogDensity: 0.004, ambientColor: '#ffe4e6', sunPosition: [-30, 50, 40], sunIntensity: 1.3 },
  spawnPoint: [0, 2.2, 0],
  parts: [
    part('nd_court', 'block', 'Dojo Stone Courtyard', [0, 0.5, 0], [24, 1.2, 20], '#475569'),
    part('nd_pagoda1', 'block', 'Pagoda Roof 1', [0, 5.0, 22], [14, 1.2, 14], '#991b1b', 'wood'),
    part('nd_ramp1', 'wedge', 'Timber Ramp', [0, 2.8, 12], [6, 4.4, 8], '#78350f', 'wood'),
    coin('nd_c1', [0, 7.2, 22]),
    part('nd_beam', 'block', 'Bamboo Balance Beam', [0, 5.4, 40], [2.4, 0.6, 22], '#65a30d', 'wood'),
    part('nd_pagoda2', 'block', 'Pagoda Roof 2', [0, 6.5, 62], [16, 1.2, 16], '#b91c1c', 'wood'),
    part('nd_b1', 'bounce', 'Wind Scroll Pad', [0, 7.2, 67], [5, 0.4, 5], '#f472b6', 'neon', true, true, { bounceForce: 40 }),
    part('nd_pagoda3', 'block', 'High Watch Pagoda', [0, 17.5, 86], [16, 1.2, 16], '#991b1b', 'wood'),
    coin('nd_c2', [0, 19.5, 86]),
    part('nd_fin', 'checkpoint', 'Shinobi Scroll Shrine', [0, 18.3, 88], [6, 0.3, 6], '#facc15', 'neon', true, true, { checkpointIndex: 99 }),
  ],
};

// ==========================================
// 23. CYBERPUNK WALL-HOP GRID
// ==========================================
export const cyberWallhopWorld: BrickWorldData = {
  id: 'game_cyber_wallhop',
  name: 'Cyberpunk Wall-Hop Grid',
  description: 'Navigate neon magenta & cyan floating monoliths across a synthwave abyss to unlock the Cyber Citadel!',
  author: 'BrickVerse Official',
  version: 1,
  created: 1700000000000,
  updated: 1700000000000,
  gameMode: 'obby',
  environment: { skyColor: '#09090b', fogDensity: 0.007, ambientColor: '#e879f9', sunPosition: [0, 60, -40], sunIntensity: 0.9 },
  spawnPoint: [0, 2.2, 0],
  parts: [
    part('cw_s1', 'block', 'Synth Grid Pad', [0, 0.5, 0], [14, 1.2, 14], '#18181b', 'metal'),
    part('cw_c1', 'checkpoint', 'Stage 1', [0, 1.2, 2], [4, 0.1, 4], '#06b6d4', 'neon', true, true, { checkpointIndex: 1 }),
    part('cw_m1', 'block', 'Neon Block 1', [-4, 2.0, 12], [5, 1, 5], '#ec4899', 'neon'),
    part('cw_m2', 'block', 'Neon Block 2', [4, 3.2, 21], [5, 1, 5], '#06b6d4', 'neon'),
    part('cw_s2', 'block', 'Laser Hub 2', [0, 4.2, 34], [14, 1.2, 12], '#18181b', 'metal'),
    part('cw_c2', 'checkpoint', 'Stage 2', [0, 4.9, 32], [4, 0.1, 4], '#06b6d4', 'neon', true, true, { checkpointIndex: 2 }),
    part('cw_conv', 'block', 'Hyper Conveyor', [0, 4.5, 50], [6, 0.8, 20], '#8b5cf6', 'neon', true, true, { conveyorSpeed: [0, 32] }),
    coin('cw_coin1', [0, 6.2, 50]),
    part('cw_s3', 'block', 'Grid Node 3', [0, 5.0, 68], [14, 1.2, 12], '#18181b', 'metal'),
    part('cw_c3', 'checkpoint', 'Stage 3', [0, 5.7, 66], [4, 0.1, 4], '#06b6d4', 'neon', true, true, { checkpointIndex: 3 }),
    part('cw_b1', 'bounce', 'Gravity Thruster', [0, 5.8, 72], [5, 0.4, 5], '#22d3ee', 'neon', true, true, { bounceForce: 48 }),
    part('cw_s4', 'block', 'Upper Synth Deck', [0, 17, 84], [14, 1.2, 12], '#27272a', 'metal'),
    part('cw_c4', 'checkpoint', 'Stage 4', [0, 17.7, 82], [4, 0.1, 4], '#06b6d4', 'neon', true, true, { checkpointIndex: 4 }),
    part('cw_c5', 'checkpoint', 'Stage 5', [0, 18.7, 102], [4, 0.1, 4], '#06b6d4', 'neon', true, true, { checkpointIndex: 5 }),
    part('cw_s5', 'block', 'Cyber Tower Deck', [0, 18, 102], [14, 1.2, 12], '#3f3f46', 'metal'),
    part('cw_end', 'block', 'Cyber Citadel Core', [0, 19, 122], [18, 2, 18], '#a855f7', 'neon'),
    part('cw_c6', 'checkpoint', 'Citadel Trophy', [0, 20.1, 122], [6, 0.3, 6], '#facc15', 'neon', true, true, { checkpointIndex: 6 }),
  ],
};

// ==========================================
// 24. ICE CAVERN SLIPPERY SLIDE
// ==========================================
export const iceCavernWorld: BrickWorldData = {
  id: 'game_ice_cavern',
  name: 'Ice Cavern Slippery Slide',
  description: 'Zoom down frozen glacier ramps, boost across crystal ice tunnels, and reach the Aurora Borealis Summit!',
  author: 'BrickVerse Official',
  version: 1,
  created: 1700000000000,
  updated: 1700000000000,
  gameMode: 'speed_run',
  environment: { skyColor: '#0284c7', fogDensity: 0.005, ambientColor: '#bae6fd', sunPosition: [20, 60, 30], sunIntensity: 1.4 },
  spawnPoint: [0, 2.2, 0],
  parts: [
    part('ic_start', 'block', 'Frozen Basecamp', [0, 0.5, 0], [16, 1.2, 16], '#e0f2fe', 'glass'),
    part('ic_slide1', 'block', 'Glacier Speed Ice', [0, 0.5, 30], [8, 1.2, 44], '#7dd3fc', 'glass', true, true, { conveyorSpeed: [0, 38] }),
    coin('ic_c1', [0, 2.4, 30]),
    part('ic_plaza', 'block', 'Crystal Cavern Hall', [0, 1.0, 64], [22, 1.4, 22], '#bae6fd', 'glass'),
    part('ic_b1', 'bounce', 'Geyser Ice Vent', [0, 1.8, 70], [5, 0.4, 5], '#38bdf8', 'neon', true, true, { bounceForce: 44 }),
    part('ic_peak', 'block', 'Aurora Ice Summit', [0, 15.0, 88], [20, 2, 20], '#e0f2fe', 'glass'),
    coin('ic_c2', [0, 17.5, 88]),
    part('ic_fin', 'checkpoint', 'Aurora Crystal Goal', [0, 16.2, 92], [6, 0.3, 6], '#34d399', 'neon', true, true, { checkpointIndex: 99 }),
  ],
};

// ==========================================
// 25. SUMO RING: KNOCKOFF ROYALE
// ==========================================
export const sumoRoyaleWorld: BrickWorldData = {
  id: 'game_sumo_royale',
  name: 'Sumo Ring: Knockoff Royale',
  description: 'No walls, pure knockback chaos! Equip Slap Hand, Rubber Chicken, or Rocket Launcher to blast rivals off the floating Sumo Ring!',
  author: 'BrickVerse Official',
  version: 1,
  created: 1700000000000,
  updated: 1700000000000,
  gameMode: 'sumo',
  environment: { skyColor: '#fb923c', fogDensity: 0.004, ambientColor: '#fed7aa', sunPosition: [30, 60, -20], sunIntensity: 1.4 },
  spawnPoint: [0, 3.0, 14],
  parts: [
    part('sm_ring', 'cylinder', 'Grand Sumo Dohyo Ring', [0, 1.0, 0], [42, 2.0, 42], '#fef3c7', 'wood'),
    part('sm_border', 'cylinder', 'Golden Ring Rim', [0, 1.1, 0], [44, 1.4, 44], '#eab308', 'metal'),
    part('sm_center', 'cylinder', 'Center Clash Circle', [0, 2.05, 0], [10, 0.15, 10], '#dc2626', 'neon'),
    coin('sm_c1', [0, 3.8, 0]),
    coin('sm_c2', [-12, 3.8, 0]),
    coin('sm_c3', [12, 3.8, 0]),
    part('sm_pillar1', 'cylinder', 'Corner Lantern NW', [-17, 5, -17], [1.5, 7, 1.5], '#991b1b', 'wood'),
    part('sm_pillar2', 'cylinder', 'Corner Lantern NE', [17, 5, -17], [1.5, 7, 1.5], '#991b1b', 'wood'),
    part('sm_pillar3', 'cylinder', 'Corner Lantern SW', [-17, 5, 17], [1.5, 7, 1.5], '#991b1b', 'wood'),
    part('sm_pillar4', 'cylinder', 'Corner Lantern SE', [17, 5, 17], [1.5, 7, 1.5], '#991b1b', 'wood'),
  ],
};

// ==========================================
// 26. PIRATE SHIP BROADSIDE
// ==========================================
export const pirateShipsWorld: BrickWorldData = {
  id: 'game_pirate_ships',
  name: 'Pirate Ship Broadside',
  description: 'Cross wooden boarding planks between two towering pirate galleons and duel rival buccaneers on the high seas!',
  author: 'BrickVerse Official',
  version: 1,
  created: 1700000000000,
  updated: 1700000000000,
  gameMode: 'sword',
  environment: { skyColor: '#0ea5e9', fogDensity: 0.004, ambientColor: '#bae6fd', sunPosition: [50, 60, 20], sunIntensity: 1.4 },
  spawnPoint: [-18, 5.2, 0],
  parts: [
    part('ps_ocean', 'kill', 'Shark-Infested Ocean', [0, -1, 0], [150, 1, 150], '#0369a1', 'glass'),
    part('ps_ship1', 'block', 'Blue Corsair Galleon', [-18, 3.0, 0], [16, 4.0, 46], '#78350f', 'wood'),
    part('ps_mast1', 'cylinder', 'Corsair Mainmast', [-18, 13, 0], [1.6, 18, 1.6], '#92400e', 'wood'),
    part('ps_sail1', 'block', 'Corsair Sail', [-18, 14, 0], [12, 10, 0.6], '#f8fafc'),
    part('ps_ship2', 'block', 'Red Raider Galleon', [18, 3.0, 0], [16, 4.0, 46], '#451a03', 'wood'),
    part('ps_mast2', 'cylinder', 'Raider Mainmast', [18, 13, 0], [1.6, 18, 1.6], '#92400e', 'wood'),
    part('ps_sail2', 'block', 'Raider Sail', [18, 14, 0], [12, 10, 0.6], '#dc2626'),
    part('ps_plank1', 'block', 'Boarding Plank North', [0, 4.8, 10], [20, 0.6, 4], '#b45309', 'wood'),
    part('ps_plank2', 'block', 'Boarding Plank South', [0, 4.8, -10], [20, 0.6, 4], '#b45309', 'wood'),
    coin('ps_c1', [0, 6.6, 10]),
    coin('ps_c2', [0, 6.6, -10]),
    part('ps_b1', 'bounce', 'Cannon Launch Pad W', [-18, 5.2, 16], [4, 0.4, 4], '#facc15', 'neon', true, true, { bounceForce: 34 }),
    part('ps_b2', 'bounce', 'Cannon Launch Pad E', [18, 5.2, -16], [4, 0.4, 4], '#facc15', 'neon', true, true, { bounceForce: 34 }),
  ],
};

// ==========================================
// 27. COLOSSEUM BOSS RAID: TITAN MECH
// ==========================================
export const titanBossWorld: BrickWorldData = {
  id: 'game_titan_boss',
  name: 'Boss Raid: Titan Colosseum',
  description: 'Team up or go solo against the colossal Giant Titan Mech Boss! Blast it with Rocket Launchers and Laser Katanas for massive rewards!',
  author: 'BrickVerse Official',
  version: 1,
  created: 1700000000000,
  updated: 1700000000000,
  gameMode: 'boss_raid',
  environment: { skyColor: '#450a0a', fogDensity: 0.005, ambientColor: '#fca5a5', sunPosition: [25, 65, 25], sunIntensity: 1.3 },
  spawnPoint: [0, 2.2, 26],
  parts: [
    part('tb_floor', 'cylinder', 'Colosseum Sand Floor', [0, 0.5, 0], [80, 1.2, 80], '#d6d3d1', 'plastic'),
    part('tb_ring', 'cylinder', 'Boss Arena Ring', [0, 1.15, 0], [36, 0.2, 36], '#dc2626', 'neon'),
    part('tb_w1', 'block', 'North Wall', [0, 5, -40], [80, 9, 3], '#57534e'),
    part('tb_w2', 'block', 'South Wall', [0, 5, 40], [80, 9, 3], '#57534e'),
    part('tb_w3', 'block', 'West Wall', [-40, 5, 0], [3, 9, 80], '#57534e'),
    part('tb_w4', 'block', 'East Wall', [40, 5, 0], [3, 9, 80], '#57534e'),
    part('tb_pillar1', 'cylinder', 'Cover Pillar NW', [-16, 4.5, -16], [4, 8, 4], '#78716c'),
    part('tb_pillar2', 'cylinder', 'Cover Pillar NE', [16, 4.5, -16], [4, 8, 4], '#78716c'),
    part('tb_pillar3', 'cylinder', 'Cover Pillar SW', [-16, 4.5, 16], [4, 8, 4], '#78716c'),
    part('tb_pillar4', 'cylinder', 'Cover Pillar SE', [16, 4.5, 16], [4, 8, 4], '#78716c'),
    part('tb_b1', 'bounce', 'Jump Escape Pad W', [-28, 1.3, 0], [5, 0.4, 5], '#facc15', 'neon', true, true, { bounceForce: 34 }),
    part('tb_b2', 'bounce', 'Jump Escape Pad E', [28, 1.3, 0], [5, 0.4, 5], '#facc15', 'neon', true, true, { bounceForce: 34 }),
    coin('tb_c1', [-16, 9.8, -16]),
    coin('tb_c2', [16, 9.8, 16]),
  ],
};

// ==========================================
// 28. WILD WEST SALOON SHOWDOWN
// ==========================================
export const wildWestWorld: BrickWorldData = {
  id: 'game_wild_west',
  name: 'Wild West Saloon Showdown',
  description: 'High-noon Paintball Capture the Flag across a dusty canyon town with wooden saloons, water towers, and cactus cover!',
  author: 'BrickVerse Official',
  version: 1,
  created: 1700000000000,
  updated: 1700000000000,
  gameMode: 'paintball_ctf',
  environment: { skyColor: '#fb923c', fogDensity: 0.004, ambientColor: '#fed7aa', sunPosition: [40, 55, 10], sunIntensity: 1.5 },
  spawnPoint: [26, 2.2, 0],
  parts: [
    part('ww_sand', 'block', 'Canyon Desert Floor', [0, 0.5, 0], [90, 1, 60], '#fcd34d'),
    part('ww_saloon', 'block', 'Grand Saloon Building', [0, 5.0, -18], [22, 8, 12], '#92400e', 'wood'),
    part('ww_bank', 'block', 'Frontier Bank', [0, 4.5, 18], [18, 7, 10], '#78350f', 'wood'),
    part('ww_red_base', 'block', 'Outlaw Red Base', [-32, 1.1, 0], [10, 0.4, 10], '#dc2626', 'neon'),
    part('ww_red_flag', 'block', 'Red Flag Pole', [-32, 3.0, 0], [1.2, 3.5, 1.2], '#ef4444', 'neon'),
    part('ww_blue_base', 'block', 'Sheriff Blue Base', [30, 1.1, 0], [10, 0.4, 10], '#2563eb', 'neon'),
    part('ww_cactus1', 'cylinder', 'Giant Cactus 1', [-10, 3.5, 5], [1.6, 5, 1.6], '#15803d'),
    part('ww_cactus2', 'cylinder', 'Giant Cactus 2', [10, 3.5, -5], [1.6, 5, 1.6], '#15803d'),
    coin('ww_c1', [0, 10.2, -18]),
  ],
};

// ==========================================
// 29. SPACE STATION ZERO-G BATTLE
// ==========================================
export const spaceStationWorld: BrickWorldData = {
  id: 'game_space_station',
  name: 'Space Station Zero-G Battle',
  description: 'Float with low lunar gravity inside a cosmic orbital station! Soar over glowing reactor cores and battle cyber bots!',
  author: 'BrickVerse Official',
  version: 1,
  created: 1700000000000,
  updated: 1700000000000,
  gameMode: 'moon_gravity',
  environment: { skyColor: '#020617', fogDensity: 0.004, ambientColor: '#38bdf8', sunPosition: [50, 40, -50], sunIntensity: 1.0 },
  spawnPoint: [0, 2.2, 22],
  parts: [
    part('ss_deck', 'cylinder', 'Orbital Station Deck', [0, 0.5, 0], [72, 1.2, 72], '#1e293b', 'metal'),
    part('ss_core', 'cylinder', 'Fusion Reactor Core', [0, 6.0, 0], [8, 10, 8], '#06b6d4', 'neon'),
    part('ss_ring1', 'block', 'Upper Catwalk North', [0, 8.0, -18], [28, 1, 6], '#334155', 'metal'),
    part('ss_ring2', 'block', 'Upper Catwalk South', [0, 8.0, 18], [28, 1, 6], '#334155', 'metal'),
    part('ss_b1', 'bounce', 'Thruster Vent W', [-20, 1.3, 0], [5, 0.4, 5], '#38bdf8', 'neon', true, true, { bounceForce: 28 }),
    part('ss_b2', 'bounce', 'Thruster Vent E', [20, 1.3, 0], [5, 0.4, 5], '#a855f7', 'neon', true, true, { bounceForce: 28 }),
    coin('ss_c1', [0, 10.2, -18]),
    coin('ss_c2', [0, 10.2, 18]),
  ],
};

// ==========================================
// 30. TOY BOX WAR: GIANT BEDROOM
// ==========================================
export const toyBoxWarWorld: BrickWorldData = {
  id: 'game_toy_war',
  name: 'Toy Box War: Giant Bedroom',
  description: 'Shrunk to toy-soldier size! Storm giant Lego block forts, climb stacked hardcover books, and capture the enemy flag!',
  author: 'BrickVerse Official',
  version: 1,
  created: 1700000000000,
  updated: 1700000000000,
  gameMode: 'paintball_ctf',
  environment: { skyColor: '#bae6fd', fogDensity: 0.003, ambientColor: '#fef3c7', sunPosition: [30, 70, 30], sunIntensity: 1.4 },
  spawnPoint: [28, 2.2, 0],
  parts: [
    part('tw_rug', 'block', 'Giant Playroom Carpet', [0, 0.5, 0], [90, 1, 60], '#38bdf8'),
    part('tw_blocks1', 'block', 'Red Mega Brick Wall', [-14, 4.0, 8], [8, 7, 14], '#ef4444'),
    part('tw_blocks2', 'block', 'Yellow Mega Brick Bridge', [0, 6.0, 0], [18, 2, 8], '#facc15'),
    part('tw_book1', 'block', 'Giant Dictionary Stack', [14, 3.0, -10], [10, 5, 12], '#10b981'),
    part('tw_red_base', 'block', 'Red Toy Fort', [-32, 1.1, 0], [10, 0.4, 10], '#dc2626', 'neon'),
    part('tw_red_flag', 'block', 'Red Toy Flag', [-32, 3.0, 0], [1.2, 3.5, 1.2], '#ef4444', 'neon'),
    part('tw_blue_base', 'block', 'Blue Toy Fort', [30, 1.1, 0], [10, 0.4, 10], '#2563eb', 'neon'),
    coin('tw_c1', [0, 8.8, 0]),
  ],
};

// ==========================================
// 31. GLADIATOR LAVA PIT
// ==========================================
export const lavaPitDuelWorld: BrickWorldData = {
  id: 'game_lava_pit_duel',
  name: 'Gladiator Lava Pit',
  description: 'Sword & laser-katana duel on steel grates suspended directly over bubbling volcanic magma! One slip means instant lava!',
  author: 'BrickVerse Official',
  version: 1,
  created: 1700000000000,
  updated: 1700000000000,
  gameMode: 'sword',
  environment: { skyColor: '#270b0b', fogDensity: 0.008, ambientColor: '#f97316', sunPosition: [0, 50, 0], sunIntensity: 1.0 },
  spawnPoint: [0, 3.2, -16],
  parts: [
    part('lp_magma', 'kill', 'Volcanic Magma Pit', [0, 0, 0], [90, 1, 90], '#ea580c', 'neon'),
    part('lp_center', 'cylinder', 'Steel Duel Platform', [0, 2.0, 0], [36, 1.2, 36], '#334155', 'metal'),
    part('lp_ring1', 'block', 'North Bridge Grate', [0, 2.0, -22], [10, 1.2, 16], '#475569', 'metal'),
    part('lp_ring2', 'block', 'South Bridge Grate', [0, 2.0, 22], [10, 1.2, 16], '#475569', 'metal'),
    part('lp_b1', 'bounce', 'Thermal Updraft W', [-14, 2.7, 0], [4, 0.3, 4], '#f59e0b', 'neon', true, true, { bounceForce: 30 }),
    part('lp_b2', 'bounce', 'Thermal Updraft E', [14, 2.7, 0], [4, 0.3, 4], '#f59e0b', 'neon', true, true, { bounceForce: 30 }),
    coin('lp_c1', [0, 4.4, 0]),
  ],
};

// ==========================================
// 32. TSUNAMI FLOOD ESCAPE
// ==========================================
export const floodEscapeWorld: BrickWorldData = {
  id: 'game_flood_escape',
  name: 'Tsunami Flood Escape',
  description: 'A tidal surge is flooding the underwater lab! Sprint up catwalks, hit airlock jump pads, and reach the top rescue submarine!',
  author: 'BrickVerse Official',
  version: 1,
  created: 1700000000000,
  updated: 1700000000000,
  gameMode: 'floor_lava',
  environment: { skyColor: '#0c4a6e', fogDensity: 0.008, ambientColor: '#7dd3fc', sunPosition: [20, 70, 20], sunIntensity: 1.2 },
  spawnPoint: [0, 2.5, 0],
  parts: [
    part('fe_floor', 'block', 'Submerged Lab Floor', [0, 0.5, 0], [40, 1, 40], '#1e293b', 'metal'),
    part('fe_r1', 'block', 'Catwalk Tier 1', [0, 4.0, 12], [14, 0.8, 8], '#38bdf8', 'metal'),
    part('fe_ramp1', 'wedge', 'Pipe Ramp 1', [0, 2.2, 6], [6, 3.5, 8], '#0284c7', 'metal'),
    part('fe_b1', 'bounce', 'Airlock Vent 1', [4, 4.6, 12], [4, 0.4, 4], '#22d3ee', 'neon', true, true, { bounceForce: 34 }),
    part('fe_r2', 'block', 'Turbine Deck Tier 2', [12, 11.0, 0], [12, 0.8, 16], '#475569', 'metal'),
    coin('fe_c1', [12, 12.8, 0]),
    part('fe_r3', 'block', 'Bridge Catwalk Tier 3', [0, 15.0, -12], [18, 0.8, 8], '#64748b', 'metal'),
    part('fe_b2', 'bounce', 'Emergency Escape Jet', [-5, 15.6, -12], [4, 0.4, 4], '#facc15', 'neon', true, true, { bounceForce: 40 }),
    part('fe_top', 'block', 'Surface Rescue Dock', [0, 26.0, 0], [16, 1.5, 16], '#22c55e', 'metal'),
    part('fe_fin', 'checkpoint', 'Rescue Submarine Hatch', [0, 27.0, 0], [6, 0.3, 6], '#34d399', 'neon', true, true, { checkpointIndex: 99 }),
  ],
};

// ==========================================
// 33. HAUNTED GRAVEYARD: ZOMBIE SIEGE
// ==========================================
export const graveyardSiegeWorld: BrickWorldData = {
  id: 'game_graveyard_siege',
  name: 'Haunted Graveyard: Zombie Siege',
  description: 'Misty midnight cemetery! Hold the gothic stone mausoleum rooftop and blast relentless undead waves!',
  author: 'BrickVerse Official',
  version: 1,
  created: 1700000000000,
  updated: 1700000000000,
  gameMode: 'zombie_defense',
  environment: { skyColor: '#0f172a', fogDensity: 0.014, ambientColor: '#6366f1', sunPosition: [-20, 40, -20], sunIntensity: 0.6 },
  spawnPoint: [0, 2.2, 0],
  parts: [
    part('gs_grass', 'block', 'Misty Cemetery Ground', [0, 0.5, 0], [90, 1, 90], '#14532d'),
    part('gs_crypt', 'block', 'Central Stone Crypt', [0, 3.5, 0], [16, 5, 16], '#334155', 'metal'),
    part('gs_ramp', 'wedge', 'Crypt Stairs', [0, 2.2, 11], [6, 3.5, 6], '#475569'),
    part('gs_tomb1', 'block', 'Tombstone 1', [-14, 2.0, -10], [2, 3, 1], '#64748b'),
    part('gs_tomb2', 'block', 'Tombstone 2', [14, 2.0, -10], [2, 3, 1], '#64748b'),
    part('gs_tomb3', 'block', 'Tombstone 3', [-14, 2.0, 10], [2, 3, 1], '#64748b'),
    part('gs_tomb4', 'block', 'Tombstone 4', [14, 2.0, 10], [2, 3, 1], '#64748b'),
    coin('gs_c1', [0, 7.5, 0]),
  ],
};

// ==========================================
// 34. BACKROOMS LABYRINTH ESCAPE
// ==========================================
export const backroomsWorld: BrickWorldData = {
  id: 'game_backrooms',
  name: 'Backrooms Labyrinth Escape',
  description: 'Trapped in endless eerie yellow corridors! Find all 6 glowing exit keys while evading the stalking Entity Bot!',
  author: 'BrickVerse Official',
  version: 1,
  created: 1700000000000,
  updated: 1700000000000,
  gameMode: 'murder',
  environment: { skyColor: '#713f12', fogDensity: 0.015, ambientColor: '#fef08a', sunPosition: [0, 40, 0], sunIntensity: 0.8 },
  spawnPoint: [0, 2.2, 22],
  parts: [
    part('br_floor', 'block', 'Damp Yellow Carpet', [0, 0.5, 0], [70, 1, 70], '#ca8a04'),
    part('br_wn', 'block', 'Outer Wall N', [0, 5, -35], [70, 9, 2], '#eab308'),
    part('br_ws', 'block', 'Outer Wall S', [0, 5, 35], [70, 9, 2], '#eab308'),
    part('br_we', 'block', 'Outer Wall E', [35, 5, 0], [2, 9, 70], '#eab308'),
    part('br_ww', 'block', 'Outer Wall W', [-35, 5, 0], [2, 9, 70], '#eab308'),
    part('br_m1', 'block', 'Maze Wall 1', [-14, 5, 10], [24, 9, 2], '#fde047'),
    part('br_m2', 'block', 'Maze Wall 2', [14, 5, -10], [24, 9, 2], '#fde047'),
    part('br_m3', 'block', 'Maze Wall 3', [0, 5, 0], [2, 9, 24], '#fde047'),
    part('br_k1', 'cylinder', 'Exit Key 1', [-25, 2.2, 25], [1.4, 2, 1.4], '#38bdf8', 'neon', true, false, { isClue: true }),
    part('br_k2', 'cylinder', 'Exit Key 2', [25, 2.2, 25], [1.4, 2, 1.4], '#38bdf8', 'neon', true, false, { isClue: true }),
    part('br_k3', 'cylinder', 'Exit Key 3', [-25, 2.2, -25], [1.4, 2, 1.4], '#38bdf8', 'neon', true, false, { isClue: true }),
    part('br_k4', 'cylinder', 'Exit Key 4', [25, 2.2, -25], [1.4, 2, 1.4], '#38bdf8', 'neon', true, false, { isClue: true }),
    part('br_k5', 'cylinder', 'Exit Key 5', [-10, 2.2, -4], [1.4, 2, 1.4], '#38bdf8', 'neon', true, false, { isClue: true }),
    part('br_k6', 'cylinder', 'Exit Key 6', [10, 2.2, 4], [1.4, 2, 1.4], '#38bdf8', 'neon', true, false, { isClue: true }),
  ],
};

// ==========================================
// 35. PRISON BREAK: ALCATRAZ OBBY
// ==========================================
export const prisonBreakWorld: BrickWorldData = {
  id: 'game_prison_break',
  name: 'Prison Break: Alcatraz Obby',
  description: 'Break out of Cellblock 9! Dodge security lasers, cross yard spotlights, leap guard towers, and reach the getaway speedboat!',
  author: 'BrickVerse Official',
  version: 1,
  created: 1700000000000,
  updated: 1700000000000,
  gameMode: 'obby',
  environment: { skyColor: '#0f172a', fogDensity: 0.005, ambientColor: '#94a3b8', sunPosition: [-20, 60, 20], sunIntensity: 1.0 },
  spawnPoint: [0, 2.2, 0],
  parts: [
    part('pb_cell', 'block', 'Cellblock Floor', [0, 0.5, 0], [16, 1.2, 14], '#475569', 'metal'),
    part('pb_c1', 'checkpoint', 'Stage 1', [0, 1.2, 2], [4, 0.1, 4], '#10b981', 'neon', true, true, { checkpointIndex: 1 }),
    part('pb_hall', 'block', 'Laser Security Hallway', [0, 0.8, 22], [8, 1.0, 26], '#334155', 'metal'),
    part('pb_l1', 'kill', 'Alarm Laser 1', [0, 1.7, 16], [8, 0.4, 0.8], '#ef4444', 'neon'),
    part('pb_l2', 'kill', 'Alarm Laser 2', [0, 1.7, 24], [8, 0.4, 0.8], '#ef4444', 'neon'),
    part('pb_yard', 'block', 'Prison Yard', [0, 1.0, 42], [18, 1.2, 14], '#64748b'),
    part('pb_c2', 'checkpoint', 'Stage 2', [0, 1.7, 40], [4, 0.1, 4], '#10b981', 'neon', true, true, { checkpointIndex: 2 }),
    part('pb_b1', 'bounce', 'Yard Trampoline', [0, 1.8, 46], [5, 0.4, 5], '#f97316', 'neon', true, true, { bounceForce: 40 }),
    part('pb_wall', 'block', 'Perimeter Wall Top', [0, 11.0, 62], [14, 1.5, 14], '#1e293b', 'metal'),
    part('pb_c3', 'checkpoint', 'Stage 3', [0, 11.9, 60], [4, 0.1, 4], '#10b981', 'neon', true, true, { checkpointIndex: 3 }),
    part('pb_sewer', 'block', 'Drain Pipe Path', [0, 11.2, 78], [4, 0.8, 18], '#16a34a', 'metal'),
    coin('pb_coin1', [0, 13.0, 78]),
    part('pb_c4', 'checkpoint', 'Stage 4', [0, 12.1, 92], [4, 0.1, 4], '#10b981', 'neon', true, true, { checkpointIndex: 4 }),
    part('pb_dock', 'block', 'Coast Guard Pier', [0, 11.4, 92], [14, 1.2, 12], '#78350f', 'wood'),
    part('pb_c5', 'checkpoint', 'Stage 5', [0, 12.1, 108], [4, 0.1, 4], '#10b981', 'neon', true, true, { checkpointIndex: 5 }),
    part('pb_step', 'block', 'Pier Plank', [0, 11.4, 108], [10, 1.2, 12], '#78350f', 'wood'),
    part('pb_boat', 'block', 'Getaway Speedboat', [0, 11.6, 126], [14, 2, 18], '#f8fafc', 'metal'),
    part('pb_c6', 'checkpoint', 'Freedom Trophy', [0, 12.8, 126], [6, 0.3, 6], '#fbbf24', 'neon', true, true, { checkpointIndex: 6 }),
  ],
};

// ==========================================
// 36. SHRINK RAY LAB: HIDE & SEEK
// ==========================================
export const shrinkLabWorld: BrickWorldData = {
  id: 'game_shrink_lab',
  name: 'Shrink Ray Lab: Hide & Seek',
  description: 'A shrink ray turned you 10 inches tall! Climb giant beakers, cereal boxes, and lab notebooks while hiding from the Giant Scientist!',
  author: 'BrickVerse Official',
  version: 1,
  created: 1700000000000,
  updated: 1700000000000,
  gameMode: 'hide_seek',
  environment: { skyColor: '#e0f2fe', fogDensity: 0.004, ambientColor: '#ffffff', sunPosition: [25, 65, 25], sunIntensity: 1.3 },
  spawnPoint: [0, 2.2, 22],
  parts: [
    part('sl_floor', 'block', 'Giant Lab Tile Floor', [0, 0.5, 0], [80, 1, 80], '#f1f5f9'),
    part('sl_table', 'block', 'Colossal Lab Counter', [-16, 4.0, -10], [22, 7, 16], '#cbd5e1', 'metal'),
    part('sl_cereal', 'block', 'Giant Cereal Box', [18, 5.0, 12], [8, 9, 5], '#f59e0b'),
    part('sl_beaker', 'cylinder', 'Giant Bubbling Beaker', [-10, 9.5, -10], [6, 4, 6], '#10b981', 'glass'),
    part('sl_b1', 'bounce', 'Spring Sponge', [10, 1.2, 0], [5, 0.6, 5], '#facc15', 'neon', true, true, { bounceForce: 34 }),
    coin('sl_c1', [-16, 9.5, -18]),
    coin('sl_c2', [18, 11.2, 12]),
  ],
};

// ==========================================
// 37. SCHOOLYARD PROP HUNT
// ==========================================
export const schoolPropHuntWorld: BrickWorldData = {
  id: 'game_school_prop_hunt',
  name: 'Schoolyard Prop Hunt',
  description: 'Disguise yourself as a school crate, bio barrel, or hallway locker inside BrickHigh School while hall-monitor bots patrol!',
  author: 'BrickVerse Official',
  version: 1,
  created: 1700000000000,
  updated: 1700000000000,
  gameMode: 'prop_hunt',
  environment: { skyColor: '#bae6fd', fogDensity: 0.005, ambientColor: '#f8fafc', sunPosition: [30, 60, 20], sunIntensity: 1.2 },
  spawnPoint: [0, 2.2, 0],
  parts: [
    part('sp_floor', 'block', 'Gymnasium Hardwood Floor', [0, 0.5, 0], [70, 1, 70], '#d97706', 'wood'),
    part('sp_wn', 'block', 'Gym Wall N', [0, 6, 35], [70, 10, 2], '#94a3b8'),
    part('sp_ws', 'block', 'Gym Wall S', [0, 6, -35], [70, 10, 2], '#94a3b8'),
    part('sp_we', 'block', 'Gym Wall E', [35, 6, 0], [2, 10, 70], '#94a3b8'),
    part('sp_ww', 'block', 'Gym Wall W', [-35, 6, 0], [2, 10, 70], '#94a3b8'),
    part('sp_disg_crate', 'block', 'Disguise: Classroom Crate', [-6, 1.2, -6], [2.5, 1.5, 2.5], '#b45309', 'wood', true, true, { isClue: true }),
    part('sp_disg_barrel', 'cylinder', 'Disguise: Science Barrel', [6, 1.2, -6], [2.2, 2.5, 2.2], '#16a34a', 'neon', true, true, { isClue: true }),
    part('sp_disg_locker', 'block', 'Disguise: Hallway Locker', [0, 2.0, -12], [2.0, 3.8, 1.8], '#0284c7', 'metal', true, true, { isClue: true }),
    part('sp_bleachers', 'block', 'Gym Bleachers', [-22, 3.0, 15], [10, 5, 26], '#dc2626', 'wood'),
    part('sp_desks', 'block', 'Study Desks Cluster', [20, 2.0, 15], [12, 2.5, 12], '#eab308', 'wood'),
    coin('sp_c1', [-22, 7.2, 15]),
  ],
};

// ==========================================
// 38. DESERT RALLY BAJA CIRCUIT
// ==========================================
export const desertRallyWorld: BrickWorldData = {
  id: 'game_desert_rally',
  name: 'Desert Rally Baja Circuit',
  description: 'Blaze across sandstone canyon straightaways, launch off desert boost chevrons, and set blistering Baja lap records!',
  author: 'BrickVerse Official',
  version: 1,
  created: 1700000000000,
  updated: 1700000000000,
  gameMode: 'kart_speedway',
  environment: { skyColor: '#f97316', fogDensity: 0.003, ambientColor: '#fed7aa', sunPosition: [40, 60, 20], sunIntensity: 1.5 },
  spawnPoint: [0, 1.5, 0],
  parts: [
    part('dr_sand', 'block', 'Baja Desert Basin', [0, 0.45, 0], [120, 0.9, 120], '#fbbf24'),
    part('dr_start', 'checkpoint', 'Start / Finish Banner', [0, 1.05, 0], [12, 0.1, 4], '#ef4444', 'neon', true, true, { checkpointIndex: 1 }),
    part('dr_str1', 'block', 'Canyon Straight N', [0, 1.0, 24], [12, 0.8, 44], '#78350f'),
    part('dr_bst1', 'block', 'Nitro Sand Strip', [0, 1.08, 25], [6, 0.1, 8], '#facc15', 'neon', true, true, { conveyorSpeed: [0, 50] }),
    part('dr_turn1', 'block', 'Mesa Turn East', [22, 1.0, 44], [38, 0.8, 12], '#78350f'),
    part('dr_chk2', 'checkpoint', 'Midway Baja Gate', [25, 1.05, 44], [4, 0.1, 12], '#10b981', 'neon', true, true, { checkpointIndex: 2 }),
    part('dr_str2', 'block', 'Backstretch Canyon', [40, 1.0, 0], [12, 0.8, 76], '#78350f'),
    part('dr_bst2', 'block', 'Turbo Dune Boost', [40, 1.08, 0], [6, 0.1, 8], '#06b6d4', 'neon', true, true, { conveyorSpeed: [0, -50] }),
    part('dr_turn2', 'block', 'Hairpin West', [20, 1.0, -40], [45, 0.8, 12], '#78350f'),
    part('dr_return', 'block', 'Finish Chicane', [-14, 1.0, -20], [14, 0.8, 45], '#78350f'),
    coin('dr_c1', [40, 2.8, 20]),
  ],
};

// ==========================================
// 39. RAINBOW SKY COASTER PARK
// ==========================================
export const rainbowCoasterWorld: BrickWorldData = {
  id: 'game_rainbow_coaster',
  name: 'Rainbow Sky Coaster Park',
  description: 'A pastel cloud carnival floating in the sky! Board the high-speed sky coaster cart and bounce across marshmallow plazas!',
  author: 'BrickVerse Official',
  version: 1,
  created: 1700000000000,
  updated: 1700000000000,
  gameMode: 'rollercoaster',
  environment: { skyColor: '#c084fc', fogDensity: 0.004, ambientColor: '#f5d0fe', sunPosition: [30, 70, 20], sunIntensity: 1.3 },
  spawnPoint: [0, 2.2, 0],
  parts: [
    part('rc2_plaza', 'block', 'Cloud Carnival Deck', [0, 0.5, 0], [80, 1, 80], '#f8fafc'),
    part('rc2_station', 'block', 'Coaster Station', [0, 3.0, 20], [16, 2.0, 12], '#ec4899', 'neon'),
    part('rc2_ramp', 'wedge', 'Boarding Steps', [0, 1.8, 11], [8, 2.5, 6], '#a855f7'),
    part('rc2_b1', 'bounce', 'Rainbow Bounce Pad', [-16, 1.2, 0], [6, 0.4, 6], '#38bdf8', 'neon', true, true, { bounceForce: 38 }),
    part('rc2_b2', 'bounce', 'Starlight Bounce Pad', [16, 1.2, 0], [6, 0.4, 6], '#facc15', 'neon', true, true, { bounceForce: 38 }),
    coin('rc2_c1', [-16, 14, 0]),
    coin('rc2_c2', [16, 14, 0]),
  ],
};

// ==========================================
// 40. BRICKBALL SOCCER STADIUM
// ==========================================
export const soccerStadiumWorld: BrickWorldData = {
  id: 'game_soccer_stadium',
  name: 'BrickBall Soccer Stadium',
  description: 'Dribble, kick, and rocket-blast the giant BrickBall into the Red or Blue goals inside a roaring championship stadium!',
  author: 'BrickVerse Official',
  version: 1,
  created: 1700000000000,
  updated: 1700000000000,
  gameMode: 'soccer',
  environment: { skyColor: '#38bdf8', fogDensity: 0.003, ambientColor: '#ffffff', sunPosition: [30, 80, 30], sunIntensity: 1.4 },
  spawnPoint: [0, 2.2, -12],
  parts: [
    part('soc_turf', 'block', 'Championship Turf', [0, 0.5, 0], [56, 1, 80], '#16a34a'),
    part('soc_midline', 'block', 'Midfield Line', [0, 1.03, 0], [54, 0.08, 0.8], '#ffffff'),
    part('soc_wall_w', 'block', 'West Sideline Barrier', [-28.5, 2.5, 0], [1, 4, 80], '#1e293b', 'glass'),
    part('soc_wall_e', 'block', 'East Sideline Barrier', [28.5, 2.5, 0], [1, 4, 80], '#1e293b', 'glass'),
    part('soc_red_goal_l', 'block', 'Red Goal Post L', [-9, 4, 39], [1, 7, 2], '#ef4444', 'metal'),
    part('soc_red_goal_r', 'block', 'Red Goal Post R', [9, 4, 39], [1, 7, 2], '#ef4444', 'metal'),
    part('soc_red_goal_t', 'block', 'Red Goal Crossbar', [0, 7.5, 39], [19, 1, 2], '#ef4444', 'metal'),
    part('soc_red_zone', 'block', 'Red Goal Line', [0, 1.05, 37], [17, 0.1, 4], '#ef4444', 'neon'),
    part('soc_blue_goal_l', 'block', 'Blue Goal Post L', [-9, 4, -39], [1, 7, 2], '#2563eb', 'metal'),
    part('soc_blue_goal_r', 'block', 'Blue Goal Post R', [9, 4, -39], [1, 7, 2], '#2563eb', 'metal'),
    part('soc_blue_goal_t', 'block', 'Blue Goal Crossbar', [0, 7.5, -39], [19, 1, 2], '#2563eb', 'metal'),
    part('soc_blue_zone', 'block', 'Blue Goal Line', [0, 1.05, -37], [17, 0.1, 4], '#2563eb', 'neon'),
    part('soc_stands_w', 'block', 'West Grandstands', [-36, 4.5, 0], [10, 7, 70], '#334155', 'metal'),
    part('soc_stands_e', 'block', 'East Grandstands', [36, 4.5, 0], [10, 7, 70], '#334155', 'metal'),
  ],
};

// ==========================================
// 41. SKATEPARK MEGA RAMP
// ==========================================
export const skateparkWorld: BrickWorldData = {
  id: 'game_skatepark',
  name: 'Skatepark Mega Ramp',
  description: 'Hit colossal half-pipes, launch wedges, speed grind rails, and ragdoll stunt pads for absurd air combos!',
  author: 'BrickVerse Official',
  version: 1,
  created: 1700000000000,
  updated: 1700000000000,
  gameMode: 'ragdoll',
  environment: { skyColor: '#fbbf24', fogDensity: 0.003, ambientColor: '#fef3c7', sunPosition: [40, 60, 20], sunIntensity: 1.4 },
  spawnPoint: [0, 16, -24],
  parts: [
    part('sk_floor', 'block', 'Concrete Skate Plaza', [0, 0.5, 0], [90, 1, 90], '#cbd5e1'),
    part('sk_tower', 'block', 'Mega Drop-In Tower', [0, 7.5, -24], [14, 14, 10], '#334155', 'metal'),
    part('sk_drop', 'block', 'Boost Drop Runway', [0, 1.0, -4], [10, 0.8, 28], '#0ea5e9', 'neon', true, true, { conveyorSpeed: [0, 40] }),
    part('sk_launch', 'wedge', 'Mega Launch Quarterpipe', [0, 4.0, 14], [12, 7, 10], '#f97316', 'wood'),
    part('sk_b1', 'bounce', 'Air Stunt Trampoline', [0, 1.2, 26], [8, 0.4, 8], '#ec4899', 'neon', true, true, { bounceForce: 48 }),
    part('sk_target', 'checkpoint', 'Bullseye Stunt Landing', [0, 1.1, 36], [10, 0.2, 10], '#facc15', 'neon', true, true, { checkpointIndex: 100 }),
    part('sk_rail1', 'block', 'Grind Rail West', [-16, 2.2, 0], [1.2, 1.6, 30], '#eab308', 'metal'),
    part('sk_rail2', 'block', 'Grind Rail East', [16, 2.2, 0], [1.2, 1.6, 30], '#eab308', 'metal'),
    coin('sk_c1', [0, 14, 22]),
    coin('sk_c2', [-16, 4.2, 0]),
  ],
};

// ==========================================
// 42. TROPICAL BEACH RESORT HANGOUT
// ==========================================
export const beachResortWorld: BrickWorldData = {
  id: 'game_beach_resort',
  name: 'Tropical Beach Resort Hangout',
  description: 'Relax with friends on a sunny island paradise! Ride the giant waterslide ramp, explore the wooden boardwalk pier, and hunt hidden beach coins.',
  author: 'BrickVerse Official',
  version: 1,
  created: 1700000000000,
  updated: 1700000000000,
  gameMode: 'sandbox',
  environment: { skyColor: '#38bdf8', fogDensity: 0.003, ambientColor: '#fef08a', sunPosition: [50, 50, -30], sunIntensity: 1.4 },
  spawnPoint: [0, 2.5, 0],
  parts: [
    part('br2_ocean', 'block', 'Turquoise Lagoon', [0, -0.5, 0], [160, 1, 160], '#06b6d4', 'glass', true, false),
    part('br2_island', 'cylinder', 'Golden Sand Island', [0, 0.6, 0], [74, 1.5, 74], '#fde047'),
    part('br2_pier', 'block', 'Boardwalk Pier', [0, 1.5, 36], [8, 0.6, 34], '#b45309', 'wood'),
    part('br2_hut1', 'block', 'Tiki Cafe Floor', [-18, 1.6, -12], [12, 0.6, 12], '#92400e', 'wood'),
    part('br2_hut_roof', 'block', 'Tiki Thatched Roof', [-18, 6.2, -12], [14, 0.8, 14], '#eab308', 'wood'),
    part('br2_slide_top', 'block', 'Waterslide Tower', [18, 5.5, -12], [8, 9, 8], '#ec4899'),
    part('br2_slide_chute', 'wedge', 'Waterslide Chute', [18, 4.5, -2], [6, 7, 14], '#38bdf8', 'glass', true, true, { conveyorSpeed: [0, 28] }),
    part('br2_b1', 'bounce', 'Beach Volleyball Trampoline', [0, 1.5, -18], [8, 0.4, 8], '#f97316', 'neon', true, true, { bounceForce: 34 }),
    coin('br2_c1', [0, 3.0, 50]),
    coin('br2_c2', [-18, 8.0, -12]),
    coin('br2_c3', [18, 11.5, -12]),
  ],
};

export const MEGA_EXPANSION_WORLDS: BrickWorldData[] = [
  megaWipeoutWorld,
  skylineParkourWorld,
  glassBridgeWorld,
  candyObbyWorld,
  jungleRuinsWorld,
  ninjaDojoWorld,
  cyberWallhopWorld,
  iceCavernWorld,
  sumoRoyaleWorld,
  pirateShipsWorld,
  titanBossWorld,
  wildWestWorld,
  spaceStationWorld,
  toyBoxWarWorld,
  lavaPitDuelWorld,
  floodEscapeWorld,
  graveyardSiegeWorld,
  backroomsWorld,
  prisonBreakWorld,
  shrinkLabWorld,
  schoolPropHuntWorld,
  desertRallyWorld,
  rainbowCoasterWorld,
  soccerStadiumWorld,
  skateparkWorld,
  beachResortWorld,
];
