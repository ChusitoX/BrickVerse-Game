/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

export class CameraController {
  public camera: THREE.PerspectiveCamera;
  public targetPos: THREE.Vector3 = new THREE.Vector3();
  public currentPos: THREE.Vector3 = new THREE.Vector3();

  // Orbital angles in radians
  public yaw: number = 0; // horizontal angle
  public pitch: number = 0.35; // vertical angle (radians)
  public distance: number = 14; // distance from player

  public minDistance: number = 3.5;
  public maxDistance: number = 40;
  public minPitch: number = -0.2; // can look slightly upward
  public maxPitch: number = 1.45; // almost top-down

  public isDragging: boolean = false;
  private prevMouseX: number = 0;
  private prevMouseY: number = 0;
  public sensitivity: number = 1.0;
  public invertY: boolean = false;

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
    this.currentPos.copy(camera.position);
  }

  public onPointerDown(e: MouseEvent | Touch, isRightClickOrTouch: boolean) {
    if (isRightClickOrTouch) {
      this.isDragging = true;
      this.prevMouseX = e.clientX;
      this.prevMouseY = e.clientY;
    }
  }

  public onPointerMove(e: MouseEvent | Touch) {
    if (!this.isDragging) return;
    const dx = e.clientX - this.prevMouseX;
    const dy = e.clientY - this.prevMouseY;
    this.prevMouseX = e.clientX;
    this.prevMouseY = e.clientY;

    const sensFactor = 0.005 * this.sensitivity;
    this.yaw -= dx * sensFactor;

    const yFactor = this.invertY ? -sensFactor : sensFactor;
    this.pitch += dy * yFactor;
    this.pitch = Math.max(this.minPitch, Math.min(this.maxPitch, this.pitch));
  }

  public isFirstPerson: boolean = false;
  private savedThirdPersonDistance: number = 14;

  public togglePerspective(): boolean {
    this.isFirstPerson = !this.isFirstPerson;
    if (this.isFirstPerson) {
      this.savedThirdPersonDistance = Math.max(6, this.distance);
      this.minDistance = 0.5;
      this.distance = 0.5;
    } else {
      this.minDistance = 3.5;
      this.distance = this.savedThirdPersonDistance;
    }
    return this.isFirstPerson;
  }

  public addTouchDelta(dx: number, dy: number) {
    const sensFactor = 0.007 * this.sensitivity;
    this.yaw -= dx * sensFactor;
    const yFactor = this.invertY ? -sensFactor : sensFactor;
    this.pitch += dy * yFactor;
    this.pitch = Math.max(this.minPitch, Math.min(this.maxPitch, this.pitch));
  }

  public pinchZoom(deltaDist: number) {
    this.distance += deltaDist;
    this.distance = Math.max(this.minDistance, Math.min(this.maxDistance, this.distance));
    if (this.distance > 2) {
      this.isFirstPerson = false;
    }
  }

  public onPointerUp() {
    this.isDragging = false;
  }

  public onWheel(deltaY: number) {
    const zoomSpeed = 0.015;
    this.distance += deltaY * zoomSpeed;
    this.distance = Math.max(this.minDistance, Math.min(this.maxDistance, this.distance));
    if (this.distance > 2) {
      this.isFirstPerson = false;
    }
  }

  public update(playerPos: THREE.Vector3, delta: number) {
    // Target anchor point is player center / head level (Y + 2.2)
    const targetAnchor = playerPos.clone().add(new THREE.Vector3(0, 2.2, 0));

    // Calculate desired camera position using spherical coordinates
    const horizontalDist = this.distance * Math.cos(this.pitch);
    const verticalDist = this.distance * Math.sin(this.pitch);

    const desiredX = targetAnchor.x + horizontalDist * Math.sin(this.yaw);
    const desiredY = targetAnchor.y + verticalDist;
    const desiredZ = targetAnchor.z + horizontalDist * Math.cos(this.yaw);

    const desiredPos = new THREE.Vector3(desiredX, desiredY, desiredZ);

    // Smoothly damp camera position towards desiredPos
    this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, desiredPos.x, 14, delta);
    this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, desiredPos.y, 14, delta);
    this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, desiredPos.z, 14, delta);

    // Smooth look-at
    this.targetPos.x = THREE.MathUtils.damp(this.targetPos.x, targetAnchor.x, 16, delta);
    this.targetPos.y = THREE.MathUtils.damp(this.targetPos.y, targetAnchor.y, 16, delta);
    this.targetPos.z = THREE.MathUtils.damp(this.targetPos.z, targetAnchor.z, 16, delta);

    this.camera.lookAt(this.targetPos);
  }
}
