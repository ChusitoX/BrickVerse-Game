/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { BrickPart, BrickWorldData, PartMaterial, PartType } from '../types/game';
import { WorldRenderer } from '../engine/worldRenderer';
import { sound } from '../audio/soundEngine';
import { StorageManager } from '../storage/worldStorage';

interface WorldStudioProps {
  initialWorld: BrickWorldData;
  onTestPlay: (world: BrickWorldData) => void;
  onExit: () => void;
}

const STUDIO_COLORS = [
  '#22c55e', '#16a34a', '#0284c7', '#0369a1', '#dc2626', '#b91c1c',
  '#eab308', '#ca8a04', '#f97316', '#c2410c', '#a855f7', '#7e22ce',
  '#ec4899', '#f8fafc', '#94a3b8', '#475569', '#1e293b', '#0f172a'
];

export const WorldStudio: React.FC<WorldStudioProps> = ({ initialWorld, onTestPlay, onExit }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [world, setWorld] = useState<BrickWorldData>(() => JSON.parse(JSON.stringify(initialWorld)));
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
  const [toolMode, setToolMode] = useState<'select' | 'move' | 'scale' | 'paint' | 'delete'>('select');
  const [activePaletteColor, setActivePaletteColor] = useState<string>('#0284c7');
  const [activeAddPartType, setActiveAddPartType] = useState<PartType>('block');
  const [saveToast, setSaveToast] = useState(false);

  const worldRendererRef = useRef<WorldRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const selectionBoxRef = useRef<THREE.BoxHelper | null>(null);

  // Selection raycaster
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  // Camera Orbit
  const isOrbiting = useRef(false);
  const prevMouse = useRef({ x: 0, y: 0 });
  const camAngles = useRef({ yaw: 0.8, pitch: 0.6, dist: 35 });
  const camTarget = useRef(new THREE.Vector3(0, 4, 0));

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(world.environment.skyColor || '#38bdf8');
    sceneRef.current = scene;

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Studio Grid
    const gridHelper = new THREE.GridHelper(120, 60, 0x0284c7, 0x334155);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // Lighting
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x334155, 0.9);
    scene.add(hemiLight);

    const sun = new THREE.DirectionalLight(0xffffff, 1.4);
    sun.position.set(40, 60, 30);
    sun.castShadow = true;
    scene.add(sun);

    // Camera
    const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 1000);
    cameraRef.current = camera;

    // World Renderer
    const wr = new WorldRenderer(scene);
    wr.loadWorld(world.parts);
    worldRendererRef.current = wr;

    // Selection wireframe helper
    const dummyMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1));
    const selBox = new THREE.BoxHelper(dummyMesh, 0x38bdf8);
    selBox.visible = false;
    scene.add(selBox);
    selectionBoxRef.current = selBox;

    // Pointer events for camera orbit and clicking
    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 2 || e.button === 1) {
        // Right or middle click = orbit camera
        isOrbiting.current = true;
        prevMouse.current = { x: e.clientX, y: e.clientY };
      } else if (e.button === 0) {
        // Left click = Raycast part selection or paint/delete
        const rect = container.getBoundingClientRect();
        mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.current.setFromCamera(mouse.current, camera);
        const intersects = raycaster.current.intersectObjects(wr.partsGroup.children, true);

        if (intersects.length > 0) {
          let hitObj: THREE.Object3D | null = intersects[0].object;
          while (hitObj && !hitObj.userData?.partId && hitObj.parent) {
            hitObj = hitObj.parent;
          }

          if (hitObj?.userData?.partId) {
            const hitId = hitObj.userData.partId;
            sound.playClick();
            setSelectedPartId(hitId);

            if (toolMode === 'delete') {
              handleDeletePart(hitId);
            }
          }
        } else {
          // Deselect if clicked empty space
          setSelectedPartId(null);
        }
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (isOrbiting.current) {
        const dx = e.clientX - prevMouse.current.x;
        const dy = e.clientY - prevMouse.current.y;
        prevMouse.current = { x: e.clientX, y: e.clientY };

        camAngles.current.yaw -= dx * 0.006;
        camAngles.current.pitch += dy * 0.006;
        camAngles.current.pitch = Math.max(0.1, Math.min(1.45, camAngles.current.pitch));
      }
    };

    const onMouseUp = () => {
      isOrbiting.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      camAngles.current.dist += e.deltaY * 0.02;
      camAngles.current.dist = Math.max(5, Math.min(120, camAngles.current.dist));
    };

    const onContextMenu = (e: MouseEvent) => e.preventDefault();

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('wheel', onWheel, { passive: true });
    container.addEventListener('contextmenu', onContextMenu);

    const onResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // Render loop
    let frameId = 0;
    const animate = () => {
      // Update camera spherical position
      const angles = camAngles.current;
      const hDist = angles.dist * Math.cos(angles.pitch);
      const vDist = angles.dist * Math.sin(angles.pitch);

      camera.position.x = camTarget.current.x + hDist * Math.sin(angles.yaw);
      camera.position.y = camTarget.current.y + vDist;
      camera.position.z = camTarget.current.z + hDist * Math.cos(angles.yaw);
      camera.lookAt(camTarget.current);

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('contextmenu', onContextMenu);
      window.removeEventListener('resize', onResize);
      wr.clear();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update selection wireframe when selectedPartId changes
  useEffect(() => {
    if (!selectionBoxRef.current || !worldRendererRef.current) return;
    if (selectedPartId) {
      const rp = worldRendererRef.current.renderedParts.get(selectedPartId);
      if (rp) {
        selectionBoxRef.current.setFromObject(rp.mesh);
        selectionBoxRef.current.visible = true;
        return;
      }
    }
    selectionBoxRef.current.visible = false;
  }, [selectedPartId, world.parts]);

  // Selected Part Object
  const selectedPart = world.parts.find((p) => p.id === selectedPartId);

  // Add Part action
  const handleAddPart = (type: PartType) => {
    sound.playBuildPlace();
    const newId = `part_${Date.now()}`;
    const defaultColor = type === 'kill' ? '#dc2626' : type === 'bounce' ? '#eab308' : activePaletteColor;
    const defaultMaterial: PartMaterial = type === 'kill' || type === 'bounce' ? 'neon' : 'plastic';

    const newPart: BrickPart = {
      id: newId,
      type,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${world.parts.length + 1}`,
      position: [0, 2, 0],
      size: type === 'cylinder' ? [3, 4, 3] : [4, 1.2, 4],
      rotation: [0, 0, 0],
      color: defaultColor,
      material: defaultMaterial,
      anchored: true,
      canCollide: true,
      metadata: type === 'bounce' ? { bounceForce: 28 } : undefined,
    };

    setWorld((prev) => {
      const updatedParts = [...prev.parts, newPart];
      if (worldRendererRef.current) {
        worldRendererRef.current.addPart(newPart);
      }
      return { ...prev, parts: updatedParts };
    });
    setSelectedPartId(newId);
  };

  // Delete Part
  const handleDeletePart = (partIdToDelete?: string) => {
    const targetId = partIdToDelete || selectedPartId;
    if (!targetId) return;
    sound.playDelete();
    setWorld((prev) => {
      const nextParts = prev.parts.filter((p) => p.id !== targetId);
      if (worldRendererRef.current) {
        worldRendererRef.current.removePart(targetId);
      }
      return { ...prev, parts: nextParts };
    });
    if (selectedPartId === targetId) setSelectedPartId(null);
  };

  // Duplicate Part
  const handleDuplicatePart = () => {
    if (!selectedPart) return;
    sound.playBuildPlace();
    const copy: BrickPart = {
      ...JSON.parse(JSON.stringify(selectedPart)),
      id: `part_${Date.now()}`,
      name: `${selectedPart.name} (Copy)`,
      position: [selectedPart.position[0] + 3, selectedPart.position[1], selectedPart.position[2] + 3],
    };

    setWorld((prev) => {
      const nextParts = [...prev.parts, copy];
      if (worldRendererRef.current) {
        worldRendererRef.current.addPart(copy);
      }
      return { ...prev, parts: nextParts };
    });
    setSelectedPartId(copy.id);
  };

  // Update selected part property
  const updateSelectedPart = (partial: Partial<BrickPart>) => {
    if (!selectedPartId) return;
    setWorld((prev) => {
      const nextParts = prev.parts.map((p) => {
        if (p.id === selectedPartId) {
          const updated = { ...p, ...partial };
          if (worldRendererRef.current) {
            worldRendererRef.current.updatePartTransform(
              p.id,
              updated.position ? new THREE.Vector3(...updated.position) : undefined,
              updated.rotation ? new THREE.Euler(...updated.rotation) : undefined,
              updated.size ? new THREE.Vector3(...updated.size) : undefined
            );
          }
          return updated;
        }
        return p;
      });
      return { ...prev, parts: nextParts };
    });
  };

  // Save World to LocalStorage
  const handleSaveWorld = () => {
    sound.playCoin();
    StorageManager.saveCustomWorld(world);
    setSaveToast(true);
    window.setTimeout(() => setSaveToast(false), 2000);
  };

  // Export JSON file download
  const handleExportJson = () => {
    sound.playCoin();
    StorageManager.exportWorldToJson(world);
  };

  return (
    <div className="flex flex-col w-full h-full bg-slate-950 text-slate-100 select-none overflow-hidden relative">
      {/* Studio Top Control Bar */}
      <header className="h-14 px-4 bg-slate-900 border-b border-white/10 flex items-center justify-between gap-4 z-20 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            ← Hub
          </button>
          <div className="h-4 w-px bg-white/10" />
          <input
            type="text"
            value={world.name}
            onChange={(e) => setWorld((w) => ({ ...w, name: e.target.value }))}
            className="bg-transparent font-bold text-sm text-white focus:bg-slate-800/80 px-2.5 py-1 rounded-md border border-transparent focus:border-sky-500 outline-none w-48 md:w-64"
          />
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">
            {world.parts.length} parts
          </span>
        </div>

        {/* Center: Tools */}
        <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-white/10 text-xs">
          {[
            { id: 'select', label: 'Select' },
            { id: 'move', label: 'Move' },
            { id: 'scale', label: 'Resize' },
            { id: 'paint', label: 'Color' },
            { id: 'delete', label: 'Delete' },
          ].map((tool) => (
            <button
              key={tool.id}
              onClick={() => {
                sound.playClick();
                setToolMode(tool.id as typeof toolMode);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                toolMode === tool.id
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {tool.label}
            </button>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJson}
            title="Download world as a .brickverse.json file"
            className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 border border-white/10 transition-colors cursor-pointer hidden md:inline"
          >
            Export JSON
          </button>
          <button
            onClick={handleSaveWorld}
            className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 border border-white/10 transition-colors cursor-pointer"
          >
            Save
          </button>
          <button
            onClick={() => {
              handleSaveWorld();
              onTestPlay(world);
            }}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-lg shadow-emerald-950/40 cursor-pointer flex items-center gap-1.5"
          >
            <span>▶</span> Test Play
          </button>
        </div>
      </header>

      {/* Main Studio Workspace: 3D Viewport + Side Inspectors */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* Left Quick Add Palette */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 bg-slate-900/90 border border-white/10 p-3 rounded-2xl backdrop-blur-xs shadow-2xl max-w-[190px]">
          <span className="text-[11px] font-bold tracking-wider text-slate-400">ADD OBJECT</span>
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            {[
              { type: 'block', label: 'Brick' },
              { type: 'cylinder', label: 'Cylinder' },
              { type: 'wedge', label: 'Wedge' },
              { type: 'sphere', label: 'Sphere' },
              { type: 'kill', label: 'Kill Brick' },
              { type: 'bounce', label: 'Trampoline' },
              { type: 'checkpoint', label: 'Checkpoint' },
              { type: 'spawn', label: 'Spawn Pad' },
            ].map((p) => (
              <button
                key={p.type}
                onClick={() => handleAddPart(p.type as PartType)}
                className="px-2 py-2 rounded-lg bg-slate-800/80 hover:bg-sky-600 text-slate-200 hover:text-white font-medium text-xs transition-colors cursor-pointer border border-white/5"
              >
                {p.label}
              </button>
            ))}
          </div>

          <span className="text-[11px] font-bold tracking-wider text-slate-400 mt-2">PAINT COLOR</span>
          <div className="grid grid-cols-6 gap-1">
            {STUDIO_COLORS.slice(0, 12).map((hex) => (
              <button
                key={hex}
                onClick={() => {
                  setActivePaletteColor(hex);
                  if (selectedPartId) {
                    updateSelectedPart({ color: hex });
                  }
                }}
                className={`w-5 h-5 rounded-md cursor-pointer border ${
                  activePaletteColor === hex ? 'border-white scale-110 shadow-sm' : 'border-black/30'
                }`}
                style={{ backgroundColor: hex }}
              />
            ))}
          </div>
        </div>

        {/* 3D WebGL Canvas */}
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Orbit Hint */}
        <div className="absolute bottom-4 left-4 bg-slate-900/80 border border-white/10 px-3.5 py-1.5 rounded-full text-xs text-slate-400 backdrop-blur-xs pointer-events-none z-10">
          Right Click + Drag to Orbit · Scroll to Zoom · Left Click to Select
        </div>

        {/* Save confirmation toast */}
        {saveToast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-5 py-2 rounded-full text-xs font-bold shadow-xl animate-bounce z-30">
            World Saved to Local Storage! 💾
          </div>
        )}

        {/* Right Properties Inspector */}
        {selectedPart && (
          <aside className="w-80 bg-slate-900/95 border-l border-white/10 p-5 flex flex-col gap-4 overflow-y-auto z-10 backdrop-blur-xs shrink-0">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="font-bold text-sm text-white">Part Properties</span>
              <button
                onClick={() => setSelectedPartId(null)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Name */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400">Name</label>
              <input
                type="text"
                value={selectedPart.name}
                onChange={(e) => updateSelectedPart({ name: e.target.value })}
                className="bg-slate-950 border border-white/10 px-3 py-1.5 rounded-lg text-xs text-white focus:border-sky-500 outline-none"
              />
            </div>

            {/* Position XYZ */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400">Position (X, Y, Z)</label>
              <div className="grid grid-cols-3 gap-2">
                {['x', 'y', 'z'].map((axis, i) => (
                  <div key={axis} className="flex items-center gap-1 bg-slate-950 border border-white/10 px-2 py-1 rounded-lg">
                    <span className="text-[10px] uppercase font-bold text-slate-500">{axis}</span>
                    <input
                      type="number"
                      step={0.5}
                      value={selectedPart.position[i]}
                      onChange={(e) => {
                        const newPos = [...selectedPart.position] as [number, number, number];
                        newPos[i] = parseFloat(e.target.value) || 0;
                        updateSelectedPart({ position: newPos });
                      }}
                      className="w-full bg-transparent text-xs text-white outline-none font-mono"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Size XYZ */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400">Size (W, H, D)</label>
              <div className="grid grid-cols-3 gap-2">
                {['w', 'h', 'd'].map((dim, i) => (
                  <div key={dim} className="flex items-center gap-1 bg-slate-950 border border-white/10 px-2 py-1 rounded-lg">
                    <span className="text-[10px] uppercase font-bold text-slate-500">{dim}</span>
                    <input
                      type="number"
                      step={0.5}
                      min={0.2}
                      value={selectedPart.size[i]}
                      onChange={(e) => {
                        const newSize = [...selectedPart.size] as [number, number, number];
                        newSize[i] = Math.max(0.2, parseFloat(e.target.value) || 1);
                        updateSelectedPart({ size: newSize });
                      }}
                      className="w-full bg-transparent text-xs text-white outline-none font-mono"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Material */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400">Material Finish</label>
              <select
                value={selectedPart.material}
                onChange={(e) => updateSelectedPart({ material: e.target.value as PartMaterial })}
                className="bg-slate-950 border border-white/10 px-3 py-1.5 rounded-lg text-xs text-white outline-none cursor-pointer"
              >
                <option value="plastic">Plastic (with studs)</option>
                <option value="neon">Neon (glow emission)</option>
                <option value="glass">Glass (transparent)</option>
                <option value="metal">Metal</option>
                <option value="wood">Wood</option>
              </select>
            </div>

            {/* Color Swatches */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400">Color</label>
              <div className="grid grid-cols-6 gap-1.5">
                {STUDIO_COLORS.map((hex) => (
                  <button
                    key={hex}
                    onClick={() => updateSelectedPart({ color: hex })}
                    className={`w-7 h-7 rounded-lg cursor-pointer border ${
                      selectedPart.color === hex ? 'border-white scale-110 shadow-md' : 'border-black/30'
                    }`}
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </div>
            </div>

            {/* Physics flags */}
            <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
              <label className="flex items-center gap-2.5 text-xs text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedPart.anchored}
                  onChange={(e) => updateSelectedPart({ anchored: e.target.checked })}
                  className="rounded bg-slate-950 border-white/20 text-sky-500 focus:ring-0"
                />
                <span>Anchored (Fixed in space)</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedPart.canCollide}
                  onChange={(e) => updateSelectedPart({ canCollide: e.target.checked })}
                  className="rounded bg-slate-950 border-white/20 text-sky-500 focus:ring-0"
                />
                <span>Can Collide (Solid walls/floor)</span>
              </label>
            </div>

            {/* Actions: Duplicate / Delete */}
            <div className="flex gap-2 pt-4 border-t border-white/10 mt-auto">
              <button
                onClick={handleDuplicatePart}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-2 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Duplicate
              </button>
              <button
                onClick={() => handleDeletePart()}
                className="flex-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 font-semibold py-2 rounded-xl text-xs transition-colors cursor-pointer border border-red-500/20"
              >
                Delete
              </button>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};
