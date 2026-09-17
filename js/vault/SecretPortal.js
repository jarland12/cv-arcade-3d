import * as THREE from 'three';

// ─── Sintetizador de Audio Web Audio API para el Zumbido (Proximity Hum) ──────
// Genera un zumbido espacial retro de baja frecuencia sin requerir archivos externos.
class PortalHumSynth {
  constructor() {
    this.ctx = null;
    this.osc1 = null;
    this.osc2 = null;
    this.filter = null;
    this.gain = null;
    this.initialized = false;
    this.unlocked = false;
  }

  _init() {
    if (this.initialized) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    try {
      this.ctx = new AudioContextClass();
      this.osc1 = this.ctx.createOscillator();
      this.osc2 = this.ctx.createOscillator();
      this.filter = this.ctx.createBiquadFilter();
      this.gain = this.ctx.createGain();

      this.osc1.type = 'sawtooth';
      this.osc1.frequency.setValueAtTime(55, this.ctx.currentTime); // A1

      this.osc2.type = 'sine';
      this.osc2.frequency.setValueAtTime(110, this.ctx.currentTime); // A2

      this.filter.type = 'lowpass';
      this.filter.frequency.setValueAtTime(240, this.ctx.currentTime);

      this.gain.gain.setValueAtTime(0, this.ctx.currentTime);

      this.osc1.connect(this.filter);
      this.osc2.connect(this.filter);
      this.filter.connect(this.gain);
      this.gain.connect(this.ctx.destination);

      this.osc1.start();
      this.osc2.start();
      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio no disponible para SecretPortal:', e);
    }
  }

  unlock() {
    this.unlocked = true;
    if (!this.initialized) this._init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  setVolume(vol) {
    if (!this.initialized || !this.gain || !this.ctx) return;
    if (this.ctx.state === 'suspended') return;
    const safeVol = Math.max(0, Math.min(0.20, vol));
    this.gain.gain.setTargetAtTime(safeVol, this.ctx.currentTime, 0.12);
  }

  stop() {
    if (this.gain && this.ctx && this.ctx.state !== 'closed') {
      this.gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.08);
    }
  }
}

const portalHum = new PortalHumSynth();

// Desbloqueo seguro de AudioContext con el primer gesto del usuario
if (typeof window !== 'undefined') {
  ['click', 'touchstart', 'keydown'].forEach(evt => {
    window.addEventListener(evt, () => portalHum.unlock(), { once: true, passive: true });
  });
}

// ─── Textura del letrero del portal ──────────────────────────────────────────
function createPortalSignTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 384;
  canvas.height = 96;
  const ctx = canvas.getContext('2d');

  function draw() {
    ctx.fillStyle = '#0a0618';
    ctx.fillRect(0, 0, 384, 96);

    ctx.strokeStyle = '#9333ea';
    ctx.lineWidth = 6;
    ctx.strokeRect(5, 5, 374, 86);

    ctx.strokeStyle = '#7c4fd6';
    ctx.lineWidth = 2;
    ctx.strokeRect(11, 11, 362, 74);

    ctx.fillStyle = '#c084fc';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 14px "Press Start 2P", monospace';
    ctx.fillText('SECRET VAULT', 192, 40);

    ctx.fillStyle = '#7c4fd6';
    ctx.font = '9px "Press Start 2P", monospace';
    ctx.fillText('▶ EXPLORAR ◀', 192, 70);
  }

  draw();

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  if (document.fonts) {
    document.fonts.ready.then(() => {
      draw();
      texture.needsUpdate = true;
    });
  }

  return texture;
}

// ─── Estados de la Puerta Aleatoria e Intermitente ────────────────────────────
export const PORTAL_STATES = {
  HIDDEN: 'HIDDEN',
  SPAWNING_FLICKER: 'SPAWNING_FLICKER',
  ACTIVE: 'ACTIVE',
  DESPAWNING_FLICKER: 'DESPAWNING_FLICKER',
  ACTIVATING: 'ACTIVATING',
};

// ─── SecretPortal ────────────────────────────────────────────────────────────
export class SecretPortal extends THREE.Group {
  constructor() {
    super();

    // Materiales
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x0c0818,
      roughness: 0.65,
      metalness: 0.20,
      flatShading: true,
    });

    this.neonVioletMat = new THREE.MeshBasicMaterial({
      color: 0x9333ea,
      toneMapped: false,
    });

    this.neonPurpleSoftMat = new THREE.MeshBasicMaterial({
      color: 0x6d28d9,
      toneMapped: false,
    });

    const edgeMat = new THREE.LineBasicMaterial({ color: 0x030206 });

    const cel = (geo, mat, thresh = 15) => {
      const g = new THREE.Group();
      g.add(new THREE.Mesh(geo, mat));
      g.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo, thresh), edgeMat));
      return g;
    };

    // ── Marco exterior de la puerta ──────────────────────────────────────────
    const postGeo = new THREE.BoxGeometry(0.14, 2.60, 0.20);
    postGeo.translate(0, 1.30, 0);
    const leftPost = cel(postGeo, frameMat);
    leftPost.position.x = -0.64;
    this.add(leftPost);

    const rightPost = cel(postGeo, frameMat);
    rightPost.position.x = 0.64;
    this.add(rightPost);

    const lintelGeo = new THREE.BoxGeometry(1.42, 0.16, 0.20);
    const lintel = cel(lintelGeo, frameMat);
    lintel.position.y = 2.68;
    this.add(lintel);

    const thresholdGeo = new THREE.BoxGeometry(1.28, 0.08, 0.22);
    const threshMesh = cel(thresholdGeo, frameMat);
    threshMesh.position.y = 0.04;
    this.add(threshMesh);

    // ── Relleno portal: plano oscuro translúcido ─────────────────────────────
    const portalFillGeo = new THREE.PlaneGeometry(1.26, 2.56);
    this._fillMat = new THREE.MeshBasicMaterial({
      color: 0x1a0a2e,
      transparent: true,
      opacity: 0.82,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this._portalFill = new THREE.Mesh(portalFillGeo, this._fillMat);
    this._portalFill.position.set(0, 1.32, 0.01);
    this.add(this._portalFill);

    // ── Neon strips alrededor del marco ─────────────────────────────────────
    const neonStrips = [
      { geo: new THREE.BoxGeometry(0.022, 2.56, 0.022), pos: [-0.58, 1.28, 0.115] },
      { geo: new THREE.BoxGeometry(0.022, 2.56, 0.022), pos: [0.58, 1.28, 0.115] },
      { geo: new THREE.BoxGeometry(1.18, 0.022, 0.022), pos: [0, 2.60, 0.115] },
      { geo: new THREE.BoxGeometry(1.18, 0.022, 0.022), pos: [0, 0.02, 0.115] },
    ];
    neonStrips.forEach(({ geo, pos }) => {
      const mesh = new THREE.Mesh(geo, this.neonVioletMat);
      mesh.position.set(...pos);
      this.add(mesh);
    });

    const innerStrips = [
      { geo: new THREE.BoxGeometry(0.012, 2.52, 0.012), pos: [-0.55, 1.28, 0.02] },
      { geo: new THREE.BoxGeometry(0.012, 2.52, 0.012), pos: [0.55, 1.28, 0.02] },
      { geo: new THREE.BoxGeometry(1.12, 0.012, 0.012), pos: [0, 2.56, 0.02] },
    ];
    innerStrips.forEach(({ geo, pos }) => {
      const mesh = new THREE.Mesh(geo, this.neonPurpleSoftMat);
      mesh.position.set(...pos);
      this.add(mesh);
    });

    // ── Letrero "SECRET VAULT" sobre el dintel ───────────────────────────────
    this.signTexture = createPortalSignTexture();
    const signGeo = new THREE.PlaneGeometry(1.10, 0.28);
    this.signMat = new THREE.MeshBasicMaterial({
      map: this.signTexture,
      toneMapped: false,
    });
    this.signMesh = new THREE.Mesh(signGeo, this.signMat);
    this.signMesh.position.set(0, 2.93, 0.11);
    this.add(this.signMesh);

    const signBezelGeo = new THREE.BoxGeometry(1.15, 0.32, 0.05);
    const signBezel = cel(signBezelGeo, frameMat);
    signBezel.position.set(0, 2.93, 0.08);
    this.add(signBezel);

    // ── Luces del portal ─────────────────────────────────────────────────────
    this.portalLight = new THREE.PointLight(0x9333ea, 3.5, 6.5, 1.4);
    this.portalLight.position.set(0, 1.55, 0.6);
    this.add(this.portalLight);

    this.floorLight = new THREE.PointLight(0x6d28d9, 1.2, 4.0, 1.6);
    this.floorLight.position.set(0, 0.3, 0.5);
    this.add(this.floorLight);

    // ── Charco de glow en el suelo ───────────────────────────────────────────
    const glowGeo = new THREE.PlaneGeometry(2.4, 1.6);
    this.glowMat = new THREE.MeshBasicMaterial({
      color: 0x7c4fd6,
      transparent: true,
      opacity: 0.18,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.glowMesh = new THREE.Mesh(glowGeo, this.glowMat);
    this.glowMesh.rotation.x = -Math.PI / 2;
    this.glowMesh.position.set(0, 0.008, 0.5);
    this.add(this.glowMesh);

    // ── Partículas pulsantes alrededor del portal ────────────────────────────
    this._buildParticles();

    // ── Hitbox para interacción ──────────────────────────────────────────────
    const hitGeo = new THREE.BoxGeometry(1.30, 2.70, 0.50);
    hitGeo.translate(0, 1.35, 0);
    this.hitbox = new THREE.Mesh(
      hitGeo,
      new THREE.MeshBasicMaterial({ visible: false })
    );
    this.hitbox.userData = { isSecretPortal: true };
    this.add(this.hitbox);

    // ── Máquina de Estados para Evento Aleatorio e Intermitente ───────────────
    this.state = PORTAL_STATES.HIDDEN;
    this.stateTimer = 0;
    this.activeDuration = 22.0; // Duración activa en desktop
    this._time = 0;
    this._worldPos = new THREE.Vector3();

    // Iniciar oculto por defecto
    this.visible = false;
    this.portalLight.intensity = 0;
    this.floorLight.intensity = 0;
    this.glowMat.opacity = 0;

    // Activación por click
    this._activationDuration = 0.70;
    this._activationCallback = null;
  }

  _buildParticles() {
    const count = 40;
    const positions = new Float32Array(count * 3);
    const offsets = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const side = Math.floor(Math.random() * 3);
      if (side === 0) {
        positions[i * 3 + 0] = -0.62 + (Math.random() - 0.5) * 0.12;
        positions[i * 3 + 1] = Math.random() * 2.6;
      } else if (side === 1) {
        positions[i * 3 + 0] = 0.62 + (Math.random() - 0.5) * 0.12;
        positions[i * 3 + 1] = Math.random() * 2.6;
      } else {
        positions[i * 3 + 0] = (Math.random() - 0.5) * 1.3;
        positions[i * 3 + 1] = 2.62 + (Math.random() - 0.5) * 0.12;
      }
      positions[i * 3 + 2] = 0.12 + Math.random() * 0.10;
      offsets[i] = Math.random() * Math.PI * 2;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this._particleOffsets = offsets;
    this._particleCount = count;

    const mat = new THREE.PointsMaterial({
      color: 0xb06ef3,
      size: 0.038,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.particles = new THREE.Points(geo, mat);
    this.add(this.particles);
  }

  // ─── Spawn Dinámico con Titileo en Posición Específica ───────────────────────
  spawnAt(pos, rotY = 0, duration = 24.0) {
    if (this.state === PORTAL_STATES.ACTIVATING) return;

    this.position.copy(pos);
    this.rotation.y = rotY;
    this.activeDuration = duration;
    this.state = PORTAL_STATES.SPAWNING_FLICKER;
    this.stateTimer = 0;
    this.visible = true;
    this.hitbox.visible = true;
  }

  // ─── Forzar Aparición para Evento Mobile ────────────────────────────────────
  forceActiveForMobile(duration = 2.5) {
    this.activeDuration = duration;
    this.state = PORTAL_STATES.SPAWNING_FLICKER;
    this.stateTimer = 0;
    this.visible = true;
    this.hitbox.visible = true;
  }

  // ─── Desvanecer Portal ─────────────────────────────────────────────────────
  despawn() {
    if (this.state === PORTAL_STATES.ACTIVATING || this.state === PORTAL_STATES.HIDDEN) return;
    this.state = PORTAL_STATES.DESPAWNING_FLICKER;
    this.stateTimer = 0;
  }

  // ─── Indica si el portal puede ser clicado actualmente ──────────────────────
  isInteractable() {
    return this.state === PORTAL_STATES.SPAWNING_FLICKER ||
           this.state === PORTAL_STATES.ACTIVE;
  }

  // ─── Activación (3 flashes y transición) ───────────────────────────────────
  activate(callback) {
    if (this.state === PORTAL_STATES.ACTIVATING) return;
    this.state = PORTAL_STATES.ACTIVATING;
    this.stateTimer = 0;
    this._activationCallback = callback || null;
    portalHum.stop();
  }

  // ─── Actualización por Frame ───────────────────────────────────────────────
  update(dt, camera = null, prefersReducedMotion = false) {
    this._time += dt;
    this.stateTimer += dt;
    const t = this._time;

    // 1. ESTADO: HIDDEN (Oculto)
    if (this.state === PORTAL_STATES.HIDDEN) {
      this.visible = false;
      this.portalLight.intensity = 0;
      this.floorLight.intensity = 0;
      this.glowMat.opacity = 0;
      portalHum.stop();
      return;
    }

    // 2. ESTADO: ACTIVATING (Animación de entrada con 3 flashes)
    if (this.state === PORTAL_STATES.ACTIVATING) {
      const p = Math.min(this.stateTimer / this._activationDuration, 1.0);

      const flash1 = Math.exp(-Math.pow((p - 0.05) * 18, 2));
      const flash2 = Math.exp(-Math.pow((p - 0.40) * 18, 2));
      const flash3 = Math.exp(-Math.pow((p - 0.75) * 18, 2));
      const flashTotal = Math.max(flash1, flash2, flash3);

      this.portalLight.intensity = 3.0 + flashTotal * 25.0;
      this.floorLight.intensity  = 1.0 + flashTotal * 8.0;

      if (this._fillMat) {
        this._fillMat.color.setHSL(0.78, 0.90, 0.08 + flashTotal * 0.55);
        this._fillMat.opacity = 0.82 + flashTotal * 0.18;
      }

      if (p >= 1.0) {
        this.state = PORTAL_STATES.HIDDEN;
        this.stateTimer = 0;
        if (this._fillMat) {
          this._fillMat.color.set(0x1a0a2e);
          this._fillMat.opacity = 0.82;
        }
        if (this._activationCallback) {
          this._activationCallback();
          this._activationCallback = null;
        }
      }
      return;
    }

    // 3. ESTADO: SPAWNING_FLICKER (Titileo errático e irregular durante 1.8s)
    if (this.state === PORTAL_STATES.SPAWNING_FLICKER) {
      const duration = 1.8;
      const progress = Math.min(this.stateTimer / duration, 1.0);

      // Pseudo-ruido eléctrico irregular: combinación de altas frecuencias
      const n1 = Math.sin(t * 37.0);
      const n2 = Math.cos(t * 53.0);
      const n3 = Math.sin(t * 89.0);
      const spark = (n1 * n2 + n3) * 0.5 + 0.5; // 0..1
      const isBurst = Math.sin(t * 19.0) > -0.2;
      const flickerVal = isBurst ? (0.3 + spark * 0.7) : 0.05;

      // Escalar de inestable a estable conforme avanza el tiempo
      const baseIntensity = progress * 3.0;
      this.portalLight.intensity = baseIntensity * flickerVal;
      this.floorLight.intensity = (progress * 1.0) * flickerVal;
      this.glowMat.opacity = 0.18 * flickerVal;

      // Parpadeo de color en los neones
      const neonHue = 0.76 + Math.sin(t * 29.0) * 0.03;
      const neonLum = 0.35 + flickerVal * 0.40;
      this.neonVioletMat.color.setHSL(neonHue, 0.95, neonLum);
      this._fillMat.opacity = 0.3 + flickerVal * 0.52;

      if (this.stateTimer >= duration) {
        this.state = PORTAL_STATES.ACTIVE;
        this.stateTimer = 0;
        this.neonVioletMat.color.set(0x9333ea);
        this._fillMat.opacity = 0.82;
      }
    }

    // 4. ESTADO: ACTIVE (Presencia estable con suave pulso de respiración)
    else if (this.state === PORTAL_STATES.ACTIVE) {
      const breath = Math.sin(t * 2.1) * 0.65;
      this.portalLight.intensity = 3.0 + breath;
      this.floorLight.intensity  = 1.0 + Math.sin(t * 1.7 + 1.0) * 0.25;
      this.glowMat.opacity = 0.18 + Math.sin(t * 2.1) * 0.05;
      this.neonVioletMat.color.set(0x9333ea);

      // Partículas flotantes normales
      if (!prefersReducedMotion) {
        const posArr = this.particles.geometry.attributes.position.array;
        for (let i = 0; i < this._particleCount; i++) {
          posArr[i * 3 + 1] += Math.sin(t * 1.4 + this._particleOffsets[i]) * dt * 0.12;
          if (posArr[i * 3 + 1] > 2.80) posArr[i * 3 + 1] = 0.05;
          if (posArr[i * 3 + 1] < 0.0)  posArr[i * 3 + 1] = 2.70;
        }
        this.particles.geometry.attributes.position.needsUpdate = true;
      }

      // Si se agota el tiempo activo, iniciar titileo de desaparición
      if (this.stateTimer >= this.activeDuration) {
        this.state = PORTAL_STATES.DESPAWNING_FLICKER;
        this.stateTimer = 0;
      }
    }

    // 5. ESTADO: DESPAWNING_FLICKER (Titileo errático apagándose durante 1.2s)
    else if (this.state === PORTAL_STATES.DESPAWNING_FLICKER) {
      const duration = 1.2;
      const progress = 1.0 - Math.min(this.stateTimer / duration, 1.0);

      const n1 = Math.sin(t * 47.0);
      const spark = Math.random() > 0.4 ? 1.0 : 0.1;
      const flickerVal = Math.max(0, n1 * spark * progress);

      this.portalLight.intensity = 3.0 * flickerVal;
      this.floorLight.intensity = 1.0 * flickerVal;
      this.glowMat.opacity = 0.18 * flickerVal;
      this.neonVioletMat.color.setHSL(0.76, 0.95, 0.1 + flickerVal * 0.5);
      this._fillMat.opacity = 0.2 + flickerVal * 0.6;

      if (this.stateTimer >= duration) {
        this.state = PORTAL_STATES.HIDDEN;
        this.stateTimer = 0;
        this.visible = false;
        portalHum.stop();
      }
    }

    // ── Pista Sonora de Proximidad (Modula volumen según distancia a cámara) ──
    if (camera && this.visible && this.state !== PORTAL_STATES.HIDDEN) {
      this.getWorldPosition(this._worldPos);
      const dist = camera.position.distanceTo(this._worldPos);
      const maxDist = 9.0;
      if (dist < maxDist) {
        const proximity = Math.pow(1.0 - (dist / maxDist), 1.5);
        portalHum.setVolume(proximity * 0.18);
      } else {
        portalHum.setVolume(0);
      }
    } else {
      portalHum.setVolume(0);
    }
  }
}
