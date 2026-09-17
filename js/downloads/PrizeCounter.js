import * as THREE from 'three';

// Generador de textura para el letrero frontal del mostrador
function createCounterSignTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 140;
  const ctx = canvas.getContext('2d');

  function draw() {
    ctx.fillStyle = '#0a0818';
    ctx.fillRect(0, 0, 512, 140);

    // Marco exterior violeta neón
    ctx.strokeStyle = '#7c4fd6';
    ctx.lineWidth = 8;
    ctx.strokeRect(6, 6, 500, 128);

    // Marco interior teal
    ctx.strokeStyle = '#28e8d8';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(14, 14, 484, 112);

    // Título PRIZE CORNER
    ctx.fillStyle = '#c084fc';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 26px "Press Start 2P", monospace';
    ctx.fillText('PRIZE CORNER', 256, 56);

    // Subtítulo
    ctx.fillStyle = '#28e8d8';
    ctx.font = '11px "Press Start 2P", monospace';
    ctx.fillText('· CANJE DE CARTUCHOS & ROMS ·', 256, 98);
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

// Generador de textura CRT para el terminal de registro sobre el mostrador
export function createTerminalScreenTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 384;
  const ctx = canvas.getContext('2d');

  let state = {
    mode: 'IDLE', // 'IDLE', 'SELECTED', 'INSERTING', 'LOADING', 'COMPLETED'
    title: 'ELIGE UN PREMIO',
    progress: 0,
    colorHex: '#7c4fd6',
    flash: 0,
  };

  function render(time = 0) {
    ctx.fillStyle = '#060410';
    ctx.fillRect(0, 0, 512, 384);

    // Flash de luz al completar
    if (state.flash > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${state.flash * 0.45})`;
      ctx.fillRect(0, 0, 512, 384);
    }

    // Borde CRT
    ctx.strokeStyle = state.colorHex;
    ctx.lineWidth = 8;
    ctx.strokeRect(8, 8, 496, 368);

    // Scanlines CRT sutiles
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    for (let y = 0; y < 384; y += 4) {
      ctx.fillRect(0, y, 512, 2);
    }

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Header del terminal
    ctx.fillStyle = '#18122c';
    ctx.fillRect(18, 18, 476, 50);
    ctx.fillStyle = state.colorHex;
    ctx.font = '13px "Press Start 2P", monospace';
    ctx.fillText('TERMINAL DE CANJE v2.0', 256, 43);

    if (state.mode === 'IDLE') {
      const pulse = 0.75 + Math.sin(time * 3.5) * 0.25;
      ctx.fillStyle = state.colorHex;
      ctx.globalAlpha = pulse;
      ctx.font = '17px "Press Start 2P", monospace';
      ctx.fillText('SELECT REWARD', 256, 150);
      ctx.globalAlpha = 1.0;

      ctx.fillStyle = '#9e94c2';
      ctx.font = '11px "Press Start 2P", monospace';
      ctx.fillText('TOCA UN CARTUCHO 3D', 256, 220);

      ctx.fillStyle = '#28e8d8';
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.fillText('PARA EXPEDIR ARCHIVO', 256, 270);
    } else if (state.mode === 'SELECTED' || state.mode === 'INSERTING') {
      ctx.fillStyle = state.colorHex;
      ctx.font = '16px "Press Start 2P", monospace';
      ctx.fillText(state.title, 256, 150);

      ctx.fillStyle = '#28e8d8';
      ctx.font = '12px "Press Start 2P", monospace';
      ctx.fillText('ACOPLANDO A LA BAHÍA...', 256, 230);
    } else if (state.mode === 'LOADING') {
      ctx.fillStyle = state.colorHex;
      ctx.font = '15px "Press Start 2P", monospace';
      ctx.fillText(`LEYENDO: ${state.title}`, 256, 120);

      // Barra de bloques discretos arcade (10 bloques)
      const totalBlocks = 10;
      const filledBlocks = Math.floor(state.progress * totalBlocks);
      const barStartX = 56;
      const barY = 180;
      const blockWidth = 34;
      const blockHeight = 36;
      const blockGap = 6;

      for (let b = 0; b < totalBlocks; b++) {
        const bx = barStartX + b * (blockWidth + blockGap);
        if (b < filledBlocks) {
          ctx.fillStyle = state.colorHex;
          ctx.fillRect(bx, barY, blockWidth, blockHeight);
          // Brillo superior
          ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
          ctx.fillRect(bx + 2, barY + 2, blockWidth - 4, 5);
        } else {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
          ctx.fillRect(bx, barY, blockWidth, blockHeight);
        }
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 2;
        ctx.strokeRect(bx, barY, blockWidth, blockHeight);
      }

      const percent = Math.round(state.progress * 100);
      ctx.fillStyle = '#ffffff';
      ctx.font = '14px "Press Start 2P", monospace';
      ctx.fillText(`${percent}%`, 256, 265);
    } else if (state.mode === 'COMPLETED') {
      ctx.fillStyle = '#3ddc84';
      ctx.font = '18px "Press Start 2P", monospace';
      ctx.fillText('¡PREMIO CANJEADO!', 256, 140);

      ctx.fillStyle = state.colorHex;
      ctx.font = '13px "Press Start 2P", monospace';
      ctx.fillText(state.title, 256, 200);

      ctx.fillStyle = '#28e8d8';
      ctx.font = '11px "Press Start 2P", monospace';
      ctx.fillText('DESCARGANDO PDF...', 256, 260);
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

export class PrizeCounter extends THREE.Group {
  constructor() {
    super();

    // Materiales del mostrador (Navy oscuro + acentos metálicos y cel-shaded)
    const counterBodyMat = new THREE.MeshStandardMaterial({
      color: 0x0c0a1a,
      roughness: 0.65,
      metalness: 0.15,
      flatShading: true,
    });

    const counterTopMat = new THREE.MeshStandardMaterial({
      color: 0x141026,
      roughness: 0.40,
      metalness: 0.20,
      flatShading: true,
    });

    const darkMat = new THREE.MeshStandardMaterial({
      color: 0x06050e,
      roughness: 0.75,
      metalness: 0.10,
      flatShading: true,
    });

    const metalTrimMat = new THREE.MeshStandardMaterial({
      color: 0x5a5470,
      roughness: 0.45,
      metalness: 0.35,
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

    // Dimensiones del Mostrador Bajo
    const width = 2.14;   // Largo horizontal
    const height = 0.98;  // Altura baja de mostrador
    const depth = 0.72;   // Fondo del mostrador

    // 1. Cuerpo Principal / Base del Mostrador
    const baseGeo = new THREE.BoxGeometry(width, height, depth);
    baseGeo.translate(0, height / 2, 0);
    this.add(createCleanMesh(baseGeo, counterBodyMat, 15));

    // Zócalo inferior
    const plinthGeo = new THREE.BoxGeometry(width * 1.02, 0.08, depth * 1.02);
    plinthGeo.translate(0, 0.04, 0);
    this.add(createCleanMesh(plinthGeo, darkMat, 15));

    // 2. Encimera / Mostrador Superior con reborde
    const counterTopGeo = new THREE.BoxGeometry(width * 1.04, 0.06, depth * 1.06);
    counterTopGeo.translate(0, height + 0.03, 0);
    this.add(createCleanMesh(counterTopGeo, counterTopMat, 15));

    // Franja Neón Violeta debajo de la encimera
    const underTrimGeo = new THREE.BoxGeometry(width * 1.03, 0.015, 0.02);
    const neonVioletMat = new THREE.MeshBasicMaterial({ color: 0x7c4fd6, toneMapped: false });
    const underTrimMesh = new THREE.Mesh(underTrimGeo, neonVioletMat);
    underTrimMesh.position.set(0, height - 0.01, depth / 2 + 0.01);
    this.add(underTrimMesh);

    // 3. Letrero Frontal "PRIZE CORNER"
    this.signTexture = createCounterSignTexture();
    const signGeo = new THREE.PlaneGeometry(1.25, 0.28);
    const signMat = new THREE.MeshBasicMaterial({
      map: this.signTexture,
      toneMapped: false,
    });
    const signMesh = new THREE.Mesh(signGeo, signMat);
    signMesh.position.set(-0.15, height * 0.58, depth / 2 + 0.005);
    this.add(signMesh);

    const signBezelGeo = new THREE.BoxGeometry(1.30, 0.32, 0.03);
    signBezelGeo.translate(-0.15, height * 0.58, depth / 2);
    this.add(createCleanMesh(signBezelGeo, darkMat, 15));

    // 4. Pedestales de Exhibición para los 4 Cartuchos
    this.slotPositions = [];
    this.slotRotations = [];

    // Los 4 cartuchos se alinean sobre la encimera a la izquierda
    const slotStartX = -0.66;
    const slotSpacing = 0.36;
    const slotY = height + 0.06;
    const slotZ = 0.04;
    const showcaseTiltX = -0.36; // Inclinados ~20° hacia atrás para exhibición frontal

    const cartColors = [0xff2fb0, 0xf0b43c, 0x28e8d8, 0x7c4fd6];

    for (let i = 0; i < 4; i++) {
      const sx = slotStartX + i * slotSpacing;
      this.slotPositions.push(new THREE.Vector3(sx, slotY + 0.14, slotZ));
      this.slotRotations.push(new THREE.Euler(showcaseTiltX, 0, 0));

      // Pedestal individual biselado en la encimera
      const pedestalGeo = new THREE.BoxGeometry(0.32, 0.025, 0.26);
      pedestalGeo.translate(sx, slotY + 0.012, slotZ);
      this.add(createCleanMesh(pedestalGeo, metalTrimMat, 15));

      // Ranura/guía de apoyo
      const grooveGeo = new THREE.BoxGeometry(0.26, 0.012, 0.06);
      const grooveMat = new THREE.MeshBasicMaterial({ color: 0x06050e });
      const grooveMesh = new THREE.Mesh(grooveGeo, grooveMat);
      grooveMesh.position.set(sx, slotY + 0.026, slotZ + 0.04);
      this.add(grooveMesh);

      // Micro LED bajo el cartucho con su color
      const ledGeo = new THREE.BoxGeometry(0.24, 0.006, 0.01);
      const ledMat = new THREE.MeshBasicMaterial({ color: cartColors[i], toneMapped: false });
      const ledMesh = new THREE.Mesh(ledGeo, ledMat);
      ledMesh.position.set(sx, slotY + 0.026, slotZ + 0.08);
      this.add(ledMesh);
    }

    // 5. Terminal CRT de Registro (en la esquina derecha del mostrador)
    const termX = 0.74;
    const termY = height + 0.06;
    const termZ = -0.06;

    const termGroup = new THREE.Group();
    termGroup.position.set(termX, termY, termZ);
    termGroup.rotation.y = -0.25; // Levemente orientado hacia el usuario
    this.add(termGroup);

    // Cuello/soporte del monitor
    const neckGeo = new THREE.CylinderGeometry(0.06, 0.08, 0.06, 12);
    neckGeo.translate(0, 0.03, 0);
    termGroup.add(new THREE.Mesh(neckGeo, metalTrimMat));

    // Carcasa del monitor CRT
    const crtBoxGeo = new THREE.BoxGeometry(0.46, 0.38, 0.36);
    crtBoxGeo.translate(0, 0.24, 0);
    termGroup.add(createCleanMesh(crtBoxGeo, darkMat, 15));

    // Pantalla interactiva del terminal
    this.screenCRT = createTerminalScreenTexture();
    const screenGeo = new THREE.PlaneGeometry(0.38, 0.28);
    this.screenMat = new THREE.MeshBasicMaterial({
      map: this.screenCRT.texture,
      toneMapped: false,
    });
    const screenMesh = new THREE.Mesh(screenGeo, this.screenMat);
    screenMesh.position.set(0, 0.24, 0.182);
    termGroup.add(screenMesh);

    // 6. Bahía / Ranura de Lectura de Cartuchos (Drive Slot)
    // Ubicada sobre la encimera justo al lado del terminal CRT
    const driveX = 0.74;
    const driveY = height + 0.06;
    const driveZ = 0.18;

    const driveGeo = new THREE.BoxGeometry(0.42, 0.04, 0.14);
    driveGeo.translate(driveX, driveY + 0.02, driveZ);
    this.add(createCleanMesh(driveGeo, metalTrimMat, 15));

    const driveMouthGeo = new THREE.BoxGeometry(0.34, 0.025, 0.06);
    const driveMouthMesh = new THREE.Mesh(driveMouthGeo, new THREE.MeshBasicMaterial({ color: 0x030206 }));
    driveMouthMesh.position.set(driveX, driveY + 0.035, driveZ);
    this.add(driveMouthMesh);

    // Neón guía en la bahía de lectura
    const driveNeonGeo = new THREE.BoxGeometry(0.36, 0.008, 0.01);
    const driveNeonMesh = new THREE.Mesh(driveNeonGeo, new THREE.MeshBasicMaterial({ color: 0x28e8d8, toneMapped: false }));
    driveNeonMesh.position.set(driveX, driveY + 0.045, driveZ + 0.04);
    this.add(driveNeonMesh);

    this.insertionSlotPos = new THREE.Vector3(driveX, driveY + 0.08, driveZ);

    // 7. Iluminación y Ambiente
    // Luz violeta difusa sobre el mostrador
    this.counterLight = new THREE.PointLight(0x8a4fe8, 2.0, 5.0, 1.2);
    this.counterLight.position.set(0, height + 0.6, 0.3);
    this.add(this.counterLight);

    // Luz focalizada sobre la bahía de lectura
    this.driveLight = new THREE.PointLight(0x28e8d8, 1.2, 2.2, 1.4);
    this.driveLight.position.set(driveX, driveY + 0.35, driveZ);
    this.add(this.driveLight);

    // Charco de glow violeta en el suelo
    const floorGlowGeo = new THREE.PlaneGeometry(2.8, 1.8);
    const floorGlowMat = new THREE.MeshBasicMaterial({
      color: 0x7c4fd6,
      transparent: true,
      opacity: 0.20,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const floorGlowMesh = new THREE.Mesh(floorGlowGeo, floorGlowMat);
    floorGlowMesh.rotation.x = -Math.PI / 2;
    floorGlowMesh.position.set(0, 0.01, 0.2);
    this.add(floorGlowMesh);

    // 8. Hitbox invisible para interacción táctil y click con raycaster
    const hitboxGeo = new THREE.BoxGeometry(width * 1.05, height * 1.4, depth * 1.2);
    hitboxGeo.translate(0, height / 2 + 0.1, 0);
    this.hitbox = new THREE.Mesh(
      hitboxGeo,
      new THREE.MeshBasicMaterial({ visible: false })
    );
    this.hitbox.userData = { isPrizeCounter: true };
    this.add(this.hitbox);
  }

  update(time, dt) {
    this.screenCRT.update(time, dt);
    // Pulso suave de luz en el mostrador
    this.counterLight.intensity = 1.8 + Math.sin(time * 2.8) * 0.25;
  }
}
