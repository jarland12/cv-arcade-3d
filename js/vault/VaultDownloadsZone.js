import * as THREE from 'three';
import { Cartridge } from '../downloads/Cartridge.js';
import { CartridgeStateMachine } from '../downloads/CartridgeStateMachine.js';
import {
  playHoverBlip,
  startAmbientHum,
  updateAmbientVolume,
} from '../downloads/audio.js';
import { VendingMachine } from './VendingMachine.js';

// Configuración de los 4 cartuchos descargables
export const downloadsCartridgesConfig = [
  {
    id: 'cv',
    name: 'CV.EXE',
    color: 0xff2fb0,
    colorHex: '#ff2fb0',
    fileURL: 'assets/docs/cv.pdf',
    slotIndex: 0,
  },
  {
    id: 'certificados',
    name: 'CERTIFICADOS',
    color: 0xf0b43c,
    colorHex: '#f0b43c',
    fileURL: 'assets/docs/certificados.pdf',
    slotIndex: 1,
  },
  {
    id: 'portfolio',
    name: 'PORTFOLIO',
    color: 0x28e8d8,
    colorHex: '#28e8d8',
    fileURL: 'assets/docs/portfolio.pdf',
    slotIndex: 2,
  },
  {
    id: 'referencias',
    name: 'REFERENCIAS',
    color: 0x7c4fd6,
    colorHex: '#7c4fd6',
    fileURL: 'assets/docs/referencias.pdf',
    slotIndex: 3,
  },
];

// VaultDownloadsZone — gestiona la vending machine y los cartuchos dentro del Vault
export class VaultDownloadsZone {
  constructor(vault) {
    this.vault = vault;
    // La VendingMachine ya está construida en vault.vendingMachine
    this.counter = vault.vendingMachine;

    // Instanciar los 4 cartuchos en los slots de la vending machine
    this.cartridges = [];
    this.cartridgeHitboxes = [];

    downloadsCartridgesConfig.forEach((cfg, idx) => {
      const cart = new Cartridge(cfg);
      const slotPos = this.counter.slotPositions[idx];
      const slotRot = this.counter.slotRotations[idx];
      cart.setSlotTransform(slotPos, slotRot);
      this.counter.add(cart);
      this.cartridges.push(cart);
      this.cartridgeHitboxes.push(cart.hitbox);
    });

    // Máquina de estados de interacción
    this.stateMachine = new CartridgeStateMachine(this);

    this.currentHoveredCartridge = null;
    this.worldPos = new THREE.Vector3();
    this.hasStartedHum = false;
  }

  getHitboxes() {
    return [...this.cartridgeHitboxes, this.counter.hitbox];
  }

  handlePointerMove(raycaster) {
    if (this.stateMachine.isBusy()) return null;

    const intersects = raycaster.intersectObjects(this.cartridgeHitboxes);
    if (intersects.length > 0) {
      const hit = intersects[0].object;
      const targetCart = hit.userData.cartridge;
      if (this.currentHoveredCartridge !== targetCart) {
        if (this.currentHoveredCartridge) this.currentHoveredCartridge.setHover(false);
        this.currentHoveredCartridge = targetCart;
        targetCart.setHover(true);
        playHoverBlip();
      }
      return targetCart;
    } else {
      if (this.currentHoveredCartridge) {
        this.currentHoveredCartridge.setHover(false);
        this.currentHoveredCartridge = null;
      }
      return null;
    }
  }

  handleClick(raycaster, prefersReducedMotion = false) {
    const intersects = raycaster.intersectObjects(this.getHitboxes());
    if (intersects.length === 0) return null;

    const hit = intersects[0].object;

    if (hit.userData.isCartridge) {
      const cartridge = hit.userData.cartridge;
      const started = this.stateMachine.selectCartridge(cartridge, prefersReducedMotion);
      return { type: 'cartridge', cartridge, started };
    }

    if (hit.userData.isVendingMachine) {
      return { type: 'machine' };
    }

    return null;
  }

  update(dt, time, cameraWorldPos, prefersReducedMotion = false) {
    // Audio ambiental de proximidad
    if (!this.hasStartedHum) {
      startAmbientHum();
      this.hasStartedHum = true;
    }

    if (this.vault && cameraWorldPos) {
      this.vault.getWorldPosition(this.worldPos);
      const dist = cameraWorldPos.distanceTo(this.worldPos);
      const proximity = THREE.MathUtils.clamp(1 - (dist - 1.5) / 5.0, 0, 1);
      updateAmbientVolume(proximity);
    }

    const isInteracting = this.stateMachine.isBusy();
    this.cartridges.forEach(cart => cart.update(dt, isInteracting));
    this.stateMachine.update(dt, time, prefersReducedMotion);
  }
}
