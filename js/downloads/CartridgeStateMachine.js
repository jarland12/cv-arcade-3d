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
    this.counter = downloadsZone.counter;
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

    // Actualizar pantalla del terminal CRT en el mostrador
    this.counter.screenCRT.setState({
      mode: 'SELECTED',
      title: cartridge.cartridgeName,
      colorHex: cartridge.colorHex,
      progress: 0,
      flash: 0.5,
    });

    // Guardar posición y rotación inicial en el pedestal
    this.animStartPos.copy(cartridge.position);
    this.animStartRot.copy(cartridge.rotation);

    // Posición hero flotando hacia arriba y al frente sobre el mostrador
    this.animTargetPos.copy(cartridge.slotLocalPos);
    this.animTargetPos.y += 0.32;
    this.animTargetPos.z += 0.22;

    this.animTargetRot.set(0, prefersReducedMotion ? 0 : Math.PI * 2, 0);

    return true;
  }

  update(dt, time, prefersReducedMotion = false) {
    this.stateTimer += dt;
    const progress = Math.min(this.stateTimer / (this.stateDuration || 0.001), 1);

    switch (this.state) {
      case 'IDLE':
        // Flotación sutil sobre los pedestales del mostrador
        if (!prefersReducedMotion) {
          this.zone.cartridges.forEach((cart, i) => {
            const bob = Math.sin(time * 2.8 + i * 1.2) * 0.004;
            cart.position.y = cart.slotLocalPos.y + bob + cart.hoverOffset * 0.5;
            cart.position.z = cart.slotLocalPos.z + cart.hoverOffset;
          });
        }
        break;

      case 'SELECTED': {
        // Elevación y giro cinemático de 360° en Y
        const t = 1 - Math.pow(1 - progress, 3); // Ease Out Cubic
        if (this.activeCartridge) {
          this.activeCartridge.position.lerpVectors(this.animStartPos, this.animTargetPos, t);
          this.activeCartridge.rotation.x = THREE.MathUtils.lerp(this.animStartRot.x, 0, t);
          this.activeCartridge.rotation.y = this.animStartRot.y + this.animTargetRot.y * t;
        }

        if (progress >= 1) {
          // Transicionar a INSERTING (hacia la bahía de lectura del terminal)
          this.state = 'INSERTING';
          this.stateTimer = 0;
          this.stateDuration = prefersReducedMotion ? 0.2 : 0.50;

          playSwooshClack();

          if (this.activeCartridge) {
            this.animStartPos.copy(this.activeCartridge.position);
            this.animStartRot.copy(this.activeCartridge.rotation);

            // Destino: bahía de lectura sobre la encimera
            this.animTargetPos.copy(this.counter.insertionSlotPos);
            this.animTargetRot.set(-Math.PI / 2, 0, 0); // Acostado para inserción en la ranura
          }

          this.counter.screenCRT.setState({
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
          this.activeCartridge.rotation.y = THREE.MathUtils.lerp(this.animStartRot.y, this.animTargetRot.y, t);

          // Deslizar dentro de la ranura de lectura
          if (progress > 0.5) {
            const depthT = (progress - 0.5) / 0.5;
            this.activeCartridge.position.y = THREE.MathUtils.lerp(this.animTargetPos.y, this.animTargetPos.y - 0.14, depthT);
            this.activeCartridge.scale.setScalar(Math.max(0.01, 1 - depthT * 0.75));
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
        const totalBlocks = 10;
        const currentBlock = Math.floor(progress * totalBlocks);

        if (currentBlock > this.lastBlockIndex && currentBlock < totalBlocks) {
          this.lastBlockIndex = currentBlock;
          playLoadingBeep(currentBlock);
        }

        this.counter.screenCRT.setState({
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

          this.counter.screenCRT.setState({
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
          this.stateDuration = 0.55;

          if (this.activeCartridge) {
            this.activeCartridge.visible = true;
            this.activeCartridge.scale.set(1, 1, 1);
            this.activeCartridge.rotation.copy(this.activeCartridge.slotLocalRot);
            this.activeCartridge.position.copy(this.activeCartridge.slotLocalPos);
            this.activeCartridge.position.y += 0.25; // Reaparece flotando sobre el pedestal
          }
        }
        break;
      }

      case 'RESET': {
        const t = 1 - Math.pow(1 - progress, 2);
        if (this.activeCartridge) {
          this.activeCartridge.position.y = THREE.MathUtils.lerp(
            this.activeCartridge.slotLocalPos.y + 0.25,
            this.activeCartridge.slotLocalPos.y,
            t
          );
        }

        if (progress >= 1) {
          if (this.activeCartridge) {
            this.activeCartridge.position.copy(this.activeCartridge.slotLocalPos);
            this.activeCartridge = null;
          }

          this.counter.screenCRT.setState({
            mode: 'IDLE',
            title: 'ELIGE UN PREMIO',
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
