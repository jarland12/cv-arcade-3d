import * as THREE from 'three';
import {
  playCoinInsert,
  playSwooshClack,
  playLoadingBeep,
  playVictoryJingle
} from './audio.js';

export class CartridgeStateMachine {
  constructor(downloadsZone) {
    this.zone = downloadsZone;
    this.vendingMachine = downloadsZone.vendingMachine;
    this.state = 'IDLE'; // 'IDLE', 'SELECTED', 'INSERTING', 'LOADING', 'COMPLETED', 'RESET'
    
    this.activeCartridge = null;
    this.stateTimer = 0;
    this.stateDuration = 0;

    // Vectores temporales para animaciones
    this.animStartPos = new THREE.Vector3();
    this.animTargetPos = new THREE.Vector3();
    this.animStartRot = new THREE.Euler();
    this.animTargetRot = new THREE.Euler();
    this.lastBlockIndex = -1;
  }

  isBusy() {
    return this.state !== 'IDLE';
  }

  selectCartridge(cartridge, prefersReducedMotion = false) {
    if (this.isBusy() || !cartridge) return false;

    this.activeCartridge = cartridge;
    this.state = 'SELECTED';
    this.stateTimer = 0;
    this.stateDuration = prefersReducedMotion ? 0.2 : 0.65;
    this.lastBlockIndex = -1;

    // Reproducir SFX de Coin Insert
    playCoinInsert();

    // Actualizar pantalla de la máquina
    this.vendingMachine.screenCRT.setState({
      mode: 'SELECTED',
      title: cartridge.cartridgeName,
      colorHex: cartridge.colorHex,
      progress: 0,
      flash: 0.5,
    });

    // Guardar posición y rotación inicial
    this.animStartPos.copy(cartridge.position);
    this.animStartRot.copy(cartridge.rotation);

    // Posición hero flotando hacia el frente de la cámara
    this.animTargetPos.copy(cartridge.slotLocalPos);
    this.animTargetPos.z += 0.45;
    this.animTargetPos.y -= 0.10;

    this.animTargetRot.set(0, prefersReducedMotion ? 0 : Math.PI * 2, 0);

    return true;
  }

  update(dt, time, prefersReducedMotion = false) {
    this.stateTimer += dt;
    const progress = Math.min(this.stateTimer / (this.stateDuration || 0.001), 1);

    switch (this.state) {
      case 'IDLE':
        // Flotación sutil (bobbing) de los cartuchos en reposo
        if (!prefersReducedMotion) {
          this.zone.cartridges.forEach((cart, i) => {
            const bob = Math.sin(time * 2.5 + i * 1.2) * 0.005;
            cart.position.y = cart.slotLocalPos.y + bob;
            cart.position.z = cart.slotLocalPos.z + cart.hoverOffset;
          });
        }
        break;

      case 'SELECTED': {
        // Giro 360° en Y y flotación hacia el frente
        const t = 1 - Math.pow(1 - progress, 3); // Ease Out Cubic
        if (this.activeCartridge) {
          this.activeCartridge.position.lerpVectors(this.animStartPos, this.animTargetPos, t);
          this.activeCartridge.rotation.y = this.animStartRot.y + this.animTargetRot.y * t;
        }

        if (progress >= 1) {
          // Transicionar a INSERTING
          this.state = 'INSERTING';
          this.stateTimer = 0;
          this.stateDuration = prefersReducedMotion ? 0.2 : 0.45;

          playSwooshClack();

          if (this.activeCartridge) {
            this.animStartPos.copy(this.activeCartridge.position);
            this.animStartRot.copy(this.activeCartridge.rotation);

            // Destino: ranura de inserción
            this.animTargetPos.copy(this.vendingMachine.insertionSlotPos);
            this.animTargetPos.y += 0.08;
            this.animTargetRot.set(-0.25, 0, 0);
          }

          this.vendingMachine.screenCRT.setState({
            mode: 'INSERTING',
            title: this.activeCartridge ? this.activeCartridge.cartridgeName : 'CARGANDO',
            colorHex: this.activeCartridge ? this.activeCartridge.colorHex : '#7c4fd6',
          });
        }
        break;
      }

      case 'INSERTING': {
        const t = Math.pow(progress, 2); // Ease In Quad
        if (this.activeCartridge) {
          this.activeCartridge.position.lerpVectors(this.animStartPos, this.animTargetPos, t);
          this.activeCartridge.rotation.x = THREE.MathUtils.lerp(this.animStartRot.x, this.animTargetRot.x, t);

          // Al final de la inserción, deslizar dentro de la ranura
          if (progress > 0.6) {
            const depthT = (progress - 0.6) / 0.4;
            this.activeCartridge.position.z = THREE.MathUtils.lerp(this.animTargetPos.z, this.animTargetPos.z - 0.22, depthT);
            this.activeCartridge.scale.setScalar(Math.max(0.01, 1 - depthT * 0.7));
          }
        }

        if (progress >= 1) {
          // Transicionar a LOADING
          this.state = 'LOADING';
          this.stateTimer = 0;
          this.stateDuration = prefersReducedMotion ? 0.6 : 1.35;
          this.lastBlockIndex = -1;

          if (this.activeCartridge) {
            this.activeCartridge.visible = false;
          }
        }
        break;
      }

      case 'LOADING': {
        const totalBlocks = 12;
        const currentBlock = Math.floor(progress * totalBlocks);

        if (currentBlock > this.lastBlockIndex && currentBlock < totalBlocks) {
          this.lastBlockIndex = currentBlock;
          playLoadingBeep(currentBlock);
        }

        this.vendingMachine.screenCRT.setState({
          mode: 'LOADING',
          title: this.activeCartridge ? this.activeCartridge.cartridgeName : 'DOCUMENTO',
          progress: progress,
          colorHex: this.activeCartridge ? this.activeCartridge.colorHex : '#7c4fd6',
        });

        if (progress >= 1) {
          // Transicionar a COMPLETED
          this.state = 'COMPLETED';
          this.stateTimer = 0;
          this.stateDuration = 1.6;

          playVictoryJingle();

          this.vendingMachine.screenCRT.setState({
            mode: 'COMPLETED',
            title: this.activeCartridge ? this.activeCartridge.cartridgeName : 'DOCUMENTO',
            colorHex: this.activeCartridge ? this.activeCartridge.colorHex : '#7c4fd6',
            flash: 1.0,
          });

          // Disparar la descarga real del archivo
          this.triggerFileDownload(this.activeCartridge);
        }
        break;
      }

      case 'COMPLETED': {
        if (progress >= 1) {
          // Transicionar a RESET
          this.state = 'RESET';
          this.stateTimer = 0;
          this.stateDuration = 0.5;

          if (this.activeCartridge) {
            this.activeCartridge.visible = true;
            this.activeCartridge.scale.set(1, 1, 1);
            this.activeCartridge.rotation.copy(this.activeCartridge.slotLocalRot);
            this.activeCartridge.position.copy(this.activeCartridge.slotLocalPos);
            this.activeCartridge.position.z += 0.2; // Sale suavemente del fondo del slot
          }
        }
        break;
      }

      case 'RESET': {
        const t = 1 - Math.pow(1 - progress, 2);
        if (this.activeCartridge) {
          this.activeCartridge.position.z = THREE.MathUtils.lerp(
            this.activeCartridge.slotLocalPos.z + 0.2,
            this.activeCartridge.slotLocalPos.z,
            t
          );
        }

        if (progress >= 1) {
          if (this.activeCartridge) {
            this.activeCartridge.position.copy(this.activeCartridge.slotLocalPos);
            this.activeCartridge = null;
          }

          this.vendingMachine.screenCRT.setState({
            mode: 'IDLE',
            title: 'SELECCIONA CARTUCHO',
            colorHex: '#7c4fd6',
            flash: 0,
            progress: 0,
          });

          this.state = 'IDLE';
        }
        break;
      }
    }
  }

  triggerFileDownload(cartridge) {
    if (!cartridge || !cartridge.fileURL) return;

    try {
      const link = document.createElement('a');
      link.href = cartridge.fileURL;
      const fileName = cartridge.fileURL.split('/').pop() || `${cartridge.cartridgeName.toLowerCase()}.pdf`;
      link.setAttribute('download', fileName);
      link.setAttribute('target', '_blank');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.warn('Download execution error:', e);
    }
  }
}
