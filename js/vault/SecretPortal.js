import * as THREE from 'three';

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

    const neonVioletMat = new THREE.MeshBasicMaterial({
      color: 0x9333ea,
      toneMapped: false,
    });

    const neonPurpleSoftMat = new THREE.MeshBasicMaterial({
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
    // Montante izquierdo
    const postGeo = new THREE.BoxGeometry(0.14, 2.60, 0.20);
    postGeo.translate(0, 1.30, 0);
    const leftPost = cel(postGeo, frameMat);
    leftPost.position.x = -0.64;
    this.add(leftPost);

    const rightPost = cel(postGeo, frameMat);
    rightPost.position.x = 0.64;
    this.add(rightPost);

    // Dintel superior
    const lintelGeo = new THREE.BoxGeometry(1.42, 0.16, 0.20);
    lintelGeo.translate(0, 0, 0);
    const lintel = cel(lintelGeo, frameMat);
    lintel.position.y = 2.68;
    this.add(lintel);

    // Umbral inferior
    const thresholdGeo = new THREE.BoxGeometry(1.28, 0.08, 0.22);
    const threshMesh = cel(thresholdGeo, frameMat);
    threshMesh.position.y = 0.04;
    this.add(threshMesh);

    // ── Relleno portal: plano oscuro translúcido ─────────────────────────────
    const portalFillGeo = new THREE.PlaneGeometry(1.26, 2.56);
    const portalFillMat = new THREE.MeshBasicMaterial({
      color: 0x1a0a2e,
      transparent: true,
      opacity: 0.82,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const portalFill = new THREE.Mesh(portalFillGeo, portalFillMat);
    portalFill.position.set(0, 1.32, 0.01);
    this.add(portalFill);

    // ── Neon strips alrededor del marco ─────────────────────────────────────
    const neonStrips = [
      // Lado izq
      { geo: new THREE.BoxGeometry(0.022, 2.56, 0.022), pos: [-0.58, 1.28, 0.115] },
      // Lado der
      { geo: new THREE.BoxGeometry(0.022, 2.56, 0.022), pos: [0.58, 1.28, 0.115] },
      // Top
      { geo: new THREE.BoxGeometry(1.18, 0.022, 0.022), pos: [0, 2.60, 0.115] },
      // Bot
      { geo: new THREE.BoxGeometry(1.18, 0.022, 0.022), pos: [0, 0.02, 0.115] },
    ];

    neonStrips.forEach(({ geo, pos }) => {
      const mesh = new THREE.Mesh(geo, neonVioletMat);
      mesh.position.set(...pos);
      this.add(mesh);
    });

    // Inner glow strip (más interior, color más suave)
    const innerStrips = [
      { geo: new THREE.BoxGeometry(0.012, 2.52, 0.012), pos: [-0.55, 1.28, 0.02] },
      { geo: new THREE.BoxGeometry(0.012, 2.52, 0.012), pos: [0.55, 1.28, 0.02] },
      { geo: new THREE.BoxGeometry(1.12, 0.012, 0.012), pos: [0, 2.56, 0.02] },
    ];

    innerStrips.forEach(({ geo, pos }) => {
      const mesh = new THREE.Mesh(geo, neonPurpleSoftMat);
      mesh.position.set(...pos);
      this.add(mesh);
    });

    // ── Letrero "SECRET VAULT" sobre el dintel ───────────────────────────────
    this.signTexture = createPortalSignTexture();
    const signGeo = new THREE.PlaneGeometry(1.10, 0.28);
    const signMat = new THREE.MeshBasicMaterial({
      map: this.signTexture,
      toneMapped: false,
    });
    const signMesh = new THREE.Mesh(signGeo, signMat);
    signMesh.position.set(0, 2.93, 0.11);
    this.add(signMesh);

    // Placa detrás del letrero
    const signBezelGeo = new THREE.BoxGeometry(1.15, 0.32, 0.05);
    signBezelGeo.translate(0, 0, 0);
    const signBezel = cel(signBezelGeo, frameMat);
    signBezel.position.set(0, 2.93, 0.08);
    this.add(signBezel);

    // ── Luz puntual violeta: el halo del portal ──────────────────────────────
    this.portalLight = new THREE.PointLight(0x9333ea, 3.5, 6.5, 1.4);
    this.portalLight.position.set(0, 1.55, 0.6);
    this.add(this.portalLight);

    // Segundo punto de luz, más suave, para iluminar el suelo
    this.floorLight = new THREE.PointLight(0x6d28d9, 1.2, 4.0, 1.6);
    this.floorLight.position.set(0, 0.3, 0.5);
    this.add(this.floorLight);

    // ── Charco de glow en el suelo ───────────────────────────────────────────
    const glowGeo = new THREE.PlaneGeometry(2.4, 1.6);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x7c4fd6,
      transparent: true,
      opacity: 0.18,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    glowMesh.rotation.x = -Math.PI / 2;
    glowMesh.position.set(0, 0.008, 0.5);
    this.add(glowMesh);

    // ── Partículas pulsantes alrededor del portal ────────────────────────────
    this._buildParticles();

    // ── Hitbox invisible para raycaster ─────────────────────────────────────
    const hitGeo = new THREE.BoxGeometry(1.30, 2.70, 0.40);
    hitGeo.translate(0, 1.35, 0);
    this.hitbox = new THREE.Mesh(
      hitGeo,
      new THREE.MeshBasicMaterial({ visible: false })
    );
    this.hitbox.userData = { isSecretPortal: true };
    this.add(this.hitbox);

    this._time = 0;

    // Estado de activación (animación al hacer click)
    this._activating = false;
    this._activationTimer = 0;
    this._activationDuration = 0.70; // segundos antes del fade
    this._activationCallback = null;

    // Guarda referencia al plano relleno del portal para el flash
    this._portalFill = portalFill;
    this._fillMat = portalFillMat;
  }

  _buildParticles() {
    const count = 40;
    const positions = new Float32Array(count * 3);
    const alphas = new Float32Array(count);
    const offsets = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Distribuir alrededor del marco
      const side = Math.floor(Math.random() * 3); // 0=left, 1=right, 2=top
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

      alphas[i] = Math.random();
      offsets[i] = Math.random() * Math.PI * 2;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this._particlePositions = positions;
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

  // Llama a activate(callback) al hacer click en el portal.
  // Reproduce la animación (~700ms) y luego llama callback para iniciar el fade.
  activate(callback) {
    if (this._activating) return;
    this._activating = true;
    this._activationTimer = 0;
    this._activationCallback = callback || null;
  }

  update(dt, prefersReducedMotion = false) {
    this._time += dt;
    const t = this._time;

    // ── Animación de ACTIVACIÓN ─────────────────────────────────────────────
    if (this._activating) {
      this._activationTimer += dt;
      const p = Math.min(this._activationTimer / this._activationDuration, 1.0);

      // Tres pulsos de luz explosivos: 0.0, 0.3, 0.6 s
      const flash1 = Math.exp(-Math.pow((p - 0.05) * 18, 2));
      const flash2 = Math.exp(-Math.pow((p - 0.40) * 18, 2));
      const flash3 = Math.exp(-Math.pow((p - 0.75) * 18, 2));
      const flashTotal = Math.max(flash1, flash2, flash3);

      // Luz principal sube a 28 en los picos y baja a 3 entre ellos
      this.portalLight.intensity = 3.0 + flashTotal * 25.0;
      this.floorLight.intensity  = 1.0 + flashTotal * 8.0;

      // El relleno del portal destella de oscuro a violeta brillante
      if (this._fillMat) {
        this._fillMat.color.setHSL(0.78, 0.90, 0.08 + flashTotal * 0.55);
        this._fillMat.opacity = 0.82 + flashTotal * 0.18;
      }

      // Partículas se disparan hacia afuera con velocidad 10× durante activación
      if (!prefersReducedMotion) {
        const posArr = this.particles.geometry.attributes.position.array;
        const speed = 1.0 + flashTotal * 10.0;
        for (let i = 0; i < this._particleCount; i++) {
          posArr[i * 3 + 1] += Math.sin(t * 4.0 + this._particleOffsets[i]) * dt * speed;
          if (posArr[i * 3 + 1] > 3.20) posArr[i * 3 + 1] = -0.10;
          if (posArr[i * 3 + 1] < -0.15) posArr[i * 3 + 1] = 3.10;
        }
        this.particles.geometry.attributes.position.needsUpdate = true;
        this.particles.material.opacity = 0.65 + flashTotal * 0.35;
        this.particles.material.size = 0.038 + flashTotal * 0.06;
      }

      // Al completarse la animación, disparar el callback
      if (p >= 1.0) {
        this._activating = false;
        this._activationTimer = 0;
        // Resetear el material del fill
        if (this._fillMat) {
          this._fillMat.color.set(0x1a0a2e);
          this._fillMat.opacity = 0.82;
        }
        if (this._activationCallback) {
          this._activationCallback();
          this._activationCallback = null;
        }
      }
      return; // skip idle animation durante activación
    }

    // ── Idle: pulso suave ───────────────────────────────────────────────────
    this.portalLight.intensity = 3.0 + Math.sin(t * 2.1) * 0.65;
    this.floorLight.intensity  = 1.0 + Math.sin(t * 1.7 + 1.0) * 0.25;

    if (prefersReducedMotion) return;

    // Partículas flotantes normales
    const posArr = this.particles.geometry.attributes.position.array;
    for (let i = 0; i < this._particleCount; i++) {
      posArr[i * 3 + 1] += Math.sin(t * 1.4 + this._particleOffsets[i]) * dt * 0.12;
      if (posArr[i * 3 + 1] > 2.80) posArr[i * 3 + 1] = 0.05;
      if (posArr[i * 3 + 1] < 0.0)  posArr[i * 3 + 1] = 2.70;
    }
    this.particles.geometry.attributes.position.needsUpdate = true;
    this.particles.material.opacity = 0.55 + Math.sin(t * 1.8) * 0.20;
    this.particles.material.size = 0.038;
  }
}
