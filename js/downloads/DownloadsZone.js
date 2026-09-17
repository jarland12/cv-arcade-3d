import * as THREE from 'three';
import { VendingMachine } from './VendingMachine.js';
import { Cartridge } from './Cartridge.js';
import { CartridgeStateMachine } from './CartridgeStateMachine.js';
import {
  playHoverBlip,
  startAmbientHum,
  updateAmbientVolume
} from './audio.js';

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
  }
];

export class DownloadsZone extends THREE.Group {
  constructor() {
    super();

    // Posición apartada en el ala lateral izquierda (secreta/easter egg)
    this.position.set(-7.5, 0, -1.8);
    this.rotation.set(0, 0.65, 0); // Orientada en diagonal hacia el centro de la sala

    // 1. Instanciar Máquina Expendedora
    this.vendingMachine = new VendingMachine();
    this.add(this.vendingMachine);

    // 2. Instanciar y ubicar los 4 Cartuchos en sus slots
    this.cartridges = [];
    this.cartridgeHitboxes = [];

    downloadsCartridgesConfig.forEach((cfg, idx) => {
      const cart = new Cartridge(cfg);
      const slotPos = this.vendingMachine.slotPositions[idx];
      cart.setSlotTransform(slotPos);
      this.vendingMachine.add(cart);

      this.cartridges.push(cart);
      this.cartridgeHitboxes.push(cart.hitbox);
    });

    // 3. Máquina de Estados de interacción
    this.stateMachine = new CartridgeStateMachine(this);

    this.currentHoveredCartridge = null;
    this.worldMachinePos = new THREE.Vector3();
    this.hasStartedAudioHum = false;
  }

  getHitboxes() {
    return [...this.cartridgeHitboxes, this.vendingMachine.hitbox];
  }

  handlePointerMove(raycaster) {
    if (this.stateMachine.isBusy()) return null;

    const intersects = raycaster.intersectObjects(this.cartridgeHitboxes);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      const targetCartridge = hit.userData.cartridge;

      if (this.currentHoveredCartridge !== targetCartridge) {
        if (this.currentHoveredCartridge) {
          this.currentHoveredCartridge.setHover(false);
        }
        this.currentHoveredCartridge = targetCartridge;
        this.currentHoveredCartridge.setHover(true);
        playHoverBlip();
      }
      return targetCartridge;
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
      return { type: 'machine', position: this.getWorldTarget() };
    }

    return null;
  }

  getWorldTarget() {
    this.getWorldPosition(this.worldMachinePos);
    return {
      pos: new THREE.Vector3(this.worldMachinePos.x + 1.8, 1.85, this.worldMachinePos.z + 2.4),
      look: new THREE.Vector3(this.worldMachinePos.x, 1.35, this.worldMachinePos.z)
    };
  }

  update(dt, time, cameraPos, prefersReducedMotion = false) {
    // 1. Audio ambiental de proximidad
    if (!this.hasStartedAudioHum) {
      startAmbientHum();
      this.hasStartedAudioHum = true;
    }

    this.getWorldPosition(this.worldMachinePos);
    const distToCam = cameraPos ? cameraPos.distanceTo(this.worldMachinePos) : 10;
    // Rango de audición entre 3.0m (volumen máx) y 9.5m (silencioso)
    const proximity = THREE.MathUtils.clamp(1 - (distToCam - 2.8) / 6.7, 0, 1);
    updateAmbientVolume(proximity);

    // 2. Actualizar máquina y cartuchos
    const isInteracting = this.stateMachine.isBusy();
    this.vendingMachine.update(time, dt);
    this.cartridges.forEach(cart => cart.update(dt, isInteracting));

    // 3. Actualizar máquina de estados
    this.stateMachine.update(dt, time, prefersReducedMotion);
  }
}
