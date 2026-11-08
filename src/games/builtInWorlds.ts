/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrickWorldData, BrickPart } from '../types/game';

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
    createPart('s3_bounce', 'bounce', 'Super Trampoline', [0, 5.8, 81], [5, 0.3, 5], '#eab308', 'neon', true, true, { bounceForce: 36 }),

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
    createPart('sr_bounce1', 'bounce', 'Space Launcher', [0, 5.2, 80], [6, 0.3, 6], '#ec4899', 'neon', true, true, { bounceForce: 38 }),

    // Elevated floating rings in mid-air
    createPart('sr_air1', 'block', 'Air Platform 1', [0, 38, 120], [8, 1, 10], '#06b6d4', 'neon'),
    createPart('sr_air2', 'block', 'Air Platform 2', [12, 40, 145], [8, 1, 10], '#a855f7', 'neon'),
    createPart('sr_air3', 'block', 'Air Platform 3', [-8, 42, 170], [8, 1, 10], '#ec4899', 'neon'),

    // Neon speed bridge
    createPart('sr_track2', 'block', 'Galaxy Bridge', [0, 42, 215], [8, 1, 70], '#1e1b4b', 'plastic'),
    createPart('sr_pad3', 'block', 'Hyper Booster', [0, 42.6, 200], [6, 0.1, 12], '#06b6d4', 'neon'),

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
// 8. STARTER CREATIVE TEMPLATES
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

export const ALL_BUILTIN_WORLDS: BrickWorldData[] = [
  obbyWorld,
  disasterWorld,
  pizzaTycoonWorld,
  swordArenaWorld,
  speedRunWorld,
  murderMansionWorld,
  hideSeekWorld,
  classicBaseplateWorld,
];
