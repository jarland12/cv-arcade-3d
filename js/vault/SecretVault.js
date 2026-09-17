import * as THREE from 'three';
import { VendingMachine } from './VendingMachine.js';

// ─── Geometría personalizada: Carcasa CRT estilo "Tobogán" ────────────────────
// Frustum trapezoidal donde la parte superior e inclinación caen hacia atrás
// simulando la rampa/tobogán clásica de los televisores retro de tubo catódico.
function createCRTToboganGeometry(wFront, hFront, wBack, hBack, depth, dropTop = 0.08) {
  const geo = new THREE.BufferGeometry();

  const halfWF = wFront / 2;
  const halfHF = hFront / 2;
  const halfWB = wBack / 2;
  const halfHB = hBack / 2;

  // 8 vértices
  // Front face en z = 0
  const v0 = [-halfWF,  halfHF, 0];           // Front Top-Left
  const v1 = [ halfWF,  halfHF, 0];           // Front Top-Right
  const v2 = [ halfWF, -halfHF, 0];           // Front Bottom-Right
  const v3 = [-halfWF, -halfHF, 0];           // Front Bottom-Left

  // Back face en z = -depth (la parte superior cae hacia abajo como tobogán)
  const backTopY = halfHB - dropTop;
  const backBotY = -halfHB;
  const v4 = [-halfWB,  backTopY, -depth];    // Back Top-Left
  const v5 = [ halfWB,  backTopY, -depth];    // Back Top-Right
  const v6 = [ halfWB,  backBotY, -depth];    // Back Bottom-Right
  const v7 = [-halfWB,  backBotY, -depth];    // Back Bottom-Left

  const vertices = new Float32Array([
    // Front face
    ...v0, ...v3, ...v2,   ...v0, ...v2, ...v1,
    // Back face
    ...v5, ...v6, ...v7,   ...v5, ...v7, ...v4,
    // Top face - "El Tobogán"
    ...v0, ...v1, ...v5,   ...v0, ...v5, ...v4,
    // Bottom face
    ...v3, ...v7, ...v6,   ...v3, ...v6, ...v2,
    // Right face
    ...v1, ...v2, ...v6,   ...v1, ...v6, ...v5,
    // Left face
    ...v4, ...v7, ...v3,   ...v4, ...v3, ...v0,
  ]);

  geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  geo.computeVertexNormals();
  return geo;
}

// ─── Geometría de Pantalla Convexa Abombada CRT ──────────────────────────────
function createCRTScreenGeometry(width, height, bulge = 0.038) {
  const geo = new THREE.PlaneGeometry(width, height, 12, 10);
  const pos = geo.attributes.position;
  const halfW = width / 2;
  const halfH = height / 2;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const nx = x / halfW;
    const ny = y / halfH;
    const distSq = nx * nx + ny * ny;
    const z = Math.max(0, 1 - distSq * 0.42) * bulge;
    pos.setZ(i, z);
  }

  geo.computeVertexNormals();
  return geo;
}

// ─── Textura del letrero neón del vault ──────────────────────────────────────
function createVaultSignTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 112;
  const ctx = canvas.getContext('2d');

  function draw() {
    ctx.fillStyle = '#080512';
    ctx.fillRect(0, 0, 640, 112);

    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 4;
    ctx.strokeRect(5, 5, 630, 102);

    ctx.fillStyle = '#f3e8ff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 24px "Press Start 2P", monospace';
    ctx.shadowColor = '#a855f7';
    ctx.shadowBlur = 16;
    ctx.fillText('★ ARCHIVO SECRETO ★', 320, 46);

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#a855f7';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillText('VAULT · DOCUMENTOS & LOGROS EXCLUSIVOS', 320, 84);
  }

  draw();

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  if (document.fonts) {
    document.fonts.ready.then(() => { draw(); texture.needsUpdate = true; });
  }

  return texture;
}

// ─── Textura de la puerta de salida "EXIT" ────────────────────────────────────
function createExitSignTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 384;
  canvas.height = 96;
  const ctx = canvas.getContext('2d');

  function draw() {
    ctx.fillStyle = '#040b12';
    ctx.fillRect(0, 0, 384, 96);

    ctx.strokeStyle = '#28e8d8';
    ctx.lineWidth = 6;
    ctx.strokeRect(5, 5, 374, 86);

    ctx.fillStyle = '#28e8d8';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 18px "Press Start 2P", monospace';
    ctx.shadowColor = '#28e8d8';
    ctx.shadowBlur = 8;
    ctx.fillText('◀ EXIT ◀', 192, 38);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#3ddc84';
    ctx.font = '9px "Press Start 2P", monospace';
    ctx.fillText('VOLVER A SALA PRINCIPAL', 192, 72);
  }

  draw();

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  if (document.fonts) {
    document.fonts.ready.then(() => { draw(); texture.needsUpdate = true; });
  }
  return texture;
}

// ─── Pantalla CRT Animada en Loop ────────────────────────────────────────────
function createCRTLoopTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 384;
  const ctx = canvas.getContext('2d');

  const slides = [
    {
      header: 'MELTDOWN CALI 🕹️',
      headerColor: '#ff2fb0',
      lines: [
        { label: 'FUNDADO',    value: '2022', color: '#f0b43c' },
        { label: 'EVENTOS',    value: '40+',  color: '#28e8d8' },
        { label: 'COMUNIDAD',  value: '500+', color: '#c084fc' },
        { label: 'UBICACIÓN',  value: 'CALI', color: '#3ddc84' },
      ],
      footer: '· BAR & CRYPTO LOUNGE ·',
    },
    {
      header: 'BINANCE ANGEL 🌐',
      headerColor: '#f0b43c',
      lines: [
        { label: 'PROGRAMA',  value: 'ANGEL',   color: '#f0b43c' },
        { label: 'ROL',       value: 'LATAM',   color: '#28e8d8' },
        { label: 'ALCANCE',   value: 'GLOBAL',  color: '#c084fc' },
        { label: 'STATUS',    value: 'ACTIVO',  color: '#3ddc84' },
      ],
      footer: '· AMBASSADOR OFICIAL ·',
    },
    {
      header: 'DOCENTE & DEV 💻',
      headerColor: '#28e8d8',
      lines: [
        { label: 'INSTITUC.',  value: 'UNIGRAN', color: '#ff2fb0' },
        { label: 'LENGUAJES',  value: 'C++ / PY', color: '#28e8d8' },
        { label: 'HARDWARE',   value: 'ESP32',   color: '#f0b43c' },
        { label: 'IA & BOTS',  value: '2024',    color: '#c084fc' },
      ],
      footer: '· INGENIERÍA · ROBÓTICA ·',
    },
  ];

  let currentSlide = 0;
  let lastSlideTime = 0;
  const slideDuration = 4.0;

  function renderSlide(slide, time) {
    ctx.fillStyle = '#060312';
    ctx.fillRect(0, 0, 512, 384);

    // Scanlines CRT
    ctx.fillStyle = 'rgba(0,0,0,0.34)';
    for (let y = 0; y < 384; y += 4) ctx.fillRect(0, y, 512, 2);

    const flicker = 0.94 + Math.sin(time * 38) * 0.04;
    ctx.globalAlpha = flicker;

    ctx.strokeStyle = slide.headerColor;
    ctx.lineWidth = 6;
    ctx.strokeRect(8, 8, 496, 368);

    // Header
    ctx.fillStyle = '#100a26';
    ctx.fillRect(16, 16, 480, 52);
    ctx.fillStyle = slide.headerColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 16px "Press Start 2P", monospace';
    ctx.fillText(slide.header, 256, 42);

    // Separador
    ctx.strokeStyle = slide.headerColor;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(22, 74); ctx.lineTo(490, 74); ctx.stroke();

    // Filas
    slide.lines.forEach((row, i) => {
      const rowY = 118 + i * 58;
      ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0)';
      ctx.fillRect(20, rowY - 18, 472, 42);

      ctx.textAlign = 'left';
      ctx.fillStyle = '#a69fc4';
      ctx.font = '11px "Press Start 2P", monospace';
      ctx.fillText(row.label, 32, rowY + 4);

      ctx.textAlign = 'right';
      ctx.fillStyle = row.color;
      ctx.font = '900 14px "Press Start 2P", monospace';
      ctx.fillText(row.value, 482, rowY + 4);
    });

    // Barra de progreso del slide
    const prog = ((time - lastSlideTime) % slideDuration) / slideDuration;
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(20, 354, 472, 8);
    ctx.fillStyle = slide.headerColor;
    ctx.fillRect(20, 354, 472 * prog, 8);

    // Footer
    ctx.fillStyle = '#6d6594';
    ctx.textAlign = 'center';
    ctx.font = '9px "Press Start 2P", monospace';
    ctx.fillText(slide.footer, 256, 342);

    ctx.globalAlpha = 1.0;
  }

  renderSlide(slides[0], 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  return {
    texture,
    update(time) {
      if (time - lastSlideTime >= slideDuration) {
        lastSlideTime = time;
        currentSlide = (currentSlide + 1) % slides.length;
      }
      renderSlide(slides[currentSlide], time);
      texture.needsUpdate = true;
    },
  };
}

// ─── Placa descriptiva para trofeos ──────────────────────────────────────────
function createPlaqueTexture(title, subtitle, colorHex) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 100;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#0a0718';
  ctx.fillRect(0, 0, 256, 100);

  ctx.strokeStyle = colorHex;
  ctx.lineWidth = 3;
  ctx.strokeRect(3, 3, 250, 94);

  ctx.fillStyle = colorHex;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '900 10px "Press Start 2P", monospace';
  ctx.fillText(title, 128, 34);

  ctx.fillStyle = '#beb6dc';
  ctx.font = '7.5px "Press Start 2P", monospace';
  ctx.fillText(subtitle, 128, 68);

  const tex = new THREE.CanvasTexture(canvas);
  tex.minFilter = THREE.LinearFilter;
  return tex;
}

// ─── Clase Principal: SecretVault ─────────────────────────────────────────────
export class SecretVault extends THREE.Group {
  constructor() {
    super();

    // ── Materiales del Cuarto Compacto ────────────────────────────────────────
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x18142a,
      roughness: 0.62,
      metalness: 0.22,
      flatShading: true,
    });
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x130f24,
      roughness: 0.32,
      metalness: 0.42,
    });
    const ceilingMat = new THREE.MeshStandardMaterial({
      color: 0x110c20,
      roughness: 0.78,
    });
    const darkMat = new THREE.MeshStandardMaterial({
      color: 0x161128,
      roughness: 0.65,
      metalness: 0.35,
      flatShading: true,
    });
    const metalMat = new THREE.MeshStandardMaterial({
      color: 0x483a66,
      roughness: 0.38,
      metalness: 0.62,
      flatShading: true,
    });
    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0x7c6ba3,
      roughness: 0.25,
      metalness: 0.85,
    });
    const edgeMat = new THREE.LineBasicMaterial({ color: 0x070514 });

    const cel = (geo, mat, thresh = 15) => {
      const g = new THREE.Group();
      g.add(new THREE.Mesh(geo, mat));
      g.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo, thresh), edgeMat));
      return g;
    };

    // Dimensiones compactas e íntimas del cuarto
    const RW = 6.4;   // ancho compacto
    const RH = 3.6;   // altura acogedora
    const RD = 4.8;   // profundidad cerrada

    // ── Suelo del vault ──────────────────────────────────────────────────────
    const floorGeo = new THREE.PlaneGeometry(RW, RD);
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = 0;
    this.add(floorMesh);

    // Grid del suelo
    const gridHelper = new THREE.GridHelper(6, 12, 0x4a327a, 0x221742);
    gridHelper.position.y = 0.002;
    this.add(gridHelper);

    // ── Paredes del Cuarto ───────────────────────────────────────────────────
    // Pared frontal (donde se aglomera toda la instalación principal)
    const backWallGeo = new THREE.BoxGeometry(RW, RH, 0.18);
    backWallGeo.translate(0, RH / 2, -RD / 2);
    this.add(cel(backWallGeo, wallMat));

    // Pared izquierda
    const leftWallGeo = new THREE.BoxGeometry(0.18, RH, RD);
    leftWallGeo.translate(-RW / 2, RH / 2, 0);
    this.add(cel(leftWallGeo, wallMat));

    // Pared derecha
    const rightWallGeo = new THREE.BoxGeometry(0.18, RH, RD);
    rightWallGeo.translate(RW / 2, RH / 2, 0);
    this.add(cel(rightWallGeo, wallMat));

    // Techo
    const ceilGeo = new THREE.BoxGeometry(RW + 0.18, 0.16, RD);
    ceilGeo.translate(0, RH, 0);
    this.add(new THREE.Mesh(ceilGeo, ceilingMat));

    // Pilastras verticales decorativas
    [-RW / 2 + 0.08, RW / 2 - 0.08].forEach(xPos => {
      const p = new THREE.BoxGeometry(0.14, RH, 0.22);
      p.translate(xPos, RH / 2, 0);
      this.add(cel(p, metalMat));
    });

    // Zócalos y cornisas
    const baseboards = [
      [RW, 0.14, 0.12, [0, 0.07, -RD / 2 + 0.06]],
      [0.12, 0.14, RD, [-RW / 2 + 0.06, 0.07, 0]],
      [0.12, 0.14, RD, [RW / 2 - 0.06, 0.07, 0]],
    ];
    baseboards.forEach(([w, h, d, pos]) => {
      const g = new THREE.BoxGeometry(w, h, d);
      const m = new THREE.Mesh(g, metalMat);
      m.position.set(...pos);
      this.add(m);
    });

    // Neón en el techo
    const ceilNeonGeo = new THREE.BoxGeometry(RW * 0.78, 0.016, 0.024);
    const ceilNeonMat = new THREE.MeshBasicMaterial({ color: 0xa855f7, toneMapped: false });
    const cNeon = new THREE.Mesh(ceilNeonGeo, ceilNeonMat);
    cNeon.position.set(0, RH - 0.08, 0);
    this.add(cNeon);

    // ── LETRERO NEÓN SUPERIOR QUE CORONA TODA LA INSTALACIÓN ─────────────────
    const vaultSignTex = createVaultSignTexture();
    const vaultSignGeo = new THREE.PlaneGeometry(4.4, 0.74);
    const vaultSignMesh = new THREE.Mesh(vaultSignGeo, new THREE.MeshBasicMaterial({
      map: vaultSignTex,
      toneMapped: false,
    }));
    vaultSignMesh.position.set(0, RH - 0.52, -RD / 2 + 0.14);
    this.add(vaultSignMesh);

    const signPlateGeo = new THREE.BoxGeometry(4.54, 0.82, 0.08);
    signPlateGeo.translate(0, RH - 0.52, -RD / 2 + 0.10);
    this.add(cel(signPlateGeo, darkMat));

    const signFrameMat = new THREE.MeshBasicMaterial({ color: 0xc084fc, toneMapped: false });
    const topBar = new THREE.Mesh(new THREE.BoxGeometry(4.56, 0.016, 0.016), signFrameMat);
    topBar.position.set(0, RH - 0.10, -RD / 2 + 0.15);
    this.add(topBar);
    const botBar = new THREE.Mesh(new THREE.BoxGeometry(4.56, 0.016, 0.016), signFrameMat);
    botBar.position.set(0, RH - 0.94, -RD / 2 + 0.15);
    this.add(botBar);

    // ═════════════════════════════════════════════════════════════════════════
    // LA INSTALACIÓN PRINCIPAL UNIFICADA (En la misma pared focal)
    // [ CRT Tobogán Izquierda ]  —  [ Vending Cartuchos Centro ]  —  [ Vitrina Trofeos Derecha ]
    // ═════════════════════════════════════════════════════════════════════════

    // ── 1. CENTRO: Máquina Vending 3D con los Cartuchos ──────────────────────
    this.vendingMachine = new VendingMachine();
    this.vendingMachine.position.set(0, 0, -RD / 2 + 0.80);
    this.vendingMachine.rotation.y = 0;
    this.add(this.vendingMachine);

    // ── 2. LADO IZQUIERDO: Monitor CRT con forma de TV TOBOGÁN ───────────────
    this._crtScreens = [];
    const crtStationX = -1.95;

    // Consola / Pedestal arcade metálico para el CRT
    const crtPedGeo = new THREE.BoxGeometry(1.24, 0.72, 0.65);
    crtPedGeo.translate(crtStationX, 0.36, -RD / 2 + 0.55);
    this.add(cel(crtPedGeo, darkMat));

    // Borde neón cian en el pedestal
    const crtPedNeon = new THREE.Mesh(
      new THREE.BoxGeometry(1.26, 0.014, 0.014),
      new THREE.MeshBasicMaterial({ color: 0x28e8d8, toneMapped: false })
    );
    crtPedNeon.position.set(crtStationX, 0.72, -RD / 2 + 0.88);
    this.add(crtPedNeon);

    // Rótulo neón sobre el CRT
    const crtLabelGeo = new THREE.PlaneGeometry(1.20, 0.20);
    const crtLabelCanvas = document.createElement('canvas');
    crtLabelCanvas.width = 384; crtLabelCanvas.height = 80;
    const clc = crtLabelCanvas.getContext('2d');
    clc.fillStyle = '#070414'; clc.fillRect(0, 0, 384, 80);
    clc.strokeStyle = '#28e8d8'; clc.lineWidth = 4; clc.strokeRect(3, 3, 378, 74);
    clc.fillStyle = '#28e8d8'; clc.textAlign = 'center'; clc.textBaseline = 'middle';
    clc.font = '900 11px "Press Start 2P", monospace';
    clc.fillText('📺 MELTDOWN EN VIVO', 192, 40);
    const crtLabelTex = new THREE.CanvasTexture(crtLabelCanvas);
    const crtLabelMesh = new THREE.Mesh(crtLabelGeo, new THREE.MeshBasicMaterial({
      map: crtLabelTex,
      toneMapped: false,
    }));
    crtLabelMesh.position.set(crtStationX, 2.15, -RD / 2 + 0.16);
    this.add(crtLabelMesh);

    // El Monitor CRT
    const crtGroup = new THREE.Group();
    // Levemente orientado hacia el centro para resaltar la silueta de tobogán
    crtGroup.position.set(crtStationX, 1.32, -RD / 2 + 0.58);
    crtGroup.rotation.y = 0.14;

    // A. Chasis estilo TOBOGÁN (Frustum trapezoidal que se inclina hacia atrás)
    const wFront = 0.82;
    const hFront = 0.64;
    const wBack = 0.50;
    const hBack = 0.42;
    const depth = 0.46;
    const dropTop = 0.08; // Caída de rampa del tobogán

    const toboganGeo = createCRTToboganGeometry(wFront, hFront, wBack, hBack, depth, dropTop);
    crtGroup.add(cel(toboganGeo, darkMat));

    // B. Cuello trasero del tubo catódico
    const neckW = 0.34;
    const neckH = 0.28;
    const neckD = 0.18;
    const neckGeo = new THREE.BoxGeometry(neckW, neckH, neckD);
    neckGeo.translate(0, -0.02, -depth - neckD / 2);
    crtGroup.add(cel(neckGeo, darkMat));

    // Rejillas de ventilación traseras
    for (let r = 0; r < 4; r++) {
      const slotGeo = new THREE.BoxGeometry(neckW * 0.75, 0.014, 0.01);
      const slotMesh = new THREE.Mesh(slotGeo, metalMat);
      slotMesh.position.set(0, 0.06 - r * 0.05, -depth - neckD - 0.005);
      crtGroup.add(slotMesh);
    }

    // C. Bisel frontal del monitor
    const bezelGeo = new THREE.BoxGeometry(wFront + 0.04, hFront + 0.04, 0.05);
    bezelGeo.translate(0, 0, 0.025);
    crtGroup.add(cel(bezelGeo, metalMat));

    // D. Pantalla Convexa Abombada hacia adelante con textura animada en loop
    const screenW = 0.62;
    const screenH = 0.48;
    const screenGeo = createCRTScreenGeometry(screenW, screenH, 0.038);
    const crtData = createCRTLoopTexture();
    this._crtScreens.push(crtData);

    const screenMat = new THREE.MeshBasicMaterial({
      map: crtData.texture,
      toneMapped: false,
    });
    const screenMesh = new THREE.Mesh(screenGeo, screenMat);
    screenMesh.position.set(-0.06, 0.02, 0.05);
    crtGroup.add(screenMesh);

    // Capa de cristal translúcido con brillo
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x1a2e38,
      roughness: 0.10,
      metalness: 0.90,
      transparent: true,
      opacity: 0.18,
    });
    const glassMesh = new THREE.Mesh(screenGeo, glassMat);
    glassMesh.position.set(-0.06, 0.02, 0.055);
    crtGroup.add(glassMesh);

    // E. Perillas frontales y controles
    const knobGeo = new THREE.CylinderGeometry(0.022, 0.024, 0.026, 12);
    const knob1 = new THREE.Mesh(knobGeo, chromeMat);
    knob1.rotation.x = Math.PI / 2;
    knob1.position.set(wFront / 2 - 0.06, 0.12, 0.06);
    crtGroup.add(knob1);

    const knob2 = new THREE.Mesh(knobGeo, chromeMat);
    knob2.rotation.x = Math.PI / 2;
    knob2.position.set(wFront / 2 - 0.06, 0.03, 0.06);
    crtGroup.add(knob2);

    // Ranuras de altavoz
    for (let s = 0; s < 5; s++) {
      const slatGeo = new THREE.BoxGeometry(0.06, 0.008, 0.01);
      const slatMesh = new THREE.Mesh(slatGeo, darkMat);
      slatMesh.position.set(wFront / 2 - 0.06, -0.07 - s * 0.022, 0.055);
      crtGroup.add(slatMesh);
    }

    // LED de encendido verde
    const ledGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.02, 8);
    const ledMat = new THREE.MeshBasicMaterial({ color: 0x3ddc84, toneMapped: false });
    const ledMesh = new THREE.Mesh(ledGeo, ledMat);
    ledMesh.rotation.x = Math.PI / 2;
    ledMesh.position.set(wFront / 2 - 0.06, -0.22, 0.06);
    crtGroup.add(ledMesh);

    // Placa "TRINITRON"
    const badgeGeo = new THREE.PlaneGeometry(0.18, 0.04);
    const badgeCanvas = document.createElement('canvas');
    badgeCanvas.width = 256; badgeCanvas.height = 64;
    const bctx = badgeCanvas.getContext('2d');
    bctx.fillStyle = '#111'; bctx.fillRect(0, 0, 256, 64);
    bctx.strokeStyle = '#c084fc'; bctx.lineWidth = 4; bctx.strokeRect(2, 2, 252, 60);
    bctx.fillStyle = '#c084fc'; bctx.textAlign = 'center'; bctx.textBaseline = 'middle';
    bctx.font = '900 13px monospace'; bctx.fillText('TRINITRON', 128, 32);
    const badgeTex = new THREE.CanvasTexture(badgeCanvas);
    const badgeMesh = new THREE.Mesh(badgeGeo, new THREE.MeshBasicMaterial({ map: badgeTex }));
    badgeMesh.position.set(-0.06, -hFront / 2 + 0.035, 0.055);
    crtGroup.add(badgeMesh);

    this.add(crtGroup);

    // ── 3. LADO DERECHO: Vitrina de Trofeos 3D Integrada ──────────────────────
    const trophyStationX = 1.95;

    // Rótulo neón sobre los trofeos
    const trophyLabelGeo = new THREE.PlaneGeometry(1.30, 0.20);
    const trophyLabelCanvas = document.createElement('canvas');
    trophyLabelCanvas.width = 384; trophyLabelCanvas.height = 80;
    const tlc = trophyLabelCanvas.getContext('2d');
    tlc.fillStyle = '#070414'; tlc.fillRect(0, 0, 384, 80);
    tlc.strokeStyle = '#f0b43c'; tlc.lineWidth = 4; tlc.strokeRect(3, 3, 378, 74);
    tlc.fillStyle = '#f0b43c'; tlc.textAlign = 'center'; tlc.textBaseline = 'middle';
    tlc.font = '900 11px "Press Start 2P", monospace';
    tlc.fillText('🏆 SALA DE TROFEOS', 192, 40);
    const trophyLabelTex = new THREE.CanvasTexture(trophyLabelCanvas);
    const trophyLabelMesh = new THREE.Mesh(trophyLabelGeo, new THREE.MeshBasicMaterial({
      map: trophyLabelTex,
      toneMapped: false,
    }));
    trophyLabelMesh.position.set(trophyStationX, 2.15, -RD / 2 + 0.16);
    this.add(trophyLabelMesh);

    const trophyGroup = new THREE.Group();
    trophyGroup.position.set(trophyStationX, 0, -RD / 2 + 0.58);
    trophyGroup.rotation.y = -0.14; // Orientada suavemente hacia el centro

    // Mueble vitrina (base metálica)
    const cabinetBaseGeo = new THREE.BoxGeometry(1.34, 0.72, 0.60);
    cabinetBaseGeo.translate(0, 0.36, 0);
    trophyGroup.add(cel(cabinetBaseGeo, darkMat));

    // Urna de cristal transparente
    const glassCabinetGeo = new THREE.BoxGeometry(1.34, 0.95, 0.60);
    glassCabinetGeo.translate(0, 1.195, 0);
    const cabinetGlassMat = new THREE.MeshStandardMaterial({
      color: 0x99ccff,
      roughness: 0.08,
      metalness: 0.10,
      transparent: true,
      opacity: 0.20,
    });
    trophyGroup.add(new THREE.Mesh(glassCabinetGeo, cabinetGlassMat));
    trophyGroup.add(new THREE.LineSegments(
      new THREE.EdgesGeometry(glassCabinetGeo),
      new THREE.LineBasicMaterial({ color: 0x4466aa })
    ));

    // Tira neón dorada en el estante
    const shelfNeon = new THREE.Mesh(
      new THREE.BoxGeometry(1.36, 0.014, 0.014),
      new THREE.MeshBasicMaterial({ color: 0xf0b43c, toneMapped: false })
    );
    shelfNeon.position.set(0, 0.72, 0.31);
    trophyGroup.add(shelfNeon);

    // Los 3 Trofeos 3D
    const trophyItems = [
      {
        x: -0.42,
        title: 'BINANCE ANGEL',
        subtitle: 'LATAM AMBASSADOR',
        colorHex: '#f0b43c',
        build3D: () => {
          const g = new THREE.Group();
          const ped = new THREE.Mesh(
            new THREE.CylinderGeometry(0.12, 0.14, 0.10, 16),
            new THREE.MeshStandardMaterial({ color: 0x241a06, metalness: 0.8, roughness: 0.3 })
          );
          ped.position.y = 0.05;
          g.add(ped);

          const goldMat = new THREE.MeshStandardMaterial({
            color: 0xffd700,
            metalness: 0.90,
            roughness: 0.18,
            emissive: 0xb8860b,
            emissiveIntensity: 0.45,
          });
          const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.12, 0), goldMat);
          star.position.y = 0.25;
          star.rotation.y = Math.PI / 4;
          g.add(star);

          [-0.14, 0.14].forEach(xWing => {
            const wing = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.18, 0.10), goldMat);
            wing.position.set(xWing, 0.26, 0);
            wing.rotation.z = xWing > 0 ? -0.35 : 0.35;
            g.add(wing);
          });
          return g;
        },
      },
      {
        x: 0.0,
        title: 'MELTDOWN CEO',
        subtitle: 'WEB3 & BAR CALI',
        colorHex: '#ff2fb0',
        build3D: () => {
          const g = new THREE.Group();
          const ped = new THREE.Mesh(
            new THREE.CylinderGeometry(0.12, 0.14, 0.10, 16),
            new THREE.MeshStandardMaterial({ color: 0x1f071a, metalness: 0.8, roughness: 0.3 })
          );
          ped.position.y = 0.05;
          g.add(ped);

          const crystalMat = new THREE.MeshStandardMaterial({
            color: 0xff2fb0,
            metalness: 0.60,
            roughness: 0.15,
            emissive: 0xaa0066,
            emissiveIntensity: 0.50,
          });
          const crystal = new THREE.Mesh(new THREE.DodecahedronGeometry(0.12, 0), crystalMat);
          crystal.position.y = 0.25;
          g.add(crystal);

          const ring = new THREE.Mesh(
            new THREE.TorusGeometry(0.18, 0.012, 8, 20),
            new THREE.MeshBasicMaterial({ color: 0xc084fc, toneMapped: false })
          );
          ring.rotation.x = Math.PI / 3;
          ring.position.y = 0.25;
          g.add(ring);
          return g;
        },
      },
      {
        x: 0.42,
        title: 'ING. SISTEMAS',
        subtitle: 'UNIV. DEL VALLE',
        colorHex: '#28e8d8',
        build3D: () => {
          const g = new THREE.Group();
          const ped = new THREE.Mesh(
            new THREE.CylinderGeometry(0.12, 0.14, 0.10, 16),
            new THREE.MeshStandardMaterial({ color: 0x051a18, metalness: 0.8, roughness: 0.3 })
          );
          ped.position.y = 0.05;
          g.add(ped);

          const cianMat = new THREE.MeshStandardMaterial({
            color: 0x28e8d8,
            metalness: 0.80,
            roughness: 0.20,
            emissive: 0x0f857a,
            emissiveIntensity: 0.45,
          });
          const chip = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.035), cianMat);
          chip.position.y = 0.25;
          chip.rotation.z = Math.PI / 4;
          g.add(chip);

          const core = new THREE.Mesh(
            new THREE.BoxGeometry(0.08, 0.08, 0.04),
            new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false })
          );
          core.position.y = 0.25;
          g.add(core);
          return g;
        },
      },
    ];

    trophyItems.forEach(item => {
      const tg = item.build3D();
      tg.position.set(item.x, 0.72, 0);
      trophyGroup.add(tg);

      // Placa descriptiva
      const pTex = createPlaqueTexture(item.title, item.subtitle, item.colorHex);
      const pGeo = new THREE.PlaneGeometry(0.40, 0.16);
      const pMesh = new THREE.Mesh(pGeo, new THREE.MeshBasicMaterial({ map: pTex }));
      pMesh.position.set(item.x, 0.50, 0.305);
      trophyGroup.add(pMesh);
    });

    this.add(trophyGroup);

    // ── Pared Posterior: Puerta de Salida "EXIT" ──────────────────────────────
    const exitFrameMat = new THREE.MeshStandardMaterial({ color: 0x0a1c18, roughness: 0.55, flatShading: true });

    const epostGeo = new THREE.BoxGeometry(0.14, 2.50, 0.18);
    epostGeo.translate(0, 1.25, 0);
    const eLeftPost = cel(epostGeo, exitFrameMat);
    eLeftPost.position.set(-0.62, 0, RD / 2 - 0.14);
    this.add(eLeftPost);

    const eRightPost = cel(epostGeo, exitFrameMat);
    eRightPost.position.set(0.62, 0, RD / 2 - 0.14);
    this.add(eRightPost);

    const eLintelGeo = new THREE.BoxGeometry(1.38, 0.16, 0.18);
    const eLintel = cel(eLintelGeo, exitFrameMat);
    eLintel.position.set(0, 2.58, RD / 2 - 0.14);
    this.add(eLintel);

    const exitFillGeo = new THREE.PlaneGeometry(1.24, 2.48);
    const exitFillMat = new THREE.MeshBasicMaterial({
      color: 0x0a201c,
      transparent: true,
      opacity: 0.82,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this._exitFillMat = exitFillMat;
    const exitFillMesh = new THREE.Mesh(exitFillGeo, exitFillMat);
    exitFillMesh.position.set(0, 1.28, RD / 2 - 0.13);
    exitFillMesh.rotation.y = Math.PI;
    this.add(exitFillMesh);

    // Neon cian en la puerta de salida
    const exitNeonGeo = new THREE.BoxGeometry(0.018, 2.46, 0.018);
    const exitNeonMat = new THREE.MeshBasicMaterial({ color: 0x28e8d8, toneMapped: false });
    this._exitNeonMat = exitNeonMat;
    [-0.57, 0.57].forEach(xOff => {
      const n = new THREE.Mesh(exitNeonGeo, exitNeonMat);
      n.position.set(xOff, 1.25, RD / 2 - 0.06);
      this.add(n);
    });
    const exitNeonTop = new THREE.Mesh(new THREE.BoxGeometry(1.16, 0.018, 0.018), exitNeonMat);
    exitNeonTop.position.set(0, 2.50, RD / 2 - 0.06);
    this.add(exitNeonTop);

    // Letrero "EXIT"
    const exitSignTex = createExitSignTexture();
    const exitSignGeo = new THREE.PlaneGeometry(1.08, 0.28);
    const exitSignMesh = new THREE.Mesh(exitSignGeo, new THREE.MeshBasicMaterial({ map: exitSignTex, toneMapped: false }));
    exitSignMesh.position.set(0, 2.82, RD / 2 - 0.08);
    exitSignMesh.rotation.y = Math.PI;
    this.add(exitSignMesh);

    // Hitbox de la puerta de salida
    const exitHitGeo = new THREE.BoxGeometry(1.30, 2.60, 0.50);
    exitHitGeo.translate(0, 1.30, 0);
    this.exitDoorHitbox = new THREE.Mesh(
      exitHitGeo,
      new THREE.MeshBasicMaterial({ visible: false })
    );
    this.exitDoorHitbox.position.set(0, 0, RD / 2 - 0.15);
    this.exitDoorHitbox.userData = { isVaultExit: true };
    this.add(this.exitDoorHitbox);

    // ── ILUMINACIÓN EQUILIBRADA PARA EL ESPACIO COMPACTO ─────────────────────
    // 1. Luz ambiental violeta clara
    this.ambientVault = new THREE.AmbientLight(0x2d1f4d, 2.4);
    this.add(this.ambientVault);

    // 2. Luz direccional frontal que esculpe volúmenes
    const dirFill = new THREE.DirectionalLight(0x9d72ff, 0.85);
    dirFill.position.set(0, RH, RD / 2);
    this.add(dirFill);

    // 3. Foco central cenital
    this.mainVaultLight = new THREE.PointLight(0xb066ff, 2.2, 8.0, 1.2);
    this.mainVaultLight.position.set(0, RH - 0.35, 0);
    this.add(this.mainVaultLight);

    // 4. Foco de acento sobre la máquina vending
    const vendLight = new THREE.PointLight(0x9333ea, 1.6, 3.8, 1.5);
    vendLight.position.set(0, 2.1, -RD / 2 + 1.2);
    this.add(vendLight);

    // 5. Luz cian de la puerta EXIT
    this.exitLight = new THREE.PointLight(0x28e8d8, 2.0, 3.5, 1.5);
    this.exitLight.position.set(0, 1.50, RD / 2 - 0.5);
    this.add(this.exitLight);

    this._time = 0;
    this._exitActivating = false;
    this._exitActivationTimer = 0;
    this._exitActivationDuration = 0.65;
    this._exitActivationCallback = null;
  }

  // Encuadre frontal panorámico centrado en la instalación unificada
  getEntryCameraTarget() {
    const worldPos = new THREE.Vector3();
    this.getWorldPosition(worldPos);
    return {
      pos: new THREE.Vector3(worldPos.x, worldPos.y + 1.85, worldPos.z + 1.80),
      look: new THREE.Vector3(worldPos.x, worldPos.y + 1.40, worldPos.z - 1.80),
    };
  }

  getExitCameraHint() {
    const worldPos = new THREE.Vector3();
    this.getWorldPosition(worldPos);
    return {
      pos: new THREE.Vector3(worldPos.x, worldPos.y + 1.6, worldPos.z + 1.2),
      look: new THREE.Vector3(worldPos.x, worldPos.y + 1.3, worldPos.z + 2.3),
    };
  }

  getHitboxes() {
    return [this.vendingMachine.hitbox, this.exitDoorHitbox];
  }

  activateExit(callback) {
    if (this._exitActivating) return;
    this._exitActivating = true;
    this._exitActivationTimer = 0;
    this._exitActivationCallback = callback || null;
  }

  update(dt, time, prefersReducedMotion = false) {
    this._time += dt;
    this.vendingMachine.update(time, dt);

    if (!prefersReducedMotion && this._crtScreens) {
      this._crtScreens.forEach(crt => crt.update(time));
    }

    if (this._exitActivating) {
      this._exitActivationTimer += dt;
      const p = Math.min(this._exitActivationTimer / this._exitActivationDuration, 1.0);

      const flash1 = Math.exp(-Math.pow((p - 0.08) * 16, 2));
      const flash2 = Math.exp(-Math.pow((p - 0.40) * 16, 2));
      const flash3 = Math.exp(-Math.pow((p - 0.72) * 16, 2));
      const flashTotal = Math.max(flash1, flash2, flash3);

      this.exitLight.intensity = 2.0 + flashTotal * 26.0;

      if (this._exitFillMat) {
        this._exitFillMat.color.setHSL(0.49, 0.92, 0.06 + flashTotal * 0.52);
        this._exitFillMat.opacity = 0.78 + flashTotal * 0.22;
      }

      if (this._exitNeonMat) {
        const neonLum = 0.48 + flashTotal * 0.52;
        this._exitNeonMat.color.setHSL(0.49, 1.0, neonLum);
      }

      this.mainVaultLight.intensity = 2.2 + flashTotal * 4.5;

      if (p >= 1.0) {
        this._exitActivating = false;
        this._exitActivationTimer = 0;
        if (this._exitFillMat) {
          this._exitFillMat.color.set(0x0a201c);
          this._exitFillMat.opacity = 0.82;
        }
        if (this._exitNeonMat) {
          this._exitNeonMat.color.set(0x28e8d8);
        }
        if (this._exitActivationCallback) {
          this._exitActivationCallback();
          this._exitActivationCallback = null;
        }
      }
      return;
    }

    this.exitLight.intensity = 2.0 + Math.sin(time * 1.9) * 0.30;
    this.mainVaultLight.intensity = 2.2 + Math.sin(time * 0.9) * 0.35;
  }
}
