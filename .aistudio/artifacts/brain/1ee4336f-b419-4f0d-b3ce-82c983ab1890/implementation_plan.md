# BrickVerse Mega Expansion: 6 New Games, 6 Interactive Gears & Daily Missions

A massive gameplay content and systems expansion for BrickVerse, introducing 6 brand new fully playable 3D games, 6 interactive physics toys and weapons, and an integrated Daily Missions & Quests progression system with real-time tracking and coin rewards.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following decisions have been confirmed through user feedback and will govern the expansion:

- **6 New Games & Experiences Added**:
  1. *Zombie Defense Outpost*: Wave survival with barricades, aggressive AI zombie hordes, defense turrets, and night-sky atmosphere.
  2. *Paintball CTF (Capture the Flag)*: Two team bases (Red & Blue), flag capture logic, scoreboards, and paintball splat battles.
  3. *Rollercoaster Theme Park*: Functional loop-de-loop track with automatic coaster cart riding, carnival stalls, and skyway fireworks.
  4. *Prop Hunt Mystery*: Attic & warehouse hide-and-seek where players transform into props (crate, barrel, chair, rubber duck) while seeker bots hunt them down.
  5. *Kart Racing Speedway*: High-speed banked asphalt racetrack with drift boost pads, lap timers, checkpoint gates, and neon grandstands.
  6. *Laser Tag Arena*: High-tech glow-in-the-dark neon labyrinth with bouncing laser beams, shield rechargers, and fast-paced tagged combat.
- **6 New Interactive Gears & Toys in Inventory**:
  1. *Rocket Launcher*: Fires physical explosive rockets that detonate on impact with fire/smoke particles and area-of-effect knockback.
  2. *Grappling Hook*: Shoots a cable latching onto walls and ceiling beams, pulling the player smoothly upward through the air.
  3. *Jetpack*: Hold Space / Jump button to engage thruster flames, hovering and flying vertically with fuel gauge mechanics.
  4. *Laser Katana*: High-speed cybernetic melee blade with glowing neon trails, double-slash combo, and energetic hum SFX.
  5. *Super Pogo Stick*: Continuous spring bounce mechanic, gaining progressive bounce height on timed impacts.
  6. *Ghost Cloak*: Makes the avatar translucent / invisible to enemy bot aggro for 10 seconds with stealth particle wisps.
- **New Gameplay System: Daily Missions & Quest Hub**:
  - Daily rotating quests (e.g. "Eliminate 8 Zombies", "Complete a Lap under 35s in Speedway", "Ride the Mega Rollercoaster", "Deliver 3 Pizzas", "Score 250 Coins").
  - Persistent daily streak tracker, progress bars, one-click "Claim Reward" celebration confetti, and bonus coin payouts.
- **Platform Integrity**:
  - 100% preservation of all existing 10 games, full PC keyboard & mouse precision (WASD, mouse orbit, scroll zoom), and responsive mobile controls.

---

## 1. Overview & Core Concept

This expansion scales BrickVerse from 10 games to **16 distinct 3D games**, expands the gear loadout from 7 items to **13 interactive tools**, and introduces an overarching **Daily Missions** system that unifies gameplay across all modes.

### Key Value
- **Unmatched Variety**: Players can shift from intense PvE zombie survival to high-speed kart laps, rollercoasters, stealth prop hunt, and laser tag duels.
- **Interactive Toy Sandbox**: Every new tool features distinct physical reactions (explosions, grapples, hovering thrusters, bouncy pogo hops, and stealth mechanics).
- **Retention & Motivation**: Daily Missions give players clear goals and immediate coin rewards every time they launch BrickVerse.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Daily Missions Drawer / Modal**:
   - Accessible via a prominent "Daily Quests" button on the Discover Hub and a compact quest badge in the in-game HUD.
   - Shows 4 active daily quests with live progress bars (e.g. `Zombie Defense: 5/10 defeated [50%]`).
   - Claiming a completed quest triggers a coin ring sound, gold confetti, and increments the player's currency balance and streak counter.

2. **Selecting New Games in the Discover Catalog**:
   - The Discover screen features intuitive category filters (`All (16)`, `Action & Combat`, `Obby & Speed`, `Survival & Mystery`, `Tycoon & Chill`).
   - Vibrant 3D thematic preview cards for each of the 6 new games with player counts, difficulty ratings, and high-score badges.

3. **Playing with New Interactive Gears**:
   - On PC, players press `1` through `9` and `0` to instantly equip gears, or click the bottom hotbar.
   - On mobile, the gear drawer expands smoothly to select between standard gear, mobility tools, and heavy weapons.
   - Equipping the *Rocket Launcher* equips an over-the-shoulder bazooka; clicking launches a rocket with smoke particles that bursts on hit.
   - Equipping the *Grappling Hook* projects a visible line to geometry and reels the player in.
   - Equipping the *Jetpack* displays dual back thrusters with flame particles and an energy meter in the HUD.

### Visual Architecture & Layout Mockup

```
┌────────────────────────────────────────────────────────────────────────┐
│  BRICKVERSE   [ Discover ]   [ Quests (3/4) ]   [ Avatar ]   [ Studio ]│
├────────────────────────────────────────────────────────────────────────┤
│  DAILY MISSIONS & STREAK ────── Day 3 Streak! 🔥  [ Claim +150 Coins ] │
│  ┌─────────────────────────┬─────────────────────────┬───────────────┐ │
│  │ 🧟 Survive Wave 3 (3/3) │ 🏎️ Kart Lap < 40s (1/1)  │ 🚀 Rocket Hit │ │
│  │ [ CLAIM 100 COINS ]     │ [ CLAIM 75 COINS ]      │ [ 2/5 - 40% ] │ │
│  └─────────────────────────┴─────────────────────────┴───────────────┘ │
│                                                                        │
│  WORLD SELECTOR: 16 EXPERIENCES                                        │
│  [ All (16) ] [ Action ] [ Parkour ] [ Survival ] [ Creative & Fun ]   │
│                                                                        │
│  ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐   │
│  │  ZOMBIE DEFENSE   │  │   PAINTBALL CTF   │  │   ROLLERCOASTER   │   │
│  │ Night Wave Outpost│  │ Flag Capture Arena│  │  Loop-de-Loop Park│   │
│  │   [ PLAY NOW ]    │  │   [ PLAY NOW ]    │  │   [ RIDE NOW ]    │   │
│  └───────────────────┘  └───────────────────┘  └───────────────────┘   │
│  ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐   │
│  │ PROP HUNT MYSTERY │  │   KART SPEEDWAY   │  │  LASER TAG ARENA  │   │
│  │ Sneaky Disguises  │  │ Drifting & Laps   │  │ Neon Cyber Maze   │   │
│  │   [ PLAY NOW ]    │  │   [ RACE NOW ]    │  │   [ ENTER NOW ]   │   │
│  └───────────────────┘  └───────────────────┘  └───────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Key Product Decisions & Trade-Offs

1. **Procedural Geometry vs External Meshes for Karts & Coasters**:
   - *Decision*: Build rollercoasters and kart models purely with procedural Three.js primitives (curves, extruded tracks, blocky chassis).
   - *Why*: Zero external downloads, instantaneous 60fps load times, and guarantees 100% offline functionality.
2. **Deterministic Daily Missions Generator**:
   - *Decision*: Daily quests seeded by the current calendar date (`YYYY-MM-DD`).
   - *Why*: Ensures consistent quests throughout the day without requiring a cloud backend, while resetting fresh every midnight.
3. **Unified Bot AI System**:
   - *Decision*: Generalize the existing bot agent loop to support Zombie AI (melee swarm), CTF bot defenders/runners, and Prop Hunt seekers.
   - *Why*: Keeps CPU usage low, reuses pathing and collision checks, and makes bots responsive to knockbacks and rocket explosions.

---

## 4. Technical Architecture & Data Strategy

### System Component Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                             REACT UI LAYER                             │
│  ┌───────────────┐ ┌────────────────┐ ┌───────────────┐ ┌───────────┐  │
│  │ MainMenu Hub  │ │ DailyMissions  │ │ AvatarEditor  │ │ GameHUD   │  │
│  │ (16 Worlds)   │ │ (Quests/Streak)│ │ (Accessories) │ │ (Hotbar)  │  │
│  └───────┬───────┘ └───────┬────────┘ └───────┬───────┘ └─────┬─────┘  │
└──────────┼─────────────────┼──────────────────┼───────────────┼────────┘
           │                 │                  │               │
┌──────────▼─────────────────▼──────────────────▼───────────────▼────────┐
│                     APP STATE & PROGRESSION STORE                      │
│  - Active World & Game Mode                                            │
│  - Daily Quests State (Saved in LocalStorage: streak, completed, claim) │
│  - Player Stats (Kills, Laps, Waves, Pizzas, Coins, Unlocked Items)    │
│  - Hotbar Inventory: 13 Items (Swords, Guns, Coils, Rocket, Jetpack...)│
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
┌────────────────────────────────────▼───────────────────────────────────┐
│                       THREE.JS BRICK ENGINE CORE                       │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Character Rig & Gear Renderer (Bazooka, Grapple, Wings, Katana)  │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │ Physics Engine (Rockets, Grapple Spring, Jetpack Lift, Coaster)  │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │ Smart Bots (Zombies, CTF Flag Runners, Seeker NPCs)              │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │ Particle System (Explosions, Thruster Flames, Splats, Lasers)    │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │ Web Audio SFX (Rocket Boom, Laser Hum, Engine Rev, Fanfare)      │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### New Data Schemas & Types

```typescript
// Expanded EquippedItemType
export type EquippedItemType =
  | 'none'
  | 'sword'
  | 'speed_coil'
  | 'gravity_coil'
  | 'paintball_gun'
  | 'slap_hand'
  | 'banana_peel'
  | 'rubber_chicken'
  // 6 New Gears
  | 'rocket_launcher'
  | 'grappling_hook'
  | 'jetpack'
  | 'laser_katana'
  | 'super_pogo'
  | 'ghost_cloak';

// Daily Mission Item
export interface DailyMission {
  id: string;
  title: string;
  description: string;
  targetCount: number;
  currentCount: number;
  rewardCoins: number;
  completed: boolean;
  claimed: boolean;
  gameMode?: string;
  actionType: 'kill_zombies' | 'complete_lap' | 'score_points' | 'ride_coaster' | 'collect_coins' | 'use_gear';
}

// Daily Mission Store in localStorage
export interface DailyMissionsState {
  lastDateStr: string;
  streakDays: number;
  missions: DailyMission[];
}
```

---

## 5. Execution Steps

1. **Daily Missions System (`src/utils/dailyMissions.ts`)**:
   - Daily seed generator, progress increment handlers, storage sync, and claim celebration.
2. **Build 6 New Game Environments (`src/games/builtInWorlds.ts`)**:
   - `zombieDefenseWorld`: Dark moonlit fort with wooden barricades, watchtowers, ammo crates, and spawn gates.
   - `paintballCtfWorld`: Symmetrical arena with Red / Blue flag podiums, neon barricades, and sniper towers.
   - `rollercoasterWorld`: Animated rollercoaster cars traversing looped rails, ferris wheel, and carnival tents.
   - `propHuntWorld`: Cluttered warehouse with crates, barrels, shelves, and disguise podiums.
   - `kartSpeedwayWorld`: Winding racing circuit with curved turns, boost chevrons, starting grid, and lap gates.
   - `laserTagWorld`: Dual-level glowing labyrinth with reflective mirrors, neon pillars, and recharge stations.
3. **Character Rig & 6 New Gears (`src/engine/characterBuilder.ts`)**:
   - Add 3D procedural meshes for Rocket Launcher, Grappling Hook, Jetpack, Laser Katana, Super Pogo, and Ghost Cloak.
4. **Gameplay Physics & Weapons Implementation (`src/engine/GameViewport.tsx`)**:
   - Rocket projectile physics + explosive impact radius with particle blast.
   - Grappling hook line renderer + kinematic pull velocity toward target.
   - Jetpack vertical thruster force, flame particles, and fuel UI meter.
   - Laser Katana energetic slash combo + sound synthesis.
   - Super Pogo vertical bounce loop with progressive height gains.
   - Ghost Cloak opacity reduction (0.25 alpha) + bot de-aggro effect.
   - Game-specific logic: Zombie waves, CTF flag capture, Rollercoaster cart riding, Kart lap tracking, Prop transformation.
5. **UI & Daily Missions Integration (`src/components/DailyMissionsModal.tsx` & `MainMenu.tsx`)**:
   - Add Daily Missions drawer with live progress and claim animations.
   - Update Discover Hub category filters and cards for all 16 worlds.
   - Synchronize PC gear hotbar (1-9, 0) and mobile gear drawer to accommodate all 13 items smoothly.
6. **Audio Engine Expansion (`src/engine/soundEngine.ts`)**:
   - Add procedural Web Audio sounds: `playRocketBoom()`, `playLaserBeam()`, `playJetpackHiss()`, `playEngineRev()`, and `playFanfare()`.
7. **Verification**:
   - Execute `compile_applet` and `lint_applet` to confirm zero errors and flawless performance.
