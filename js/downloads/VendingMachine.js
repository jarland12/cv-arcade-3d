import * as THREE from 'three';

// Generador de textura para la marquesina "DOWNLOADS"
function createVendingMarqueeTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');

  function draw() {
    ctx.fillStyle = '#0a0818';
    ctx.fillRect(0, 0, 512, 160);

    // Marco exterior violeta
    ctx.strokeStyle = '#7c4fd6';
    ctx.lineWidth = 8;
    ctx.strokeRect(6, 6, 500, 148);

    // Marco interior teal sutil
    ctx.strokeStyle = '#28e8d8';
    ctx.lineWidth = 3;
    ctx.strokeRect(14, 14, 484, 132);

    // Título DOWNLOADS
    ctx.fillStyle = '#a855f7';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 32px "Press Start 2P", monospace';
    ctx.fillText('DOWNLOADS', 256, 75);

    // Subtítulo
    ctx.fillStyle = '#28e8d8';
    ctx.font = '12px "Press Start 2P", monospace';
    ctx.fillText('· 16-BIT CART DISPENSER ·', 256, 115);
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

// Generador de textura CRT dinámico para la pantalla de estado y barra de bloques
export function createVendingScreenTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  let state = {
    mode: 'IDLE', // 'IDLE', 'SELECTED', 'INSERTING', 'LOADING', 'COMPLETED'
    title: 'SELECCIONA CARTUCHO',
    subtitle: 'EXPLORA LOS DOCUMENTOS',
    progress: 0, // 0 a 1
    colorHex: '#7c4fd6',
    flash: 0,
  };

  function render(time = 0) {
    ctx.fillStyle = '#080612';
    ctx.fillRect(0, 0, 512, 256);

    // Flash de completado
    if (state.flash > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${state.flash * 0.4})`;
      ctx.fillRect(0, 0, 512, 256);
    }

    // Borde CRT
    ctx.strokeStyle = state.colorHex;
    ctx.lineWidth = 6;
    ctx.strokeRect(6, 6, 500, 244);

    // Scanlines CRT sutiles
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    for (let y = 0; y < 256; y += 4) {
      ctx.fillRect(0, y, 512, 2);
    }

    // Contenido según el estado
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (state.mode === 'IDLE') {
      const pulse = 0.7 + Math.sin(time * 3) * 0.3;
      ctx.fillStyle = state.colorHex;
      ctx.globalAlpha = pulse;
      ctx.font = '16px "Press Start 2P", monospace';
      ctx.fillText('INSERT COIN / CART', 256, 85);
      ctx.globalAlpha = 1.0;

      ctx.fillStyle = '#8f86b0';
      ctx.font = '11px "Press Start 2P", monospace';
      ctx.fillText('TOCA UN CARTUCHO 3D', 256, 145);

      ctx.fillStyle = '#28e8d8';
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.fillText('PARA INICIAR DESCARGA', 256, 185);
    } else if (state.mode === 'SELECTED' || state.mode === 'INSERTING') {
      ctx.fillStyle = state.colorHex;
      ctx.font = '16px "Press Start 2P", monospace';
      ctx.fillText(state.title, 256, 95);

      ctx.fillStyle = '#28e8d8';
      ctx.font = '12px "Press Start 2P", monospace';
      ctx.fillText('INSERTANDO EN RANURA...', 256, 155);
    } else if (state.mode === 'LOADING') {
      ctx.fillStyle = state.colorHex;
      ctx.font = '14px "Press Start 2P", monospace';
      ctx.fillText(`CARGANDO: ${state.title}`, 256, 65);

      // Barra de progreso arcade en bloques discretos (12 bloques)
      const totalBlocks = 12;
      const filledBlocks = Math.floor(state.progress * totalBlocks);
      const barStartX = 56;
      const barY = 115;
      const blockWidth = 28;
      const blockHeight = 28;
      const blockGap = 5;

      for (let b = 0; b < totalBlocks; b++) {
        const bx = barStartX + b * (blockWidth + blockGap);
        if (b < filledBlocks) {
          ctx.fillStyle = state.colorHex;
          ctx.fillRect(bx, barY, blockWidth, blockHeight);
          // Highlight superior en cada bloque
          ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
          ctx.fillRect(bx + 2, barY + 2, blockWidth - 4, 4);
        } else {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
          ctx.fillRect(bx, barY, blockWidth, blockHeight);
        }
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(bx, barY, blockWidth, blockHeight);
      }

      const percent = Math.round(state.progress * 100);
      ctx.fillStyle = '#ffffff';
      ctx.font = '13px "Press Start 2P", monospace';
      ctx.fillText(`${percent}%`, 256, 185);
    } else if (state.mode === 'COMPLETED') {
      ctx.fillStyle = '#3ddc84';
      ctx.font = '20px "Press Start 2P", monospace';
      ctx.fillText('¡DESCARGA LISTA!', 256, 85);

      ctx.fillStyle = state.colorHex;
      ctx.font = '12px "Press Start 2P", monospace';
      ctx.fillText(state.title, 256, 135);

      ctx.fillStyle = '#28e8d8';
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.fillText('EXPIDIENDO ARCHIVO...', 256, 175);
    }
  }

  render(0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  return {
    texture,
    setState: (newState) => {
      Object.assign(state, newState);
      render();
      texture.needsUpdate = true;
    },
    getState: () => state,
    update: (time, dt) => {
      if (state.flash > 0) {
        state.flash = Math.max(0, state.flash - dt * 2.5);
      }
      if (state.mode === 'IDLE' || state.flash > 0) {
        render(time);
        texture.needsUpdate = true;
      }
    }
  };
}

export class VendingMachine extends THREE.Group {
  constructor() {
    super();

    // Materiales principales (Navy dominante + acentos violeta y teal)
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x0c0a1a,
      roughness: 0.60,
      metalness: 0.15,
      flatShading: true,
    });

    const darkMat = new THREE.MeshStandardMaterial({
      color: 0x06050e,
      roughness: 0.70,
      metalness: 0.10,
      flatShading: true,
    });

    const metalTrimMat = new THREE.MeshStandardMaterial({
      color: 0x5a5470,
      roughness: 0.40,
      metalness: 0.40,
      flatShading: true,
    });

    const edgeLineMat = new THREE.LineBasicMaterial({
      color: 0x030206,
    });

    const createCleanMesh = (geo, mat, edgeThreshold = 18) => {
      const grp = new THREE.Group();
      const mesh = new THREE.Mesh(geo, mat);
      grp.add(mesh);
      const edges = new THREE.EdgesGeometry(geo, edgeThreshold);
      const lines = new THREE.LineSegments(edges, edgeLineMat);
      grp.add(lines);
      return grp;
    };

    // 1. Cuerpo Principal / Gabinete de la Máquina
    const width = 1.54;
    const height = 2.45;
    const depth = 0.95;

    const baseGeo = new THREE.BoxGeometry(width, height, depth);
    baseGeo.translate(0, height / 2, 0);
    this.add(createCleanMesh(baseGeo, bodyMat, 15));

    // 2. Marquesina Superior "DOWNLOADS"
    const marqueeGeo = new THREE.BoxGeometry(width * 0.94, 0.42, 0.18);
    marqueeGeo.translate(0, height - 0.24, depth / 2 + 0.05);
    this.add(createCleanMesh(marqueeGeo, darkMat, 15));

    this.marqueeTexture = createVendingMarqueeTexture();
    const marqueeFrontGeo = new THREE.PlaneGeometry(width * 0.90, 0.36);
    const marqueeFrontMat = new THREE.MeshBasicMaterial({
      map: this.marqueeTexture,
      toneMapped: false,
    });
    const marqueeFrontMesh = new THREE.Mesh(marqueeFrontGeo, marqueeFrontMat);
    marqueeFrontMesh.position.set(0, height - 0.24, depth / 2 + 0.142);
    this.add(marqueeFrontMesh);

    // 3. Estante / Rack con 4 Compartimentos de Cartuchos
    const rackY = 1.46;
    const rackZ = depth / 2 + 0.02;

    const rackFrameGeo = new THREE.BoxGeometry(width * 0.94, 0.62, 0.14);
    rackFrameGeo.translate(0, rackY, rackZ - 0.02);
    this.add(createCleanMesh(rackFrameGeo, darkMat, 15));

    // Posiciones exactas para los 4 cartuchos
    this.slotPositions = [];
    const slotSpacing = 0.32;
    const startX = -((4 - 1) * slotSpacing) / 2;

    for (let i = 0; i < 4; i++) {
      const sx = startX + i * slotSpacing;
      this.slotPositions.push(new THREE.Vector3(sx, rackY + 0.02, rackZ + 0.07));

      // Cavidad / Slot individual
      const slotGeo = new THREE.BoxGeometry(0.28, 0.52, 0.10);
      slotGeo.translate(sx, rackY + 0.02, rackZ);
      this.add(createCleanMesh(slotGeo, metalTrimMat, 18));
    }

    // 4. Pantalla CRT de Estado y Carga
    this.screenCRT = createVendingScreenTexture();
    const screenGeo = new THREE.PlaneGeometry(0.72, 0.38);
    this.screenMat = new THREE.MeshBasicMaterial({
      map: this.screenCRT.texture,
      toneMapped: false,
    });
    const screenMesh = new THREE.Mesh(screenGeo, this.screenMat);
    screenMesh.position.set(0, 0.88, depth / 2 + 0.005);
    this.add(screenMesh);

    const screenBezelGeo = new THREE.BoxGeometry(0.82, 0.46, 0.04);
    screenBezelGeo.translate(0, 0.88, depth / 2 - 0.01);
    this.add(createCleanMesh(screenBezelGeo, darkMat, 15));

    // 5. Ranura de Inserción de Cartucho (Reader Slot)
    const slotY = 0.44;
    const insertSlotBezelGeo = new THREE.BoxGeometry(0.56, 0.14, 0.06);
    insertSlotBezelGeo.translate(0, slotY, depth / 2 + 0.02);
    this.add(createCleanMesh(insertSlotBezelGeo, darkMat, 15));

    // Boca de la ranura
    const slotMouthGeo = new THREE.BoxGeometry(0.44, 0.05, 0.08);
    const slotMouthMat = new THREE.MeshBasicMaterial({ color: 0x040308 });
    const slotMouthMesh = new THREE.Mesh(slotMouthGeo, slotMouthMat);
    slotMouthMesh.position.set(0, slotY, depth / 2 + 0.03);
    this.add(slotMouthMesh);

    // Franja de Neón guía de inserción
    const insertNeonGeo = new THREE.BoxGeometry(0.48, 0.012, 0.02);
    const insertNeonMat = new THREE.MeshBasicMaterial({ color: 0x7c4fd6, toneMapped: false });
    const insertNeonMesh = new THREE.Mesh(insertNeonGeo, insertNeonMat);
    insertNeonMesh.position.set(0, slotY + 0.045, depth / 2 + 0.05);
    this.add(insertNeonMesh);

    this.insertionSlotPos = new THREE.Vector3(0, slotY, depth / 2 + 0.03);

    // 6. Iluminación y Reflejo
    // Faro de acento violeta característico de la zona secreta
    this.beaconLight = new THREE.PointLight(0x8a4fe8, 2.4, 7.5, 1.2);
    this.beaconLight.position.set(0, 1.6, 0.8);
    this.add(this.beaconLight);

    // Luz de lectura sobre la ranura
    this.slotLight = new THREE.PointLight(0x28e8d8, 1.4, 2.5, 1.4);
    this.slotLight.position.set(0, 0.65, 0.7);
    this.add(this.slotLight);

    // Charco de glow violeta en el suelo
    const floorGlowGeo = new THREE.PlaneGeometry(3.0, 2.6);
    const floorGlowMat = new THREE.MeshBasicMaterial({
      color: 0x7c4fd6,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const floorGlowMesh = new THREE.Mesh(floorGlowGeo, floorGlowMat);
    floorGlowMesh.rotation.x = -Math.PI / 2;
    floorGlowMesh.position.set(0, 0.01, 0.6);
    this.add(floorGlowMesh);

    // 7. Hitbox para enfocar la máquina
    const hitboxGeo = new THREE.BoxGeometry(1.65, 2.5, 1.3);
    hitboxGeo.translate(0, 1.25, 0.2);
    this.hitbox = new THREE.Mesh(
      hitboxGeo,
      new THREE.MeshBasicMaterial({ visible: false })
    );
    this.hitbox.userData = { isVendingMachine: true };
    this.add(this.hitbox);
  }

  update(time, dt) {
    this.screenCRT.update(time, dt);
    // Pulso sutil de la luz violeta
    this.beaconLight.intensity = 2.2 + Math.sin(time * 2.5) * 0.35;
  }
}
