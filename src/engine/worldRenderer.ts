/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { BrickPart, PartMaterial } from '../types/game';
import { getBaseplateTexture, getHazardTexture, getStudTexture } from './proceduralTextures';

export interface RenderedPart {
  partData: BrickPart;
  mesh: THREE.Mesh;
  boundingBox: THREE.Box3;
  initialPosition: THREE.Vector3;
  initialRotation: THREE.Euler;
  currentVelocity?: THREE.Vector3;
  isPhysicsActive?: boolean;
}

export class WorldRenderer {
  public partsGroup: THREE.Group;
  public renderedParts: Map<string, RenderedPart> = new Map();
  private studTexture: THREE.CanvasTexture;
  private hazardTexture: THREE.CanvasTexture;
  private baseplateTexture: THREE.CanvasTexture;

  constructor(scene: THREE.Scene) {
    this.partsGroup = new THREE.Group();
    this.partsGroup.name = 'world_parts_group';
    scene.add(this.partsGroup);

    this.studTexture = getStudTexture();
    this.hazardTexture = getHazardTexture();
    this.baseplateTexture = getBaseplateTexture();
  }

  public clear() {
    this.renderedParts.forEach((rp) => {
      this.partsGroup.remove(rp.mesh);
      if (rp.mesh.geometry) rp.mesh.geometry.dispose();
      if (Array.isArray(rp.mesh.material)) {
        rp.mesh.material.forEach((m) => m.dispose());
      } else if (rp.mesh.material) {
        rp.mesh.material.dispose();
      }
    });
    this.renderedParts.clear();
  }

  public createPartMesh(part: BrickPart): THREE.Mesh {
    const [sx, sy, sz] = part.size;
    let geom: THREE.BufferGeometry;

    if (part.type === 'cylinder') {
      geom = new THREE.CylinderGeometry(sx / 2, sx / 2, sy, 24);
    } else if (part.type === 'sphere') {
      geom = new THREE.SphereGeometry(Math.max(sx, sy, sz) / 2, 20, 16);
    } else if (part.type === 'wedge') {
      // Right triangle wedge
      const shape = new THREE.Shape();
      shape.moveTo(-sz / 2, -sy / 2);
      shape.lineTo(sz / 2, -sy / 2);
      shape.lineTo(-sz / 2, sy / 2);
      shape.closePath();
      const extrudeSettings = { depth: sx, bevelEnabled: false };
      geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      geom.center();
    } else {
      // Default box for block, kill, bounce, conveyor, checkpoint, spawn
      geom = new THREE.BoxGeometry(sx, sy, sz);
    }

    // Material setup
    const mat = this.createMaterial(part.material, part.color, part.type, part.transparency);

    // Multi-material for boxes with studs on top
    let finalMaterial: THREE.Material | THREE.Material[] = mat;
    if (part.type === 'block' && part.material === 'plastic') {
      const topMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(part.color),
        roughness: 0.35,
        metalness: 0.1,
        map: this.studTexture,
      });
      // Repeat studs based on width/depth
      topMat.map!.repeat.set(Math.max(1, Math.round(sx)), Math.max(1, Math.round(sz)));

      finalMaterial = [
        mat, // right
        mat, // left
        topMat, // top
        mat, // bottom
        mat, // front
        mat, // back
      ];
    } else if (part.type === 'kill') {
      finalMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#dc2626'),
        emissive: new THREE.Color('#ef4444'),
        emissiveIntensity: 0.6,
        roughness: 0.2,
        map: this.hazardTexture,
      });
    } else if (part.type === 'bounce') {
      finalMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#eab308'),
        emissive: new THREE.Color('#facc15'),
        emissiveIntensity: 0.5,
        roughness: 0.2,
      });
    } else if (part.type === 'checkpoint') {
      finalMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#10b981'),
        emissive: new THREE.Color('#34d399'),
        emissiveIntensity: 0.6,
        roughness: 0.2,
        transparent: true,
        opacity: 0.85,
      });
    }

    const mesh = new THREE.Mesh(geom, finalMaterial);
    mesh.position.set(...part.position);
    mesh.rotation.set(...part.rotation);
    mesh.castShadow = part.material !== 'glass' && (part.transparency || 0) < 0.5;
    mesh.receiveShadow = true;
    mesh.userData = { partId: part.id, partData: part };

    return mesh;
  }

  private createMaterial(
    type: PartMaterial,
    colorHex: string,
    partType: BrickPart['type'],
    transparency?: number
  ): THREE.Material {
    const color = new THREE.Color(colorHex);

    if (partType === 'kill' || type === 'neon') {
      return new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.8,
        roughness: 0.1,
      });
    }

    if (type === 'glass') {
      return new THREE.MeshStandardMaterial({
        color,
        roughness: 0.1,
        metalness: 0.1,
        transparent: true,
        opacity: transparency !== undefined ? 1 - transparency : 0.45,
      });
    }

    if (type === 'metal') {
      return new THREE.MeshStandardMaterial({
        color,
        roughness: 0.2,
        metalness: 0.85,
      });
    }

    if (type === 'wood') {
      return new THREE.MeshStandardMaterial({
        color,
        roughness: 0.85,
        metalness: 0.05,
      });
    }

    // Default plastic
    return new THREE.MeshStandardMaterial({
      color,
      roughness: 0.4,
      metalness: 0.1,
    });
  }

  public loadWorld(parts: BrickPart[]) {
    this.clear();
    parts.forEach((p) => {
      this.addPart(p);
    });
  }

  public addPart(part: BrickPart): RenderedPart {
    const mesh = this.createPartMesh(part);
    this.partsGroup.add(mesh);

    const boundingBox = new THREE.Box3().setFromObject(mesh);
    const rendered: RenderedPart = {
      partData: part,
      mesh,
      boundingBox,
      initialPosition: mesh.position.clone(),
      initialRotation: mesh.rotation.clone(),
    };
    this.renderedParts.set(part.id, rendered);
    return rendered;
  }

  public removePart(partId: string) {
    const rendered = this.renderedParts.get(partId);
    if (!rendered) return;
    this.partsGroup.remove(rendered.mesh);
    if (rendered.mesh.geometry) rendered.mesh.geometry.dispose();
    this.renderedParts.delete(partId);
  }

  public updatePartTransform(partId: string, pos?: THREE.Vector3, rot?: THREE.Euler, size?: THREE.Vector3) {
    const rendered = this.renderedParts.get(partId);
    if (!rendered) return;
    if (pos) rendered.mesh.position.copy(pos);
    if (rot) rendered.mesh.rotation.copy(rot);
    if (size) {
      // Re-create mesh geometry for updated size
      rendered.partData.size = [size.x, size.y, size.z];
      const newMesh = this.createPartMesh(rendered.partData);
      this.partsGroup.remove(rendered.mesh);
      this.partsGroup.add(newMesh);
      rendered.mesh = newMesh;
    }
    rendered.boundingBox.setFromObject(rendered.mesh);
  }

  /**
   * Collision resolution for player movement:
   * Moves player box and resolves AABB intersections with collidable parts
   */
  public checkPlayerCollision(
    playerPos: THREE.Vector3,
    playerRadius: number,
    playerHeight: number
  ): {
    correctedPos: THREE.Vector3;
    isGrounded: boolean;
    groundPart?: RenderedPart;
    standingOnKill: boolean;
    standingOnBounce: boolean;
    bounceForce?: number;
    standingOnCheckpoint?: number;
    conveyorSpeed?: [number, number];
  } {
    const correctedPos = playerPos.clone();
    let isGrounded = false;
    let groundPart: RenderedPart | undefined;
    let standingOnKill = false;
    let standingOnBounce = false;
    let bounceForce: number | undefined;
    let standingOnCheckpoint: number | undefined;
    let conveyorSpeed: [number, number] | undefined;

    // Player AABB
    const pMinX = correctedPos.x - playerRadius;
    const pMaxX = correctedPos.x + playerRadius;
    const pMinZ = correctedPos.z - playerRadius;
    const pMaxZ = correctedPos.z + playerRadius;
    const pMinY = correctedPos.y;
    const pMaxY = correctedPos.y + playerHeight;

    // Check downward ground support
    this.renderedParts.forEach((rp) => {
      if (!rp.partData.canCollide && rp.partData.type !== 'checkpoint') return;
      const box = rp.boundingBox;

      // Check horizontal overlap
      if (pMaxX > box.min.x && pMinX < box.max.x && pMaxZ > box.min.z && pMinZ < box.max.z) {
        // Check if player feet are just above or touching top face
        const feetY = correctedPos.y;
        if (feetY >= box.max.y - 0.45 && feetY <= box.max.y + 0.35) {
          correctedPos.y = box.max.y;
          isGrounded = true;
          groundPart = rp;

          if (rp.partData.type === 'kill') {
            standingOnKill = true;
          } else if (rp.partData.type === 'bounce') {
            standingOnBounce = true;
            bounceForce = rp.partData.metadata?.bounceForce || 28;
          } else if (rp.partData.type === 'checkpoint') {
            standingOnCheckpoint = rp.partData.metadata?.checkpointIndex ?? 1;
          }

          if (rp.partData.metadata?.conveyorSpeed) {
            conveyorSpeed = rp.partData.metadata.conveyorSpeed;
          }
        }
      }
    });

    // Side wall push-out resolution
    this.renderedParts.forEach((rp) => {
      if (!rp.partData.canCollide) return;
      const box = rp.boundingBox;

      // Vertical overlap
      const pTop = correctedPos.y + playerHeight;
      const pBot = correctedPos.y;
      if (pTop > box.min.y + 0.3 && pBot < box.max.y - 0.3) {
        // Horizontal overlap check
        if (
          correctedPos.x + playerRadius > box.min.x &&
          correctedPos.x - playerRadius < box.max.x &&
          correctedPos.z + playerRadius > box.min.z &&
          correctedPos.z - playerRadius < box.max.z
        ) {
          // Determine penetration depth on 4 sides
          const pushLeft = correctedPos.x + playerRadius - box.min.x;
          const pushRight = box.max.x - (correctedPos.x - playerRadius);
          const pushBack = correctedPos.z + playerRadius - box.min.z;
          const pushFront = box.max.z - (correctedPos.z - playerRadius);

          const minPush = Math.min(pushLeft, pushRight, pushBack, pushFront);
          if (minPush === pushLeft) correctedPos.x -= pushLeft;
          else if (minPush === pushRight) correctedPos.x += pushRight;
          else if (minPush === pushBack) correctedPos.z -= pushBack;
          else if (minPush === pushFront) correctedPos.z += pushFront;
        }
      }
    });

    return {
      correctedPos,
      isGrounded,
      groundPart,
      standingOnKill,
      standingOnBounce,
      bounceForce,
      standingOnCheckpoint,
      conveyorSpeed,
    };
  }

  // Update dynamic moving / physics parts (e.g. disaster debris, moving platforms)
  public updatePhysics(delta: number, disasterActive?: boolean, tornadoPos?: THREE.Vector3) {
    this.renderedParts.forEach((rp) => {
      if (!rp.partData.anchored) {
        if (!rp.currentVelocity) rp.currentVelocity = new THREE.Vector3();

        // Gravity
        rp.currentVelocity.y -= 25 * delta;

        // Tornado pull if disaster active
        if (disasterActive && tornadoPos) {
          const dist = rp.mesh.position.distanceTo(tornadoPos);
          if (dist < 40) {
            const pull = tornadoPos.clone().sub(rp.mesh.position).normalize();
            rp.currentVelocity.addScaledVector(pull, (40 - dist) * 1.5 * delta);
            rp.currentVelocity.y += (40 - dist) * 1.2 * delta; // swirl upward
            rp.mesh.rotation.x += delta * 2;
            rp.mesh.rotation.y += delta * 3;
          }
        }

        rp.mesh.position.addScaledVector(rp.currentVelocity, delta);

        // Ground floor bounce/stop at Y=0
        if (rp.mesh.position.y < rp.partData.size[1] / 2) {
          rp.mesh.position.y = rp.partData.size[1] / 2;
          rp.currentVelocity.y *= -0.3; // bounce
          rp.currentVelocity.x *= 0.8; // friction
          rp.currentVelocity.z *= 0.8;
        }

        rp.boundingBox.setFromObject(rp.mesh);
      }
    });
  }
}
