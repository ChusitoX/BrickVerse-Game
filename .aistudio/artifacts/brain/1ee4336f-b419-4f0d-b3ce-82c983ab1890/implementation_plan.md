# BrickVerse: Offline 3D Game Engine & Creative Platform

A high-performance, offline 3D gaming universe and creative engine inspired by classic voxel/block sandbox platforms. Built with Three.js, React, and Tailwind CSS, BrickVerse enables players to customize their blocky avatars, jump into four distinct pre-built interactive minigames, and enter a built-in World Studio to design, test-play, and export/import custom 3D sandbox worlds locally without any external servers or copyright encumbrances.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions have been aligned based on user preferences:

- **Platform Identity & Aesthetic**: **BrickVerse** — A retro-modern blocky toy sandbox aesthetic with tactile stud textures, saturated plastic materials, and vibrant environment lighting.
- **Pre-Built Game Lineup**:
  1. *Obby Jump: Tower of Bricks* (multi-stage obstacle course with moving platforms, disappearing blocks, bounce pads, and kill-bricks)
  2. *Disaster Survival: Blox Island* (dynamic physics disasters including tornadoes, meteor rain, acid storms, and crumbling structures)
  3. *Pizza Chef Tycoon* (order fulfillment, pizza baking mini-stations, NPC deliveries, and BloxCoin store upgrades)
  4. *Sword Arena: Red vs Blue* (gladiator sword slashes, lunge combat, smart bot opponents, gravity/speed coils, and killstreaks)
- **Camera & Controls**: Classic 3D orbital camera with right-click mouse drag, scroll-wheel zoom, WASD / Arrow key movement, Space jump, touch/joystick overlay for accessibility, and Esc pause menu.
- **Save Strategy**: Client-side storage via `localStorage` for world slots and player profile + full JSON Export / Import file downloads for infinite offline world sharing and backup.

---

## 1. Overview & Core Concept

BrickVerse delivers a complete, self-contained offline platform featuring three interconnected hubs:
1. **The Discover Hub & Main Menu**: Browse official pre-built experiences, review local achievements/high scores, and configure audio, graphics, FOV, and controls.
2. **The Avatar Editor**: A 3D studio turntable where players style their 6-part blocky avatar (head, torso, arms, legs) with classic skin-tone palettes, shirts, pants, facial expressions, and 3D accessories (hats, fedoras, headphones, swords, wings).
3. **The World Studio (Game Engine)**: An intuitive in-browser 3D creative suite featuring grid snapping, object manipulation (Move, Resize, Recolor, Delete), physical properties (Anchored, CanCollide), specialized interactive blocks (Kill Bricks, Trampolines, Conveyors, Spawners), instant Play/Edit toggling, and JSON import/export.

---

## 2. User Experience & Visual Design

### Key User Flows
- **Launcher to Game**: Player selects an experience on the Discover page (e.g. *Obby Jump*). The 3D engine mounts in full viewport with a minimal HUD. Player moves, jumps, reaches checkpoints, triggers Web Audio retro sound effects, and can pause or return to Hub at any time.
- **Avatar Customization**: Player navigates to Avatar Editor. The 3D avatar stands on an illuminated pedestal. Selecting skin tones or accessories instantly reflects on the live model and saves across all games and studio sessions.
- **World Creation in Studio**: Player clicks "New World", chooses a template (Classic Baseplate, Island, Floating Arena), places blocks with stud snapping, sets properties (e.g. makes a block a spinning red kill-brick), tests the world with "Test Play", and exports the `.brickverse.json` file.

```
┌────────────────────────────────────────────────────────────────────────┐
│  BRICKVERSE   [ Discover ]   [ Avatar ]   [ Studio ]   [ Settings ]    │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐  │
│   │   OBBY JUMP       │  │ DISASTER SURVIVAL │  │ PIZZA CHEF TYCOON │  │
│   │  Tower of Bricks  │  │    Blox Island    │  │  Order & Upgrade  │  │
│   │  [ Play Now ]     │  │  [ Play Now ]     │  │  [ Play Now ]     │  │
│   └───────────────────┘  └───────────────────┘  └───────────────────┘  │
│                                                                        │
│   ┌───────────────────┐  ┌──────────────────────────────────────────┐  │
│   │    SWORD ARENA    │  │  MY CUSTOM WORLDS (Studio)               │  │
│   │    Red vs Blue    │  │  + Create New World   [ Import JSON ]    │  │
│   │  [ Play Now ]     │  │  - Parkour Fortress   [ Edit ] [ Play ]  │  │
│   └───────────────────┘  └──────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### Visual Identity & Theme
- **Theme Palette**: Deep dark slate canvas (`#0b0f19`) with crisp architectural cards (`#131c2e`), energetic toy primary accents (Stud Blue `#0284c7`, Brick Red `#dc2626`, Classic Yellow `#eab308`, Neon Emerald `#10b981`), and subtle hairline borders (`border-white/10`).
- **Typography**: Bold display headings using clean geometric typography (`Plus Jakarta Sans`), paired with crisp tabular figures (`tabular-nums`) for timers, speed, and coins.
- **3D Procedural Styling**: Authentic cylindrical stud bump patterns generated via procedural canvas textures, warm directional sun with soft PCF shadows, horizon-matched distance fog, and procedural audio synthesis (classic jump bloop, brick clink, coin ring, hazard zap).

---

## 3. Key Product Decisions & Trade-Offs

1. **Procedural Three.js 3D Models vs External Files**:
   - *Chosen Approach*: 100% procedural geometries and textures generated at runtime. No external `.glb` or image assets that could fail or 404.
   - *Why*: Ensures instant loading, zero missing textures, full offline reliability, and exact styling control.
2. **Local Storage + JSON File System for Custom Worlds**:
   - *Chosen Approach*: Save world slots directly into browser `localStorage`, with 1-click Download JSON (Export) and File Input (Import).
   - *Why*: Provides persistent local creative worlds without requiring backend server databases or authentication.
3. **Integrated Game Engine Sandbox in Single WebGL Context**:
   - *Chosen Approach*: Reusable Three.js core renderer that powers both the 4 pre-built game modules and the user-built custom worlds through a unified actor/physics/trigger pipeline.
   - *Why*: Keeps bundle light, eliminates context switching overhead, and ensures custom worlds enjoy the exact same player physics, camera controls, and audio as pre-built games.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                             REACT UI LAYER                             │
│  ┌───────────────┐ ┌────────────────┐ ┌───────────────┐ ┌───────────┐  │
│  │ MainMenu Hub  │ │ AvatarEditor   │ │ StudioToolbar │ │ GameHUD   │  │
│  │ (Tabs/Cards)  │ │ (Color/Hats)   │ │ (Tools/Props) │ │ (Stats/HP)│  │
│  └───────┬───────┘ └───────┬────────┘ └───────┬───────┘ └─────┬─────┘  │
└──────────┼─────────────────┼──────────────────┼───────────────┼────────┘
           │                 │                  │               │
┌──────────▼─────────────────▼──────────────────▼───────────────▼────────┐
│                        APP STATE & STORAGE MGR                         │
│  - Active Scene / Mode (MENU | GAME | STUDIO | AVATAR)                 │
│  - AvatarConfig Store (Limb colors, face decal, accessories)          │
│  - WorldStorage (Built-in maps + Custom user creations in LocalStore)  │
│  - Settings Store (Graphics, Audio, Mouse Sens, FOV)                  │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
┌────────────────────────────────────▼───────────────────────────────────┐
│                       THREE.JS BRICK ENGINE CORE                       │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ WebGLRenderer (PCFSoftShadows, SRGBColorSpace, ACES ToneMapping) │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │ Scene Graph & Lighting (Key Sun, Hemisphere Fill, Distance Fog)  │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │ Brick Avatar Kinematics (6-limb procedural character, walk cycle)│  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │ Physics & Collision Engine (AABB, Ground Raycasting, Jump/Bounce)│  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │ Studio Raycaster & Transform Gizmo (Select, Place, Drag, Scale)  │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │ Web Audio Procedural SFX (Jump, Oof, Coin, Slash, Alert, Click)  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### Data Structures

```typescript
// World Schema for Studio & Games
interface BrickWorldData {
  id: string;
  name: string;
  description: string;
  author: string;
  version: number;
  environment: {
    skyColor: string;
    fogDensity: number;
    ambientColor: string;
    sunPosition: [number, number, number];
  };
  spawnPoint: [number, number, number];
  parts: BrickPart[];
}

interface BrickPart {
  id: string;
  type: 'block' | 'cylinder' | 'wedge' | 'sphere' | 'kill' | 'bounce' | 'conveyor' | 'checkpoint' | 'light';
  name: string;
  position: [number, number, number];
  rotation: [number, number, number];
  size: [number, number, number];
  color: string;
  material: 'plastic' | 'studs' | 'neon' | 'glass' | 'metal';
  anchored: boolean;
  canCollide: boolean;
  transparency?: number;
  metadata?: Record<string, any>;
}

// Avatar Config Schema
interface AvatarConfig {
  headColor: string;
  torsoColor: string;
  leftArmColor: string;
  rightArmColor: string;
  leftLegColor: string;
  rightLegColor: string;
  face: 'smile' | 'chill' | 'epic' | 'evil' | 'cyborg';
  hat: 'none' | 'cap' | 'fedora' | 'headphones' | 'valkyrie';
  backAccessory: 'none' | 'sword' | 'wings' | 'jetpack';
  shirtPattern: 'classic' | 'tuxedo' | 'hoodie' | 'stripes' | 'armor';
  scale: number;
}
```

### Interactive Minigames Implementation
1. **Obby Jump: Tower of Bricks**:
   - 6 progressive obstacle levels rising into the clouds.
   - Kill bricks (neon red) that trigger the classic "Oof!" sound and respawn.
   - Moving platforms (sinusoidal lerp), disappearing stepping stones (fade out on touch, reset after 3s), and high-jump trampolines.
   - Checkpoints with glowing green rings and chime sounds.
2. **Disaster Survival: Blox Island**:
   - Coastal island with a central brick tower, watch house, and lighthouse.
   - Random disaster round selector (Tornado with physics wind pulling debris; Meteor shower dropping explosive projectiles; Acid rain damaging unshielded players; Earthquake collapsing brick building floors).
   - Real-time round timer, survival victory rewards, and interactive disaster alerts.
3. **Pizza Chef Tycoon**:
   - Fully interactive restaurant simulator.
   - Dough prep table -> Topping counter (Cheese, Pepperoni, Sauce) -> Conveyor oven -> Delivery window.
   - NPC customers walking up with order speech bubbles. Completing orders awards BloxCoins to unlock chef upgrades (Faster Oven, Golden Delivery Scooter, Expanded Counter).
4. **Sword Arena: Red vs Blue**:
   - Classic duel arena with castle ramparts and capture points.
   - Melee sword combat with slash animations, lunge hitboxes, and particle sparks.
   - Smart bot combatants patrolling and engaging player.
   - Special collectible gear: Gravity Coil (super floaty jumps) and Speed Coil (neon trail sprint).

---

## 5. Execution Steps

1. **Dependencies Installation**: Install `three` and `@types/three`.
2. **Core 3D Engine & Character System**:
   - Procedural stud textures, PBR materials, lighting rig, and software-WebGL safety guards.
   - 6-part procedural Brick Avatar with walk/jump animations and cosmetic accessories.
   - Third-person orbital camera with right-click drag orbit and scroll zoom.
3. **Synthesized Web Audio Engine**:
   - Zero-dependency retro audio synthesizer using Web Audio API (`jump`, `oof`, `coin`, `slash`, `ambient`, `fanfare`, `build`).
4. **Pre-Built Game Experiences**:
   - Implement the 4 distinct playable games with full rules, state management, and victory/respawn flows.
5. **World Studio Engine**:
   - Transform gizmos, part palette, property inspector, grid snapping, and instant Test/Play toggling.
   - LocalStorage manager with JSON Export and Import.
6. **Avatar Editor & Customizer**:
   - Real-time 3D turntable viewer and customization controls for colors, faces, hats, and gear.
7. **Main Menu, Settings, & Polish**:
   - Discover game launcher, controls guide, settings modal (audio, graphics quality, FOV, sensitivity), and responsive design.
8. **Verification**: Run `compile_applet` and `lint_applet` to verify flawless compilation.
