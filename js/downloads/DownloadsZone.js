import * as THREE from 'three';
import { PrizeCounter } from './PrizeCounter.js';
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

    // Posición en esquina "L" a solo 1.5m a la izquierda de la Cabina 1
    // Rotada 90° mirando hacia el interior de la sala y las cabinas
    this.position.set(-5.4, 0, 1.2);
    this.rotation.set(0, Math.PI / 2, 0);

    // 1. Instanciar Mostrador de Premios (Prize Counter)
    this.counter = new PrizeCounter();
    this.add(this.counter);

    // 2. Instanciar y ubicar los 4 Cartuchos en los pedestales inclinados
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

    // 3. Máquina de Estados de interacción
    this.stateMachine = new CartridgeStateMachine(this);

    this.currentHoveredCartridge = null;
    this.worldCounterPos = new THREE.Vector3();
    this.hasStartedAudioHum = false;
  }

  getHitboxes() {
    return [...this.cartridgeHitboxes, this.counter.hitbox];
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

    if (hit.userData.isPrizeCounter) {
      return { type: 'counter', position: this.getWorldTarget() };
    }

    return null;
  }

  getWorldTarget() {
    this.getWorldPosition(this.worldCounterPos);
    // Encuadre isométrico mirando el mostrador desde el pasillo central
    return {
      pos: new THREE.Vector3(this.worldCounterPos.x + 2.2, 1.70, this.worldCounterPos.z + 0.4),
      look: new THREE.Vector3(this.worldCounterPos.x, 1.05, this.worldCounterPos.z)
    };
  }

  update(dt, time, cameraPos, prefersReducedMotion = false) {
    // 1. Audio ambiental de proximidad
    if (!this.hasStartedAudioHum) {
      startAmbientHum();
      this.hasStartedAudioHum = true;
    }

    this.getWorldPosition(this.worldCounterPos);
    const distToCam = cameraPos ? cameraPos.distanceTo(this.worldCounterPos) : 10;
    // Rango de audición suave entre 2.2m y 7.5m
    const proximity = THREE.MathUtils.clamp(1 - (distToCam - 2.0) / 5.5, 0, 1);
    updateAmbientVolume(proximity);

    // 2. Actualizar mostrador y cartuchos
    const isInteracting = this.stateMachine.isBusy();
    this.counter.update(time, dt);
    this.cartridges.forEach(cart => cart.update(dt, isInteracting));

    // 3. Actualizar máquina de estados
    this.stateMachine.update(dt, time, prefersReducedMotion);
  }
}
