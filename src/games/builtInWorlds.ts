/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrickWorldData, BrickPart } from '../types/game';
import { MEGA_EXPANSION_WORLDS } from './megaExpansionWorlds';

// Helper to create parts concisely
function createPart(
  id: string,
  type: BrickPart['type'],
  name: string,
  pos: [number, number, number],
  size: [number, number, number],
  color: string,
  material: BrickPart['material'] = 'plastic',
  anchored: boolean = true,
  canCollide: boolean = true,
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

// ==========================================
// 1. OBBY JUMP: TOWER OF BRICKS
// ==========================================
export const obbyWorld: BrickWorldData = {
  id: 'game_obby_jump',
  name: 'Obby Jump: Tower of Bricks',
  description: 'Climb 6 daring obstacle stages into the clouds! Avoid red kill-bricks, time moving platforms, and reach the victory trophy.',
  author: 'BrickVerse Official',
  version: 1,
  created: 1700000000000,
  updated: 1700000000000,
  gameMode: 'obby',
  environment: {
    skyColor: '#38bdf8',
    fogDensity: 0.005,
    ambientColor: '#93c5fd',
    sunPosition: [40, 70, 30],
    sunIntensity: 1.4,
  },
  spawnPoint: [0, 1.2, 0],
  parts: [
    createPart('sp1', 'block', 'Spawn Pad', [0, 0.5, 0], [12, 1, 12], '#22c55e'),
    createPart('st1_chk', 'checkpoint', 'Stage 1 Checkpoint', [0, 1.05, 0], [4, 0.1, 4], '#10b981', 'neon', true, true, { checkpointIndex: 1 }),

    createPart('s1_p1', 'block', 'Step 1', [0, 1.2, 10], [4, 0.8, 4], '#0284c7'),
    createPart('s1_p2', 'block', 'Step 2', [4, 2.0, 18], [4, 0.8, 4], '#0284c7'),
    createPart('s1_p3', 'block', 'Step 3', [-3, 2.8, 26], [4, 0.8, 4], '#0284c7'),
    createPart('s1_p4', 'block', 'Step 4', [2, 3.6, 34], [4, 0.8, 4], '#0284c7'),

    createPart('sp2', 'block', 'Stage 2 Island', [0, 4.4, 46], [14, 1, 12], '#475569'),
    createPart('st2_chk', 'checkpoint', 'Stage 2 Checkpoint', [0, 4.95, 42], [4, 0.1, 4], '#10b981', 'neon', true, true, { checkpointIndex: 2 }),

    createPart('s2_floor', 'block', 'Lava Bridge Base', [0, 4.4, 62], [6, 0.8, 18], '#334155'),
    createPart('s2_k1', 'kill', 'Lava 1', [0, 5.0, 56], [6, 0.4, 1.2], '#dc2626', 'neon'),
    createPart('s2_k2', 'kill', 'Lava 2', [0, 5.0, 60], [6, 0.4, 1.2], '#dc2626', 'neon'),
    createPart('s2_k3', 'kill', 'Lava 3', [0, 5.0, 64], [6, 0.4, 1.2], '#dc2626', 'neon'),
    createPart('s2_k4', 'kill', 'Lava 4', [0, 5.0, 68], [6, 0.4, 1.2], '#dc2626', 'neon'),

    createPart('sp3', 'block', 'Stage 3 Island', [0, 5.2, 78], [12, 1, 10], '#1e293b'),
    createPart('st3_chk', 'checkpoint', 'Stage 3 Checkpoint', [0, 5.75, 75], [4, 0.1, 4], '#10b981', 'neon', true, true, { checkpointIndex: 3 }),
    createPart('s3_bounce', 'bounce', 'Super Trampoline', [0, 5.8, 81], [6, 0.4, 6], '#eab308', 'neon', true, true, { bounceForce: 58 }),
    createPart('s3_cloud1', 'block', 'Rainbow Cloud 1', [0, 16, 81], [6, 0.6, 6], '#f472b6', 'glass'),
    createPart('s3_cloud2', 'block', 'Rainbow Cloud 2', [0, 26, 81], [6, 0.6, 6], '#38bdf8', 'glass'),

    createPart('sp4', 'block', 'Cloud Haven', [0, 36, 81], [16, 1, 16], '#f8fafc', 'plastic'),
    createPart('st4_chk', 'checkpoint', 'Stage 4 Checkpoint', [0, 36.55, 76], [4, 0.1, 4], '#10b981', 'neon', true, true, { checkpointIndex: 4 }),

    createPart('s4_glass1', 'block', 'Glass 1', [0, 36.5, 94], [4, 0.4, 5], '#38bdf8', 'glass', true, true),
    createPart('s4_glass2', 'block', 'Glass 2', [5, 37.5, 103], [4, 0.4, 5], '#38bdf8', 'glass', true, true),
    createPart('s4_glass3', 'block', 'Glass 3', [-3, 38.5, 112], [4, 0.4, 5], '#38bdf8', 'glass', true, true),
    createPart('s4_glass4', 'block', 'Glass 4', [2, 39.5, 121], [4, 0.4, 5], '#38bdf8', 'glass', true, true),

    createPart('sp5', 'block', 'Laser Platform', [0, 40.5, 134], [14, 1, 14], '#0f172a'),
    createPart('st5_chk', 'checkpoint', 'Stage 5 Checkpoint', [0, 41.05, 129], [4, 0.1, 4], '#10b981', 'neon', true, true, { checkpointIndex: 5 }),

    createPart('s5_beam', 'block', 'Balance Beam', [0, 40.5, 150], [1.8, 0.6, 18], '#f59e0b'),
    createPart('s5_laser1', 'kill', 'Laser Bar 1', [0, 41.2, 144], [3, 0.3, 0.4], '#ef4444', 'neon'),
    createPart('s5_laser2', 'kill', 'Laser Bar 2', [0, 41.2, 150], [3, 0.3, 0.4], '#ef4444', 'neon'),
    createPart('s5_laser3', 'kill', 'Laser Bar 3', [0, 41.2, 156], [3, 0.3, 0.4], '#ef4444', 'neon'),

    createPart('sp6_podium', 'block', 'Victory Summit', [0, 41.5, 172], [18, 2, 18], '#eab308', 'metal'),
    createPart('sp6_pillar1', 'cylinder', 'Victory Pillar L', [-7, 46.5, 172], [1.5, 8, 1.5], '#facc15', 'metal'),
    createPart('sp6_pillar2', 'cylinder', 'Victory Pillar R', [7, 46.5, 172], [1.5, 8, 1.5], '#facc15', 'metal'),
    createPart('sp6_arch', 'block', 'Arch Beam', [0, 51, 172], [16, 1.2, 2], '#facc15', 'metal'),
    createPart('s6_trophy', 'checkpoint', 'Golden Trophy Altar', [0, 43, 172], [5, 0.4, 5], '#fbbf24', 'neon', true, true, { checkpointIndex: 6 }),
  ],
};

// ==========================================
// 2. DISASTER SURVIVAL: BLOX ISLAND
// ==========================================
export const disasterWorld: BrickWorldData = {
  id: 'game_disaster_survival',
  name: 'Disaster Survival: Blox Island',
  description: 'Survive random disasters on an interactive physics island! Flee tornadoes, acid rain, earthquakes, and meteor strikes.',
  author: 'BrickVerse Official',
  version: 1,
  created: 1700000000000,
  updated: 1700000000000,
  gameMode: 'disaster',
  environment: {
    skyColor: '#0ea5e9',
    fogDensity: 0.004,
    ambientColor: '#bae6fd',
    sunPosition: [50, 60, -40],
    sunIntensity: 1.3,
  },
  spawnPoint: [0, 2.2, 0],
  parts: [
    createPart('ocean', 'block', 'Ocean Surface', [0, -1, 0], [160, 2, 160], '#0284c7', 'glass', true, false),
    createPart('sand_shore', 'cylinder', 'Sand Beach', [0, 0.5, 0], [90, 1.2, 90], '#fde047', 'plastic'),
    createPart('grass_center', 'cylinder', 'Grass Hill', [0, 1.4, 0], [74, 1.2, 74], '#22c55e', 'plastic'),

    createPart('tw_f1_floor', 'block', 'Tower F1 Floor', [0, 2.1, 0], [18, 0.6, 18], '#64748b', 'plastic', true),
    createPart('tw_f1_wall_l', 'block', 'Tower F1 Wall L', [-8.5, 4.5, 0], [1, 4.2, 18], '#475569', 'plastic', false),
    createPart('tw_f1_wall_r', 'block', 'Tower F1 Wall R', [8.5, 4.5, 0], [1, 4.2, 18], '#475569', 'plastic', false),
    createPart('tw_f1_wall_b', 'block', 'Tower F1 Wall B', [0, 4.5, -8.5], [16, 4.2, 1], '#475569', 'plastic', false),
    createPart('tw_f2_floor', 'block', 'Tower F2 Floor', [0, 6.9, 0], [18, 0.6, 18], '#64748b', 'plastic', false),
    createPart('tw_f2_wall_l', 'block', 'Tower F2 Wall L', [-8.5, 9.3, 0], [1, 4.2, 18], '#94a3b8', 'plastic', false),
    createPart('tw_f2_wall_r', 'block', 'Tower F2 Wall R', [8.5, 9.3, 0], [1, 4.2, 18], '#94a3b8', 'plastic', false),
    createPart('tw_f2_wall_f', 'block', 'Tower F2 Wall F', [0, 9.3, 8.5], [16, 4.2, 1], '#94a3b8', 'plastic', false),
    createPart('tw_f3_floor', 'block', 'Tower F3 Floor', [0, 11.7, 0], [18, 0.6, 18], '#64748b', 'plastic', false),
    createPart('tw_roof', 'block', 'Tower Roof Top', [0, 14.2, 0], [16, 0.6, 16], '#dc2626', 'plastic', false),
    createPart('tw_antenna', 'cylinder', 'Tower Antenna', [0, 17, 0], [0.4, 5, 0.4], '#e2e8f0', 'metal', false),

    createPart('bh_floor', 'block', 'Beach House Floor', [22, 2.1, 15], [14, 0.6, 12], '#b45309', 'wood', true),
    createPart('bh_roof', 'block', 'Beach House Shelter Roof', [22, 6.2, 15], [16, 0.8, 14], '#b91c1c', 'wood', false),
    createPart('bh_post1', 'cylinder', 'House Post 1', [16, 4.1, 10], [0.8, 3.6, 0.8], '#78350f', 'wood', false),
    createPart('bh_post2', 'cylinder', 'House Post 2', [28, 4.1, 10], [0.8, 3.6, 0.8], '#78350f', 'wood', false),
    createPart('bh_post3', 'cylinder', 'House Post 3', [16, 4.1, 20], [0.8, 3.6, 0.8], '#78350f', 'wood', false),
    createPart('bh_post4', 'cylinder', 'House Post 4', [28, 4.1, 20], [0.8, 3.6, 0.8], '#78350f', 'wood', false),

    createPart('lh_base', 'cylinder', 'Lighthouse Base', [-24, 4, -18], [6, 6, 6], '#dc2626', 'plastic', true),
    createPart('lh_mid', 'cylinder', 'Lighthouse Mid', [-24, 9, -18], [5, 4, 5], '#ffffff', 'plastic', false),
    createPart('lh_top', 'cylinder', 'Lighthouse Lamp', [-24, 12, -18], [4, 2, 4], '#facc15', 'neon', false),

    createPart('tr1_t', 'cylinder', 'Tree Trunk 1', [-15, 3.5, 15], [1.2, 3.5, 1.2], '#78350f', 'wood', true),
    createPart('tr1_l', 'sphere', 'Tree Leaves 1', [-15, 6.5, 15], [5, 4, 5], '#15803d', 'plastic', false),
    createPart('tr2_t', 'cylinder', 'Tree Trunk 2', [15, 3.5, -20], [1.2, 3.5, 1.2], '#78350f', 'wood', true),
    createPart('tr2_l', 'sphere', 'Tree Leaves 2', [15, 6.5, -20], [5, 4, 5], '#15803d', 'plastic', false),
  ],
};

// ==========================================
// 3. PIZZA CHEF TYCOON
// ==========================================
export const pizzaTycoonWorld: BrickWorldData = {
  id: 'game_pizza_tycoon',
  name: 'Pizza Chef Tycoon',
  description: 'Work at the bustling Blox Pizza place! Prepare fresh dough, add toppings, bake in the conveyor oven, and deliver orders for BloxCoins.',
  author: 'BrickVerse Official',
  version: 1,
  created: 1700000000000,
  updated: 1700000000000,
  gameMode: 'pizza',
  environment: {
    skyColor: '#f97316',
    fogDensity: 0.005,
    ambientColor: '#fed7aa',
    sunPosition: [30, 50, 20],
    sunIntensity: 1.2,
  },
  spawnPoint: [0, 1.2, 10],
  parts: [
    createPart('piz_floor', 'block', 'Restaurant Floor', [0, 0.5, 0], [40, 1, 36], '#e2e8f0', 'plastic'),
    createPart('piz_wall_b', 'block', 'Back Wall', [0, 5, -17.5], [40, 8, 1], '#991b1b', 'plastic'),
    createPart('piz_wall_l', 'block', 'Left Wall', [-19.5, 5, 0], [1, 8, 36], '#991b1b', 'plastic'),
    createPart('piz_wall_r', 'block', 'Right Wall', [19.5, 5, 0], [1, 8, 36], '#991b1b', 'plastic'),

    createPart('piz_counter', 'block', 'Order Front Desk', [0, 2.2, 2], [18, 2.4, 2], '#1e293b', 'plastic'),
    createPart('piz_register', 'block', 'Cash Register', [0, 3.6, 2], [1.4, 0.8, 1.2], '#0284c7', 'plastic'),

    createPart('st_dough_table', 'block', 'Dough Prep Table', [-12, 2.2, -6], [6, 2.4, 4], '#f1f5f9', 'metal'),
    createPart('st_dough_bin', 'cylinder', 'Flour & Dough Tub', [-12, 3.7, -6], [2.2, 0.6, 2.2], '#fef08a', 'plastic'),

    createPart('st_topping_table', 'block', 'Topping Bar', [-12, 2.2, -13], [8, 2.4, 3], '#475569', 'metal'),
    createPart('top_sauce', 'cylinder', 'Tomato Sauce Tub', [-14, 3.7, -13], [1.4, 0.5, 1.4], '#ef4444', 'plastic'),
    createPart('top_cheese', 'cylinder', 'Mozzarella Cheese Tub', [-12, 3.7, -13], [1.4, 0.5, 1.4], '#fde047', 'plastic'),
    createPart('top_pep', 'cylinder', 'Pepperoni Slices Tub', [-10, 3.7, -13], [1.4, 0.5, 1.4], '#b91c1c', 'plastic'),

    createPart('st_oven', 'block', 'Industrial Pizza Oven', [2, 2.5, -12], [12, 3, 5], '#334155', 'metal'),
    createPart('st_oven_belt', 'block', 'Oven Conveyor Track', [2, 2.6, -12], [11, 0.2, 2.2], '#f97316', 'neon'),
    createPart('st_oven_hood', 'block', 'Oven Heat Hood', [2, 5, -12], [8, 2, 4], '#64748b', 'metal'),

    createPart('st_box_counter', 'block', 'Packaging Counter', [12, 2.2, -8], [6, 2.4, 5], '#b45309', 'wood'),

    createPart('dining_table1', 'cylinder', 'Dining Table 1', [-8, 2, 12], [3.2, 2, 3.2], '#78350f', 'wood'),
    createPart('dining_table2', 'cylinder', 'Dining Table 2', [8, 2, 12], [3.2, 2, 3.2], '#78350f', 'wood'),

    createPart('truck_base', 'block', 'Blox Delivery Truck', [0, 1.8, 24], [6, 2.2, 10], '#dc2626', 'plastic'),
    createPart('truck_cab', 'block', 'Truck Cab', [0, 3.4, 26.5], [5.6, 1.8, 4], '#ef4444', 'plastic'),
  ],
};

// ==========================================
// 4. SWORD ARENA: RED VS BLUE
// ==========================================
export const swordArenaWorld: BrickWorldData = {
  id: 'game_sword_arena',
  name: 'Sword Arena: Red vs Blue',
  description: 'Enter the medieval gladiator arena! Slash, lunge, collect speed and gravity coils, and battle smart AI knights for arena glory.',
  author: 'BrickVerse Official',
  version: 1,
  created: 1700000000000,
  updated: 1700000000000,
  gameMode: 'sword',
  environment: {
    skyColor: '#1e293b',
    fogDensity: 0.005,
    ambientColor: '#64748b',
    sunPosition: [20, 60, -20],
    sunIntensity: 1.3,
  },
  spawnPoint: [0, 1.5, -28],
  parts: [
    createPart('arena_floor', 'block', 'Arena Courtyard', [0, 0.5, 0], [70, 1, 70], '#334155', 'plastic'),

    createPart('wall_north', 'block', 'North Rampart', [0, 4, -34.5], [70, 6, 2], '#475569', 'plastic'),
    createPart('wall_south', 'block', 'South Rampart', [0, 4, 34.5], [70, 6, 2], '#475569', 'plastic'),
    createPart('wall_west', 'block', 'West Rampart', [-34.5, 4, 0], [2, 6, 70], '#475569', 'plastic'),
    createPart('wall_east', 'block', 'East Rampart', [34.5, 4, 0], [2, 6, 70], '#475569', 'plastic'),

    createPart('tower_nw', 'cylinder', 'NW Watchtower', [-34, 7, -34], [7, 12, 7], '#1e293b', 'metal'),
    createPart('tower_ne', 'cylinder', 'NE Watchtower', [34, 7, -34], [7, 12, 7], '#1e293b', 'metal'),
    createPart('tower_sw', 'cylinder', 'SW Watchtower', [-34, 7, 34], [7, 12, 7], '#1e293b', 'metal'),
    createPart('tower_se', 'cylinder', 'SE Watchtower', [34, 7, 34], [7, 12, 7], '#1e293b', 'metal'),

    createPart('mid_platform', 'cylinder', 'Honor Stage', [0, 1.8, 0], [16, 1.6, 16], '#eab308', 'plastic'),
    createPart('mid_pillar', 'cylinder', 'Center Trophy Pillar', [0, 4, 0], [2, 3, 2], '#facc15', 'metal'),

    createPart('jp_1', 'bounce', 'Jump Pad West', [-22, 1.1, 0], [4, 0.2, 4], '#eab308', 'neon', true, true, { bounceForce: 24 }),
    createPart('jp_2', 'bounce', 'Jump Pad East', [22, 1.1, 0], [4, 0.2, 4], '#eab308', 'neon', true, true, { bounceForce: 24 }),

    createPart('sp_speed_pedestal', 'cylinder', 'Speed Coil Altar', [-16, 1.5, -16], [3, 1, 3], '#0284c7', 'neon'),
    createPart('sp_grav_pedestal', 'cylinder', 'Gravity Coil Altar', [16, 1.5, 16], [3, 1, 3], '#a855f7', 'neon'),
  ],
};

// ==========================================
// 5. SPEED RUN: NEON GALAXY
// ==========================================
export const speedRunWorld: BrickWorldData = {
  id: 'game_speed_run',
  name: 'Speed Run: Neon Galaxy',
  description: 'Lightning fast parkour in deep space! Hit glowing neon speed pads, launch off mega booster rings, and beat the world record clock.',
  author: 'BrickVerse Official',
  version: 1,
  created: 1700000000000,
  updated: 1700000000000,
  gameMode: 'speed_run',
  environment: {
    skyColor: '#050510',
    fogDensity: 0.003,
    ambientColor: '#38bdf8',
    sunPosition: [30, 80, -30],
    sunIntensity: 1.5,
  },
  spawnPoint: [0, 1.5, -5],
  parts: [
    // Starting launch pad
    createPart('sr_start', 'block', 'Launch Base', [0, 0.5, 0], [14, 1, 16], '#0284c7', 'neon'),

    // Straightaway runway with neon speed strips
    createPart('sr_track1', 'block', 'Hyperspace Track 1', [0, 0.5, 40], [10, 1, 60], '#0f172a', 'plastic'),
    createPart('sr_pad1', 'block', 'Speed Booster 1', [0, 1.05, 30], [6, 0.1, 8], '#06b6d4', 'neon', true, true, { conveyorSpeed: [0, 40] }),
    createPart('sr_pad2', 'block', 'Speed Booster 2', [0, 1.05, 55], [6, 0.1, 8], '#06b6d4', 'neon', true, true, { conveyorSpeed: [0, 40] }),

    // High launch ramp
    createPart('sr_ramp1', 'wedge', 'Launch Wedge', [0, 3, 75], [8, 4, 10], '#a855f7', 'neon'),
    createPart('sr_bounce1', 'bounce', 'Space Launcher', [0, 5.2, 80], [6, 0.4, 6], '#ec4899', 'neon', true, true, { bounceForce: 58, conveyorSpeed: [0, 30] }),
    createPart('sr_boost_ring1', 'block', 'Midway Booster 1', [0, 22, 98], [8, 0.8, 8], '#06b6d4', 'neon', true, true, { bounceForce: 45, conveyorSpeed: [0, 25] }),

    // Elevated floating rings in mid-air
    createPart('sr_air1', 'block', 'Air Platform 1', [0, 38, 120], [8, 1, 10], '#06b6d4', 'neon'),
    createPart('sr_air2', 'block', 'Air Platform 2', [12, 40, 145], [8, 1, 10], '#a855f7', 'neon'),
    createPart('sr_air3', 'block', 'Air Platform 3', [-8, 42, 170], [8, 1, 10], '#ec4899', 'neon'),

    // Neon speed bridge
    createPart('sr_track2', 'block', 'Galaxy Bridge', [0, 42, 215], [8, 1, 70], '#1e1b4b', 'plastic'),
    createPart('sr_pad3', 'block', 'Hyper Booster', [0, 42.6, 200], [6, 0.1, 12], '#06b6d4', 'neon', true, true, { conveyorSpeed: [0, 45] }),

    // Finish Gateway Portal
    createPart('sr_finish_podium', 'block', 'Cosmic Finish Line', [0, 42.5, 270], [20, 2, 18], '#facc15', 'metal'),
    createPart('sr_portal_ring', 'cylinder', 'Victory Warp Ring', [0, 48, 275], [10, 0.8, 10], '#06b6d4', 'neon'),
    createPart('sr_finish_chk', 'checkpoint', 'Finish Line Checkpoint', [0, 43.6, 270], [6, 0.2, 6], '#22c55e', 'neon', true, true, { checkpointIndex: 99 }),
  ],
};

// ==========================================
// 6. MYSTERY MURDER MANSION
// ==========================================
export const murderMansionWorld: BrickWorldData = {
  id: 'game_murder_mansion',
  name: 'Mystery Murder Mansion',
  description: 'Explore an eerie 2-story haunted manor! An Impostor Bot stalks the dark corridors. Collect 8 hidden gold keys to unlock the escape vault.',
  author: 'BrickVerse Official',
  version: 1,
  created: 1700000000000,
  updated: 1700000000000,
  gameMode: 'murder',
  environment: {
    skyColor: '#09090b',
    fogDensity: 0.012,
    ambientColor: '#27272a',
    sunPosition: [10, 40, -10],
    sunIntensity: 0.5,
  },
  spawnPoint: [0, 1.5, 20],
  parts: [
    // Mansion Main Floor (Mahogany)
    createPart('mn_f1', 'block', 'Manor Ground Floor', [0, 0.5, 0], [60, 1, 55], '#451a03', 'wood'),
    createPart('mn_wall_n', 'block', 'North Wall', [0, 6, -27], [60, 10, 1], '#18181b', 'plastic'),
    createPart('mn_wall_s', 'block', 'South Wall', [0, 6, 27], [60, 10, 1], '#18181b', 'plastic'),
    createPart('mn_wall_w', 'block', 'West Wall', [-29.5, 6, 0], [1, 10, 55], '#18181b', 'plastic'),
    createPart('mn_wall_e', 'block', 'East Wall', [29.5, 6, 0], [1, 10, 55], '#18181b', 'plastic'),

    // Interior partitions: Foyer, Library, Dining Hall
    createPart('mn_div1', 'block', 'Library Partition', [-10, 5, -8], [1, 8, 24], '#27272a', 'wood'),
    createPart('mn_div2', 'block', 'Dining Partition', [10, 5, -8], [1, 8, 24], '#27272a', 'wood'),

    // Grand Double Staircase to 2nd Floor
    createPart('mn_stair1', 'block', 'Stair Step 1', [-4, 1.8, -18], [5, 1.6, 5], '#78350f', 'wood'),
    createPart('mn_stair2', 'block', 'Stair Step 2', [-4, 3.4, -22], [5, 1.6, 5], '#78350f', 'wood'),
    createPart('mn_stair_land', 'block', 'Stair Landing', [0, 5.0, -24], [16, 1.0, 6], '#78350f', 'wood'),

    // 2nd Floor Balcony Gallery
    createPart('mn_f2_balcony', 'block', 'Mezzanine Balcony', [0, 5.5, 0], [54, 0.8, 14], '#451a03', 'wood'),
    createPart('mn_rail_w', 'block', 'Balcony Rail', [0, 6.4, 6.5], [54, 1.0, 0.4], '#b45309', 'wood'),

    // Hanging Candle Chandeliers (Eerie glow)
    createPart('mn_chan1', 'cylinder', 'Chandelier 1', [0, 9.5, 5], [4, 0.5, 4], '#f59e0b', 'neon'),
    createPart('mn_chan2', 'cylinder', 'Chandelier 2', [-18, 9.5, -12], [3, 0.5, 3], '#f59e0b', 'neon'),
    createPart('mn_chan3', 'cylinder', 'Chandelier 3', [18, 9.5, -12], [3, 0.5, 3], '#f59e0b', 'neon'),

    // Secret Escape Vault in the Back
    createPart('mn_vault', 'block', 'Golden Escape Vault', [0, 1.5, -24], [5, 2.0, 3], '#eab308', 'metal'),

    // Collectible Clue / Key pedestals
    createPart('key_1', 'checkpoint', 'Gold Key 1', [-20, 1.5, 15], [1.2, 0.2, 1.2], '#eab308', 'neon', true, true, { isClue: true }),
    createPart('key_2', 'checkpoint', 'Gold Key 2', [20, 1.5, 15], [1.2, 0.2, 1.2], '#eab308', 'neon', true, true, { isClue: true }),
    createPart('key_3', 'checkpoint', 'Gold Key 3', [-22, 1.5, -18], [1.2, 0.2, 1.2], '#eab308', 'neon', true, true, { isClue: true }),
    createPart('key_4', 'checkpoint', 'Gold Key 4', [22, 1.5, -18], [1.2, 0.2, 1.2], '#eab308', 'neon', true, true, { isClue: true }),
    createPart('key_5', 'checkpoint', 'Gold Key 5', [-18, 6.5, 0], [1.2, 0.2, 1.2], '#eab308', 'neon', true, true, { isClue: true }),
    createPart('key_6', 'checkpoint', 'Gold Key 6', [18, 6.5, 0], [1.2, 0.2, 1.2], '#eab308', 'neon', true, true, { isClue: true }),
  ],
};

// ==========================================
// 7. HIDE & SEEK EXTREME: TOY WORKSHOP
// ==========================================
export const hideSeekWorld: BrickWorldData = {
  id: 'game_hide_seek',
  name: 'Hide & Seek Extreme: Toy Workshop',
  description: 'Shrink down into a giant playroom! Hide behind giant toy blocks, climb giant bookshelves, bounce on toy drums, and evade the Giant Seeker Bot.',
  author: 'BrickVerse Official',
  version: 1,
  created: 1700000000000,
  updated: 1700000000000,
  gameMode: 'hide_seek',
  environment: {
    skyColor: '#60a5fa',
    fogDensity: 0.004,
    ambientColor: '#fef08a',
    sunPosition: [30, 60, 40],
    sunIntensity: 1.3,
  },
  spawnPoint: [0, 1.5, 0],
  parts: [
    // Giant Room Floor (Bright Wood Parquet)
    createPart('hs_floor', 'block', 'Workshop Floor', [0, 0.5, 0], [80, 1, 80], '#fef3c7', 'wood'),
    createPart('hs_wall_b', 'block', 'Room Wall Back', [0, 15, -39.5], [80, 30, 1], '#93c5fd', 'plastic'),
    createPart('hs_wall_l', 'block', 'Room Wall Left', [-39.5, 15, 0], [1, 30, 80], '#93c5fd', 'plastic'),
    createPart('hs_wall_r', 'block', 'Room Wall Right', [39.5, 15, 0], [1, 30, 80], '#93c5fd', 'plastic'),

    // Giant Toy Blocks (Colossal 6x6x6 blocks you can hide behind / on top)
    createPart('gb_red', 'block', 'Giant Red Toy Block', [-18, 3.5, -15], [7, 6, 7], '#dc2626', 'plastic'),
    createPart('gb_blue', 'block', 'Giant Blue Toy Block', [-18, 9.5, -15], [7, 6, 7], '#0284c7', 'plastic'),
    createPart('gb_yellow', 'block', 'Giant Yellow Toy Block', [18, 3.5, 15], [8, 6, 8], '#eab308', 'plastic'),
    createPart('gb_green', 'block', 'Giant Green Toy Block', [14, 3.5, -20], [7, 6, 7], '#16a34a', 'plastic'),

    // Giant Desk with Drawer you can crawl under
    createPart('gd_top', 'block', 'Giant Desk Surface', [-15, 14, 18], [24, 1.2, 16], '#78350f', 'wood'),
    createPart('gd_leg1', 'cylinder', 'Desk Leg 1', [-25, 7, 12], [1.4, 13, 1.4], '#451a03', 'wood'),
    createPart('gd_leg2', 'cylinder', 'Desk Leg 2', [-5, 7, 12], [1.4, 13, 1.4], '#451a03', 'wood'),
    createPart('gd_leg3', 'cylinder', 'Desk Leg 3', [-25, 7, 24], [1.4, 13, 1.4], '#451a03', 'wood'),
    createPart('gd_leg4', 'cylinder', 'Desk Leg 4', [-5, 7, 24], [1.4, 13, 1.4], '#451a03', 'wood'),

    // Giant Bouncy Toy Drum (Trampoline)
    createPart('hs_drum', 'cylinder', 'Giant Toy Snare Drum', [0, 2.5, -12], [10, 4, 10], '#dc2626', 'metal'),
    createPart('hs_drum_skin', 'bounce', 'Super Bouncy Drumhead', [0, 4.6, -12], [9, 0.3, 9], '#ffffff', 'neon', true, true, { bounceForce: 32 }),

    // Giant Toy Train Track Ramp
    createPart('hs_track1', 'block', 'Train Rail 1', [22, 1.2, -5], [4, 1.2, 28], '#334155', 'plastic'),
    createPart('hs_track2', 'block', 'Train Rail 2', [28, 1.2, -5], [4, 1.2, 28], '#334155', 'plastic'),
  ],
};

// ==========================================
// 8. RAGDOLL MAYHEM: MEGA STAIR DISMOUNT
// ==========================================
export const ragdollWorld: BrickWorldData = {
  id: 'game_ragdoll_mayhem',
  name: 'Ragdoll Mayhem: Mega Stair Dismount',
  description: 'Launch your floppy blocky avatar down a colossal mountain of bouncy stairs, giant bowling pins, spinning obstacles, and bumper trampolines! Score points for crazy flips, bonks, and airtime.',
  author: 'BrickVerse Official',
  version: 1,
  created: 1700000000000,
  updated: 1700000000000,
  gameMode: 'ragdoll',
  environment: {
    skyColor: '#fb923c',
    fogDensity: 0.003,
    ambientColor: '#ffedd5',
    sunPosition: [50, 80, 20],
    sunIntensity: 1.4,
  },
  spawnPoint: [0, 63.5, -12],
  parts: [
    // Summit Cannon Launch Pad
    createPart('summit_platform', 'block', 'Summit Launch Pad', [0, 62, -10], [18, 2, 16], '#1e293b', 'metal'),
    createPart('cannon_mount', 'block', 'Cannon Turret Mount', [0, 63.5, -5], [4, 1.2, 4], '#0f172a', 'metal'),
    createPart('cannon_barrel', 'cylinder', 'Super Launch Cannon', [0, 65, 0], [2.2, 7, 2.2], '#dc2626', 'metal'),
    createPart('cannon_booster', 'bounce', 'Cannon Blast Pad', [0, 63.2, -5], [3, 0.4, 3], '#facc15', 'neon', true, true, { bounceForce: 46 }),

    // Giant Stair Cascades (Section 1: Y 60 down to Y 42)
    createPart('stair_1', 'block', 'Mega Step 1', [0, 58, 12], [22, 3, 10], '#3b82f6', 'plastic'),
    createPart('stair_2', 'block', 'Mega Step 2', [0, 54, 24], [22, 3, 10], '#60a5fa', 'plastic'),
    createPart('stair_3', 'block', 'Mega Step 3', [0, 50, 36], [22, 3, 10], '#3b82f6', 'plastic'),
    createPart('stair_4', 'block', 'Mega Step 4', [0, 46, 48], [24, 3, 10], '#60a5fa', 'plastic'),
    createPart('stair_landing_1', 'block', 'Landing 1 Platform', [0, 42, 62], [28, 2, 14], '#1e293b', 'plastic'),

    // Bouncy Bumpers on Landing 1
    createPart('bumper_1', 'bounce', 'Bouncy Bumper Left', [-8, 43.6, 62], [4, 1.2, 4], '#f59e0b', 'neon', true, true, { bounceForce: 38 }),
    createPart('bumper_2', 'bounce', 'Bouncy Bumper Right', [8, 43.6, 62], [4, 1.2, 4], '#f59e0b', 'neon', true, true, { bounceForce: 38 }),

    // Giant Bowling Pins on Landing 1
    createPart('pin_1_body', 'cylinder', 'Bowling Pin 1 Body', [0, 45, 60], [1.6, 4, 1.6], '#ffffff', 'plastic'),
    createPart('pin_1_head', 'sphere', 'Bowling Pin 1 Head', [0, 47.5, 60], [2.0, 2.0, 2.0], '#dc2626', 'plastic'),
    createPart('pin_2_body', 'cylinder', 'Bowling Pin 2 Body', [-4, 45, 64], [1.6, 4, 1.6], '#ffffff', 'plastic'),
    createPart('pin_2_head', 'sphere', 'Bowling Pin 2 Head', [-4, 47.5, 64], [2.0, 2.0, 2.0], '#dc2626', 'plastic'),
    createPart('pin_3_body', 'cylinder', 'Bowling Pin 3 Body', [4, 45, 64], [1.6, 4, 1.6], '#ffffff', 'plastic'),
    createPart('pin_3_head', 'sphere', 'Bowling Pin 3 Head', [4, 47.5, 64], [2.0, 2.0, 2.0], '#dc2626', 'plastic'),

    // Giant Stair Cascades (Section 2: Y 40 down to Y 24)
    createPart('stair_5', 'block', 'Mega Step 5', [0, 38, 76], [24, 3, 10], '#ec4899', 'plastic'),
    createPart('stair_6', 'block', 'Mega Step 6', [0, 34, 88], [24, 3, 10], '#f43f5e', 'plastic'),
    createPart('stair_7', 'block', 'Mega Step 7', [0, 30, 100], [26, 3, 10], '#ec4899', 'plastic'),
    createPart('stair_8', 'block', 'Mega Step 8', [0, 26, 112], [26, 3, 10], '#f43f5e', 'plastic'),
    createPart('stair_landing_2', 'block', 'Landing 2 Trampoline Deck', [0, 22, 128], [32, 2, 18], '#0f172a', 'plastic'),
    createPart('mega_trampoline', 'bounce', 'Super Trampoline', [0, 23.4, 128], [12, 0.4, 12], '#eab308', 'neon', true, true, { bounceForce: 48 }),

    // Giant Rubber Ducky on Landing 2
    createPart('duck_body', 'sphere', 'Giant Rubber Ducky Body', [-10, 25, 128], [6, 4.5, 6], '#facc15', 'plastic'),
    createPart('duck_head', 'sphere', 'Giant Rubber Ducky Head', [-10, 28, 126], [3.5, 3.5, 3.5], '#facc15', 'plastic'),
    createPart('duck_beak', 'wedge', 'Rubber Ducky Beak', [-10, 28, 123.5], [1.2, 1.8, 1.2], '#f97316', 'plastic'),

    // Giant Stair Cascades (Section 3: Y 20 down to Y 2)
    createPart('stair_9', 'block', 'Mega Step 9', [0, 18, 144], [28, 3, 10], '#10b981', 'plastic'),
    createPart('stair_10', 'block', 'Mega Step 10', [0, 14, 156], [28, 3, 10], '#059669', 'plastic'),
    createPart('stair_11', 'block', 'Mega Step 11', [0, 10, 168], [30, 3, 10], '#10b981', 'plastic'),
    createPart('stair_12', 'block', 'Mega Step 12', [0, 6, 180], [30, 3, 10], '#059669', 'plastic'),

    // Bottom Celebration Arena & Target Landing Rings
    createPart('bottom_arena', 'block', 'Finish Celebration Arena', [0, 1, 215], [60, 2, 50], '#1e293b', 'plastic'),
    createPart('bullseye_ring_3', 'cylinder', 'Bronze Bullseye Ring', [0, 2.1, 215], [32, 0.2, 32], '#b45309', 'plastic'),
    createPart('bullseye_ring_2', 'cylinder', 'Silver Bullseye Ring', [0, 2.2, 215], [20, 0.2, 20], '#94a3b8', 'plastic'),
    createPart('bullseye_center', 'checkpoint', 'Golden Victory Bullseye', [0, 2.3, 215], [10, 0.2, 10], '#fbbf24', 'neon', true, true, { checkpointIndex: 100 }),

    // Finish Arch & Victory Confetti Pillars
    createPart('finish_pillar_l', 'cylinder', 'Victory Pillar L', [-16, 8, 235], [2, 14, 2], '#38bdf8', 'metal'),
    createPart('finish_pillar_r', 'cylinder', 'Victory Pillar R', [16, 8, 235], [2, 14, 2], '#38bdf8', 'metal'),
    createPart('finish_beam', 'block', 'Finish Banner Beam', [0, 15, 235], [34, 1.5, 2], '#facc15', 'neon'),
  ],
};

// ==========================================
// 9. THE FLOOR IS LAVA: VOLCANO ESCAPE
// ==========================================
export const floorLavaWorld: BrickWorldData = {
  id: 'game_floor_is_lava',
  name: 'The Floor is Lava: Volcano Escape',
  description: 'Hot molten magma is rapidly rising! Parkour across floating sofas, vintage TV sets, bouncing air vents, and suspended rock spires before the volcanic cavern fills with lava!',
  author: 'BrickVerse Official',
  version: 1,
  created: 1700000000000,
  updated: 1700000000000,
  gameMode: 'floor_lava',
  environment: {
    skyColor: '#450a0a',
    fogDensity: 0.008,
    ambientColor: '#fca5a5',
    sunPosition: [20, 50, 10],
    sunIntensity: 1.5,
  },
  spawnPoint: [0, 2.2, 0],
  parts: [
    // Volcano Cavern Base Floor (Will be submerged in lava)
    createPart('lava_base_rock', 'block', 'Volcano Cavern Base', [0, 0.5, 0], [60, 1, 60], '#1c1917', 'plastic'),

    // Cavern Wall Pillars (Natural perimeter)
    createPart('cav_p1', 'cylinder', 'Obsidian Pillar 1', [-28, 25, -28], [5, 50, 5], '#0c0a09', 'plastic'),
    createPart('cav_p2', 'cylinder', 'Obsidian Pillar 2', [28, 25, -28], [5, 50, 5], '#0c0a09', 'plastic'),
    createPart('cav_p3', 'cylinder', 'Obsidian Pillar 3', [-28, 25, 28], [5, 50, 5], '#0c0a09', 'plastic'),
    createPart('cav_p4', 'cylinder', 'Obsidian Pillar 4', [28, 25, 28], [5, 50, 5], '#0c0a09', 'plastic'),

    // Level 1: Floating Furniture Obstacles (Y = 4 to 8)
    // Giant Living Room Sofa
    createPart('sofa_seat', 'block', 'Giant Velvet Sofa Seat', [0, 4.5, 12], [10, 1.2, 5], '#dc2626', 'wood'),
    createPart('sofa_back', 'block', 'Sofa Backrest', [0, 6.2, 14], [10, 2.5, 1.2], '#b91c1c', 'wood'),
    createPart('sofa_arm_l', 'block', 'Sofa Armrest Left', [-5.2, 5.5, 12], [1.2, 2.0, 5], '#b91c1c', 'wood'),
    createPart('sofa_arm_r', 'block', 'Sofa Armrest Right', [5.2, 5.5, 12], [1.2, 2.0, 5], '#b91c1c', 'wood'),

    // Vintage Giant Television (Y = 8.5)
    createPart('tv_body', 'block', 'Giant Wooden TV Box', [14, 8.5, 8], [8, 5, 5], '#78350f', 'wood'),
    createPart('tv_screen', 'block', 'TV Screen Glass', [14, 8.5, 5.4], [6.5, 3.8, 0.4], '#38bdf8', 'glass'),
    createPart('tv_antenna_1', 'cylinder', 'TV Antenna Left', [12, 12, 8], [0.2, 3, 0.2], '#e2e8f0', 'metal'),
    createPart('tv_antenna_2', 'cylinder', 'TV Antenna Right', [16, 12, 8], [0.2, 3, 0.2], '#e2e8f0', 'metal'),

    // Bouncy Air Vent (Y = 11.5)
    createPart('vent_duct', 'block', 'Industrial Duct Base', [-12, 11, 10], [5, 2, 5], '#64748b', 'metal'),
    createPart('vent_grill', 'bounce', 'Super Bouncy Air Vent', [-12, 12.2, 10], [4.5, 0.4, 4.5], '#06b6d4', 'neon', true, true, { bounceForce: 32 }),

    // Level 2: Suspended Obsidian Spires (Y = 15 to 22)
    createPart('spire_plat_1', 'block', 'Basalt Ledge 1', [-8, 16, -6], [7, 1.2, 7], '#292524', 'plastic'),
    createPart('spire_plat_2', 'block', 'Basalt Ledge 2', [8, 20, -10], [7, 1.2, 7], '#292524', 'plastic'),
    createPart('spire_vent', 'bounce', 'Thermal Geyser Vent', [8, 20.8, -10], [3.5, 0.3, 3.5], '#f97316', 'neon', true, true, { bounceForce: 30 }),

    // Suspended Bookshelves & Fridges (Y = 24 to 30)
    createPart('fridge_body', 'block', 'Suspended Fridge', [-10, 26, -18], [6, 9, 5], '#f8fafc', 'metal'),
    createPart('fridge_door', 'block', 'Fridge Freezer Door', [-10, 28.5, -15.4], [5.5, 3.5, 0.4], '#e2e8f0', 'metal'),

    createPart('shelf_board_1', 'block', 'Floating Bookshelf 1', [4, 28, -20], [12, 0.8, 4], '#92400e', 'wood'),
    createPart('shelf_board_2', 'block', 'Floating Bookshelf 2', [12, 33, -12], [8, 0.8, 5], '#92400e', 'wood'),

    // Level 3: Cavern Chandelier & Stepping Stones (Y = 35 to 39)
    createPart('stone_1', 'cylinder', 'Floating Crystal Hexagon', [0, 36, -4], [6, 1.5, 6], '#a855f7', 'neon'),
    createPart('stone_vent', 'bounce', 'Crystal Jump Pad', [0, 37, -4], [4, 0.3, 4], '#ec4899', 'neon', true, true, { bounceForce: 32 }),

    // Level 4: Escape Helicopter Summit Platform (Y = 42)
    createPart('summit_deck', 'block', 'Evacuation Helipad', [0, 42, 10], [16, 2, 16], '#eab308', 'metal'),
    createPart('helipad_ring', 'cylinder', 'Helipad H Ring', [0, 43.1, 10], [12, 0.2, 12], '#ffffff', 'plastic'),
    createPart('escape_shuttle', 'block', 'Rescue Pod Cabin', [0, 46, 10], [7, 4, 7], '#0284c7', 'metal'),
    createPart('escape_beacon', 'checkpoint', 'Rescue Extraction Beacon', [0, 43.3, 10], [5, 0.3, 5], '#22c55e', 'neon', true, true, { checkpointIndex: 99 }),
  ],
};

// ==========================================
// 10. STARTER CREATIVE TEMPLATES
// ==========================================
export const classicBaseplateWorld: BrickWorldData = {
  id: 'template_classic_baseplate',
  name: 'Classic Baseplate Sandbox',
  description: 'The iconic huge green building plane with studs. Perfect blank canvas for building your own creations.',
  author: 'You',
  version: 1,
  created: Date.now(),
  updated: Date.now(),
  gameMode: 'sandbox',
  environment: {
    skyColor: '#38bdf8',
    fogDensity: 0.003,
    ambientColor: '#bfdbfe',
    sunPosition: [40, 60, 20],
    sunIntensity: 1.3,
  },
  spawnPoint: [0, 1.2, 0],
  parts: [
    createPart('baseplate_0', 'block', 'Green Baseplate', [0, 0.5, 0], [100, 1, 100], '#22c55e', 'plastic'),
    createPart('spawn_marker', 'spawn', 'Spawn Marker', [0, 1.05, 0], [4, 0.1, 4], '#0284c7', 'neon'),
  ],
};

// ==========================================
// 11. ZOMBIE DEFENSE: OUTPOST SURVIVAL
// ==========================================
export const zombieDefenseWorld: BrickWorldData = {
  id: 'game_zombie_defense',
  name: 'Zombie Defense: Night Outpost',
  description: 'Defend the fortified desert outpost from relentless waves of mutant block zombies! Repair barricades and use heavy weapons.',
  author: 'BrickVerse Official',
  version: 1,
  created: 1700000000000,
  updated: 1700000000000,
  gameMode: 'zombie_defense',
  environment: {
    skyColor: '#090d16',
    fogDensity: 0.015,
    ambientColor: '#1e293b',
    sunPosition: [-20, 40, -30],
    sunIntensity: 0.6,
  },
  spawnPoint: [0, 1.2, 0],
  parts: [
    // Main base ground
    createPart('zd_ground', 'block', 'Outpost Sand Floor', [0, 0.5, 0], [90, 1, 90], '#78350f', 'plastic'),
    createPart('zd_courtyard', 'block', 'Concrete Fort Courtyard', [0, 0.55, 0], [36, 1.05, 36], '#475569', 'metal'),
    createPart('zd_spawn', 'spawn', 'Fort Center Spawn', [0, 1.1, 0], [4, 0.1, 4], '#22c55e', 'neon'),

    // Defense Barricades & Walls
    createPart('zd_wall_n', 'block', 'North Sandbag Wall', [0, 2.0, 18], [28, 2.0, 2], '#ca8a04', 'wood'),
    createPart('zd_wall_s', 'block', 'South Sandbag Wall', [0, 2.0, -18], [28, 2.0, 2], '#ca8a04', 'wood'),
    createPart('zd_wall_e', 'block', 'East Sandbag Wall', [18, 2.0, 0], [2, 2.0, 28], '#ca8a04', 'wood'),
    createPart('zd_wall_w', 'block', 'West Sandbag Wall', [-18, 2.0, 0], [2, 2.0, 28], '#ca8a04', 'wood'),

    // Watchtowers
    createPart('zd_tw1', 'block', 'NW Watchtower Base', [-16, 4.5, 16], [5, 7.0, 5], '#334155', 'metal'),
    createPart('zd_tw1_plat', 'block', 'NW Sniper Platform', [-16, 8.2, 16], [8, 0.6, 8], '#1e293b', 'metal'),
    createPart('zd_tw2', 'block', 'SE Watchtower Base', [16, 4.5, -16], [5, 7.0, 5], '#334155', 'metal'),
    createPart('zd_tw2_plat', 'block', 'SE Sniper Platform', [16, 8.2, -16], [8, 0.6, 8], '#1e293b', 'metal'),

    // Defense Turret & Ammo Crates
    createPart('zd_ammo1', 'block', 'Heavy Ammo Crate', [4, 1.6, 6], [2.2, 1.8, 2.2], '#15803d', 'metal'),
    createPart('zd_ammo2', 'block', 'Rocket Depot Crate', [-4, 1.6, -6], [2.2, 1.8, 2.2], '#b45309', 'metal'),
    createPart('zd_repair_bench', 'block', 'Barricade Repair Table', [-6, 1.5, 6], [3.5, 1.4, 2], '#475569', 'wood'),

    // Night Searchlight
    createPart('zd_light1', 'light', 'Night Searchlight NW', [-16, 9.0, 16], [1, 1, 1], '#fef08a', 'neon', true, false, {
      lightColor: '#fef08a',
      lightIntensity: 2.2,
      lightDistance: 45,
    }),
  ],
};

// ==========================================
// 12. PAINTBALL CTF (CAPTURE THE FLAG)
// ==========================================
export const paintballCtfWorld: BrickWorldData = {
  id: 'game_paintball_ctf',
  name: 'Paintball CTF: Stadium Clash',
  description: 'Infiltrate the enemy base, grab their team flag, and bring it back to your base while dodging colorful paintball fire!',
  author: 'BrickVerse Official',
  version: 1,
  created: 1700000000000,
  updated: 1700000000000,
  gameMode: 'paintball_ctf',
  environment: {
    skyColor: '#38bdf8',
    fogDensity: 0.004,
    ambientColor: '#bae6fd',
    sunPosition: [30, 60, 40],
    sunIntensity: 1.3,
  },
  spawnPoint: [-28, 1.2, 0],
  parts: [
    // Stadium arena floor
    createPart('ctf_floor', 'block', 'Stadium Turf', [0, 0.5, 0], [90, 1, 60], '#15803d', 'plastic'),

    // Red Base (West)
    createPart('ctf_red_base', 'block', 'Red Fortress Base', [-30, 1.5, 0], [16, 2, 24], '#b91c1c', 'plastic'),
    createPart('ctf_red_flag_ped', 'block', 'Red Flag Pedestal', [-32, 2.7, 0], [3, 0.8, 3], '#dc2626', 'metal'),
    createPart('ctf_red_flag', 'cylinder', 'Red Team Flag', [-32, 4.5, 0], [0.3, 3, 0.3], '#ef4444', 'neon', true, true, {
      isClue: true, // Marker for red flag
    }),
    createPart('ctf_red_spawn', 'spawn', 'Red Spawn', [-26, 2.6, 0], [4, 0.1, 4], '#ef4444', 'neon'),

    // Blue Base (East)
    createPart('ctf_blue_base', 'block', 'Blue Fortress Base', [30, 1.5, 0], [16, 2, 24], '#1d4ed8', 'plastic'),
    createPart('ctf_blue_flag_ped', 'block', 'Blue Flag Pedestal', [32, 2.7, 0], [3, 0.8, 3], '#2563eb', 'metal'),
    createPart('ctf_blue_flag', 'cylinder', 'Blue Team Flag', [32, 4.5, 0], [0.3, 3, 0.3], '#3b82f6', 'neon', true, true, {
      isClue: true, // Marker for blue flag
    }),
    createPart('ctf_blue_spawn', 'block', 'Blue Spawn Marker', [26, 2.6, 0], [4, 0.1, 4], '#3b82f6', 'neon'),

    // Midfield Bunkers & Catwalks
    createPart('ctf_bunker_mid', 'block', 'Midfield Bunker Cover', [0, 2.5, 0], [10, 3.5, 12], '#475569', 'metal'),
    createPart('ctf_cover_n1', 'block', 'North Inflatable Barrier', [-10, 2.0, 15], [3, 2.5, 8], '#eab308', 'plastic'),
    createPart('ctf_cover_n2', 'block', 'North Inflatable Barrier Blue', [10, 2.0, 15], [3, 2.5, 8], '#06b6d4', 'plastic'),
    createPart('ctf_cover_s1', 'block', 'South Inflatable Barrier', [-10, 2.0, -15], [3, 2.5, 8], '#ec4899', 'plastic'),
    createPart('ctf_cover_s2', 'block', 'South Inflatable Barrier Blue', [10, 2.0, -15], [3, 2.5, 8], '#a855f7', 'plastic'),

    // Speed pads
    createPart('ctf_spd_r', 'block', 'Red Rush Pad', [-18, 1.05, 0], [3, 0.1, 6], '#f97316', 'neon', true, true, {
      conveyorSpeed: [25, 0],
    }),
    createPart('ctf_spd_b', 'block', 'Blue Rush Pad', [18, 1.05, 0], [3, 0.1, 6], '#06b6d4', 'neon', true, true, {
      conveyorSpeed: [-25, 0],
    }),
  ],
};

// ==========================================
// 13. ROLLERCOASTER THEME PARK
// ==========================================
export const rollercoasterWorld: BrickWorldData = {
  id: 'game_rollercoaster',
  name: 'Rollercoaster Theme Park: Loop Paradise',
  description: 'Ride the colossal high-speed coaster across sky loops, explore carnival food stalls, and launch into the air!',
  author: 'BrickVerse Official',
  version: 1,
  created: 1700000000000,
  updated: 1700000000000,
  gameMode: 'rollercoaster',
  environment: {
    skyColor: '#60a5fa',
    fogDensity: 0.003,
    ambientColor: '#fef08a',
    sunPosition: [50, 70, 20],
    sunIntensity: 1.4,
  },
  spawnPoint: [0, 1.2, 0],
  parts: [
    // Theme park plaza
    createPart('rc_plaza', 'block', 'Park Plaza Stone', [0, 0.5, 0], [90, 1, 90], '#e2e8f0', 'plastic'),
    createPart('rc_spawn', 'spawn', 'Plaza Spawn Hub', [0, 1.1, 0], [6, 0.1, 6], '#ec4899', 'neon'),

    // Coaster Boarding Station
    createPart('rc_station_floor', 'block', 'Coaster Station Platform', [0, 3.5, 20], [18, 1, 14], '#0284c7', 'metal'),
    createPart('rc_station_roof', 'block', 'Station Canopy', [0, 8.5, 20], [20, 0.6, 16], '#ef4444', 'plastic'),
    createPart('rc_cart_seat', 'block', 'Ride Cart Boarding Trigger', [0, 4.3, 20], [5, 1.2, 8], '#eab308', 'metal', true, true, {
      isCoinPickup: true,
    }),

    // High Elevation Sky Coaster Loop Rails
    createPart('rc_rail_lift', 'wedge', 'Coaster Lift Hill 1', [0, 12, 45], [4, 16, 25], '#dc2626', 'metal'),
    createPart('rc_rail_crest', 'block', 'Sky Summit 1', [0, 20.5, 60], [6, 1, 10], '#dc2626', 'metal'),
    createPart('rc_rail_drop', 'wedge', 'Mega Drop 1', [0, 10, 75], [4, 20, 25], '#dc2626', 'metal'),
    createPart('rc_rail_loop_l', 'block', 'Loop Left Wing', [-12, 16, 90], [4, 18, 6], '#0284c7', 'metal'),
    createPart('rc_rail_loop_r', 'block', 'Loop Right Wing', [12, 16, 90], [4, 18, 6], '#0284c7', 'metal'),
    createPart('rc_rail_loop_top', 'block', 'Inverted Loop Peak', [0, 26, 90], [24, 2, 6], '#facc15', 'neon'),

    // Carnival Stalls & Tents
    createPart('rc_stall1', 'block', 'Cotton Candy Stand', [-16, 2.0, -12], [6, 3, 5], '#f472b6', 'wood'),
    createPart('rc_stall2', 'block', 'Popcorn & Soda Booth', [16, 2.0, -12], [6, 3, 5], '#fbbf24', 'wood'),
    createPart('rc_tent_circus', 'cylinder', 'Circus Tent Rotunda', [0, 5.0, -32], [14, 8, 14], '#9333ea', 'plastic'),

    // High Sky Spring Trampoline
    createPart('rc_bounce_sky', 'bounce', 'Super Carnival Bouncer', [22, 1.2, 15], [5, 0.6, 5], '#10b981', 'neon', true, true, {
      bounceForce: 52,
    }),
  ],
};

// ==========================================
// 14. PROP HUNT MYSTERY: WAREHOUSE DISGUISE
// ==========================================
export const propHuntWorld: BrickWorldData = {
  id: 'game_prop_hunt',
  name: 'Prop Hunt: Warehouse Mystery',
  description: 'Disguise yourself as a crate, barrel, or bench and blend into the warehouse while seeker bots search every corner!',
  author: 'BrickVerse Official',
  version: 1,
  created: 1700000000000,
  updated: 1700000000000,
  gameMode: 'prop_hunt',
  environment: {
    skyColor: '#1e293b',
    fogDensity: 0.008,
    ambientColor: '#cbd5e1',
    sunPosition: [10, 45, 10],
    sunIntensity: 0.9,
  },
  spawnPoint: [0, 1.2, 0],
  parts: [
    // Warehouse interior floor
    createPart('ph_floor', 'block', 'Polished Concrete Floor', [0, 0.5, 0], [70, 1, 70], '#334155', 'metal'),
    createPart('ph_spawn', 'spawn', 'Warehouse Center Spawn', [0, 1.1, 0], [4, 0.1, 4], '#38bdf8', 'neon'),

    // Warehouse Outer Walls
    createPart('ph_wall_n', 'block', 'North Corrugated Wall', [0, 6.0, 35], [70, 10.0, 2], '#475569', 'metal'),
    createPart('ph_wall_s', 'block', 'South Corrugated Wall', [0, 6.0, -35], [70, 10.0, 2], '#475569', 'metal'),
    createPart('ph_wall_e', 'block', 'East Corrugated Wall', [35, 6.0, 0], [2, 10.0, 70], '#475569', 'metal'),
    createPart('ph_wall_w', 'block', 'West Corrugated Wall', [-35, 6.0, 0], [2, 10.0, 70], '#475569', 'metal'),

    // Disguise Stations (Transform player prop!)
    createPart('ph_disg_crate', 'block', 'Disguise Station: Wooden Crate', [-6, 1.2, -6], [2.5, 1.5, 2.5], '#b45309', 'wood', true, true, {
      isClue: true,
    }),
    createPart('ph_disg_barrel', 'cylinder', 'Disguise Station: Bio Barrel', [6, 1.2, -6], [2.2, 2.5, 2.2], '#16a34a', 'neon', true, true, {
      isClue: true,
    }),
    createPart('ph_disg_bench', 'block', 'Disguise Station: Metal Locker', [0, 2.0, -12], [2.0, 3.8, 1.8], '#0284c7', 'metal', true, true, {
      isClue: true,
    }),

    // Clutter: Real Props for camouflage
    createPart('ph_p_crate1', 'block', 'Cargo Crate Stack 1', [-18, 2.0, 15], [3, 3, 3], '#92400e', 'wood'),
    createPart('ph_p_crate2', 'block', 'Cargo Crate Stack 2', [-18, 5.0, 15], [2.5, 2.5, 2.5], '#b45309', 'wood'),
    createPart('ph_p_barrel1', 'cylinder', 'Oil Barrel Blue', [18, 1.8, 15], [2, 2.6, 2], '#1e40af', 'metal'),
    createPart('ph_p_barrel2', 'cylinder', 'Oil Barrel Red', [21, 1.8, 15], [2, 2.6, 2], '#991b1b', 'metal'),
    createPart('ph_p_rack', 'block', 'Industrial Storage Rack', [0, 4.0, 22], [22, 7.0, 3], '#64748b', 'metal'),
  ],
};

// ==========================================
// 15. KART RACING SPEEDWAY
// ==========================================
export const kartSpeedwayWorld: BrickWorldData = {
  id: 'game_kart_speedway',
  name: 'Kart Racing: Neon Grand Prix',
  description: 'Burn rubber across a high-speed circuit with curved asphalt, drift boost pads, and lap time challenges!',
  author: 'BrickVerse Official',
  version: 1,
  created: 1700000000000,
  updated: 1700000000000,
  gameMode: 'kart_speedway',
  environment: {
    skyColor: '#0f172a',
    fogDensity: 0.003,
    ambientColor: '#38bdf8',
    sunPosition: [20, 60, 20],
    sunIntensity: 1.2,
  },
  spawnPoint: [0, 1.2, 0],
  parts: [
    // Speedway base infield
    createPart('ks_infield', 'block', 'Infield Grass', [0, 0.45, 0], [110, 0.9, 110], '#15803d', 'plastic'),

    // Starting Line / Checkpoint
    createPart('ks_start_pad', 'checkpoint', 'Start & Finish Lap Gate', [0, 1.05, 0], [12, 0.1, 4], '#facc15', 'neon', true, true, {
      checkpointIndex: 1,
    }),
    createPart('ks_arch_l', 'block', 'Finish Arch Left', [-6.5, 3.5, 0], [1, 5.0, 1], '#0284c7', 'metal'),
    createPart('ks_arch_r', 'block', 'Finish Arch Right', [6.5, 3.5, 0], [1, 5.0, 1], '#0284c7', 'metal'),
    createPart('ks_arch_top', 'block', 'Finish Arch Banner', [0, 6.0, 0], [14, 1.2, 1], '#ef4444', 'neon'),

    // Straightaway North Track
    createPart('ks_str_n', 'block', 'North Straight Track', [0, 1.0, 22], [12, 0.8, 40], '#1e293b', 'metal'),
    createPart('ks_bst_n', 'block', 'Hyper Boost Chevron N', [0, 1.05, 25], [6, 0.1, 8], '#06b6d4', 'neon', true, true, {
      conveyorSpeed: [0, 48],
    }),

    // Turn 1 East
    createPart('ks_turn_1', 'block', 'Turn 1 Apex', [22, 1.0, 42], [35, 0.8, 12], '#1e293b', 'metal'),
    createPart('ks_chk_2', 'checkpoint', 'Midway Checkpoint Turn 1', [25, 1.05, 42], [4, 0.1, 12], '#10b981', 'neon', true, true, {
      checkpointIndex: 2,
    }),

    // Backstretch South
    createPart('ks_str_s', 'block', 'Backstretch Track', [40, 1.0, 0], [12, 0.8, 72], '#1e293b', 'metal'),
    createPart('ks_bst_s', 'block', 'Hyper Boost Chevron S', [40, 1.05, 0], [6, 0.1, 8], '#f59e0b', 'neon', true, true, {
      conveyorSpeed: [0, -48],
    }),

    // Turn 2 Loop Return
    createPart('ks_turn_2', 'block', 'Hairpin Turn 2', [20, 1.0, -40], [45, 0.8, 12], '#1e293b', 'metal'),
    createPart('ks_turn_3', 'block', 'Final Chicane Return', [-15, 1.0, -20], [14, 0.8, 45], '#1e293b', 'metal'),

    // Grandstands with cheering blocks
    createPart('ks_stands', 'block', 'Spectator Grandstands', [-18, 3.5, 10], [8, 5.0, 30], '#334155', 'metal'),
  ],
};

// ==========================================
// 16. LASER TAG ARENA: NEON CYBER MATRIX
// ==========================================
export const laserTagWorld: BrickWorldData = {
  id: 'game_laser_tag',
  name: 'Laser Tag: Cyber Matrix',
  description: 'Fast-paced neon laser battles in a glow-in-the-dark double-decker maze with shield recharge pads and mirror reflections!',
  author: 'BrickVerse Official',
  version: 1,
  created: 1700000000000,
  updated: 1700000000000,
  gameMode: 'laser_tag',
  environment: {
    skyColor: '#020617',
    fogDensity: 0.012,
    ambientColor: '#38bdf8',
    sunPosition: [0, 40, 0],
    sunIntensity: 0.5,
  },
  spawnPoint: [0, 1.2, 0],
  parts: [
    // Arena dark floor with grid
    createPart('lt_floor', 'block', 'Grid Floor Matrix', [0, 0.5, 0], [80, 1, 80], '#020617', 'metal'),
    createPart('lt_spawn', 'spawn', 'Center Arena Spawn', [0, 1.1, 0], [4, 0.1, 4], '#06b6d4', 'neon'),

    // Glowing Neon Maze Partitions
    createPart('lt_w_cyan1', 'block', 'Cyan Barrier 1', [-12, 3.0, 12], [2, 4.5, 18], '#06b6d4', 'neon'),
    createPart('lt_w_pink1', 'block', 'Magenta Barrier 1', [12, 3.0, -12], [2, 4.5, 18], '#ec4899', 'neon'),
    createPart('lt_w_yellow1', 'block', 'Yellow Cross Wall', [0, 3.0, 22], [24, 4.5, 2], '#facc15', 'neon'),
    createPart('lt_w_green1', 'block', 'Green Cross Wall', [0, 3.0, -22], [24, 4.5, 2], '#10b981', 'neon'),

    // Upper Mezzanine Sniper Deck
    createPart('lt_deck_c', 'block', 'Upper Sniper Deck', [0, 6.0, 0], [16, 0.8, 16], '#1e293b', 'metal'),
    createPart('lt_deck_ramp_n', 'wedge', 'North Catwalk Ramp', [0, 3.2, 14], [5, 5.0, 12], '#0f172a', 'metal'),
    createPart('lt_deck_ramp_s', 'wedge', 'South Catwalk Ramp', [0, 3.2, -14], [5, 5.0, 12], '#0f172a', 'metal'),

    // Shield Recharge Pods
    createPart('lt_shield_w', 'bounce', 'Shield Recharge Pod West', [-22, 1.15, 0], [4, 0.3, 4], '#3b82f6', 'neon', true, true, {
      bounceForce: 28,
    }),
    createPart('lt_shield_e', 'bounce', 'Shield Recharge Pod East', [22, 1.15, 0], [4, 0.3, 4], '#a855f7', 'neon', true, true, {
      bounceForce: 28,
    }),
  ],
};

export const ALL_BUILTIN_WORLDS: BrickWorldData[] = [
  obbyWorld,
  disasterWorld,
  pizzaTycoonWorld,
  swordArenaWorld,
  speedRunWorld,
  murderMansionWorld,
  hideSeekWorld,
  ragdollWorld,
  floorLavaWorld,
  classicBaseplateWorld,
  // 6 Mega Expansion Worlds
  zombieDefenseWorld,
  paintballCtfWorld,
  rollercoasterWorld,
  propHuntWorld,
  kartSpeedwayWorld,
  laserTagWorld,
  // 26 New Mega Expansion Worlds (42 Total)
  ...MEGA_EXPANSION_WORLDS,
];


