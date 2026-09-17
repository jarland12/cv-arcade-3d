import * as THREE from 'three';

// ─── Textura del letrero "DOWNLOADS" de la máquina ───────────────────────────
function createVendingSignTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  function draw() {
    ctx.fillStyle = '#06050e';
    ctx.fillRect(0, 0, 512, 128);

    ctx.strokeStyle = '#7c4fd6';
    ctx.lineWidth = 7;
    ctx.strokeRect(5, 5, 502, 118);

    ctx.strokeStyle = '#9333ea';
    ctx.lineWidth = 2;
    ctx.strokeRect(12, 12, 488, 104);

    ctx.fillStyle = '#c084fc';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 24px "Press Start 2P", monospace';
    ctx.fillText('DOWNLOADS', 256, 50);

    ctx.fillStyle = '#7c4fd6';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillText('· EXPIDE TUS ARCHIVOS SECRETOS ·', 256, 90);
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

// ─── Textura dinámica CRT de la pantalla de la máquina ───────────────────────
export function createVendingScreenTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 384;
  const ctx = canvas.getContext('2d');

  let state = {
    mode: 'IDLE',
    title: 'SELECCIONA UN ROM',
    progress: 0,
    colorHex: '#7c4fd6',
    flash: 0,
  };

  function render(time = 0) {
    ctx.fillStyle = '#06040f';
    ctx.fillRect(0, 0, 512, 384);

    if (state.flash > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${state.flash * 0.5})`;
      ctx.fillRect(0, 0, 512, 384);
    }

    // Scanlines CRT
    ctx.fillStyle = 'rgba(0,0,0,0.26)';
    for (let y = 0; y < 384; y += 4) {
      ctx.fillRect(0, y, 512, 2);
    }

    // Marco exterior
    ctx.strokeStyle = state.colorHex;
    ctx.lineWidth = 8;
    ctx.strokeRect(8, 8, 496, 368);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Cabecera
    ctx.fillStyle = '#120d20';
    ctx.fillRect(18, 18, 476, 48);
    ctx.fillStyle = state.colorHex;
    ctx.font = '12px "Press Start 2P", monospace';
    ctx.fillText('TERMINAL ARCADE v2.0', 256, 42);

    if (state.mode === 'IDLE') {
      const pulse = 0.75 + Math.sin(time * 3.2) * 0.25;
      ctx.globalAlpha = pulse;
      ctx.fillStyle = state.colorHex;
      ctx.font = '16px "Press Start 2P", monospace';
      ctx.fillText('INSERT CARTRIDGE', 256, 155);
      ctx.globalAlpha = 1.0;

      ctx.fillStyle = '#9e94c2';
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.fillText('ELIGE UN CARTUCHO', 256, 222);

      ctx.fillStyle = '#28e8d8';
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.fillText('PARA DESCARGAR ARCHIVO', 256, 268);

    } else if (state.mode === 'SELECTED' || state.mode === 'INSERTING') {
      ctx.fillStyle = state.colorHex;
      ctx.font = '15px "Press Start 2P", monospace';
      ctx.fillText(state.title, 256, 145);
      ctx.fillStyle = '#28e8d8';
      ctx.font = '11px "Press Start 2P", monospace';
      ctx.fillText('LEYENDO DATOS...', 256, 228);

    } else if (state.mode === 'LOADING') {
      ctx.fillStyle = state.colorHex;
      ctx.font = '14px "Press Start 2P", monospace';
      ctx.fillText(`ROM: ${state.title}`, 256, 115);

      // Barra de 10 bloques arcade
      const totalBlocks = 10;
      const filled = Math.floor(state.progress * totalBlocks);
      const bx0 = 52, barY = 175, bw = 36, bh = 38, gap = 5;

      for (let b = 0; b < totalBlocks; b++) {
        const bx = bx0 + b * (bw + gap);
        if (b < filled) {
          ctx.fillStyle = state.colorHex;
          ctx.fillRect(bx, barY, bw, bh);
          ctx.fillStyle = 'rgba(255,255,255,0.40)';
          ctx.fillRect(bx + 2, barY + 2, bw - 4, 6);
        } else {
          ctx.fillStyle = 'rgba(255,255,255,0.07)';
          ctx.fillRect(bx, barY, bw, bh);
        }
        ctx.strokeStyle = 'rgba(255,255,255,0.22)';
        ctx.lineWidth = 2;
        ctx.strokeRect(bx, barY, bw, bh);
      }

      const pct = Math.round(state.progress * 100);
      ctx.fillStyle = '#ffffff';
      ctx.font = '13px "Press Start 2P", monospace';
      ctx.fillText(`${pct}%`, 256, 263);

    } else if (state.mode === 'COMPLETED') {
      ctx.fillStyle = '#3ddc84';
      ctx.font = '17px "Press Start 2P", monospace';
      ctx.fillText('¡DESCARGA LISTA!', 256, 135);

      ctx.fillStyle = state.colorHex;
      ctx.font = '12px "Press Start 2P", monospace';
      ctx.fillText(state.title, 256, 195);

      ctx.fillStyle = '#28e8d8';
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.fillText('ABRIENDO ARCHIVO...', 256, 260);
    }
  }

  render(0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  return {
    texture,
    setState(newState) {
      Object.assign(state, newState);
      render();
      texture.needsUpdate = true;
    },
    update(time, dt) {
      if (state.flash > 0) {
        state.flash = Math.max(0, state.flash - dt * 2.8);
      }
      if (state.mode === 'IDLE' || state.flash > 0) {
        render(time);
        texture.needsUpdate = true;
      }
    }
  };
}

// ─── VendingMachine ───────────────────────────────────────────────────────────
export class VendingMachine extends THREE.Group {
  constructor() {
    super();

    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x0d0b1c,
      roughness: 0.60,
      metalness: 0.22,
      flatShading: true,
    });
    const metalMat = new THREE.MeshStandardMaterial({
      color: 0x4a4465,
      roughness: 0.42,
      metalness: 0.38,
      flatShading: true,
    });
    const darkMat = new THREE.MeshStandardMaterial({
      color: 0x06050e,
      roughness: 0.75,
      metalness: 0.10,
      flatShading: true,
    });
    const edgeMat = new THREE.LineBasicMaterial({ color: 0x030206 });

    const cel = (geo, mat, thresh = 15) => {
      const g = new THREE.Group();
      g.add(new THREE.Mesh(geo, mat));
      g.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo, thresh), edgeMat));
      return g;
    };

    // Dimensiones de la máquina expendedora vertical
    const W = 1.10;  // ancho
    const H = 2.20;  // altura (más baja que los cabinets de 3.3m)
    const D = 0.68;  // profundidad

    // ── Cuerpo principal ─────────────────────────────────────────────────────
    const bodyGeo = new THREE.BoxGeometry(W, H, D);
    bodyGeo.translate(0, H / 2, 0);
    this.add(cel(bodyGeo, bodyMat));

    // Zócalo inferior
    const baseGeo = new THREE.BoxGeometry(W * 1.04, 0.09, D * 1.04);
    baseGeo.translate(0, 0.045, 0);
    this.add(cel(baseGeo, darkMat));

    // Tapas laterales metálicas
    [-W / 2, W / 2].forEach(xOff => {
      const sideGeo = new THREE.BoxGeometry(0.06, H * 0.96, D * 0.98);
      sideGeo.translate(xOff, H / 2, 0);
      this.add(cel(sideGeo, metalMat));
    });

    // ── Letrero "DOWNLOADS" en la parte superior ─────────────────────────────
    this.signTexture = createVendingSignTexture();
    const signGeo = new THREE.PlaneGeometry(W * 0.82, 0.26);
    const signMat = new THREE.MeshBasicMaterial({
      map: this.signTexture,
      toneMapped: false,
    });
    const signMesh = new THREE.Mesh(signGeo, signMat);
    signMesh.position.set(0, H - 0.20, D / 2 + 0.005);
    this.add(signMesh);

    const signBezelGeo = new THREE.BoxGeometry(W * 0.86, 0.30, 0.04);
    signBezelGeo.translate(0, H - 0.20, D / 2 + 0.005);
    this.add(cel(signBezelGeo, darkMat));

    // Franja neón violeta bajo el letrero
    const neonTopGeo = new THREE.BoxGeometry(W * 0.88, 0.014, 0.018);
    const neonMat = new THREE.MeshBasicMaterial({ color: 0x9333ea, toneMapped: false });
    const neonTop = new THREE.Mesh(neonTopGeo, neonMat);
    neonTop.position.set(0, H - 0.365, D / 2 + 0.01);
    this.add(neonTop);

    // ── Pantalla CRT central ──────────────────────────────────────────────────
    const screenY = H * 0.58;
    const crtBezelGeo = new THREE.BoxGeometry(W * 0.82, 0.75, 0.06);
    crtBezelGeo.translate(0, screenY, D / 2);
    this.add(cel(crtBezelGeo, darkMat));

    this.screenCRT = createVendingScreenTexture();
    const screenPlaneGeo = new THREE.PlaneGeometry(W * 0.72, 0.62);
    this.screenMat = new THREE.MeshBasicMaterial({
      map: this.screenCRT.texture,
      toneMapped: false,
    });
    const screenMesh = new THREE.Mesh(screenPlaneGeo, this.screenMat);
    screenMesh.position.set(0, screenY, D / 2 + 0.032);
    this.add(screenMesh);

    // ── 4 Slots de cartuchos en la parte inferior ────────────────────────────
    // Rejilla 2×2: izquierda/derecha × arriba/abajo
    const slotW = 0.32;
    const slotH = 0.52;
    const slotD = 0.52; // profundidad del slot
    const slotMarginX = 0.08;
    const slotMarginY = 0.06;
    const slotBaseY = 0.30;

    this.slotPositions = [];    // posiciones locales donde van los cartuchos (dentro de la máquina)
    this.slotRotations = [];

    // 4 slots en columna vertical
    const slotXPositions = [-W * 0.23, W * 0.23];
    const slotYPositions = [slotBaseY + slotH + slotMarginY, slotBaseY];

    let slotIdx = 0;
    for (let row = 1; row >= 0; row--) {
      for (let col = 0; col < 2; col++) {
        const sx = slotXPositions[col];
        const sy = slotYPositions[row];
        const sz = 0; // centrado en profundidad

        // Cavidad del slot (caja oscura)
        const cavGeo = new THREE.BoxGeometry(slotW, slotH, slotD);
        cavGeo.translate(sx, sy + slotH / 2, sz);
        this.add(new THREE.Mesh(cavGeo, new THREE.MeshBasicMaterial({ color: 0x04030a })));

        // Marco del slot
        const slotFrameGeo = new THREE.BoxGeometry(slotW + 0.04, slotH + 0.04, 0.04);
        slotFrameGeo.translate(sx, sy + slotH / 2, slotD / 2 + 0.02);
        this.add(cel(slotFrameGeo, metalMat));

        // Posición de reposo del cartucho (dentro del slot, ligeramente hacia afuera)
        this.slotPositions.push(new THREE.Vector3(sx, sy + slotH * 0.55, slotD / 2 + 0.06));
        this.slotRotations.push(new THREE.Euler(-0.20, 0, 0));

        slotIdx++;
      }
    }

    // ── Ranura de lectura / inserción (drive slot) en la parte central ────────
    const driveX = 0;
    const driveY = H * 0.36;
    const driveZ = D / 2;

    const driveBodyGeo = new THREE.BoxGeometry(W * 0.48, 0.07, 0.16);
    driveBodyGeo.translate(driveX, driveY, driveZ);
    this.add(cel(driveBodyGeo, metalMat));

    const driveMouthGeo = new THREE.BoxGeometry(W * 0.38, 0.038, 0.08);
    const driveMouth = new THREE.Mesh(driveMouthGeo, new THREE.MeshBasicMaterial({ color: 0x030206 }));
    driveMouth.position.set(driveX, driveY, driveZ + 0.01);
    this.add(driveMouth);

    const driveNeonGeo = new THREE.BoxGeometry(W * 0.40, 0.010, 0.012);
    const driveNeon = new THREE.Mesh(driveNeonGeo, new THREE.MeshBasicMaterial({ color: 0x28e8d8, toneMapped: false }));
    driveNeon.position.set(driveX, driveY + 0.042, driveZ + 0.06);
    this.add(driveNeon);

    this.insertionSlotPos = new THREE.Vector3(driveX, driveY + 0.05, driveZ + 0.05);

    // ── Franja neón violeta en el suelo / zócalo ─────────────────────────────
    const neonBaseGeo = new THREE.BoxGeometry(W * 1.02, 0.014, 0.018);
    const neonBase = new THREE.Mesh(neonBaseGeo, neonMat.clone());
    neonBase.position.set(0, 0.095, D / 2 + 0.01);
    this.add(neonBase);

    // ── Luces ────────────────────────────────────────────────────────────────
    this.mainLight = new THREE.PointLight(0x8a4fe8, 2.2, 5.5, 1.3);
    this.mainLight.position.set(0, H * 0.65, 0.85);
    this.add(this.mainLight);

    this.slotLight = new THREE.PointLight(0x6d28d9, 1.0, 2.5, 1.5);
    this.slotLight.position.set(0, 0.80, 0.85);
    this.add(this.slotLight);

    // Charco de glow en el suelo
    const floorGlowGeo = new THREE.PlaneGeometry(2.2, 1.6);
    const floorGlowMat = new THREE.MeshBasicMaterial({
      color: 0x7c4fd6,
      transparent: true,
      opacity: 0.16,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const floorGlow = new THREE.Mesh(floorGlowGeo, floorGlowMat);
    floorGlow.rotation.x = -Math.PI / 2;
    floorGlow.position.set(0, 0.01, 0.40);
    this.add(floorGlow);

    // ── Hitbox ───────────────────────────────────────────────────────────────
    const hitGeo = new THREE.BoxGeometry(W * 1.05, H * 1.05, D * 1.1);
    hitGeo.translate(0, H / 2, 0);
    this.hitbox = new THREE.Mesh(
      hitGeo,
      new THREE.MeshBasicMaterial({ visible: false })
    );
    this.hitbox.userData = { isVendingMachine: true };
    this.add(this.hitbox);
  }

  update(time, dt) {
    this.screenCRT.update(time, dt);
    this.mainLight.intensity = 2.0 + Math.sin(time * 2.5) * 0.28;
    this.slotLight.intensity = 0.85 + Math.sin(time * 1.8 + 1.1) * 0.18;
  }
}
