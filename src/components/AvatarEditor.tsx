/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { AvatarBackAccessory, AvatarConfig, AvatarFace, AvatarHat, AvatarShirt } from '../types/game';
import { buildCharacter, CharacterRig } from '../engine/characterBuilder';
import { sound } from '../audio/soundEngine';
import { DEFAULT_AVATAR_CONFIG, StorageManager } from '../storage/worldStorage';

interface AvatarEditorProps {
  currentConfig: AvatarConfig;
  onSave: (config: AvatarConfig) => void;
  onBack: () => void;
}

const CLASSIC_PALETTE = [
  { name: 'Classic Yellow', hex: '#facc15' },
  { name: 'Bright Blue', hex: '#0284c7' },
  { name: 'Bright Red', hex: '#dc2626' },
  { name: 'Bright Green', hex: '#16a34a' },
  { name: 'Light Orange', hex: '#f97316' },
  { name: 'Deep Purple', hex: '#9333ea' },
  { name: 'Hot Pink', hex: '#ec4899' },
  { name: 'Pure White', hex: '#ffffff' },
  { name: 'Dark Slate', hex: '#1e293b' },
  { name: 'Obsidian Black', hex: '#0f172a' },
  { name: 'Warm Tan', hex: '#d97706' },
  { name: 'Medium Grey', hex: '#64748b' },
  { name: 'Pastel Cyan', hex: '#38bdf8' },
  { name: 'Emerald Mint', hex: '#10b981' },
  { name: 'Rose Pink', hex: '#f43f5e' },
  { name: 'Deep Indigo', hex: '#4338ca' },
];

export const AvatarEditor: React.FC<AvatarEditorProps> = ({ currentConfig, onSave, onBack }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [config, setConfig] = useState<AvatarConfig>(currentConfig);
  const [activeTab, setActiveTab] = useState<'colors' | 'faces' | 'hats' | 'back' | 'clothing'>('colors');
  const [selectedBodyPart, setSelectedBodyPart] = useState<
    'all' | 'head' | 'torso' | 'leftArm' | 'rightArm' | 'leftLeg' | 'rightLeg'
  >('head');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [customHex, setCustomHex] = useState(config.headColor);

  const charRigRef = useRef<CharacterRig | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0f172a');

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    const keyLight = new THREE.DirectionalLight(0xfffbeb, 1.8);
    keyLight.position.set(5, 8, 8);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    rimLight.position.set(-6, 6, -6);
    scene.add(rimLight);

    const fillLight = new THREE.HemisphereLight(0xe2e8f0, 0x1e293b, 0.8);
    scene.add(fillLight);

    const pedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(3.2, 3.5, 0.4, 32),
      new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.2,
        metalness: 0.6,
      })
    );
    pedestal.position.set(0, -0.2, 0);
    pedestal.receiveShadow = true;
    scene.add(pedestal);

    const rimRing = new THREE.Mesh(
      new THREE.TorusGeometry(3.25, 0.06, 8, 32),
      new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        emissive: 0x0284c7,
        emissiveIntensity: 1.0,
      })
    );
    rimRing.rotation.x = Math.PI / 2;
    rimRing.position.set(0, 0.02, 0);
    scene.add(rimRing);

    const rig = buildCharacter(config);
    scene.add(rig.root);
    charRigRef.current = rig;

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 2.8, 8.5);
    camera.lookAt(new THREE.Vector3(0, 2.0, 0));

    let isDragging = false;
    let prevX = 0;
    let rotY = 0;

    const onPointerDown = (e: MouseEvent) => {
      isDragging = true;
      prevX = e.clientX;
    };
    const onPointerMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevX;
      prevX = e.clientX;
      rotY += dx * 0.01;
      rig.root.rotation.y = rotY;
    };
    const onPointerUp = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    const onResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    let frameId = 0;
    const clock = new THREE.Clock();
    const animate = () => {
      const delta = clock.getDelta();
      if (!isDragging) {
        rotY += delta * 0.2;
        rig.root.rotation.y = rotY;
      }
      rig.updateAnimation(new THREE.Vector3(), true, false, 0, delta);
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
      container.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  useEffect(() => {
    if (charRigRef.current) {
      charRigRef.current.updateConfig(config);
    }
  }, [config]);

  const applyColor = (hex: string) => {
    sound.playClick();
    setCustomHex(hex);
    setConfig((prev) => {
      if (selectedBodyPart === 'all') {
        return {
          ...prev,
          headColor: hex,
          torsoColor: hex,
          leftArmColor: hex,
          rightArmColor: hex,
          leftLegColor: hex,
          rightLegColor: hex,
        };
      }
      return {
        ...prev,
        [`${selectedBodyPart}Color`]: hex,
      };
    });
  };

  const setFace = (face: AvatarFace) => {
    sound.playClick();
    setConfig((prev) => ({ ...prev, face }));
  };

  const setHat = (hat: AvatarHat) => {
    sound.playClick();
    setConfig((prev) => ({ ...prev, hat }));
  };

  const setBack = (backAccessory: AvatarBackAccessory) => {
    sound.playClick();
    setConfig((prev) => ({ ...prev, backAccessory }));
  };

  const setShirt = (shirtPattern: AvatarShirt) => {
    sound.playClick();
    setConfig((prev) => ({ ...prev, shirtPattern }));
  };

  const handleSave = () => {
    sound.playCoin();
    StorageManager.saveAvatarConfig(config);
    onSave(config);
    setSaveSuccess(true);
    window.setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleRandomize = () => {
    sound.playBuildPlace();
    const faces: AvatarFace[] = [
      'smile',
      'chill',
      'epic',
      'evil',
      'cyborg',
      'stare',
      'wink',
      'chad',
      'derp',
      'screaming',
      'clown',
      'mustache',
    ];
    const hats: AvatarHat[] = [
      'none',
      'cap',
      'fedora',
      'headphones',
      'valkyrie',
      'crown',
      'ninja',
      'halo',
      'viking',
      'propeller',
      'traffic_cone',
      'cheese',
      'chicken',
    ];
    const backs: AvatarBackAccessory[] = [
      'none',
      'sword',
      'wings',
      'jetpack',
      'dragon_wings',
      'skateboard',
      'boombox',
      'balloons',
      'pizza_jet',
      'toilet_paper',
    ];
    const shirts: AvatarShirt[] = ['classic', 'tuxedo', 'hoodie', 'stripes', 'armor', 'police', 'cyber', 'ninja', 'retro'];
    const randomHex = () => CLASSIC_PALETTE[Math.floor(Math.random() * CLASSIC_PALETTE.length)].hex;

    setConfig({
      headColor: randomHex(),
      torsoColor: randomHex(),
      leftArmColor: randomHex(),
      rightArmColor: randomHex(),
      leftLegColor: randomHex(),
      rightLegColor: randomHex(),
      face: faces[Math.floor(Math.random() * faces.length)],
      hat: hats[Math.floor(Math.random() * hats.length)],
      backAccessory: backs[Math.floor(Math.random() * backs.length)],
      shirtPattern: shirts[Math.floor(Math.random() * shirts.length)],
      scale: 1.0,
    });
  };

  const handleReset = () => {
    sound.playClick();
    setConfig(DEFAULT_AVATAR_CONFIG);
  };

  return (
    <div className="flex flex-col md:flex-row w-full h-full bg-slate-950 text-slate-100 overflow-hidden select-none">
      {/* Left 3D Turntable Viewport */}
      <div className="relative flex-1 h-[45vh] md:h-full bg-radial from-slate-900 to-slate-950 flex items-center justify-center">
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        <div className="absolute bottom-4 left-4 bg-slate-900/80 border border-white/10 px-3.5 py-1.5 rounded-full text-xs text-slate-300 backdrop-blur-xs">
          Drag to spin 360° · Crisp vibrant skin colors
        </div>

        {saveSuccess && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-5 py-2 rounded-full text-xs font-bold shadow-xl animate-bounce">
            Avatar Saved Successfully! ✨
          </div>
        )}
      </div>

      {/* Right Customizer Panel */}
      <div className="w-full md:w-[480px] h-[55vh] md:h-full bg-slate-900 border-l border-white/10 flex flex-col p-6 z-10">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">Avatar Editor</h2>
            <p className="text-xs text-slate-400">Customize skin colors, expressions, hats, and outfits</p>
          </div>
          <button
            onClick={onBack}
            className="text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer border border-white/10"
          >
            Done
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-1 py-3 border-b border-white/10 text-xs font-semibold overflow-x-auto">
          {[
            { id: 'colors', label: 'Body Colors' },
            { id: 'faces', label: 'Faces (12)' },
            { id: 'hats', label: 'Hats & Helms (13)' },
            { id: 'back', label: 'Back Gear (10)' },
            { id: 'clothing', label: 'Clothing (9)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                sound.playClick();
                setActiveTab(tab.id as typeof activeTab);
              }}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Panel Content */}
        <div className="flex-1 overflow-y-auto py-4 pr-1 flex flex-col gap-5">
          {/* TAB 1: BODY COLORS */}
          {activeTab === 'colors' && (
            <div className="flex flex-col gap-4">
              <div className="text-xs font-semibold text-slate-400">Select Body Part to Tint:</div>
              <div className="grid grid-cols-4 gap-1.5 text-xs font-medium">
                {[
                  { id: 'all', label: 'All Parts' },
                  { id: 'head', label: 'Head' },
                  { id: 'torso', label: 'Torso' },
                  { id: 'leftArm', label: 'Left Arm' },
                  { id: 'rightArm', label: 'Right Arm' },
                  { id: 'leftLeg', label: 'Left Leg' },
                  { id: 'rightLeg', label: 'Right Leg' },
                ].map((part) => (
                  <button
                    key={part.id}
                    onClick={() => {
                      sound.playClick();
                      setSelectedBodyPart(part.id as typeof selectedBodyPart);
                    }}
                    className={`px-2 py-2 rounded-lg border text-center transition-colors cursor-pointer ${
                      selectedBodyPart === part.id
                        ? 'border-sky-500 bg-sky-500/20 text-sky-300 font-bold'
                        : 'border-white/10 hover:border-white/20 text-slate-300'
                    }`}
                  >
                    {part.label}
                  </button>
                ))}
              </div>

              {/* Custom Hex Color Picker */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-white/10">
                <input
                  type="color"
                  value={customHex}
                  onChange={(e) => applyColor(e.target.value)}
                  className="w-9 h-9 rounded-lg border border-white/20 cursor-pointer bg-transparent"
                />
                <div className="flex-1 flex flex-col">
                  <span className="text-xs font-semibold text-slate-300">Custom Color</span>
                  <span className="text-[10px] text-slate-500 font-mono">{customHex.toUpperCase()}</span>
                </div>
                <input
                  type="text"
                  value={customHex}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCustomHex(val);
                    if (/^#[0-9A-F]{6}$/i.test(val)) {
                      applyColor(val);
                    }
                  }}
                  className="w-24 bg-slate-900 border border-white/10 px-2.5 py-1 text-xs font-mono rounded-lg text-white"
                />
              </div>

              <div className="text-xs font-semibold text-slate-400 pt-1">Palette Swatches:</div>
              <div className="grid grid-cols-4 gap-2.5">
                {CLASSIC_PALETTE.map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => applyColor(c.hex)}
                    title={c.name}
                    className="flex flex-col items-center gap-1.5 p-2 rounded-xl border border-white/10 hover:border-sky-400 transition-all hover:scale-105 cursor-pointer bg-slate-950/40"
                  >
                    <div
                      className="w-8 h-8 rounded-lg shadow-inner border border-white/20"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span className="text-[10px] text-slate-400 truncate max-w-full text-center">
                      {c.name.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: FACES */}
          {activeTab === 'faces' && (
            <div className="flex flex-col gap-3">
              <div className="text-xs font-semibold text-slate-400">Classic Decal Expressions:</div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'smile', label: 'Classic Smile', desc: 'The iconic timeless grin' },
                  { id: 'derp', label: 'Derp Face', desc: 'Googly mismatched eyes & goofy tongue' },
                  { id: 'screaming', label: 'Screaming Oof', desc: 'Cartoon horror screaming open mouth' },
                  { id: 'clown', label: 'Circus Clown', desc: 'Big red nose & playful diamonds' },
                  { id: 'mustache', label: 'Monocle & Stache', desc: 'Dapper mustache & golden monocle' },
                  { id: 'chill', label: 'Chill Shades', desc: 'Cool dark sunglasses' },
                  { id: 'epic', label: 'Epic Face', desc: 'Astonished wide eyes & tongue' },
                  { id: 'evil', label: 'Sinister Evil', desc: 'Sharp teeth & angled eyes' },
                  { id: 'cyborg', label: 'Cyborg Lens', desc: 'Glowing robotic cyber eye' },
                  { id: 'stare', label: 'Stare Face', desc: 'Wide unblinking pupils' },
                  { id: 'wink', label: 'Playful Wink', desc: 'Cheery smile with wink' },
                  { id: 'chad', label: 'Giga Chad', desc: 'Chiseled jawline & brow' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFace(f.id as AvatarFace)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      config.face === f.id
                        ? 'border-sky-500 bg-sky-500/20 text-sky-200'
                        : 'border-white/10 hover:border-white/20 text-slate-300 bg-slate-950/40'
                    }`}
                  >
                    <div className="font-bold text-sm">{f.label}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{f.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: HATS & HELMETS */}
          {activeTab === 'hats' && (
            <div className="flex flex-col gap-3">
              <div className="text-xs font-semibold text-slate-400">3D Hats & Headwear:</div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'none', label: 'None', desc: 'Bare block head stud' },
                  { id: 'propeller', label: 'Propeller Beanie', desc: 'Spinning colorful rotor cap' },
                  { id: 'traffic_cone', label: 'Traffic Cone', desc: 'Orange caution cone on head' },
                  { id: 'cheese', label: 'Cheese Wedge', desc: 'Giant Swiss cheddar slice' },
                  { id: 'chicken', label: 'Clucking Chicken', desc: 'Feathery chicken with comb & beak' },
                  { id: 'cap', label: 'Baseball Cap', desc: 'Red crown with dark visor' },
                  { id: 'fedora', label: 'Classic Fedora', desc: 'Black brim with crimson band' },
                  { id: 'headphones', label: 'Gamer Headset', desc: 'Padded earcups with headband' },
                  { id: 'valkyrie', label: 'Valkyrie Helm', desc: 'Golden winged warrior helmet' },
                  { id: 'crown', label: 'Golden Crown', desc: 'Royal 5-point spiked crown' },
                  { id: 'ninja', label: 'Ninja Headband', desc: 'Crimson martial arts knot' },
                  { id: 'halo', label: 'Angel Halo', desc: 'Golden glowing floating ring' },
                  { id: 'viking', label: 'Viking Helmet', desc: 'Iron helmet with horn spikes' },
                ].map((h) => (
                  <button
                    key={h.id}
                    onClick={() => setHat(h.id as AvatarHat)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      config.hat === h.id
                        ? 'border-sky-500 bg-sky-500/20 text-sky-200'
                        : 'border-white/10 hover:border-white/20 text-slate-300 bg-slate-950/40'
                    }`}
                  >
                    <div className="font-bold text-sm">{h.label}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{h.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: BACK GEAR */}
          {activeTab === 'back' && (
            <div className="flex flex-col gap-3">
              <div className="text-xs font-semibold text-slate-400">Back Accessories & Wings:</div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'none', label: 'None', desc: 'No back attachment' },
                  { id: 'balloons', label: 'Helium Balloons', desc: 'Floating party balloons bundle' },
                  { id: 'pizza_jet', label: 'Pizza Rocketpack', desc: 'Pepperoni slice with jet thrusters' },
                  { id: 'toilet_paper', label: 'TP Streamer', desc: 'Toilet paper roll with streaming paper' },
                  { id: 'sword', label: 'Katana Scabbard', desc: 'Slung diagonal on back' },
                  { id: 'wings', label: 'Cyan Neon Wings', desc: 'Emissive cyber wings' },
                  { id: 'dragon_wings', label: 'Dragon Wings', desc: 'Fiery crimson wings' },
                  { id: 'jetpack', label: 'Rocket Jetpack', desc: 'Dual booster thrusters' },
                  { id: 'skateboard', label: 'Skateboard', desc: 'Green pro skate deck' },
                  { id: 'boombox', label: 'Retro Boombox', desc: 'Stereo tape deck on back' },
                ].map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setBack(b.id as AvatarBackAccessory)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      config.backAccessory === b.id
                        ? 'border-sky-500 bg-sky-500/20 text-sky-200'
                        : 'border-white/10 hover:border-white/20 text-slate-300 bg-slate-950/40'
                    }`}
                  >
                    <div className="font-bold text-sm">{b.label}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{b.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: CLOTHING */}
          {activeTab === 'clothing' && (
            <div className="flex flex-col gap-3">
              <div className="text-xs font-semibold text-slate-400">Torso Shirt Patterns:</div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'classic', label: 'Classic Solid', desc: 'Pure torso color with seams' },
                  { id: 'tuxedo', label: 'Formal Tuxedo', desc: 'Bowtie & dress suit' },
                  { id: 'hoodie', label: 'Streetwear Hoodie', desc: 'Drawstrings & pouch pocket' },
                  { id: 'stripes', label: 'Sport Stripes', desc: 'Horizontal athletic bands' },
                  { id: 'armor', label: 'Knight Armor', desc: 'Steel seams & gold crest' },
                  { id: 'police', label: 'Officer Uniform', desc: 'Blue tie & golden badge' },
                  { id: 'cyber', label: 'Cyber Grid', desc: 'Glowing neon circuitry' },
                  { id: 'ninja', label: 'Ninja Robe', desc: 'Crimson sash & buckle' },
                  { id: 'retro', label: 'Retro Pixel', desc: '8-bit colorful pixel heart' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setShirt(s.id as AvatarShirt)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      config.shirtPattern === s.id
                        ? 'border-sky-500 bg-sky-500/20 text-sky-200'
                        : 'border-white/10 hover:border-white/20 text-slate-300 bg-slate-950/40'
                    }`}
                  >
                    <div className="font-bold text-sm">{s.label}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-white/10 flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              onClick={handleRandomize}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-2.5 rounded-xl text-xs transition-colors cursor-pointer border border-white/5"
            >
              🎲 Randomize
            </button>
            <button
              onClick={handleReset}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 font-semibold py-2.5 rounded-xl text-xs transition-colors cursor-pointer border border-white/5"
            >
              ↺ Reset
            </button>
          </div>
          <button
            onClick={handleSave}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-sm transition-colors shadow-lg shadow-emerald-950/50 cursor-pointer"
          >
            Save & Equip Avatar
          </button>
        </div>
      </div>
    </div>
  );
};
