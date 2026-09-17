import * as THREE from 'three';
import { VendingMachine } from './VendingMachine.js';

// ─── Textura del letrero neón del vault ──────────────────────────────────────
function createVaultSignTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  function draw() {
    ctx.fillStyle = '#08050f';
    ctx.fillRect(0, 0, 768, 128);

    ctx.fillStyle = '#c084fc';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 28px "Press Start 2P", monospace';
    ctx.shadowColor = '#9333ea';
    ctx.shadowBlur = 14;
    ctx.fillText('★ ARCHIVO SECRETO ★', 384, 54);

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#7c4fd6';
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

// ─── Textura de la vitrina de trofeos / logros ───────────────────────────────
function createTrophyShelfTexture(label, subtitle, colorHex) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  function draw() {
    ctx.fillStyle = '#06040e';
    ctx.fillRect(0, 0, 256, 256);

    ctx.strokeStyle = colorHex;
    ctx.lineWidth = 6;
    ctx.strokeRect(5, 5, 246, 246);

    // Trophy emoji substituido por forma geométrica
    ctx.fillStyle = colorHex;
    ctx.font = '52px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🏆', 128, 90);

    ctx.fillStyle = colorHex;
    ctx.font = '900 10px "Press Start 2P", monospace';
    ctx.fillText(label, 128, 165);

    ctx.fillStyle = '#9e94c2';
    ctx.font = '8px "Press Start 2P", monospace';

    // Wrap del subtítulo
    const words = subtitle.split(' ');
    let line = '';
    let lineY = 195;
    words.forEach(word => {
      const test = line + word + ' ';
      if (ctx.measureText(test).width > 220 && line !== '') {
        ctx.fillText(line.trim(), 128, lineY);
        line = word + ' ';
        lineY += 20;
      } else {
        line = test;
      }
    });
    if (line.trim()) ctx.fillText(line.trim(), 128, lineY);
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
    ctx.fillStyle = '#06040e';
    ctx.fillRect(0, 0, 768, 512);

    ctx.strokeStyle = '#9333ea';
    ctx.lineWidth = 6;
    ctx.strokeRect(6, 6, 756, 500);

    ctx.fillStyle = '#c084fc';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 18px "Press Start 2P", monospace';
    ctx.fillText('HIGH SCORES · LOGROS', 384, 38);

    // Scanlines
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    for (let y = 0; y < 512; y += 4) {
      ctx.fillRect(0, y, 768, 2);
    }

    entries.forEach((e, i) => {
      const rowY = 90 + i * 66;

      // Fondo alternante
      ctx.fillStyle = i % 2 === 0 ? 'rgba(124,79,214,0.07)' : 'rgba(0,0,0,0)';
      ctx.fillRect(16, rowY - 22, 736, 50);

      ctx.textAlign = 'left';
      ctx.fillStyle = e.color;
      ctx.font = '900 13px "Press Start 2P", monospace';
      ctx.fillText(e.rank, 26, rowY);

      ctx.fillStyle = '#d0cde8';
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
    ctx.fillStyle = '#04080f';
    ctx.fillRect(0, 0, 384, 96);

    ctx.strokeStyle = '#28e8d8';
    ctx.lineWidth = 6;
    ctx.strokeRect(5, 5, 374, 86);

    ctx.fillStyle = '#28e8d8';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 18px "Press Start 2P", monospace';
    ctx.fillText('◀ EXIT ◀', 192, 38);

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

// ─── Pantalla CRT Animada en Loop (slides de MELTDOWN) ───────────────────────
function createCRTLoopTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 384;
  const ctx = canvas.getContext('2d');

  // Slides que se muestran en ciclo (simula "clips mudos" de MELTDOWN)
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
  const slideDuration = 4.0; // segundos por slide

  function renderSlide(slide, time) {
    ctx.fillStyle = '#040210';
    ctx.fillRect(0, 0, 512, 384);

    // Scanlines CRT
    ctx.fillStyle = 'rgba(0,0,0,0.30)';
    for (let y = 0; y < 384; y += 4) ctx.fillRect(0, y, 512, 2);

    // Marco exterior
    ctx.strokeStyle = slide.headerColor;
    ctx.lineWidth = 8;
    ctx.strokeRect(6, 6, 500, 372);

    // Parpadeo leve de todo el marco (simula CRT)
    const flicker = 0.92 + Math.sin(time * 47) * 0.04;
    ctx.globalAlpha = flicker;

    // Header
    ctx.fillStyle = '#0c0820';
    ctx.fillRect(14, 14, 484, 52);
    ctx.fillStyle = slide.headerColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 16px "Press Start 2P", monospace';
    ctx.fillText(slide.header, 256, 40);

    // Separator
    ctx.strokeStyle = slide.headerColor;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(20, 74); ctx.lineTo(492, 74); ctx.stroke();

    // Filas de datos
    slide.lines.forEach((row, i) => {
      const rowY = 115 + i * 60;
      ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0)';
      ctx.fillRect(18, rowY - 18, 476, 42);

      ctx.textAlign = 'left';
      ctx.fillStyle = '#9e94c2';
      ctx.font = '11px "Press Start 2P", monospace';
      ctx.fillText(row.label, 30, rowY + 4);

      ctx.textAlign = 'right';
      ctx.fillStyle = row.color;
      ctx.font = '900 14px "Press Start 2P", monospace';
      ctx.fillText(row.value, 490, rowY + 4);
    });

    // Barra de progreso del slide
    const prog = ((time - lastSlideTime) % slideDuration) / slideDuration;
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(18, 358, 476, 10);
    ctx.fillStyle = slide.headerColor;
    ctx.fillRect(18, 358, 476 * prog, 10);

    // Footer
    ctx.fillStyle = '#5e5880';
    ctx.textAlign = 'center';
    ctx.font = '9px "Press Start 2P", monospace';
    ctx.fillText(slide.footer, 256, 347);

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

// ─── Póster Ambiental: Estilo Jaime Garzón (memorabilia MELTDOWN) ─────────────
function createGarzonPosterTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 704;
  const ctx = canvas.getContext('2d');

  function draw() {
    // Fondo color periódico amarillento-envejecido
    ctx.fillStyle = '#e8ddb8';
    ctx.fillRect(0, 0, 512, 704);

    // Bordes de papel viejo
    ctx.strokeStyle = '#8b6c3a';
    ctx.lineWidth = 12;
    ctx.strokeRect(6, 6, 500, 692);
    ctx.strokeStyle = '#6b4c2a';
    ctx.lineWidth = 4;
    ctx.strokeRect(16, 16, 480, 672);

    // Cabecera estilo periódico
    ctx.fillStyle = '#1a0a00';
    ctx.fillRect(22, 22, 468, 70);
    ctx.fillStyle = '#e8ddb8';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 18px "Press Start 2P", serif';
    ctx.fillText('EL CUADERNO', 256, 48);
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillText('DE LA CRIPTO', 256, 72);

    // Fecha estilo encabezado de columna
    ctx.fillStyle = '#3a1a00';
    ctx.font = '8px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('CALI · COLOMBIA · 2024', 26, 108);
    ctx.textAlign = 'right';
    ctx.fillText('ED. MELTDOWN Nº1', 486, 108);

    // Linea separadora
    ctx.strokeStyle = '#3a1a00';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(22, 114); ctx.lineTo(490, 114); ctx.stroke();

    // "Ilustración" — Personaje con sombrero estilo Garzón en pixel art abstracto
    ctx.fillStyle = '#2a1400';
    // Sombrero
    ctx.fillRect(180, 130, 152, 18);
    ctx.fillRect(196, 112, 120, 22);
    // Cabeza
    ctx.fillStyle = '#c8a068';
    ctx.fillRect(196, 150, 120, 90);
    // Ojos
    ctx.fillStyle = '#1a0a00';
    ctx.fillRect(216, 170, 16, 14);
    ctx.fillRect(280, 170, 16, 14);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(220, 173, 6, 5);
    ctx.fillRect(284, 173, 6, 5);
    // Bigote
    ctx.fillStyle = '#2a1400';
    ctx.fillRect(224, 208, 64, 8);
    // Corbatín
    ctx.fillStyle = '#ff2fb0';
    ctx.fillRect(240, 240, 32, 20);
    ctx.fillRect(248, 255, 16, 28);
    // Traje
    ctx.fillStyle = '#0a0a14';
    ctx.fillRect(164, 268, 184, 130);
    ctx.fillStyle = '#e8ddb8';
    ctx.fillRect(218, 268, 76, 80);

    // Bocadillo / burbuja de texto
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#2a1400';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(380, 200, 90, 50, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    // Pico de bocadillo
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(320, 230); ctx.lineTo(295, 260); ctx.lineTo(340, 240);
    ctx.closePath(); ctx.fill(); ctx.stroke();

    ctx.fillStyle = '#1a0a00';
    ctx.textAlign = 'center';
    ctx.font = '900 9px "Press Start 2P", monospace';
    ctx.fillText('HOY BITCOIN', 380, 190);
    ctx.fillText('VALE MÁS QUE', 380, 205);
    ctx.fillText('MI PENSIÓN', 380, 220);

    // Título del artículo
    ctx.fillStyle = '#1a0a00';
    ctx.textAlign = 'center';
    ctx.font = '900 14px "Press Start 2P", serif';
    ctx.fillText('CUANDO MELTDOWN', 256, 430);
    ctx.fillText('ABRIÓ SUS PUERTAS', 256, 452);

    // Cuerpo del artículo (líneas decorativas de texto)
    ctx.fillStyle = '#3a2a10';
    ctx.font = '8px "JetBrains Mono", monospace';
    const loremLines = [
      'Un bar donde el whisky se paga',
      'en satoshis y los cocteles tienen',
      'nombre de altcoins. Jhojan lo soñó',
      'y lo hizo realidad en el corazón',
      'de Cali, Colombia. Referente Web3.',
    ];
    loremLines.forEach((l, i) => ctx.fillText(l, 256, 490 + i * 18));

    // Firma estilo Garzón
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

// ─── Póster Ambiental: Bitcoin Pizza Day (memorabilia) ───────────────────────
function createBitcoinPizzaPosterTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 704;
  const ctx = canvas.getContext('2d');

  function draw() {
    // Fondo negro foto retro con textura de grano
    ctx.fillStyle = '#0a0806';
    ctx.fillRect(0, 0, 512, 704);

    // Marco de foto polaroid
    ctx.fillStyle = '#e8e0d0';
    ctx.fillRect(14, 14, 484, 560);
    ctx.fillStyle = '#f0e8d8';
    ctx.fillRect(20, 20, 472, 540);

    // "Foto" en escala de grises — pizza y BTC estilizados
    ctx.fillStyle = '#c8b89a';
    ctx.fillRect(22, 22, 468, 480);

    // Granos de película retro
    for (let i = 0; i < 300; i++) {
      const gx = 22 + Math.sin(i * 127.3) * 234 + 234;
      const gy = 22 + Math.cos(i * 89.7) * 240 + 240;
      ctx.fillStyle = `rgba(${Math.floor(150 + Math.sin(i) * 50)},${Math.floor(140 + Math.cos(i) * 40)},${Math.floor(120 + Math.sin(i * 2) * 30)},0.4)`;
      ctx.fillRect(gx, gy, 2, 2);
    }

    // Pizza (caja) — pixelada retro
    ctx.fillStyle = '#8b6020';
    ctx.fillRect(80, 80, 310, 250);
    ctx.fillStyle = '#b07830';
    ctx.fillRect(88, 88, 294, 234);
    ctx.fillStyle = '#e8a050';
    ctx.fillRect(100, 100, 270, 210);
    // "Topping" simplificado
    ctx.fillStyle = '#c83020';
    for (let r = 0; r < 6; r++) {
      const rx = 120 + (r % 3) * 80;
      const ry = 130 + Math.floor(r / 3) * 80;
      ctx.beginPath(); ctx.arc(rx, ry, 24, 0, Math.PI * 2); ctx.fill();
    }
    // Texto en caja de pizza
    ctx.fillStyle = '#2a1000';
    ctx.textAlign = 'center';
    ctx.font = '900 11px "Press Start 2P", monospace';
    ctx.fillText("PAPA JOHN'S", 256, 330);
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillText('ORDEN N° 0001', 256, 350);

    // Logo BTC simplificado
    ctx.fillStyle = '#f7931a';
    ctx.beginPath(); ctx.arc(380, 400, 46, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 28px "JetBrains Mono", monospace';
    ctx.fillText('₿', 380, 405);

    // Leyenda debajo de la foto (zona blanca de polaroid)
    ctx.fillStyle = '#1a1208';
    ctx.textAlign = 'center';
    ctx.font = '900 10px "Press Start 2P", monospace';
    ctx.fillText('22 MAY 2010', 256, 548);

    // Zona inferior negra del póster
    ctx.fillStyle = '#f7931a';
    ctx.fillRect(14, 580, 484, 2);

    ctx.fillStyle = '#f7931a';
    ctx.textAlign = 'center';
    ctx.font = '900 13px "Press Start 2P", monospace';
    ctx.fillText('BITCOIN PIZZA DAY', 256, 616);

    ctx.fillStyle = '#c8b060';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillText('10,000 BTC = 2 PIZZAS', 256, 640);

    ctx.fillStyle = '#6a5838';
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

// ─── SecretVault ──────────────────────────────────────────────────────────────
export class SecretVault extends THREE.Group {
  constructor() {
    super();

    const darkMat = new THREE.MeshStandardMaterial({ color: 0x080614, roughness: 0.80, flatShading: true });
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x0a0819, roughness: 0.72, metalness: 0.12, flatShading: true });
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x07060f, roughness: 0.30, metalness: 0.30 });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x3d3554, roughness: 0.45, metalness: 0.40, flatShading: true });
    const edgeMat = new THREE.LineBasicMaterial({ color: 0x030206 });

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

    // Grid del suelo
    const gridHelper = new THREE.GridHelper(10, 20, 0x2a1f4a, 0x1a1030);
    gridHelper.position.y = 0.002;
    this.add(gridHelper);

    // ── Paredes ───────────────────────────────────────────────────────────────
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
    this.add(new THREE.Mesh(ceilGeo, darkMat));

    // Zócalo inferior en paredes
    const baseboardColors = [[RW, 0.12, 0.12, [0, 0.06, -RD / 2]], [RW, 0.12, 0.12, [0, 0.06, 0]], [0.12, 0.12, RD, [-RW / 2, 0.06, 0]], [0.12, 0.12, RD, [RW / 2, 0.06, 0]]];
    baseboardColors.forEach(([w, h, d, pos]) => {
      const g = new THREE.BoxGeometry(w, h, d);
      const m = new THREE.Mesh(g, metalMat);
      m.position.set(...pos);
      this.add(m);
    });

    // ── Tiras de Neón violeta en el techo (ambient ceiling glow) ─────────────
    const ceilNeonGeo = new THREE.BoxGeometry(RW * 0.78, 0.014, 0.02);
    const ceilNeonMat = new THREE.MeshBasicMaterial({ color: 0x9333ea, toneMapped: false });
    [-RD * 0.28, RD * 0.05].forEach(zOff => {
      const n = new THREE.Mesh(ceilNeonGeo, ceilNeonMat);
      n.position.set(0, RH - 0.10, zOff);
      this.add(n);
    });

    // ── Letrero neón "ARCHIVO SECRETO" ───────────────────────────────────────
    const vaultSignTex = createVaultSignTexture();
    const vaultSignGeo = new THREE.PlaneGeometry(5.0, 0.84);
    const vaultSignMesh = new THREE.Mesh(vaultSignGeo, new THREE.MeshBasicMaterial({ map: vaultSignTex, toneMapped: false }));
    vaultSignMesh.position.set(0, RH - 0.68, -RD / 2 + 0.12);
    this.add(vaultSignMesh);

    // Placa detrás del letrero
    const signPlateGeo = new THREE.BoxGeometry(5.10, 0.92, 0.06);
    signPlateGeo.translate(0, RH - 0.68, -RD / 2 + 0.09);
    this.add(cel(signPlateGeo, darkMat));

    // ── Máquina Vending de Cartuchos 3D ─────────────────────────────────────
    this.vendingMachine = new VendingMachine();
    this.vendingMachine.position.set(-2.2, 0, -RD / 2 + 0.80);
    this.vendingMachine.rotation.y = 0; // De frente
    this.add(this.vendingMachine);

    // ── Vitrina de Logros / Trofeos ───────────────────────────────────────────
    const trophies = [
      { label: 'BINANCE ANGEL', subtitle: 'Ambassador Oficial LATAM', color: '#f0b43c' },
      { label: 'MELTDOWN',      subtitle: 'Fundador & CEO Web3', color: '#ff2fb0' },
      { label: 'ING. SISTEMAS', subtitle: 'Universidad del Valle', color: '#28e8d8' },
    ];

    const shelfX = 2.6;
    const shelfBaseY = 1.10;

    // Estante
    const shelfGeo = new THREE.BoxGeometry(3.0, 0.07, 0.42);
    shelfGeo.translate(shelfX, shelfBaseY - 0.04, -RD / 2 + 0.35);
    this.add(cel(shelfGeo, metalMat));

    trophies.forEach((t, i) => {
      const tex = createTrophyShelfTexture(t.label, t.subtitle, t.color);
      const planeGeo = new THREE.PlaneGeometry(0.74, 0.74);
      const mesh = new THREE.Mesh(planeGeo, new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));

      const px = shelfX - 0.92 + i * 0.96;
      mesh.position.set(px, shelfBaseY + 0.43, -RD / 2 + 0.12);
      this.add(mesh);

      // Peana de cada trofeo
      const pedGeo = new THREE.BoxGeometry(0.76, 0.78, 0.06);
      pedGeo.translate(px, shelfBaseY + 0.43, -RD / 2 + 0.09);
      this.add(cel(pedGeo, darkMat));

      // Micro punto de luz de cada trofeo
      const tLight = new THREE.PointLight(new THREE.Color(t.color), 1.0, 1.8, 1.8);
      tLight.position.set(px, shelfBaseY + 0.85, -RD / 2 + 0.55);
      this.add(tLight);
    });

    // ── Tabla de High Scores ──────────────────────────────────────────────────
    const highScoresTex = createHighScoresTexture();
    const hsPanelGeo = new THREE.PlaneGeometry(3.20, 2.14);
    const hsMesh = new THREE.Mesh(hsPanelGeo, new THREE.MeshBasicMaterial({ map: highScoresTex, toneMapped: false }));
    hsMesh.position.set(2.8, 1.80, -RD / 2 + 0.13);
    this.add(hsMesh);

    const hsBezelGeo = new THREE.BoxGeometry(3.30, 2.22, 0.06);
    hsBezelGeo.translate(2.8, 1.80, -RD / 2 + 0.10);
    this.add(cel(hsBezelGeo, darkMat));

    // ── Pantallas CRT Animadas en Loop (Pared Izquierda) ─────────────────────
    // Simula "clips mudos de MELTDOWN" — 2 monitores CRT en pedestales
    this._crtScreens = [];

    const crtPositions = [
      { x: -RW / 2 + 0.12, y: 1.75, z: 0.8,  rotY:  Math.PI / 2 },
      { x: -RW / 2 + 0.12, y: 1.75, z: -2.0, rotY:  Math.PI / 2 },
    ];

    crtPositions.forEach(({ x, y, z, rotY }) => {
      const crtGroup = new THREE.Group();
      crtGroup.position.set(x, y, z);
      crtGroup.rotation.y = rotY;

      // Carcasa del CRT
      const crtCaseGeo = new THREE.BoxGeometry(0.70, 0.56, 0.44);
      crtCaseGeo.translate(0, 0, 0);
      crtGroup.add(cel(crtCaseGeo, darkMat));

      // Cuello del CRT (más ancho atrás)
      const crtNeckGeo = new THREE.BoxGeometry(0.56, 0.46, 0.26);
      crtNeckGeo.translate(0, 0, -0.32);
      crtGroup.add(new THREE.Mesh(crtNeckGeo, darkMat));

      // Bisel de la pantalla
      const bezelGeo = new THREE.BoxGeometry(0.66, 0.52, 0.04);
      crtGroup.add(cel(bezelGeo, metalMat));

      // Pantalla animada
      const crtData = createCRTLoopTexture();
      this._crtScreens.push(crtData);
      const screenGeo = new THREE.PlaneGeometry(0.56, 0.42);
      const screenMesh = new THREE.Mesh(screenGeo, new THREE.MeshBasicMaterial({
        map: crtData.texture,
        toneMapped: false,
      }));
      screenMesh.position.z = 0.022;
      crtGroup.add(screenMesh);

      // Botón de encendido
      const btnGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.025, 8);
      const btnMesh = new THREE.Mesh(btnGeo, new THREE.MeshBasicMaterial({ color: 0x3ddc84 }));
      btnMesh.rotation.x = Math.PI / 2;
      btnMesh.position.set(0.28, -0.20, 0.022);
      crtGroup.add(btnMesh);

      // Pedestal / soporte del monitor
      const standGeo = new THREE.BoxGeometry(0.10, 0.22, 0.10);
      standGeo.translate(0, -0.39, 0);
      crtGroup.add(cel(standGeo, metalMat));

      const standBaseGeo = new THREE.BoxGeometry(0.44, 0.05, 0.34);
      standBaseGeo.translate(0, -0.50, 0);
      crtGroup.add(cel(standBaseGeo, metalMat));

      // Luz de pantalla
      const screenLight = new THREE.PointLight(0x28e8d8, 0.8, 2.0, 1.8);
      screenLight.position.set(0, 0, 0.50);
      crtGroup.add(screenLight);

      this.add(crtGroup);
    });

    // Letrero sobre los monitores CRT
    const crtLabelGeo = new THREE.PlaneGeometry(1.50, 0.22);
    const crtLabelCtx = document.createElement('canvas');
    crtLabelCtx.width = 512; crtLabelCtx.height = 80;
    const crtLCtx = crtLabelCtx.getContext('2d');
    crtLCtx.fillStyle = '#06040e';
    crtLCtx.fillRect(0, 0, 512, 80);
    crtLCtx.strokeStyle = '#28e8d8';
    crtLCtx.lineWidth = 6;
    crtLCtx.strokeRect(4, 4, 504, 72);
    crtLCtx.fillStyle = '#28e8d8';
    crtLCtx.textAlign = 'center';
    crtLCtx.textBaseline = 'middle';
    crtLCtx.font = '900 12px "Press Start 2P", monospace';
    crtLCtx.fillText('📺 MELTDOWN EN VIVO', 256, 40);
    const crtLabelTex = new THREE.CanvasTexture(crtLabelCtx);
    crtLabelTex.minFilter = THREE.LinearFilter;
    const crtLabelMesh = new THREE.Mesh(crtLabelGeo, new THREE.MeshBasicMaterial({ map: crtLabelTex, toneMapped: false }));
    crtLabelMesh.position.set(-RW / 2 + 0.12, 2.60, -0.60);
    crtLabelMesh.rotation.y = Math.PI / 2;
    this.add(crtLabelMesh);
    if (document.fonts) {
      document.fonts.ready.then(() => {
        crtLCtx.clearRect(0, 0, 512, 80);
        crtLCtx.fillStyle = '#06040e'; crtLCtx.fillRect(0, 0, 512, 80);
        crtLCtx.strokeStyle = '#28e8d8'; crtLCtx.lineWidth = 6; crtLCtx.strokeRect(4, 4, 504, 72);
        crtLCtx.fillStyle = '#28e8d8'; crtLCtx.textAlign = 'center'; crtLCtx.textBaseline = 'middle';
        crtLCtx.font = '900 12px "Press Start 2P", monospace';
        crtLCtx.fillText('📺 MELTDOWN EN VIVO', 256, 40);
        crtLabelTex.needsUpdate = true;
      });
    }

    // ── Pósters Ambientales (Pared Derecha) ───────────────────────────────────
    // Póster 1: Estilo Jaime Garzón — Meltdown editorial humorístico
    const garzonTex = createGarzonPosterTexture();
    const garzonGeo = new THREE.PlaneGeometry(1.18, 1.62);
    const garzonMesh = new THREE.Mesh(garzonGeo, new THREE.MeshBasicMaterial({ map: garzonTex, toneMapped: false }));
    garzonMesh.position.set(RW / 2 - 0.05, 1.85, 0.80);
    garzonMesh.rotation.y = -Math.PI / 2;
    this.add(garzonMesh);

    // Marco del póster Garzón
    const garzonFrameGeo = new THREE.BoxGeometry(0.05, 1.70, 1.26);
    garzonFrameGeo.translate(RW / 2 - 0.07, 1.85, 0.80);
    this.add(cel(garzonFrameGeo, metalMat));

    // Luz cálida sobre el póster Garzón (simula foco de galería)
    const garzonLight = new THREE.PointLight(0xd4a060, 1.2, 2.0, 1.8);
    garzonLight.position.set(RW / 2 - 0.8, 2.9, 0.80);
    this.add(garzonLight);

    // Póster 2: Bitcoin Pizza Day — foto polaroid memorabilia
    const pizzaTex = createBitcoinPizzaPosterTexture();
    const pizzaGeo = new THREE.PlaneGeometry(1.18, 1.62);
    const pizzaMesh = new THREE.Mesh(pizzaGeo, new THREE.MeshBasicMaterial({ map: pizzaTex, toneMapped: false }));
    pizzaMesh.position.set(RW / 2 - 0.05, 1.85, -2.0);
    pizzaMesh.rotation.y = -Math.PI / 2;
    this.add(pizzaMesh);

    // Marco del póster Bitcoin Pizza Day
    const pizzaFrameGeo = new THREE.BoxGeometry(0.05, 1.70, 1.26);
    pizzaFrameGeo.translate(RW / 2 - 0.07, 1.85, -2.0);
    this.add(cel(pizzaFrameGeo, metalMat));

    // Luz ámbar sobre el póster de Bitcoin Pizza (foco de galería)
    const pizzaLight = new THREE.PointLight(0xf7931a, 1.0, 2.0, 1.8);
    pizzaLight.position.set(RW / 2 - 0.8, 2.9, -2.0);
    this.add(pizzaLight);

    // Letrero de categoría para los pósters
    const posterLabelGeo = new THREE.PlaneGeometry(1.50, 0.22);
    const posterLCtx = document.createElement('canvas');
    posterLCtx.width = 512; posterLCtx.height = 80;
    const pCtx = posterLCtx.getContext('2d');
    pCtx.fillStyle = '#06040e'; pCtx.fillRect(0, 0, 512, 80);
    pCtx.strokeStyle = '#f7931a'; pCtx.lineWidth = 6; pCtx.strokeRect(4, 4, 504, 72);
    pCtx.fillStyle = '#f7931a'; pCtx.textAlign = 'center'; pCtx.textBaseline = 'middle';
    pCtx.font = '900 11px "Press Start 2P", monospace';
    pCtx.fillText('🖼 GALERÍA MEMORABILIA', 256, 40);
    const posterLabelTex = new THREE.CanvasTexture(posterLCtx);
    posterLabelTex.minFilter = THREE.LinearFilter;
    const posterLabelMesh = new THREE.Mesh(posterLabelGeo, new THREE.MeshBasicMaterial({ map: posterLabelTex, toneMapped: false }));
    posterLabelMesh.position.set(RW / 2 - 0.05, 2.90, -0.60);
    posterLabelMesh.rotation.y = -Math.PI / 2;
    this.add(posterLabelMesh);
    if (document.fonts) {
      document.fonts.ready.then(() => {
        pCtx.fillStyle = '#06040e'; pCtx.fillRect(0, 0, 512, 80);
        pCtx.strokeStyle = '#f7931a'; pCtx.lineWidth = 6; pCtx.strokeRect(4, 4, 504, 72);
        pCtx.fillStyle = '#f7931a'; pCtx.textAlign = 'center'; pCtx.textBaseline = 'middle';
        pCtx.font = '900 11px "Press Start 2P", monospace';
        pCtx.fillText('🖼 GALERÍA MEMORABILIA', 256, 40);
        posterLabelTex.needsUpdate = true;
      });
    }

    // ── Puerta de Salida "EXIT" ───────────────────────────────────────────────

    // Ubicada en la pared frontal (Z positivo) que separa el vault de la sala principal
    const exitFrameMat = new THREE.MeshStandardMaterial({ color: 0x0a1a14, roughness: 0.65, flatShading: true });

    // Montantes
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
      color: 0x0a1a14,
      transparent: true,
      opacity: 0.78,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this._exitFillMat = exitFillMat; // guardar para animación
    const exitFillMesh = new THREE.Mesh(exitFillGeo, exitFillMat);
    exitFillMesh.position.set(0, 1.33, RD / 2 - 0.13);
    exitFillMesh.rotation.y = Math.PI;
    this.add(exitFillMesh);

    // Neon cian en la puerta de salida
    const exitNeonGeo = new THREE.BoxGeometry(0.018, 2.56, 0.018);
    const exitNeonMat = new THREE.MeshBasicMaterial({ color: 0x28e8d8, toneMapped: false });
    this._exitNeonMat = exitNeonMat; // guardar para animación
    [-0.57, 0.57].forEach(xOff => {
      const n = new THREE.Mesh(exitNeonGeo, exitNeonMat);
      n.position.set(xOff, 1.28, RD / 2 - 0.06);
      this.add(n);
    });
    const exitNeonTopGeo = new THREE.BoxGeometry(1.16, 0.018, 0.018);
    const exitNeonTop = new THREE.Mesh(exitNeonTopGeo, exitNeonMat);
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

    // Luz cian sobre la puerta de salida
    this.exitLight = new THREE.PointLight(0x28e8d8, 2.2, 4.5, 1.5);
    this.exitLight.position.set(0, 1.60, RD / 2 - 0.5);
    this.add(this.exitLight);

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

    // ── Iluminación general del cuarto ────────────────────────────────────────
    // Luz ambiental violeta tenue
    this.ambientVault = new THREE.AmbientLight(0x1e0a38, 1.4);
    this.add(this.ambientVault);

    // Luz cenital suave
    const ceilLight = new THREE.DirectionalLight(0x8060c0, 0.30);
    ceilLight.position.set(0, RH, 0);
    this.add(ceilLight);

    // Punto de luz principal
    this.mainVaultLight = new THREE.PointLight(0x6d28d9, 2.5, RH * 2.0, 1.2);
    this.mainVaultLight.position.set(0, RH - 0.5, 0);
    this.add(this.mainVaultLight);

    // Puntos de luz sobre los ítems principales
    const vendLight = new THREE.PointLight(0x9333ea, 1.5, 3.5, 1.4);
    vendLight.position.set(-2.2, 2.8, -RD / 2 + 1.5);
    this.add(vendLight);

    // ── Posición de cámara para cuando se entra al Vault ─────────────────────
    // Encuadre frontal centrado mostrando la máquina vending y la vitrina
    this.cameraTarget = {
      pos: new THREE.Vector3(0, 2.0, RD / 2 - 1.4),
      look: new THREE.Vector3(-1.0, 1.5, -1.0),
    };

    this._time = 0;

    // Estado de activación de la puerta EXIT
    this._exitActivating = false;
    this._exitActivationTimer = 0;
    this._exitActivationDuration = 0.65;
    this._exitActivationCallback = null;
  }

  // Devuelve posiciones de cámara en coordenadas de mundo
  getEntryCameraTarget() {
    const worldPos = new THREE.Vector3();
    this.getWorldPosition(worldPos);
    return {
      pos: new THREE.Vector3(worldPos.x, worldPos.y + 2.0, worldPos.z + 3.4),
      look: new THREE.Vector3(worldPos.x - 1.2, worldPos.y + 1.5, worldPos.z - 1.0),
    };
  }

  // Posición de la puerta de salida en mundo (para la cámara al hacer click en EXIT)
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

  // Llama a activateExit(callback) al hacer click en la puerta EXIT.
  // Reproduce la animación cian (~650ms) y luego llama callback para el fade.
  activateExit(callback) {
    if (this._exitActivating) return;
    this._exitActivating = true;
    this._exitActivationTimer = 0;
    this._exitActivationCallback = callback || null;
  }

  update(dt, time, prefersReducedMotion = false) {
    this._time += dt;
    this.vendingMachine.update(time, dt);

    // Actualizar pantallas CRT animadas en loop
    if (!prefersReducedMotion && this._crtScreens) {
      this._crtScreens.forEach(crt => crt.update(time));
    }

    // ── Animación de activación de la puerta EXIT ────────────────────
    if (this._exitActivating) {
      this._exitActivationTimer += dt;
      const p = Math.min(this._exitActivationTimer / this._exitActivationDuration, 1.0);

      // 3 pulsos de luz cian explosivos
      const flash1 = Math.exp(-Math.pow((p - 0.08) * 16, 2));
      const flash2 = Math.exp(-Math.pow((p - 0.40) * 16, 2));
      const flash3 = Math.exp(-Math.pow((p - 0.72) * 16, 2));
      const flashTotal = Math.max(flash1, flash2, flash3);

      // Luz EXIT explota a 28 y vuelve
      this.exitLight.intensity = 2.2 + flashTotal * 26.0;

      // Relleno de la puerta destella de oscuro a cian
      if (this._exitFillMat) {
        this._exitFillMat.color.setHSL(0.49, 0.92, 0.06 + flashTotal * 0.52);
        this._exitFillMat.opacity = 0.78 + flashTotal * 0.22;
      }

      // Neon cian parpadea entre blanco puro y cian
      if (this._exitNeonMat) {
        const neonLum = 0.48 + flashTotal * 0.52;
        this._exitNeonMat.color.setHSL(0.49, 1.0, neonLum);
      }

      // Luz principal sube para aclarar toda la sala en el flash
      this.mainVaultLight.intensity = 2.2 + flashTotal * 5.0;

      if (p >= 1.0) {
        this._exitActivating = false;
        this._exitActivationTimer = 0;
        // Resetear materiales
        if (this._exitFillMat) {
          this._exitFillMat.color.set(0x0a1a14);
          this._exitFillMat.opacity = 0.78;
        }
        if (this._exitNeonMat) {
          this._exitNeonMat.color.set(0x28e8d8);
        }
        if (this._exitActivationCallback) {
          this._exitActivationCallback();
          this._exitActivationCallback = null;
        }
      }
      return; // skip idle animation durante activación
    }

    // Idle: pulso suave de luces
    this.exitLight.intensity = 2.0 + Math.sin(time * 1.9) * 0.30;
    this.mainVaultLight.intensity = 2.2 + Math.sin(time * 0.9) * 0.35;
  }
}
