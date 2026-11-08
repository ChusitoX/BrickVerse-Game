/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { AvatarConfig } from '../types/game';
import { getFaceTexture, getShirtTexture, getStudTexture } from './proceduralTextures';

export type EmoteType = 'none' | 'breakdance' | 'wave' | 'backflip' | 'robot';
export type EquippedItemType =
  | 'none'
  | 'sword'
  | 'speed_coil'
  | 'gravity_coil'
  | 'slap_hand'
  | 'paintball_gun'
  | 'boombox';

export interface CharacterRig {
  root: THREE.Group;
  head: THREE.Group;
  torso: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  rightHandItem: THREE.Group;
  updateAnimation: (
    velocity: THREE.Vector3,
    isGrounded: boolean,
    isJumping: boolean,
    attackProgress: number,
    delta: number
  ) => void;
  setEquippedItem: (itemType: EquippedItemType) => void;
  playEmote: (emote: EmoteType) => void;
  currentEmote: EmoteType;
  updateConfig: (config: AvatarConfig) => void;
}

export function buildCharacter(config: AvatarConfig): CharacterRig {
  const root = new THREE.Group();
  root.name = 'player_character';

  const studTex = getStudTexture();

  const makePlastic = (colorHex: string) => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(colorHex),
      roughness: 0.35,
      metalness: 0.1,
      bumpMap: studTex,
      bumpScale: 0.04,
    });
  };

  const studGeom = new THREE.CylinderGeometry(0.2, 0.2, 0.12, 12);
  const studMat = (colorHex: string) =>
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(colorHex),
      roughness: 0.35,
      metalness: 0.1,
    });

  // 1. Torso
  const torsoGroup = new THREE.Group();
  torsoGroup.position.set(0, 2.0, 0);
  root.add(torsoGroup);

  const torsoGeom = new THREE.BoxGeometry(2.0, 2.0, 1.0);
  const torsoMat = makePlastic(config.torsoColor);

  // Torso front face with shirt decal (texture has background matched to torsoColor)
  const shirtTex = getShirtTexture(config.shirtPattern, config.torsoColor);
  const torsoFrontMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.35,
    metalness: 0.1,
    map: shirtTex,
  });
  const torsoMaterials = [torsoMat, torsoMat, torsoMat, torsoMat, torsoFrontMat, torsoMat];
  const torsoMesh = new THREE.Mesh(torsoGeom, torsoMaterials);
  torsoMesh.castShadow = true;
  torsoMesh.receiveShadow = true;
  torsoGroup.add(torsoMesh);

  // Top studs on Torso
  const studLeft = new THREE.Mesh(studGeom, studMat(config.torsoColor));
  studLeft.position.set(-0.5, 1.06, 0);
  torsoGroup.add(studLeft);
  const studRight = new THREE.Mesh(studGeom, studMat(config.torsoColor));
  studRight.position.set(0.5, 1.06, 0);
  torsoGroup.add(studRight);

  // 2. Head
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.6, 0);
  torsoGroup.add(headGroup);

  const headGeom = new THREE.BoxGeometry(1.2, 1.2, 1.2);
  const headMat = makePlastic(config.headColor);
  const faceTex = getFaceTexture(config.face, config.headColor);
  const headFrontMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.35,
    metalness: 0.1,
    map: faceTex,
  });
  const headMaterials = [headMat, headMat, headMat, headMat, headFrontMat, headMat];
  const headMesh = new THREE.Mesh(headGeom, headMaterials);
  headMesh.castShadow = true;
  headMesh.receiveShadow = true;
  headGroup.add(headMesh);

  const headStud = new THREE.Mesh(studGeom, studMat(config.headColor));
  headStud.position.set(0, 0.66, 0);
  headGroup.add(headStud);

  // 3. Left Arm
  const leftArmPivot = new THREE.Group();
  leftArmPivot.position.set(-1.5, 0.8, 0);
  torsoGroup.add(leftArmPivot);

  const armGeom = new THREE.BoxGeometry(1.0, 2.0, 1.0);
  const leftArmMat = makePlastic(config.leftArmColor);
  const leftArmMesh = new THREE.Mesh(armGeom, leftArmMat);
  leftArmMesh.position.set(0, -0.8, 0);
  leftArmMesh.castShadow = true;
  leftArmPivot.add(leftArmMesh);

  // 4. Right Arm
  const rightArmPivot = new THREE.Group();
  rightArmPivot.position.set(1.5, 0.8, 0);
  torsoGroup.add(rightArmPivot);

  const rightArmMat = makePlastic(config.rightArmColor);
  const rightArmMesh = new THREE.Mesh(armGeom, rightArmMat);
  rightArmMesh.position.set(0, -0.8, 0);
  rightArmMesh.castShadow = true;
  rightArmPivot.add(rightArmMesh);

  const rightHandItem = new THREE.Group();
  rightHandItem.position.set(0, -1.8, 0.4);
  rightArmPivot.add(rightHandItem);

  // 5. Left Leg
  const leftLegPivot = new THREE.Group();
  leftLegPivot.position.set(-0.5, 1.0, 0);
  root.add(leftLegPivot);

  const legGeom = new THREE.BoxGeometry(1.0, 2.0, 1.0);
  const leftLegMat = makePlastic(config.leftLegColor);
  const leftLegMesh = new THREE.Mesh(legGeom, leftLegMat);
  leftLegMesh.position.set(0, -1.0, 0);
  leftLegMesh.castShadow = true;
  leftLegMesh.receiveShadow = true;
  leftLegPivot.add(leftLegMesh);

  // 6. Right Leg
  const rightLegPivot = new THREE.Group();
  rightLegPivot.position.set(0.5, 1.0, 0);
  root.add(rightLegPivot);

  const rightLegMat = makePlastic(config.rightLegColor);
  const rightLegMesh = new THREE.Mesh(legGeom, rightLegMat);
  rightLegMesh.position.set(0, -1.0, 0);
  rightLegMesh.castShadow = true;
  rightLegMesh.receiveShadow = true;
  rightLegPivot.add(rightLegMesh);

  // Accessories Containers
  const hatContainer = new THREE.Group();
  headGroup.add(hatContainer);

  const backContainer = new THREE.Group();
  torsoGroup.add(backContainer);

  function attachHat(hat: AvatarConfig['hat']) {
    while (hatContainer.children.length > 0) {
      hatContainer.remove(hatContainer.children[0]);
    }

    if (hat === 'cap') {
      const capGroup = new THREE.Group();
      capGroup.position.set(0, 0.6, 0);
      const capCrown = new THREE.Mesh(
        new THREE.CylinderGeometry(0.68, 0.68, 0.35, 16),
        new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.5 })
      );
      capGroup.add(capCrown);
      const visor = new THREE.Mesh(
        new THREE.BoxGeometry(0.9, 0.08, 0.6),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 })
      );
      visor.position.set(0, -0.1, 0.65);
      capGroup.add(visor);
      hatContainer.add(capGroup);
    } else if (hat === 'fedora') {
      const fedoraGroup = new THREE.Group();
      fedoraGroup.position.set(0, 0.65, 0);
      const brim = new THREE.Mesh(
        new THREE.CylinderGeometry(1.05, 1.05, 0.08, 20),
        new THREE.MeshStandardMaterial({ color: 0x1e1e1e, roughness: 0.6 })
      );
      fedoraGroup.add(brim);
      const crown = new THREE.Mesh(
        new THREE.CylinderGeometry(0.55, 0.65, 0.5, 16),
        new THREE.MeshStandardMaterial({ color: 0x1e1e1e, roughness: 0.6 })
      );
      crown.position.set(0, 0.28, 0);
      fedoraGroup.add(crown);
      const band = new THREE.Mesh(
        new THREE.CylinderGeometry(0.66, 0.66, 0.12, 16),
        new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.4 })
      );
      band.position.set(0, 0.1, 0);
      fedoraGroup.add(band);
      hatContainer.add(fedoraGroup);
    } else if (hat === 'headphones') {
      const hpGroup = new THREE.Group();
      hpGroup.position.set(0, 0.1, 0);
      const band = new THREE.Mesh(
        new THREE.TorusGeometry(0.72, 0.08, 8, 20, Math.PI),
        new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 })
      );
      band.rotation.z = Math.PI;
      band.position.set(0, 0.5, 0);
      hpGroup.add(band);
      const cupGeom = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 16);
      const cupMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 });
      const leftCup = new THREE.Mesh(cupGeom, cupMat);
      leftCup.rotation.z = Math.PI / 2;
      leftCup.position.set(-0.68, 0, 0);
      hpGroup.add(leftCup);
      const rightCup = new THREE.Mesh(cupGeom, cupMat);
      rightCup.rotation.z = Math.PI / 2;
      rightCup.position.set(0.68, 0, 0);
      hpGroup.add(rightCup);
      hatContainer.add(hpGroup);
    } else if (hat === 'valkyrie') {
      const helmGroup = new THREE.Group();
      helmGroup.position.set(0, 0.6, 0);
      const helm = new THREE.Mesh(
        new THREE.BoxGeometry(1.3, 0.3, 1.3),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8, roughness: 0.2 })
      );
      helmGroup.add(helm);
      const wingGeom = new THREE.ConeGeometry(0.25, 0.9, 4);
      const wingMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
      const leftWing = new THREE.Mesh(wingGeom, wingMat);
      leftWing.position.set(-0.75, 0.4, 0);
      leftWing.rotation.z = -0.4;
      helmGroup.add(leftWing);
      const rightWing = new THREE.Mesh(wingGeom, wingMat);
      rightWing.position.set(0.75, 0.4, 0);
      rightWing.rotation.z = 0.4;
      helmGroup.add(rightWing);
      hatContainer.add(helmGroup);
    } else if (hat === 'crown') {
      const crownGroup = new THREE.Group();
      crownGroup.position.set(0, 0.7, 0);
      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.65, 0.65, 0.2, 16),
        new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.85, roughness: 0.15 })
      );
      crownGroup.add(base);
      for (let i = 0; i < 5; i++) {
        const spike = new THREE.Mesh(
          new THREE.ConeGeometry(0.12, 0.35, 4),
          new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.85, roughness: 0.15 })
        );
        const angle = (i / 5) * Math.PI * 2;
        spike.position.set(Math.cos(angle) * 0.55, 0.25, Math.sin(angle) * 0.55);
        crownGroup.add(spike);
      }
      hatContainer.add(crownGroup);
    } else if (hat === 'ninja') {
      const ninjaGroup = new THREE.Group();
      ninjaGroup.position.set(0, 0.3, 0);
      const band = new THREE.Mesh(
        new THREE.BoxGeometry(1.3, 0.25, 1.3),
        new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.4 })
      );
      ninjaGroup.add(band);
      // Knot ribbons behind
      const knot = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.7, 0.1),
        new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.4 })
      );
      knot.position.set(0, -0.2, -0.7);
      knot.rotation.z = 0.2;
      ninjaGroup.add(knot);
      hatContainer.add(ninjaGroup);
    } else if (hat === 'halo') {
      const haloGroup = new THREE.Group();
      haloGroup.position.set(0, 0.95, 0);
      const halo = new THREE.Mesh(
        new THREE.TorusGeometry(0.65, 0.07, 8, 24),
        new THREE.MeshStandardMaterial({
          color: 0xfef08a,
          emissive: 0xfef08a,
          emissiveIntensity: 0.8,
          metalness: 0.5,
        })
      );
      halo.rotation.x = Math.PI / 2;
      haloGroup.add(halo);
      hatContainer.add(haloGroup);
    } else if (hat === 'viking') {
      const vikGroup = new THREE.Group();
      vikGroup.position.set(0, 0.6, 0);
      const cap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.7, 0.7, 0.3, 16),
        new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 })
      );
      vikGroup.add(cap);
      // Horns
      const hornGeom = new THREE.ConeGeometry(0.18, 0.8, 8);
      const hornMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7 });
      const leftHorn = new THREE.Mesh(hornGeom, hornMat);
      leftHorn.position.set(-0.7, 0.4, 0);
      leftHorn.rotation.z = -0.8;
      vikGroup.add(leftHorn);
      const rightHorn = new THREE.Mesh(hornGeom, hornMat);
      rightHorn.position.set(0.7, 0.4, 0);
      rightHorn.rotation.z = 0.8;
      vikGroup.add(rightHorn);
      hatContainer.add(vikGroup);
    }
  }

  function attachBackAccessory(acc: AvatarConfig['backAccessory']) {
    while (backContainer.children.length > 0) {
      backContainer.remove(backContainer.children[0]);
    }

    if (acc === 'sword') {
      const swordBack = new THREE.Group();
      swordBack.position.set(0, 0.2, -0.6);
      swordBack.rotation.z = 0.7;

      const scabbard = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 2.2, 0.15),
        new THREE.MeshStandardMaterial({ color: 0x1e1e1e, roughness: 0.4 })
      );
      swordBack.add(scabbard);
      const guard = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 0.08, 0.25),
        new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.8, roughness: 0.2 })
      );
      guard.position.set(0, 1.1, 0);
      swordBack.add(guard);
      const hilt = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 0.7, 8),
        new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.5 })
      );
      hilt.position.set(0, 1.5, 0);
      swordBack.add(hilt);
      backContainer.add(swordBack);
    } else if (acc === 'wings') {
      const wingsGroup = new THREE.Group();
      wingsGroup.position.set(0, 0.2, -0.6);
      const wingMat = new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        emissive: 0x06b6d4,
        emissiveIntensity: 0.5,
        roughness: 0.1,
      });
      const wingGeom = new THREE.BoxGeometry(1.6, 0.8, 0.08);
      const leftWing = new THREE.Mesh(wingGeom, wingMat);
      leftWing.position.set(-1.0, 0.3, 0);
      leftWing.rotation.z = 0.3;
      leftWing.rotation.y = -0.2;
      wingsGroup.add(leftWing);
      const rightWing = new THREE.Mesh(wingGeom, wingMat);
      rightWing.position.set(1.0, 0.3, 0);
      rightWing.rotation.z = -0.3;
      rightWing.rotation.y = 0.2;
      wingsGroup.add(rightWing);
      backContainer.add(wingsGroup);
    } else if (acc === 'dragon_wings') {
      const dwGroup = new THREE.Group();
      dwGroup.position.set(0, 0.2, -0.6);
      const wingMat = new THREE.MeshStandardMaterial({
        color: 0xdc2626,
        emissive: 0x7f1d1d,
        emissiveIntensity: 0.6,
        roughness: 0.2,
      });
      const leftWing = new THREE.Mesh(new THREE.ConeGeometry(0.6, 2.0, 3), wingMat);
      leftWing.position.set(-1.2, 0.5, 0);
      leftWing.rotation.z = -1.1;
      dwGroup.add(leftWing);
      const rightWing = new THREE.Mesh(new THREE.ConeGeometry(0.6, 2.0, 3), wingMat);
      rightWing.position.set(1.2, 0.5, 0);
      rightWing.rotation.z = 1.1;
      dwGroup.add(rightWing);
      backContainer.add(dwGroup);
    } else if (acc === 'jetpack') {
      const jpGroup = new THREE.Group();
      jpGroup.position.set(0, 0, -0.7);
      const tankGeom = new THREE.CylinderGeometry(0.25, 0.25, 1.5, 16);
      const tankMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7, roughness: 0.3 });
      const leftTank = new THREE.Mesh(tankGeom, tankMat);
      leftTank.position.set(-0.45, 0, 0);
      jpGroup.add(leftTank);
      const rightTank = new THREE.Mesh(tankGeom, tankMat);
      rightTank.position.set(0.45, 0, 0);
      jpGroup.add(rightTank);
      const nozzleGeom = new THREE.ConeGeometry(0.22, 0.35, 12);
      const nozzleMat = new THREE.MeshStandardMaterial({
        color: 0xf97316,
        emissive: 0xf97316,
        emissiveIntensity: 0.6,
      });
      const leftNozzle = new THREE.Mesh(nozzleGeom, nozzleMat);
      leftNozzle.position.set(-0.45, -0.85, 0);
      leftNozzle.rotation.x = Math.PI;
      jpGroup.add(leftNozzle);
      const rightNozzle = new THREE.Mesh(nozzleGeom, nozzleMat);
      rightNozzle.position.set(0.45, -0.85, 0);
      rightNozzle.rotation.x = Math.PI;
      jpGroup.add(rightNozzle);
      backContainer.add(jpGroup);
    } else if (acc === 'skateboard') {
      const sbGroup = new THREE.Group();
      sbGroup.position.set(0, 0.1, -0.65);
      sbGroup.rotation.z = 0.5;
      const deck = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 2.2, 0.08),
        new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.3 })
      );
      sbGroup.add(deck);
      backContainer.add(sbGroup);
    } else if (acc === 'boombox') {
      const bbGroup = new THREE.Group();
      bbGroup.position.set(0, 0, -0.7);
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.9, 0.4),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.5 })
      );
      bbGroup.add(body);
      // Two neon speakers
      const spkGeom = new THREE.CylinderGeometry(0.25, 0.25, 0.08, 16);
      const spkMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x06b6d4, emissiveIntensity: 0.6 });
      const spkL = new THREE.Mesh(spkGeom, spkMat);
      spkL.rotation.x = Math.PI / 2;
      spkL.position.set(-0.45, 0, 0.2);
      bbGroup.add(spkL);
      const spkR = new THREE.Mesh(spkGeom, spkMat);
      spkR.rotation.x = Math.PI / 2;
      spkR.position.set(0.45, 0, 0.2);
      bbGroup.add(spkR);
      backContainer.add(bbGroup);
    }
  }

  attachHat(config.hat);
  attachBackAccessory(config.backAccessory);

  function setEquippedItem(itemType: EquippedItemType) {
    while (rightHandItem.children.length > 0) {
      rightHandItem.remove(rightHandItem.children[0]);
    }

    if (itemType === 'sword') {
      const sword = new THREE.Group();
      sword.rotation.x = Math.PI / 2;
      const blade = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 1.8, 0.05),
        new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.15 })
      );
      blade.position.set(0, 0.9, 0);
      sword.add(blade);
      const guard = new THREE.Mesh(
        new THREE.BoxGeometry(0.45, 0.08, 0.15),
        new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.8, roughness: 0.2 })
      );
      guard.position.set(0, 0.02, 0);
      sword.add(guard);
      const grip = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, 0.5, 8),
        new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.5 })
      );
      grip.position.set(0, -0.25, 0);
      sword.add(grip);
      rightHandItem.add(sword);
    } else if (itemType === 'speed_coil' || itemType === 'gravity_coil') {
      const isSpeed = itemType === 'speed_coil';
      const coilColor = isSpeed ? 0x0284c7 : 0xa855f7;
      const coilGroup = new THREE.Group();
      const spring = new THREE.Mesh(
        new THREE.TorusGeometry(0.28, 0.07, 8, 24),
        new THREE.MeshStandardMaterial({
          color: coilColor,
          emissive: coilColor,
          emissiveIntensity: 0.6,
          metalness: 0.4,
          roughness: 0.2,
        })
      );
      coilGroup.add(spring);
      rightHandItem.add(coilGroup);
    } else if (itemType === 'slap_hand') {
      const handGroup = new THREE.Group();
      handGroup.rotation.x = Math.PI / 2;
      const hand = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.8, 0.1),
        new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xeab308, emissiveIntensity: 0.3 })
      );
      hand.position.set(0, 0.5, 0);
      handGroup.add(hand);
      rightHandItem.add(handGroup);
    } else if (itemType === 'paintball_gun') {
      const gunGroup = new THREE.Group();
      gunGroup.rotation.x = Math.PI / 2;
      const barrel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 1.0, 12),
        new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8 })
      );
      barrel.position.set(0, 0.5, 0);
      gunGroup.add(barrel);
      const hopper = new THREE.Mesh(
        new THREE.SphereGeometry(0.25, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x16a34a, emissiveIntensity: 0.4 })
      );
      hopper.position.set(0, 0.6, 0.25);
      gunGroup.add(hopper);
      rightHandItem.add(gunGroup);
    } else if (itemType === 'boombox') {
      const bbInHand = new THREE.Group();
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.7, 0.4),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6 })
      );
      bbInHand.add(box);
      rightHandItem.add(bbInHand);
    }
  }

  // Emotes State
  let activeEmote: EmoteType = 'none';
  let emoteTime = 0;

  function playEmote(emote: EmoteType) {
    activeEmote = emote;
    emoteTime = 0;
  }

  let walkCycleTime = 0;

  const updateAnimation = (
    velocity: THREE.Vector3,
    isGrounded: boolean,
    isJumping: boolean,
    attackProgress: number,
    delta: number
  ) => {
    const horizontalSpeed = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z);

    // If player starts moving, cancel emote
    if (horizontalSpeed > 0.1 || isJumping) {
      activeEmote = 'none';
    }

    if (activeEmote !== 'none') {
      emoteTime += delta;
      if (activeEmote === 'breakdance') {
        // Spin root and kick legs
        root.rotation.y += delta * 10;
        leftLegPivot.rotation.x = Math.sin(emoteTime * 12) * 1.2;
        rightLegPivot.rotation.x = -Math.sin(emoteTime * 12) * 1.2;
        leftArmPivot.rotation.z = -1.2;
        rightArmPivot.rotation.z = 1.2;
        torsoGroup.position.y = 1.6 + Math.abs(Math.sin(emoteTime * 8)) * 0.4;
      } else if (activeEmote === 'wave') {
        // Cheerful wave with right hand
        rightArmPivot.rotation.x = -2.2;
        rightArmPivot.rotation.z = Math.sin(emoteTime * 8) * 0.4;
        leftArmPivot.rotation.x = THREE.MathUtils.damp(leftArmPivot.rotation.x, 0, 10, delta);
        leftLegPivot.rotation.x = 0;
        rightLegPivot.rotation.x = 0;
      } else if (activeEmote === 'backflip') {
        // 360 degree backflip
        const flipProgress = (emoteTime % 1.2) / 1.2;
        torsoGroup.rotation.x = -flipProgress * Math.PI * 2;
        torsoGroup.position.y = 2.0 + Math.sin(flipProgress * Math.PI) * 2.0;
        leftLegPivot.rotation.x = -0.5;
        rightLegPivot.rotation.x = -0.5;
      } else if (activeEmote === 'robot') {
        // Stiff robotic angular movements
        const step = Math.floor(emoteTime * 4) % 4;
        rightArmPivot.rotation.x = step === 0 ? -1.5 : step === 1 ? -0.5 : 0;
        leftArmPivot.rotation.x = step === 2 ? -1.5 : step === 3 ? -0.5 : 0;
        headGroup.rotation.y = step % 2 === 0 ? 0.4 : -0.4;
      }
      return;
    }

    // Reset torso flip from backflip if any
    torsoGroup.rotation.x = THREE.MathUtils.damp(torsoGroup.rotation.x, 0, 12, delta);

    if (isGrounded && horizontalSpeed > 0.1) {
      walkCycleTime += delta * horizontalSpeed * 1.8;
      const swing = Math.sin(walkCycleTime) * 0.7;

      leftLegPivot.rotation.x = swing;
      rightLegPivot.rotation.x = -swing;
      leftArmPivot.rotation.x = -swing * 0.8;

      if (attackProgress <= 0) {
        rightArmPivot.rotation.x = swing * 0.8;
        rightArmPivot.rotation.z = 0;
      }
      torsoGroup.position.y = 2.0 + Math.abs(Math.sin(walkCycleTime * 2)) * 0.12;
    } else if (!isGrounded || isJumping) {
      leftLegPivot.rotation.x = -0.35;
      rightLegPivot.rotation.x = -0.2;
      leftArmPivot.rotation.x = -0.9;
      if (attackProgress <= 0) {
        rightArmPivot.rotation.x = -0.9;
      }
      torsoGroup.position.y = 2.0;
    } else {
      leftLegPivot.rotation.x = THREE.MathUtils.damp(leftLegPivot.rotation.x, 0, 10, delta);
      rightLegPivot.rotation.x = THREE.MathUtils.damp(rightLegPivot.rotation.x, 0, 10, delta);
      leftArmPivot.rotation.x = THREE.MathUtils.damp(leftArmPivot.rotation.x, 0, 10, delta);
      leftArmPivot.rotation.z = THREE.MathUtils.damp(leftArmPivot.rotation.z, 0, 10, delta);
      torsoGroup.position.y = THREE.MathUtils.damp(torsoGroup.position.y, 2.0, 10, delta);

      if (attackProgress <= 0) {
        rightArmPivot.rotation.x = THREE.MathUtils.damp(rightArmPivot.rotation.x, 0, 10, delta);
        rightArmPivot.rotation.z = THREE.MathUtils.damp(rightArmPivot.rotation.z, 0, 10, delta);
      }
    }

    if (attackProgress > 0 && attackProgress <= 1.0) {
      const swingPhase = Math.sin(attackProgress * Math.PI);
      rightArmPivot.rotation.x = -1.2 + swingPhase * 2.2;
      rightArmPivot.rotation.y = swingPhase * 0.4;
      rightArmPivot.rotation.z = -0.2;
    }
  };

  const updateConfig = (newConfig: AvatarConfig) => {
    // Update head
    headMesh.material[0].color.set(newConfig.headColor);
    headMesh.material[1].color.set(newConfig.headColor);
    headMesh.material[2].color.set(newConfig.headColor);
    headMesh.material[3].color.set(newConfig.headColor);
    // Face front face: Color is 0xffffff, map is generated with newConfig.headColor
    headMesh.material[4].color.set(0xffffff);
    (headMesh.material[4] as THREE.MeshStandardMaterial).map = getFaceTexture(newConfig.face, newConfig.headColor);
    headMesh.material[4].needsUpdate = true;
    headMesh.material[5].color.set(newConfig.headColor);
    headStud.material.color.set(newConfig.headColor);

    // Update torso
    torsoMesh.material[0].color.set(newConfig.torsoColor);
    torsoMesh.material[1].color.set(newConfig.torsoColor);
    torsoMesh.material[2].color.set(newConfig.torsoColor);
    torsoMesh.material[3].color.set(newConfig.torsoColor);
    // Shirt front face: Color is 0xffffff, map is generated with newConfig.torsoColor
    torsoMesh.material[4].color.set(0xffffff);
    (torsoMesh.material[4] as THREE.MeshStandardMaterial).map = getShirtTexture(newConfig.shirtPattern, newConfig.torsoColor);
    torsoMesh.material[4].needsUpdate = true;
    torsoMesh.material[5].color.set(newConfig.torsoColor);
    studLeft.material.color.set(newConfig.torsoColor);
    studRight.material.color.set(newConfig.torsoColor);

    // Update limbs
    leftArmMesh.material.color.set(newConfig.leftArmColor);
    rightArmMesh.material.color.set(newConfig.rightArmColor);
    leftLegMesh.material.color.set(newConfig.leftLegColor);
    rightLegMesh.material.color.set(newConfig.rightLegColor);

    attachHat(newConfig.hat);
    attachBackAccessory(newConfig.backAccessory);
  };

  return {
    root,
    head: headGroup,
    torso: torsoGroup,
    leftArm: leftArmPivot,
    rightArm: rightArmPivot,
    leftLeg: leftLegPivot,
    rightLeg: rightLegPivot,
    rightHandItem,
    updateAnimation,
    setEquippedItem,
    playEmote,
    get currentEmote() {
      return activeEmote;
    },
    updateConfig,
  };
}
