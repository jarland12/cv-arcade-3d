import * as THREE from 'three';
import { VendingMachine } from './VendingMachine.js';

// ─── Geometría personalizada: Carcasa CRT estilo "Tobogán" ────────────────────
// Construye un hexaedro trapezoidal (frustum) donde la parte superior e inclinación
// caen hacia atrás simulando la rampa/tobogán clásica de los televisores de tubo CRT.
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
    // Front face (v0, v3, v2,  v0, v2, v1)
    ...v0, ...v3, ...v2,   ...v0, ...v2, ...v1,
    // Back face (v5, v6, v7,  v5, v7, v4)
    ...v5, ...v6, ...v7,   ...v5, ...v7, ...v4,
    // Top face - "El Tobogán" (v0, v1, v5,  v0, v5, v4)
    ...v0, ...v1, ...v5,   ...v0, ...v5, ...v4,
    // Bottom face (v3, v7, v6,  v3, v6, v2)
    ...v3, ...v7, ...v6,   ...v3, ...v6, ...v2,
    // Right face (v1, v2, v6,  v1, v6, v5)
    ...v1, ...v2, ...v6,   ...v1, ...v6, ...v5,
    // Left face (v4, v7, v3,  v4, v3, v0)
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
  canvas.width = 768;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  function draw() {
    ctx.fillStyle = '#080512';
    ctx.fillRect(0, 0, 768, 128);

    // Borde neón
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 4;
    ctx.strokeRect(6, 6, 756, 116);

    ctx.fillStyle = '#e9d5ff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 28px "Press Start 2P", monospace';
    ctx.shadowColor = '#a855f7';
    ctx.shadowBlur = 18;
    ctx.fillText('★ ARCHIVO SECRETO ★', 384, 52);

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#a855f7';
    ctx.font = '11px "Press Start 2P", monospace';
    ctx.fillText('VAULT · DOCUMENTOS EXCLUSIVOS · ZONA RESTRINGIDA', 384, 96);
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

// ─── Textura de la tabla de High Scores arcade ───────────────────────────────
function createHighScoresTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  const entries = [
    { rank: '1ST', name: 'FUNDADOR MELTDOWN', score: '999999', color: '#ff2fb0' },
    { rank: '2ND', name: 'ANGEL BINANCE ✓',  score: '850000', color: '#f0b43c' },
    { rank: '3RD', name: 'DOCENTE UNIGRAN',   score: '720000', color: '#28e8d8' },
    { rank: '4TH', name: 'ING. SISTEMAS UV',  score: '640000', color: '#c084fc' },
    { rank: '5TH', name: 'TOROS CORREDOR',    score: '520000', color: '#7c4fd6' },
    { rank: '6TH', name: 'SOLAR DIPLOMA',     score: '400000', color: '#3ddc84' },
  ];

  function draw() {
    ctx.fillStyle = '#0a0618';
    ctx.fillRect(0, 0, 768, 512);

    ctx.strokeStyle = '#9333ea';
    ctx.lineWidth = 6;
    ctx.strokeRect(6, 6, 756, 500);

    ctx.fillStyle = '#e9d5ff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 18px "Press Start 2P", monospace';
    ctx.shadowColor = '#c084fc';
    ctx.shadowBlur = 10;
    ctx.fillText('HIGH SCORES · LOGROS', 384, 40);
    ctx.shadowBlur = 0;

    // Scanlines
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    for (let y = 0; y < 512; y += 4) {
      ctx.fillRect(0, y, 768, 2);
    }

    entries.forEach((e, i) => {
      const rowY = 92 + i * 66;

      ctx.fillStyle = i % 2 === 0 ? 'rgba(147, 51, 234, 0.10)' : 'rgba(0,0,0,0)';
      ctx.fillRect(16, rowY - 22, 736, 50);

      ctx.textAlign = 'left';
      ctx.fillStyle = e.color;
      ctx.font = '900 13px "Press Start 2P", monospace';
      ctx.fillText(e.rank, 26, rowY);

      ctx.fillStyle = '#e2e0f0';
      ctx.font = '12px "Press Start 2P", monospace';
      ctx.fillText(e.name, 100, rowY);

      ctx.textAlign = 'right';
      ctx.fillStyle = e.color;
      ctx.font = '900 13px "Press Start 2P", monospace';
      ctx.fillText(e.score, 745, rowY);
    });
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

// ─── Pantalla CRT Animada en Loop (slides temáticos) ─────────────────────────
function createCRTLoopTexture(slideSetIndex = 0) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 384;
  const ctx = canvas.getContext('2d');

  const slidesSetA = [
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
      header: 'WEB3 ARCHIVE ⚡',
      headerColor: '#c084fc',
      lines: [
        { label: 'BLOCKCHAIN', value: 'EVM/SOL', color: '#28e8d8' },
        { label: 'PAYMENTS',   value: 'LIGHTNING', color: '#f0b43c' },
        { label: 'EXPERIENCE', value: 'IMMERSIVE', color: '#ff2fb0' },
        { label: 'STATUS',     value: 'ONLINE',   color: '#3ddc84' },
      ],
      footer: '· DECENTRALIZED TERMINAL ·',
    },
  ];

  const slidesSetB = [
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

  const slides = slideSetIndex === 0 ? slidesSetA : slidesSetB;
  let currentSlide = 0;
  let lastSlideTime = 0;
  const slideDuration = 4.2;

  function renderSlide(slide, time) {
    ctx.fillStyle = '#060312';
    ctx.fillRect(0, 0, 512, 384);

    // Scanlines CRT intensas
    ctx.fillStyle = 'rgba(0,0,0,0.34)';
    for (let y = 0; y < 384; y += 4) ctx.fillRect(0, y, 512, 2);

    // Marco exterior con parpadeo leve de fósforo CRT
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

// ─── Póster Ambiental: Jaime Garzón ──────────────────────────────────────────
function createGarzonPosterTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 704;
  const ctx = canvas.getContext('2d');

  function draw() {
    ctx.fillStyle = '#ebe1c2';
    ctx.fillRect(0, 0, 512, 704);

    ctx.strokeStyle = '#7c5a2b';
    ctx.lineWidth = 12;
    ctx.strokeRect(6, 6, 500, 692);
    ctx.strokeStyle = '#5a3d1c';
    ctx.lineWidth = 4;
    ctx.strokeRect(16, 16, 480, 672);

    ctx.fillStyle = '#1c0d02';
    ctx.fillRect(22, 22, 468, 70);
    ctx.fillStyle = '#ebe1c2';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 18px "Press Start 2P", serif';
    ctx.fillText('EL CUADERNO', 256, 48);
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillText('DE LA CRIPTO', 256, 72);

    ctx.fillStyle = '#3a1a00';
    ctx.font = '8px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('CALI · COLOMBIA · 2024', 26, 108);
    ctx.textAlign = 'right';
    ctx.fillText('ED. MELTDOWN Nº1', 486, 108);

    ctx.strokeStyle = '#3a1a00';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(22, 114); ctx.lineTo(490, 114); ctx.stroke();

    // Sombrero & personaje
    ctx.fillStyle = '#2a1400';
    ctx.fillRect(180, 130, 152, 18);
    ctx.fillRect(196, 112, 120, 22);
    ctx.fillStyle = '#c8a068';
    ctx.fillRect(196, 150, 120, 90);
    ctx.fillStyle = '#1a0a00';
    ctx.fillRect(216, 170, 16, 14);
    ctx.fillRect(280, 170, 16, 14);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(220, 173, 6, 5);
    ctx.fillRect(284, 173, 6, 5);
    ctx.fillStyle = '#2a1400';
    ctx.fillRect(224, 208, 64, 8);
    ctx.fillStyle = '#ff2fb0';
    ctx.fillRect(240, 240, 32, 20);
    ctx.fillRect(248, 255, 16, 28);
    ctx.fillStyle = '#0a0a14';
    ctx.fillRect(164, 268, 184, 130);
    ctx.fillStyle = '#ebe1c2';
    ctx.fillRect(218, 268, 76, 80);

    // Bocadillo
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#2a1400';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(380, 200, 90, 50, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = '#1a0a00';
    ctx.textAlign = 'center';
    ctx.font = '900 9px "Press Start 2P", monospace';
    ctx.fillText('HOY BITCOIN', 380, 190);
    ctx.fillText('VALE MÁS QUE', 380, 205);
    ctx.fillText('MI PENSIÓN', 380, 220);

    // Título artículo
    ctx.fillStyle = '#1a0a00';
    ctx.textAlign = 'center';
    ctx.font = '900 14px "Press Start 2P", serif';
    ctx.fillText('CUANDO MELTDOWN', 256, 430);
    ctx.fillText('ABRIÓ SUS PUERTAS', 256, 452);

    ctx.fillStyle = '#3a2a10';
    ctx.font = '8px "JetBrains Mono", monospace';
    const lines = [
      'Un bar donde el whisky se paga',
      'en satoshis y los cocteles tienen',
      'nombre de altcoins. Jhojan lo soñó',
      'y lo hizo realidad en el corazón',
      'de Cali, Colombia. Referente Web3.',
    ];
    lines.forEach((l, i) => ctx.fillText(l, 256, 490 + i * 18));

    ctx.fillStyle = '#8b6c3a';
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText('VAULT EDITORES · MELTDOWN 2024', 486, 680);
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

// ─── Póster Ambiental: Bitcoin Pizza Day ─────────────────────────────────────
function createBitcoinPizzaPosterTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 704;
  const ctx = canvas.getContext('2d');

  function draw() {
    ctx.fillStyle = '#0c0a07';
    ctx.fillRect(0, 0, 512, 704);

    ctx.fillStyle = '#eee4d4';
    ctx.fillRect(14, 14, 484, 560);
    ctx.fillStyle = '#f5ede0';
    ctx.fillRect(20, 20, 472, 540);

    ctx.fillStyle = '#d0bf9e';
    ctx.fillRect(22, 22, 468, 480);

    // Pizza estilizada
    ctx.fillStyle = '#9e6d24';
    ctx.fillRect(80, 80, 310, 250);
    ctx.fillStyle = '#c58838';
    ctx.fillRect(88, 88, 294, 234);
    ctx.fillStyle = '#f0ae5c';
    ctx.fillRect(100, 100, 270, 210);

    ctx.fillStyle = '#c83020';
    for (let r = 0; r < 6; r++) {
      const rx = 120 + (r % 3) * 80;
      const ry = 130 + Math.floor(r / 3) * 80;
      ctx.beginPath(); ctx.arc(rx, ry, 24, 0, Math.PI * 2); ctx.fill();
    }

    ctx.fillStyle = '#2a1000';
    ctx.textAlign = 'center';
    ctx.font = '900 11px "Press Start 2P", monospace';
    ctx.fillText("PAPA JOHN'S", 256, 330);

    // Logo BTC
    ctx.fillStyle = '#f7931a';
    ctx.beginPath(); ctx.arc(380, 400, 46, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 28px "JetBrains Mono", monospace';
    ctx.fillText('₿', 380, 405);

    ctx.fillStyle = '#1a1208';
    ctx.textAlign = 'center';
    ctx.font = '900 10px "Press Start 2P", monospace';
    ctx.fillText('22 MAY 2010', 256, 548);

    ctx.fillStyle = '#f7931a';
    ctx.fillRect(14, 580, 484, 2);

    ctx.fillStyle = '#f7931a';
    ctx.textAlign = 'center';
    ctx.font = '900 13px "Press Start 2P", monospace';
    ctx.fillText('BITCOIN PIZZA DAY', 256, 616);

    ctx.fillStyle = '#d4be6e';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillText('10,000 BTC = 2 PIZZAS', 256, 640);

    ctx.fillStyle = '#806e48';
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillText('PRIMERA TRANSACCIÓN REAL BTC', 256, 665);
    ctx.fillText('MELTDOWN MEMORABILIA COLLECTION', 256, 683);
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

// ─── Placa descriptiva para trofeos ──────────────────────────────────────────
function createPlaqueTexture(title, subtitle, colorHex) {
  const canvas = document.createElement('canvas');
  canvas.width = 384;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#0a0718';
  ctx.fillRect(0, 0, 384, 128);

  ctx.strokeStyle = colorHex;
  ctx.lineWidth = 4;
  ctx.strokeRect(4, 4, 376, 120);

  ctx.fillStyle = colorHex;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '900 13px "Press Start 2P", monospace';
  ctx.fillText(title, 192, 42);

  ctx.fillStyle = '#beb6dc';
  ctx.font = '9px "Press Start 2P", monospace';
  ctx.fillText(subtitle, 192, 84);

  const tex = new THREE.CanvasTexture(canvas);
  tex.minFilter = THREE.LinearFilter;
  return tex;
}

// ─── Clase Principal: SecretVault ─────────────────────────────────────────────
export class SecretVault extends THREE.Group {
  constructor() {
    super();

    // ── Materiales del Cuarto (con albedos ricos cyberpunk) ──────────────────
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

    // Dimensiones del cuarto
    const RW = 10.0;  // ancho
    const RH = 4.2;   // alto
    const RD = 8.5;   // profundidad

    // ── Suelo del vault ──────────────────────────────────────────────────────
    const floorGeo = new THREE.PlaneGeometry(RW, RD);
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = 0;
    this.add(floorMesh);

    // Grid del suelo con brillo neón violeta sutil
    const gridHelper = new THREE.GridHelper(10, 20, 0x4a327a, 0x221742);
    gridHelper.position.y = 0.002;
    this.add(gridHelper);

    // ── Paredes del Cuarto ───────────────────────────────────────────────────
    // Pared trasera
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

    // Pilastras arquitectónicas verticales en las paredes (dan escala y ritmo 3D)
    [-RD * 0.28, RD * 0.05, RD * 0.35].forEach(zPos => {
      // Pilastra izquierda
      const pL = new THREE.BoxGeometry(0.14, RH, 0.22);
      pL.translate(-RW / 2 + 0.07, RH / 2, zPos);
      this.add(cel(pL, metalMat));

      // Pilastra derecha
      const pR = new THREE.BoxGeometry(0.14, RH, 0.22);
      pR.translate(RW / 2 - 0.07, RH / 2, zPos);
      this.add(cel(pR, metalMat));
    });

    // Zócalo inferior metálico en todo el perímetro
    const baseboardConfigs = [
      [RW, 0.14, 0.12, [0, 0.07, -RD / 2 + 0.06]],
      [0.12, 0.14, RD, [-RW / 2 + 0.06, 0.07, 0]],
      [0.12, 0.14, RD, [RW / 2 - 0.06, 0.07, 0]],
    ];
    baseboardConfigs.forEach(([w, h, d, pos]) => {
      const g = new THREE.BoxGeometry(w, h, d);
      const m = new THREE.Mesh(g, metalMat);
      m.position.set(...pos);
      this.add(m);
    });

    // Moldura superior (cornisa)
    const corniceConfigs = [
      [RW, 0.12, 0.12, [0, RH - 0.06, -RD / 2 + 0.06]],
      [0.12, 0.12, RD, [-RW / 2 + 0.06, RH - 0.06, 0]],
      [0.12, 0.12, RD, [RW / 2 - 0.06, RH - 0.06, 0]],
    ];
    corniceConfigs.forEach(([w, h, d, pos]) => {
      const g = new THREE.BoxGeometry(w, h, d);
      const m = new THREE.Mesh(g, metalMat);
      m.position.set(...pos);
      this.add(m);
    });

    // Tiras de Neón en el techo (ambient glow violeta)
    const ceilNeonGeo = new THREE.BoxGeometry(RW * 0.82, 0.016, 0.024);
    const ceilNeonMat = new THREE.MeshBasicMaterial({ color: 0xa855f7, toneMapped: false });
    [-RD * 0.24, RD * 0.08].forEach(zOff => {
      const n = new THREE.Mesh(ceilNeonGeo, ceilNeonMat);
      n.position.set(0, RH - 0.08, zOff);
      this.add(n);
    });

    // ── Letrero neón superior "★ ARCHIVO SECRETO ★" ──────────────────────────
    const vaultSignTex = createVaultSignTexture();
    const vaultSignGeo = new THREE.PlaneGeometry(5.2, 0.86);
    const vaultSignMesh = new THREE.Mesh(vaultSignGeo, new THREE.MeshBasicMaterial({
      map: vaultSignTex,
      toneMapped: false,
    }));
    vaultSignMesh.position.set(0, RH - 0.65, -RD / 2 + 0.14);
    this.add(vaultSignMesh);

    // Placa soporte detrás del letrero neón
    const signPlateGeo = new THREE.BoxGeometry(5.34, 0.94, 0.08);
    signPlateGeo.translate(0, RH - 0.65, -RD / 2 + 0.10);
    this.add(cel(signPlateGeo, darkMat));

    // Marco neón tubular alrededor del letrero
    const signFrameMat = new THREE.MeshBasicMaterial({ color: 0xc084fc, toneMapped: false });
    const topBar = new THREE.Mesh(new THREE.BoxGeometry(5.36, 0.018, 0.018), signFrameMat);
    topBar.position.set(0, RH - 0.17, -RD / 2 + 0.15);
    this.add(topBar);
    const botBar = new THREE.Mesh(new THREE.BoxGeometry(5.36, 0.018, 0.018), signFrameMat);
    botBar.position.set(0, RH - 1.13, -RD / 2 + 0.15);
    this.add(botBar);

    // ── Pared Trasera - Izquierda: Máquina Vending 3D ────────────────────────
    this.vendingMachine = new VendingMachine();
    this.vendingMachine.position.set(-2.3, 0, -RD / 2 + 0.80);
    this.vendingMachine.rotation.y = 0;
    this.add(this.vendingMachine);

    // ── Pared Trasera - Derecha: Tabla de High Scores Arcade ─────────────────
    // Perfectamente ubicada en el lado derecho de la pared trasera
    const highScoresTex = createHighScoresTexture();
    const hsPanelGeo = new THREE.PlaneGeometry(3.30, 2.20);
    const hsMesh = new THREE.Mesh(hsPanelGeo, new THREE.MeshBasicMaterial({
      map: highScoresTex,
      toneMapped: false,
    }));
    hsMesh.position.set(2.3, 1.95, -RD / 2 + 0.15);
    this.add(hsMesh);

    const hsBezelGeo = new THREE.BoxGeometry(3.42, 2.32, 0.08);
    hsBezelGeo.translate(2.3, 1.95, -RD / 2 + 0.11);
    this.add(cel(hsBezelGeo, darkMat));

    // Ribete neón alrededor de High Scores
    const hsBorderGeo = new THREE.BoxGeometry(3.44, 0.02, 0.02);
    const hsBorderMat = new THREE.MeshBasicMaterial({ color: 0x9333ea, toneMapped: false });
    const hsTopBorder = new THREE.Mesh(hsBorderGeo, hsBorderMat);
    hsTopBorder.position.set(2.3, 3.12, -RD / 2 + 0.16);
    this.add(hsTopBorder);
    const hsBotBorder = new THREE.Mesh(hsBorderGeo, hsBorderMat);
    hsBotBorder.position.set(2.3, 0.78, -RD / 2 + 0.16);
    this.add(hsBotBorder);

    // ── PARED IZQUIERDA: 2 Monitores CRT con auténtica silueta de TOBOGÁN ────
    this._crtScreens = [];

    // Letrero neón sobre los monitores CRT
    const crtBannerGeo = new THREE.PlaneGeometry(2.40, 0.32);
    const crtBannerCanvas = document.createElement('canvas');
    crtBannerCanvas.width = 512; crtBannerCanvas.height = 96;
    const cbc = crtBannerCanvas.getContext('2d');
    cbc.fillStyle = '#070414'; cbc.fillRect(0, 0, 512, 96);
    cbc.strokeStyle = '#28e8d8'; cbc.lineWidth = 6; cbc.strokeRect(4, 4, 504, 88);
    cbc.fillStyle = '#28e8d8'; cbc.textAlign = 'center'; cbc.textBaseline = 'middle';
    cbc.font = '900 13px "Press Start 2P", monospace';
    cbc.fillText('📺 MELTDOWN VINTAGE CRT', 256, 48);
    const crtBannerTex = new THREE.CanvasTexture(crtBannerCanvas);
    crtBannerTex.minFilter = THREE.LinearFilter;
    const crtBannerMesh = new THREE.Mesh(crtBannerGeo, new THREE.MeshBasicMaterial({
      map: crtBannerTex,
      toneMapped: false,
    }));
    crtBannerMesh.position.set(-RW / 2 + 0.14, 2.85, -0.25);
    crtBannerMesh.rotation.y = Math.PI / 2;
    this.add(crtBannerMesh);

    // Configuración de los 2 monitores CRT
    // Angulados ~30° hacia el centro de la sala para que el jugador vea tanto la pantalla convexa
    // como el cuerpo de tobogán en perspectiva 3D
    const crtConfigs = [
      { z: -1.50, y: 1.65, rotY: Math.PI / 2 - 0.50, slideIndex: 0 },
      { z:  1.05, y: 1.65, rotY: Math.PI / 2 - 0.42, slideIndex: 1 },
    ];

    crtConfigs.forEach(({ z, y, rotY, slideIndex }) => {
      const crtGroup = new THREE.Group();
      crtGroup.position.set(-RW / 2 + 0.82, y, z);
      crtGroup.rotation.y = rotY;

      // 1. Chasis estilo "TOBOGÁN" (Frustum trapezoidal que se inclina hacia atrás)
      const wFront = 0.80;
      const hFront = 0.62;
      const wBack = 0.48;
      const hBack = 0.40;
      const depth = 0.48;
      const dropTop = 0.08; // Caída de rampa superior

      const toboganGeo = createCRTToboganGeometry(wFront, hFront, wBack, hBack, depth, dropTop);
      crtGroup.add(cel(toboganGeo, darkMat));

      // 2. Cuello trasero del tubo catódico (la caja trasera de los CRT retro)
      const neckW = 0.32;
      const neckH = 0.28;
      const neckD = 0.20;
      const neckGeo = new THREE.BoxGeometry(neckW, neckH, neckD);
      neckGeo.translate(0, -0.02, -depth - neckD / 2);
      crtGroup.add(cel(neckGeo, darkMat));

      // Rejillas horizontales de ventilación en el cuello trasero
      for (let r = 0; r < 4; r++) {
        const slotGeo = new THREE.BoxGeometry(neckW * 0.75, 0.015, 0.01);
        const slotMesh = new THREE.Mesh(slotGeo, metalMat);
        slotMesh.position.set(0, 0.06 - r * 0.05, -depth - neckD - 0.005);
        crtGroup.add(slotMesh);
      }

      // 3. Bisel frontal del monitor (Bezel ancho que sostiene el vidrio)
      const bezelGeo = new THREE.BoxGeometry(wFront + 0.04, hFront + 0.04, 0.06);
      bezelGeo.translate(0, 0, 0.03);
      crtGroup.add(cel(bezelGeo, metalMat));

      // 4. Pantalla Convexa Abombada hacia adelante con textura animada CRT
      const screenW = 0.60;
      const screenH = 0.46;
      const screenGeo = createCRTScreenGeometry(screenW, screenH, 0.04);
      const crtData = createCRTLoopTexture(slideIndex);
      this._crtScreens.push(crtData);

      const screenMat = new THREE.MeshBasicMaterial({
        map: crtData.texture,
        toneMapped: false,
      });
      const screenMesh = new THREE.Mesh(screenGeo, screenMat);
      screenMesh.position.set(-0.06, 0.02, 0.06);
      crtGroup.add(screenMesh);

      // Vidrio frontal translúcido con brillo de fósforo
      const glassMat = new THREE.MeshStandardMaterial({
        color: 0x1a2e38,
        roughness: 0.10,
        metalness: 0.90,
        transparent: true,
        opacity: 0.18,
      });
      const glassMesh = new THREE.Mesh(screenGeo, glassMat);
      glassMesh.position.set(-0.06, 0.02, 0.065);
      crtGroup.add(glassMesh);

      // 5. Panel de controles retro en el lado derecho del frontal
      const knobGeo = new THREE.CylinderGeometry(0.022, 0.024, 0.028, 12);
      // Perilla 1 (Volumen)
      const knob1 = new THREE.Mesh(knobGeo, chromeMat);
      knob1.rotation.x = Math.PI / 2;
      knob1.position.set(wFront / 2 - 0.06, 0.12, 0.07);
      crtGroup.add(knob1);

      // Perilla 2 (Sintonía / Contraste)
      const knob2 = new THREE.Mesh(knobGeo, chromeMat);
      knob2.rotation.x = Math.PI / 2;
      knob2.position.set(wFront / 2 - 0.06, 0.03, 0.07);
      crtGroup.add(knob2);

      // Ranuras de altavoz frontal
      for (let s = 0; s < 5; s++) {
        const slatGeo = new THREE.BoxGeometry(0.06, 0.008, 0.01);
        const slatMesh = new THREE.Mesh(slatGeo, darkMat);
        slatMesh.position.set(wFront / 2 - 0.06, -0.07 - s * 0.022, 0.065);
        crtGroup.add(slatMesh);
      }

      // Interruptor de encendido con LED verde brillante
      const ledGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.02, 8);
      const ledMat = new THREE.MeshBasicMaterial({ color: 0x3ddc84, toneMapped: false });
      const ledMesh = new THREE.Mesh(ledGeo, ledMat);
      ledMesh.rotation.x = Math.PI / 2;
      ledMesh.position.set(wFront / 2 - 0.06, -0.22, 0.07);
      crtGroup.add(ledMesh);

      // Placa de marca retro "MELT-VISION"
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
      badgeMesh.position.set(-0.06, -hFront / 2 + 0.035, 0.065);
      crtGroup.add(badgeMesh);

      // 6. Brazo articulado industrial de soporte a la pared
      const armGeo = new THREE.CylinderGeometry(0.038, 0.038, 0.70, 10);
      const armMesh = new THREE.Mesh(armGeo, metalMat);
      armMesh.rotation.z = Math.PI / 2;
      armMesh.position.set(-0.35, -0.25, -depth * 0.4);
      crtGroup.add(armMesh);

      // Placa base montada en la pared
      const plateGeo = new THREE.BoxGeometry(0.05, 0.32, 0.32);
      const plateMesh = new THREE.Mesh(plateGeo, metalMat);
      plateMesh.position.set(-0.72, -0.25, -depth * 0.4);
      crtGroup.add(plateMesh);

      this.add(crtGroup);
    });

    // ── PARED DERECHA: Vitrina de Logros/Trofeos 3D + Pósters Memorabilia ─────
    // Ambas secciones tienen su propio espacio dedicado en la pared derecha

    // ── 1. Vitrina de Logros / Sala de Trofeos 3D ──────────────────────────────
    const trophyGroup = new THREE.Group();
    trophyGroup.position.set(RW / 2 - 0.12, 0, -1.50);
    trophyGroup.rotation.y = -Math.PI / 2;

    // Cartel neón de la vitrina
    const trophyBannerGeo = new THREE.PlaneGeometry(2.60, 0.32);
    const tbCanvas = document.createElement('canvas');
    tbCanvas.width = 512; tbCanvas.height = 96;
    const tbCtx = tbCanvas.getContext('2d');
    tbCtx.fillStyle = '#070414'; tbCtx.fillRect(0, 0, 512, 96);
    tbCtx.strokeStyle = '#f0b43c'; tbCtx.lineWidth = 6; tbCtx.strokeRect(4, 4, 504, 88);
    tbCtx.fillStyle = '#f0b43c'; tbCtx.textAlign = 'center'; tbCtx.textBaseline = 'middle';
    tbCtx.font = '900 13px "Press Start 2P", monospace';
    tbCtx.fillText('🏆 SALA DE TROFEOS & LOGROS', 256, 48);
    const tbTex = new THREE.CanvasTexture(tbCanvas);
    const tbMesh = new THREE.Mesh(trophyBannerGeo, new THREE.MeshBasicMaterial({ map: tbTex, toneMapped: false }));
    tbMesh.position.set(0, 2.85, 0.05);
    trophyGroup.add(tbMesh);

    // Mueble vitrina (base de acero)
    const cabinetBaseGeo = new THREE.BoxGeometry(2.70, 0.65, 0.60);
    cabinetBaseGeo.translate(0, 0.325, 0.30);
    trophyGroup.add(cel(cabinetBaseGeo, darkMat));

    // Marco de cristal transparente de la vitrina
    const glassCabinetGeo = new THREE.BoxGeometry(2.70, 1.45, 0.60);
    glassCabinetGeo.translate(0, 1.375, 0.30);
    const cabinetGlassMat = new THREE.MeshStandardMaterial({
      color: 0x99ccff,
      roughness: 0.08,
      metalness: 0.10,
      transparent: true,
      opacity: 0.22,
    });
    trophyGroup.add(new THREE.Mesh(glassCabinetGeo, cabinetGlassMat));
    trophyGroup.add(new THREE.LineSegments(new THREE.EdgesGeometry(glassCabinetGeo), new THREE.LineBasicMaterial({ color: 0x4466aa })));

    // Estante interior iluminado
    const shelfBoardGeo = new THREE.BoxGeometry(2.60, 0.04, 0.54);
    shelfBoardGeo.translate(0, 0.68, 0.30);
    trophyGroup.add(cel(shelfBoardGeo, metalMat));

    // Tira neón dorada en el estante
    const shelfNeon = new THREE.Mesh(
      new THREE.BoxGeometry(2.62, 0.015, 0.015),
      new THREE.MeshBasicMaterial({ color: 0xf0b43c, toneMapped: false })
    );
    shelfNeon.position.set(0, 0.70, 0.57);
    trophyGroup.add(shelfNeon);

    // ── Los 3 Trofeos 3D Esculpidos ──────────────────────────────────────────
    const trophyItems = [
      {
        id: 'binance',
        x: -0.85,
        title: 'BINANCE ANGEL',
        subtitle: 'LATAM AMBASSADOR',
        color: 0xf0b43c,
        colorHex: '#f0b43c',
        build3D: () => {
          const g = new THREE.Group();
          // Pedestal dorado
          const ped = new THREE.Mesh(
            new THREE.CylinderGeometry(0.18, 0.20, 0.12, 16),
            new THREE.MeshStandardMaterial({ color: 0x241a06, metalness: 0.8, roughness: 0.3 })
          );
          ped.position.y = 0.06;
          g.add(ped);

          // Escultura de alas/estrella de Ángel Binance
          const goldMat = new THREE.MeshStandardMaterial({
            color: 0xffd700,
            metalness: 0.90,
            roughness: 0.18,
            emissive: 0xb8860b,
            emissiveIntensity: 0.45,
          });
          const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.16, 0), goldMat);
          star.position.y = 0.32;
          star.rotation.y = Math.PI / 4;
          g.add(star);

          // Alas laterales
          [-0.18, 0.18].forEach(xWing => {
            const wingGeo = new THREE.BoxGeometry(0.04, 0.24, 0.14);
            const wing = new THREE.Mesh(wingGeo, goldMat);
            wing.position.set(xWing, 0.34, 0);
            wing.rotation.z = xWing > 0 ? -0.35 : 0.35;
            g.add(wing);
          });
          return g;
        },
      },
      {
        id: 'meltdown',
        x: 0.0,
        title: 'FUNDADOR MELTDOWN',
        subtitle: 'WEB3 & BAR CALI',
        color: 0xff2fb0,
        colorHex: '#ff2fb0',
        build3D: () => {
          const g = new THREE.Group();
          // Pedestal violeta
          const ped = new THREE.Mesh(
            new THREE.CylinderGeometry(0.18, 0.20, 0.12, 16),
            new THREE.MeshStandardMaterial({ color: 0x1f071a, metalness: 0.8, roughness: 0.3 })
          );
          ped.position.y = 0.06;
          g.add(ped);

          // Cristal holográfico Meltdown
          const crystalMat = new THREE.MeshStandardMaterial({
            color: 0xff2fb0,
            metalness: 0.60,
            roughness: 0.15,
            emissive: 0xaa0066,
            emissiveIntensity: 0.50,
          });
          const crystal = new THREE.Mesh(new THREE.DodecahedronGeometry(0.16, 0), crystalMat);
          crystal.position.y = 0.33;
          g.add(crystal);

          // Anillo orbital
          const ringGeo = new THREE.TorusGeometry(0.24, 0.014, 8, 24);
          const ringMesh = new THREE.Mesh(
            ringGeo,
            new THREE.MeshBasicMaterial({ color: 0xc084fc, toneMapped: false })
          );
          ringMesh.rotation.x = Math.PI / 3;
          ringMesh.position.y = 0.33;
          g.add(ringMesh);
          return g;
        },
      },
      {
        id: 'uv',
        x: 0.85,
        title: 'ING. DE SISTEMAS',
        subtitle: 'UNIV. DEL VALLE',
        color: 0x28e8d8,
        colorHex: '#28e8d8',
        build3D: () => {
          const g = new THREE.Group();
          // Pedestal cian
          const ped = new THREE.Mesh(
            new THREE.CylinderGeometry(0.18, 0.20, 0.12, 16),
            new THREE.MeshStandardMaterial({ color: 0x051a18, metalness: 0.8, roughness: 0.3 })
          );
          ped.position.y = 0.06;
          g.add(ped);

          // Medallón cibernético UV
          const cianMat = new THREE.MeshStandardMaterial({
            color: 0x28e8d8,
            metalness: 0.80,
            roughness: 0.20,
            emissive: 0x0f857a,
            emissiveIntensity: 0.45,
          });
          const chip = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.24, 0.04), cianMat);
          chip.position.y = 0.33;
          chip.rotation.z = Math.PI / 4;
          g.add(chip);

          // Núcleo brillante
          const core = new THREE.Mesh(
            new THREE.BoxGeometry(0.10, 0.10, 0.05),
            new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false })
          );
          core.position.y = 0.33;
          g.add(core);
          return g;
        },
      },
    ];

    trophyItems.forEach(item => {
      const tg = item.build3D();
      tg.position.set(item.x, 0.70, 0.30);
      trophyGroup.add(tg);

      // Placa descriptiva en el frontal del estante
      const pTex = createPlaqueTexture(item.title, item.subtitle, item.colorHex);
      const pGeo = new THREE.PlaneGeometry(0.68, 0.22);
      const pMesh = new THREE.Mesh(pGeo, new THREE.MeshBasicMaterial({ map: pTex }));
      pMesh.position.set(item.x, 0.48, 0.605);
      trophyGroup.add(pMesh);
    });

    this.add(trophyGroup);

    // ── 2. Galería de Pósters Ambientales (Memorabilia) ──────────────────────
    const posterGroup = new THREE.Group();
    posterGroup.position.set(RW / 2 - 0.05, 0, 1.25);
    posterGroup.rotation.y = -Math.PI / 2;

    // Letrero neón sobre los pósters
    const posterBannerGeo = new THREE.PlaneGeometry(2.30, 0.30);
    const pbCanvas = document.createElement('canvas');
    pbCanvas.width = 512; pbCanvas.height = 96;
    const pbCtx = pbCanvas.getContext('2d');
    pbCtx.fillStyle = '#070414'; pbCtx.fillRect(0, 0, 512, 96);
    pbCtx.strokeStyle = '#f7931a'; pbCtx.lineWidth = 6; pbCtx.strokeRect(4, 4, 504, 88);
    pbCtx.fillStyle = '#f7931a'; pbCtx.textAlign = 'center'; pbCtx.textBaseline = 'middle';
    pbCtx.font = '900 13px "Press Start 2P", monospace';
    pbCtx.fillText('🖼 MEMORABILIA & HISTORIA', 256, 48);
    const pbTex = new THREE.CanvasTexture(pbCanvas);
    const pbMesh = new THREE.Mesh(posterBannerGeo, new THREE.MeshBasicMaterial({ map: pbTex, toneMapped: false }));
    pbMesh.position.set(0, 2.85, 0.05);
    posterGroup.add(pbMesh);

    // Póster 1: Jaime Garzón
    const garzonTex = createGarzonPosterTexture();
    const garzonGeo = new THREE.PlaneGeometry(0.96, 1.34);
    const garzonMesh = new THREE.Mesh(garzonGeo, new THREE.MeshBasicMaterial({ map: garzonTex }));
    garzonMesh.position.set(-0.62, 1.80, 0.05);
    posterGroup.add(garzonMesh);

    const garzonFrameGeo = new THREE.BoxGeometry(1.04, 1.42, 0.04);
    garzonFrameGeo.translate(-0.62, 1.80, 0.02);
    posterGroup.add(cel(garzonFrameGeo, metalMat));

    // Póster 2: Bitcoin Pizza Day
    const pizzaTex = createBitcoinPizzaPosterTexture();
    const pizzaGeo = new THREE.PlaneGeometry(0.96, 1.34);
    const pizzaMesh = new THREE.Mesh(pizzaGeo, new THREE.MeshBasicMaterial({ map: pizzaTex }));
    pizzaMesh.position.set(0.62, 1.80, 0.05);
    posterGroup.add(pizzaMesh);

    const pizzaFrameGeo = new THREE.BoxGeometry(1.04, 1.42, 0.04);
    pizzaFrameGeo.translate(0.62, 1.80, 0.02);
    posterGroup.add(cel(pizzaFrameGeo, metalMat));

    // Focos decorativos dorados sobre los marcos
    [-0.62, 0.62].forEach(fx => {
      const lampGeo = new THREE.BoxGeometry(0.40, 0.03, 0.08);
      const lampMesh = new THREE.Mesh(lampGeo, chromeMat);
      lampMesh.position.set(fx, 2.56, 0.08);
      posterGroup.add(lampMesh);
    });

    this.add(posterGroup);

    // ── Pared Frontal: Puerta de Salida "EXIT" ────────────────────────────────
    const exitFrameMat = new THREE.MeshStandardMaterial({ color: 0x0a1c18, roughness: 0.55, flatShading: true });

    // Montantes de la puerta
    const epostGeo = new THREE.BoxGeometry(0.14, 2.60, 0.20);
    epostGeo.translate(0, 1.30, 0);
    const eLeftPost = cel(epostGeo, exitFrameMat);
    eLeftPost.position.set(-0.62, 0, RD / 2 - 0.14);
    this.add(eLeftPost);

    const eRightPost = cel(epostGeo, exitFrameMat);
    eRightPost.position.set(0.62, 0, RD / 2 - 0.14);
    this.add(eRightPost);

    // Dintel
    const eLintelGeo = new THREE.BoxGeometry(1.38, 0.16, 0.20);
    const eLintel = cel(eLintelGeo, exitFrameMat);
    eLintel.position.set(0, 2.68, RD / 2 - 0.14);
    this.add(eLintel);

    // Umbral
    const eThreshGeo = new THREE.BoxGeometry(1.26, 0.08, 0.22);
    const eThresh = cel(eThreshGeo, exitFrameMat);
    eThresh.position.set(0, 0.04, RD / 2 - 0.14);
    this.add(eThresh);

    // Relleno de la puerta de salida
    const exitFillGeo = new THREE.PlaneGeometry(1.24, 2.58);
    const exitFillMat = new THREE.MeshBasicMaterial({
      color: 0x0a201c,
      transparent: true,
      opacity: 0.82,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this._exitFillMat = exitFillMat;
    const exitFillMesh = new THREE.Mesh(exitFillGeo, exitFillMat);
    exitFillMesh.position.set(0, 1.33, RD / 2 - 0.13);
    exitFillMesh.rotation.y = Math.PI;
    this.add(exitFillMesh);

    // Neon cian en la puerta de salida
    const exitNeonGeo = new THREE.BoxGeometry(0.018, 2.56, 0.018);
    const exitNeonMat = new THREE.MeshBasicMaterial({ color: 0x28e8d8, toneMapped: false });
    this._exitNeonMat = exitNeonMat;
    [-0.57, 0.57].forEach(xOff => {
      const n = new THREE.Mesh(exitNeonGeo, exitNeonMat);
      n.position.set(xOff, 1.28, RD / 2 - 0.06);
      this.add(n);
    });
    const exitNeonTop = new THREE.Mesh(new THREE.BoxGeometry(1.16, 0.018, 0.018), exitNeonMat);
    exitNeonTop.position.set(0, 2.60, RD / 2 - 0.06);
    this.add(exitNeonTop);

    // Letrero "EXIT"
    const exitSignTex = createExitSignTexture();
    const exitSignGeo = new THREE.PlaneGeometry(1.08, 0.28);
    const exitSignMesh = new THREE.Mesh(exitSignGeo, new THREE.MeshBasicMaterial({ map: exitSignTex, toneMapped: false }));
    exitSignMesh.position.set(0, 2.94, RD / 2 - 0.08);
    exitSignMesh.rotation.y = Math.PI;
    this.add(exitSignMesh);

    const exitSignPlateGeo = new THREE.BoxGeometry(1.14, 0.32, 0.05);
    exitSignPlateGeo.translate(0, 2.94, RD / 2 - 0.12);
    this.add(cel(exitSignPlateGeo, exitFrameMat));

    // Hitbox de la puerta de salida
    const exitHitGeo = new THREE.BoxGeometry(1.30, 2.70, 0.50);
    exitHitGeo.translate(0, 1.35, 0);
    this.exitDoorHitbox = new THREE.Mesh(
      exitHitGeo,
      new THREE.MeshBasicMaterial({ visible: false })
    );
    this.exitDoorHitbox.position.set(0, 0, RD / 2 - 0.15);
    this.exitDoorHitbox.userData = { isVaultExit: true };
    this.add(this.exitDoorHitbox);

    // ── ARQUITECTURA DE ILUMINACIÓN EQUILIBRADA (Sin exceder límites WebGL) ──
    // 1. Luz ambiental violeta para legibilidad y tono retro
    this.ambientVault = new THREE.AmbientLight(0x281944, 2.2);
    this.add(this.ambientVault);

    // 2. Luz direccional cenital que define volúmenes arquitectónicos
    const dirFill = new THREE.DirectionalLight(0x9b70df, 0.75);
    dirFill.position.set(0, RH, RD / 2);
    this.add(dirFill);

    // 3. Luz puntual central en el techo (proporciona el ambiente general de bóveda)
    this.mainVaultLight = new THREE.PointLight(0xb066ff, 2.2, 14, 1.2);
    this.mainVaultLight.position.set(0, RH - 0.4, 0);
    this.add(this.mainVaultLight);

    // 4. Luz de acento sobre la máquina expendedora
    const vendLight = new THREE.PointLight(0x9333ea, 1.5, 4.0, 1.6);
    vendLight.position.set(-2.3, 2.2, -RD / 2 + 1.2);
    this.add(vendLight);

    // 5. Luz cian de la puerta de salida EXIT
    this.exitLight = new THREE.PointLight(0x28e8d8, 2.0, 4.0, 1.5);
    this.exitLight.position.set(0, 1.60, RD / 2 - 0.6);
    this.add(this.exitLight);

    this._time = 0;
    this._exitActivating = false;
    this._exitActivationTimer = 0;
    this._exitActivationDuration = 0.65;
    this._exitActivationCallback = null;
  }

  // Posición de cámara al entrar: encuadre panorámico completo
  getEntryCameraTarget() {
    const worldPos = new THREE.Vector3();
    this.getWorldPosition(worldPos);
    return {
      pos: new THREE.Vector3(worldPos.x, worldPos.y + 2.10, worldPos.z + 3.35),
      look: new THREE.Vector3(worldPos.x, worldPos.y + 1.65, worldPos.z - 0.9),
    };
  }

  getExitCameraHint() {
    const worldPos = new THREE.Vector3();
    this.getWorldPosition(worldPos);
    return {
      pos: new THREE.Vector3(worldPos.x, worldPos.y + 1.8, worldPos.z + 2.5),
      look: new THREE.Vector3(worldPos.x, worldPos.y + 1.3, worldPos.z + 4.5),
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

    // Actualizar monitores CRT animados en loop
    if (!prefersReducedMotion && this._crtScreens) {
      this._crtScreens.forEach(crt => crt.update(time));
    }

    // Animación de activación de la puerta EXIT
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

    // Pulso sutil de iluminación en reposo
    this.exitLight.intensity = 2.0 + Math.sin(time * 1.9) * 0.30;
    this.mainVaultLight.intensity = 2.2 + Math.sin(time * 0.9) * 0.35;
  }
}
