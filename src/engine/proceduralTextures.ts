/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { AvatarFace, AvatarShirt } from '../types/game';

// Cache generated textures so we don't recreate them on every frame
const textureCache = new Map<string, THREE.CanvasTexture>();

/**
 * Creates the classic raised cylindrical stud bump texture
 */
export function getStudTexture(): THREE.CanvasTexture {
  const key = 'stud_texture';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Base background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);

  // Stud circle center
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.32;

  // Outer bevel shadow
  ctx.beginPath();
  ctx.arc(cx, cy + 3, radius, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.fill();

  // Outer bevel highlight
  ctx.beginPath();
  ctx.arc(cx, cy - 2, radius, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.fill();

  // Main stud surface
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = '#f0f0f0';
  ctx.fill();

  // Inner ring highlight
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.85, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Inner ring shadow
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.72, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
  ctx.lineWidth = 2;
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(key, texture);
  return texture;
}

/**
 * Baseplate grid texture
 */
export function getBaseplateTexture(): THREE.CanvasTexture {
  const key = 'baseplate_grid';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#22c55e'; // Vibrant classic green
  ctx.fillRect(0, 0, size, size);

  // Grid lines
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, size, size);

  // 4 studs on 2x2 grid
  const positions = [
    [size * 0.25, size * 0.25],
    [size * 0.75, size * 0.25],
    [size * 0.25, size * 0.75],
    [size * 0.75, size * 0.75],
  ];

  positions.forEach(([cx, cy]) => {
    ctx.beginPath();
    ctx.arc(cx, cy + 2, 24, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy, 24, 0, Math.PI * 2);
    ctx.fillStyle = '#16a34a';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy, 18, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(16, 16);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(key, texture);
  return texture;
}

/**
 * Generates classic face decal textures with the exact underlying skin color
 * to prevent black transparent artifacts!
 */
export function getFaceTexture(faceType: AvatarFace, skinColor: string = '#facc15'): THREE.CanvasTexture {
  const key = `face_${faceType}_${skinColor}`;
  if (textureCache.has(key)) return textureCache.get(key)!;

  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Fill entire face background with the exact chosen skin color
  ctx.fillStyle = skinColor;
  ctx.fillRect(0, 0, size, size);

  switch (faceType) {
    case 'smile':
      // Classic 2 dots and curved smile
      ctx.fillStyle = '#1e1e1e';
      ctx.beginPath();
      ctx.arc(75, 95, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(181, 95, 16, 0, Math.PI * 2);
      ctx.fill();

      // Eye shine
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(71, 90, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(177, 90, 5, 0, Math.PI * 2);
      ctx.fill();

      // Curved smile
      ctx.strokeStyle = '#1e1e1e';
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(128, 120, 58, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
      break;

    case 'chill':
      // Cool black sunglasses + smirk
      ctx.fillStyle = '#111827';
      ctx.beginPath();
      ctx.roundRect(40, 75, 76, 50, [12, 12, 20, 20]);
      ctx.roundRect(140, 75, 76, 50, [12, 12, 20, 20]);
      ctx.fill();

      // Bridge
      ctx.fillRect(114, 88, 28, 12);

      // Lens shine
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(55, 85);
      ctx.lineTo(95, 115);
      ctx.moveTo(155, 85);
      ctx.lineTo(195, 115);
      ctx.stroke();

      // Chill half-smirk
      ctx.strokeStyle = '#1e1e1e';
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(135, 145, 40, 0.1 * Math.PI, 0.55 * Math.PI);
      ctx.stroke();
      break;

    case 'epic':
      // Epic Face: Huge wide eyes, happy curved open mouth with red tongue
      ctx.fillStyle = '#1e1e1e';
      ctx.beginPath();
      ctx.ellipse(75, 85, 28, 38, 0, 0, Math.PI * 2);
      ctx.ellipse(181, 85, 28, 38, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(68, 76, 12, 0, Math.PI * 2);
      ctx.arc(174, 76, 12, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#111827';
      ctx.beginPath();
      ctx.arc(128, 125, 62, 0, Math.PI);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(128, 175, 32, Math.PI, 0);
      ctx.fill();
      break;

    case 'evil':
      // Angled sharp eyes + sinister grin with teeth
      ctx.fillStyle = '#1e1e1e';
      ctx.beginPath();
      ctx.moveTo(50, 75);
      ctx.lineTo(105, 95);
      ctx.lineTo(55, 115);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(206, 75);
      ctx.lineTo(151, 95);
      ctx.lineTo(201, 115);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#1e1e1e';
      ctx.lineWidth = 12;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(128, 115, 65, 0.2 * Math.PI, 0.8 * Math.PI);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(105, 158);
      ctx.lineTo(112, 172);
      ctx.lineTo(119, 158);
      ctx.moveTo(137, 158);
      ctx.lineTo(144, 172);
      ctx.lineTo(151, 158);
      ctx.fill();
      break;

    case 'cyborg':
      // Left eye normal, right robotic glowing red lens
      ctx.fillStyle = '#1e1e1e';
      ctx.beginPath();
      ctx.arc(75, 95, 15, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.roundRect(145, 65, 75, 65, 8);
      ctx.fill();

      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(182, 97, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(178, 93, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(95, 160);
      ctx.lineTo(161, 160);
      ctx.stroke();
      break;

    case 'wink':
      // Left open happy eye, Right winking curve
      ctx.fillStyle = '#1e1e1e';
      ctx.beginPath();
      ctx.arc(75, 95, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(71, 90, 5, 0, Math.PI * 2);
      ctx.fill();

      // Right wink arch
      ctx.strokeStyle = '#1e1e1e';
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(180, 100, 22, 1.1 * Math.PI, 1.9 * Math.PI);
      ctx.stroke();

      // Cheerful open smile
      ctx.beginPath();
      ctx.arc(128, 125, 52, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
      break;

    case 'stare':
      // Giant staring round eyes with tiny pupils + straight line mouth
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(75, 95, 30, 0, Math.PI * 2);
      ctx.arc(181, 95, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#1e1e1e';
      ctx.lineWidth = 6;
      ctx.stroke();

      // Tiny pupils
      ctx.fillStyle = '#1e1e1e';
      ctx.beginPath();
      ctx.arc(75, 95, 8, 0, Math.PI * 2);
      ctx.arc(181, 95, 8, 0, Math.PI * 2);
      ctx.fill();

      // Flat line mouth
      ctx.beginPath();
      ctx.moveTo(95, 165);
      ctx.lineTo(161, 165);
      ctx.stroke();
      break;

    case 'chad':
      // Giga Chad: Chiseled jawline, squinted eyes, handsome smirk
      ctx.fillStyle = '#1e1e1e';
      // Squinted eyes
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(55, 95);
      ctx.lineTo(95, 90);
      ctx.moveTo(161, 90);
      ctx.lineTo(201, 95);
      ctx.stroke();

      // Heavy brows
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.moveTo(50, 75);
      ctx.lineTo(100, 72);
      ctx.moveTo(156, 72);
      ctx.lineTo(206, 75);
      ctx.stroke();

      // Confident smirk
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(130, 130, 45, 0.1 * Math.PI, 0.6 * Math.PI);
      ctx.stroke();

      // Sharp jawline shadow
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(40, 170);
      ctx.lineTo(128, 220);
      ctx.lineTo(216, 170);
      ctx.stroke();
      break;
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(key, texture);
  return texture;
}

/**
 * Generates torso shirt decals with the exact underlying torso color
 * to prevent black transparent artifacts!
 */
export function getShirtTexture(shirt: AvatarShirt, torsoColor: string = '#0284c7'): THREE.CanvasTexture {
  const key = `shirt_${shirt}_${torsoColor}`;
  if (textureCache.has(key)) return textureCache.get(key)!;

  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Fill entire torso front with chosen torso color!
  ctx.fillStyle = torsoColor;
  ctx.fillRect(0, 0, size, size);

  switch (shirt) {
    case 'tuxedo':
      // White shirt triangle, black lapels, red bowtie, 3 buttons
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(70, 0);
      ctx.lineTo(186, 0);
      ctx.lineTo(128, 175);
      ctx.closePath();
      ctx.fill();

      // Black jacket lapels
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(70, 0);
      ctx.lineTo(128, 175);
      ctx.lineTo(0, 256);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(256, 0);
      ctx.lineTo(186, 0);
      ctx.lineTo(128, 175);
      ctx.lineTo(256, 256);
      ctx.closePath();
      ctx.fill();

      // Red bowtie
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(105, 30);
      ctx.lineTo(151, 30);
      ctx.lineTo(105, 60);
      ctx.lineTo(151, 60);
      ctx.closePath();
      ctx.fill();
      ctx.fillRect(123, 40, 10, 10);

      // Buttons
      ctx.fillStyle = '#1e293b';
      [90, 120, 150].forEach((y) => {
        ctx.beginPath();
        ctx.arc(128, y, 5, 0, Math.PI * 2);
        ctx.fill();
      });
      break;

    case 'hoodie':
      // Drawstrings, hoodie front kangaroo pocket
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(110, 10);
      ctx.lineTo(110, 105);
      ctx.moveTo(146, 10);
      ctx.lineTo(146, 105);
      ctx.stroke();

      // Drawstring metal tips
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(106, 105, 8, 12);
      ctx.fillRect(142, 105, 8, 12);

      // Kangaroo pocket
      ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
      ctx.beginPath();
      ctx.moveTo(50, 150);
      ctx.lineTo(206, 150);
      ctx.lineTo(190, 230);
      ctx.lineTo(66, 230);
      ctx.closePath();
      ctx.fill();
      break;

    case 'stripes':
      // Horizontal sporty white and dark stripes
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fillRect(0, 45, size, 26);
      ctx.fillRect(0, 105, size, 26);
      ctx.fillRect(0, 165, size, 26);
      ctx.fillRect(0, 225, size, 26);
      break;

    case 'armor':
      // Knight plate armor seams, rivets, and golden lion crest
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(20, 20, size - 40, size - 40);
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 6;
      ctx.strokeRect(25, 25, size - 50, size - 50);

      // Center gold shield crest
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.arc(128, 90, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(128, 90, 12, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'police':
      // Dark blue tie and golden badge
      ctx.fillStyle = '#1e3a8a';
      ctx.beginPath();
      ctx.moveTo(118, 0);
      ctx.lineTo(138, 0);
      ctx.lineTo(144, 140);
      ctx.lineTo(128, 165);
      ctx.lineTo(112, 140);
      ctx.closePath();
      ctx.fill();

      // Golden star shield badge
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.arc(70, 75, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(70, 75, 9, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'cyber':
      // Glowing neon cyan grid lines and core
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, 80);
      ctx.lineTo(size, 80);
      ctx.moveTo(0, 160);
      ctx.lineTo(size, 160);
      ctx.moveTo(80, 0);
      ctx.lineTo(80, size);
      ctx.moveTo(176, 0);
      ctx.lineTo(176, size);
      ctx.stroke();

      // Glowing center cyber reactor
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.arc(128, 120, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(128, 120, 10, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'ninja':
      // Red sash belt and crossed shurikens
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(0, 160, size, 40);

      // Gold belt buckle
      ctx.fillStyle = '#facc15';
      ctx.fillRect(113, 155, 30, 50);

      // Crossed sash
      ctx.beginPath();
      ctx.moveTo(50, 0);
      ctx.lineTo(90, 0);
      ctx.lineTo(210, 160);
      ctx.lineTo(170, 160);
      ctx.closePath();
      ctx.fill();
      break;

    case 'retro':
      // 8-bit colorful pixel heart logo
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.arc(105, 90, 22, 0, Math.PI * 2);
      ctx.arc(151, 90, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(85, 98);
      ctx.lineTo(171, 98);
      ctx.lineTo(128, 155);
      ctx.closePath();
      ctx.fill();
      break;

    case 'classic':
    default:
      // Subtle vintage seam lines and collar
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(128, 0, 48, 0, Math.PI);
      ctx.stroke();
      break;
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(key, texture);
  return texture;
}

/**
 * Procedural hazard tape / kill brick pattern
 */
export function getHazardTexture(): THREE.CanvasTexture {
  const key = 'hazard_stripes';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#ef4444'; // Red
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = '#1e1e1e'; // Black stripes
  ctx.beginPath();
  for (let i = -size; i < size * 2; i += 32) {
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 16, 0);
    ctx.lineTo(i + 16 + size, size);
    ctx.lineTo(i + size, size);
    ctx.closePath();
  }
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(key, texture);
  return texture;
}
