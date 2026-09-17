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
    const exitFillMesh = new THREE.Mesh(exitFillGeo, exitFillMat);
    exitFillMesh.position.set(0, 1.33, RD / 2 - 0.13);
    exitFillMesh.rotation.y = Math.PI;
    this.add(exitFillMesh);

    // Neon cian en la puerta de salida
    const exitNeonGeo = new THREE.BoxGeometry(0.018, 2.56, 0.018);
    const exitNeonMat = new THREE.MeshBasicMaterial({ color: 0x28e8d8, toneMapped: false });
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

  update(dt, time, prefersReducedMotion = false) {
    this._time += dt;
    this.vendingMachine.update(time, dt);
    this.exitLight.intensity = 2.0 + Math.sin(time * 1.9) * 0.30;
    this.mainVaultLight.intensity = 2.2 + Math.sin(time * 0.9) * 0.35;
  }
}
