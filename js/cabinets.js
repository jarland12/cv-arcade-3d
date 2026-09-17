import * as THREE from 'three';

// Generador de texturas dinámicas para la marquesina con tipografía retro
export function createMarqueeTexture(text, bgColorHex, textColor = '#090710') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');

  function draw() {
    ctx.fillStyle = bgColorHex;
    ctx.fillRect(0, 0, 512, 160);

    ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.lineWidth = 10;
    ctx.strokeRect(6, 6, 500, 148);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 4;
    ctx.strokeRect(14, 14, 484, 132);

    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    let fontSize = 28;
    if (text.length > 14) fontSize = 22;
    if (text.length > 18) fontSize = 18;

    ctx.font = `900 ${fontSize}px "Press Start 2P", "JetBrains Mono", monospace`;
    ctx.fillText(text, 256, 80);
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

// Generador de textura animada CRT con barrido vertical (Addendum R2, Sec. 3a)
export function createCRTScreenTexture(baseColorHex) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  function renderScanline(scanY) {
    ctx.fillStyle = baseColorHex;
    ctx.fillRect(0, 0, 512, 512);

    const vignette = ctx.createRadialGradient(256, 256, 160, 256, 256, 360);
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.35)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, 512, 512);

    const beamHeight = 90;
    const grad = ctx.createLinearGradient(0, scanY - beamHeight / 2, 0, scanY + beamHeight / 2);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.0)');
    grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.45)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, scanY - beamHeight / 2, 512, beamHeight);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    for (let y = 0; y < 512; y += 6) {
      ctx.fillRect(0, y, 512, 3);
    }
  }

  renderScanline(0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  return {
    texture,
    update: (elapsed) => {
      const scanY = ((elapsed * 110) % 620) - 50;
      renderScanline(scanY);
      texture.needsUpdate = true;
    }
  };
}

// Generador de textura de reflejo difuso en piso (Addendum R3, Sec. 1)
export function createFloorReflectionTexture(colorHex) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  const vGrad = ctx.createLinearGradient(0, 0, 0, 512);
  vGrad.addColorStop(0.0, 'rgba(0, 0, 0, 0)');
  vGrad.addColorStop(0.12, colorHex);
  vGrad.addColorStop(0.35, colorHex);
  vGrad.addColorStop(0.75, 'rgba(0, 0, 0, 0)');
  vGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = vGrad;
  ctx.fillRect(0, 0, 256, 512);

  ctx.globalCompositeOperation = 'destination-in';
  const hGrad = ctx.createLinearGradient(0, 0, 256, 0);
  hGrad.addColorStop(0.0, 'rgba(0, 0, 0, 0)');
  hGrad.addColorStop(0.2, 'rgba(0, 0, 0, 0.5)');
  hGrad.addColorStop(0.5, 'rgba(0, 0, 0, 1.0)');
  hGrad.addColorStop(0.8, 'rgba(0, 0, 0, 0.5)');
  hGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = hGrad;
  ctx.fillRect(0, 0, 256, 512);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

export class Cabinet extends THREE.Group {
  constructor(config) {
    super();
    this.config = config;
    this.elapsedTime = Math.random() * 10;

    // --- MATERIALES FLAT-SHADED RETRO CON RESPUESTA A LUZ DE RELLENO ---
    const bodyMat = new THREE.MeshStandardMaterial({
      color: config.bodyColor || 0x22222a,
      roughness: 0.65,
      metalness: 0.15,
      flatShading: true,
      side: THREE.DoubleSide,
    });

    const darkMat = new THREE.MeshStandardMaterial({
      color: 0x14121a,
      roughness: 0.65,
      metalness: 0.15,
      flatShading: true,
      side: THREE.DoubleSide,
    });

    const deckSurfaceMat = new THREE.MeshStandardMaterial({
      color: 0x161420,
      roughness: 0.70,
      metalness: 0.10,
      flatShading: true,
      side: THREE.DoubleSide,
    });

    const metalMat = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      roughness: 0.50,
      metalness: 0.2,
      flatShading: true,
      side: THREE.DoubleSide,
    });

    const outlineBacksideMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      side: THREE.BackSide,
    });

    const edgeLineMat = new THREE.LineBasicMaterial({
      color: 0x000000,
    });

    const neonTrimMat = new THREE.MeshBasicMaterial({
      color: config.color,
      toneMapped: false,
    });

    this.screenCRT = createCRTScreenTexture(config.colorHex);
    this.screenMat = new THREE.MeshBasicMaterial({
      map: this.screenCRT.texture,
      color: 0xffffff,
      toneMapped: false,
    });

    this.marqueeTexture = createMarqueeTexture(config.marqueeText, config.colorHex);
    this.marqueeMat = new THREE.MeshBasicMaterial({
      map: this.marqueeTexture,
      toneMapped: false,
    });

    const createCelMesh = (geometry, material, outlineScale = 0, edgeThreshold = 18) => {
      const group = new THREE.Group();
      const mainMesh = new THREE.Mesh(geometry, material);
      group.add(mainMesh);

      if (outlineScale && outlineScale > 1.0) {
        const outlineMesh = new THREE.Mesh(geometry, outlineBacksideMat);
        outlineMesh.scale.set(outlineScale, outlineScale, outlineScale);
        group.add(outlineMesh);
      }

      const edges = new THREE.EdgesGeometry(geometry, edgeThreshold);
      const lines = new THREE.LineSegments(edges, edgeLineMat);
      group.add(lines);

      return group;
    };

    // =========================================================================
    // 1. PARED TRASERA COMPLETA (Sólida de piso a techo)
    // =========================================================================
    const backWallGeo = new THREE.BoxGeometry(1.14, 3.28, 0.08);
    backWallGeo.translate(0, 1.64, -0.62);
    this.add(createCelMesh(backWallGeo, bodyMat, 0));

    // =========================================================================
    // 2. CUERPO INFERIOR / BASE
    // =========================================================================
    const baseGeo = new THREE.BoxGeometry(1.14, 1.32, 1.25);
    baseGeo.translate(0, 0.66, -0.02);
    this.add(createCelMesh(baseGeo, bodyMat, 0));

    const coinDoorGeo = new THREE.BoxGeometry(0.62, 0.72, 0.05);
    const coinDoor = createCelMesh(coinDoorGeo, darkMat, 1.04);
    coinDoor.position.set(0, 0.65, 0.63);
    this.add(coinDoor);

    const slotGeo = new THREE.BoxGeometry(0.12, 0.18, 0.03);
    const slot1 = createCelMesh(slotGeo, metalMat, 1.06);
    slot1.position.set(-0.16, 0.82, 0.66);
    const slot2 = createCelMesh(slotGeo, metalMat, 1.06);
    slot2.position.set(0.16, 0.82, 0.66);
    this.add(slot1, slot2);

    // =========================================================================
    // 3. BOTONERA / PANEL DE CONTROL PROMINENTE
    // =========================================================================
    const controlDeckGroup = new THREE.Group();
    const deckAngle = 0.28;
    controlDeckGroup.position.set(0, 1.54, 0.68);
    controlDeckGroup.rotation.x = deckAngle;
    this.add(controlDeckGroup);

    const cpWidth = 1.14;
    const cpDeckHeight = 0.22;
    const cpDeckDepth = 0.64;
    const cpDeckGeo = new THREE.BoxGeometry(cpWidth, cpDeckHeight, cpDeckDepth);
    const deckBoxMesh = createCelMesh(cpDeckGeo, deckSurfaceMat, 1.03, 14);
    controlDeckGroup.add(deckBoxMesh);

    const surfaceY = cpDeckHeight / 2;

    // Joysticks
    const createJoystick = (localX, localZ) => {
      const jGroup = new THREE.Group();

      const washer = new THREE.Mesh(
        new THREE.CylinderGeometry(0.082, 0.085, 0.010, 16),
        new THREE.MeshStandardMaterial({ color: 0x08070d, roughness: 0.8, flatShading: true })
      );
      washer.position.y = surfaceY + 0.005;
      jGroup.add(washer);

      const mount = new THREE.Mesh(
        new THREE.CylinderGeometry(0.050, 0.058, 0.018, 14),
        new THREE.MeshStandardMaterial({ color: 0x14121a, roughness: 0.75, flatShading: true })
      );
      mount.position.y = surfaceY + 0.015;
      jGroup.add(mount);

      const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.018, 0.018, 0.17, 10),
        metalMat
      );
      shaft.position.y = surfaceY + 0.095;
      jGroup.add(shaft);

      const ball = new THREE.Mesh(
        new THREE.SphereGeometry(0.065, 12, 12),
        new THREE.MeshStandardMaterial({
          color: 0xededfa,
          roughness: 0.70,
          metalness: 0.0,
          flatShading: true,
        })
      );
      ball.position.y = surfaceY + 0.185;
      jGroup.add(ball);

      jGroup.position.set(localX, 0, localZ);
      return jGroup;
    };

    controlDeckGroup.add(createJoystick(-0.38, 0.02));
    controlDeckGroup.add(createJoystick(0.12, 0.02));

    // Botones
    const buttonColors = [0xff2a3d, 0x2979ff, 0xffea00, 0x00e676, 0xffffff, 0xff6d00];
    const btnBezelGeo = new THREE.CylinderGeometry(0.046, 0.048, 0.024, 14);
    const btnPlungerGeo = new THREE.CylinderGeometry(0.036, 0.038, 0.030, 14);
    const btnBezelMat = new THREE.MeshStandardMaterial({
      color: 0x0a0910,
      roughness: 0.85,
      metalness: 0.0,
      flatShading: true,
    });

    const createTactileArcadeButton = (colorHex) => {
      const btn = new THREE.Group();

      const bezel = new THREE.Mesh(btnBezelGeo, btnBezelMat);
      bezel.position.y = surfaceY + 0.012;
      btn.add(bezel);

      const plungerMat = new THREE.MeshStandardMaterial({
        color: colorHex,
        roughness: 0.65,
        metalness: 0.0,
        flatShading: true,
        emissive: colorHex,
        emissiveIntensity: 0.40,
      });
      const plunger = new THREE.Mesh(btnPlungerGeo, plungerMat);
      plunger.position.y = surfaceY + 0.024;
      btn.add(plunger);

      return btn;
    };

    const createPlayerButtons = (originX, originZ) => {
      const group = new THREE.Group();
      const layout = [
        [0.12, 0.05], [0.22, 0.07], [0.32, 0.05],
        [0.11, -0.06], [0.21, -0.04], [0.31, -0.06]
      ];

      layout.forEach(([ox, oz], idx) => {
        const button = createTactileArcadeButton(buttonColors[idx % buttonColors.length]);
        button.position.set(ox, 0, oz);
        group.add(button);
      });

      group.position.set(originX, 0, originZ);
      return group;
    };

    controlDeckGroup.add(createPlayerButtons(-0.38, 0.02));
    controlDeckGroup.add(createPlayerButtons(0.12, 0.02));

    // =========================================================================
    // 4. BISEL DE PANTALLA Y CRT DISPLAY
    // =========================================================================
    const bezelGeo = new THREE.BoxGeometry(1.14, 0.96, 0.14);
    bezelGeo.rotateX(-0.32);
    bezelGeo.translate(0, 2.18, 0.38);
    this.add(createCelMesh(bezelGeo, darkMat, 1.035));

    const screenGeo = new THREE.PlaneGeometry(0.96, 0.78);
    const screenMesh = new THREE.Mesh(screenGeo, this.screenMat);
    screenMesh.rotation.x = -0.32;
    screenMesh.position.set(0, 2.18, 0.46);
    this.add(screenMesh);

    const screenFrameGeo = new THREE.RingGeometry(0.46, 0.49, 4);
    screenFrameGeo.rotateZ(Math.PI / 4);
    screenFrameGeo.scale(1.08, 0.90, 1);
    const screenFrame = new THREE.Mesh(screenFrameGeo, outlineBacksideMat);
    screenFrame.rotation.x = -0.32;
    screenFrame.position.set(0, 2.18, 0.455);
    this.add(screenFrame);

    // =========================================================================
    // 5. MARQUESINA SUPERIOR
    // =========================================================================
    const marqueeBoxGeo = new THREE.BoxGeometry(1.14, 0.50, 0.24);
    marqueeBoxGeo.rotateX(0.15);
    marqueeBoxGeo.translate(0, 2.98, 0.68);
    this.add(createCelMesh(marqueeBoxGeo, darkMat, 1.035));

    const marqueeFrontGeo = new THREE.PlaneGeometry(1.08, 0.44);
    const marqueeFront = new THREE.Mesh(marqueeFrontGeo, this.marqueeMat);
    marqueeFront.rotation.x = 0.15;
    marqueeFront.position.set(0, 2.98, 0.81);
    this.add(marqueeFront);

    // Techo
    const roofGeo = new THREE.BoxGeometry(1.14, 0.14, 1.35);
    roofGeo.translate(0, 3.26, 0.02);
    this.add(createCelMesh(roofGeo, bodyMat, 0));

    // =========================================================================
    // 6. ALAS LATERALES Y FRANJAS DE ACENTO
    // =========================================================================
    const createSideWing = (xPos) => {
      const group = new THREE.Group();

      const shape = new THREE.Shape();
      shape.moveTo(0.62, 0);
      shape.lineTo(0.62, 1.30);
      shape.lineTo(0.98, 1.36);
      shape.lineTo(0.98, 1.50);
      shape.lineTo(0.38, 1.70);
      shape.lineTo(0.42, 2.65);
      shape.lineTo(0.78, 2.76);
      shape.lineTo(0.72, 3.22);
      shape.lineTo(0.40, 3.32);
      shape.lineTo(-0.65, 3.32);
      shape.lineTo(-0.65, 0);
      shape.closePath();

      const wingExtrude = new THREE.ExtrudeGeometry(shape, { depth: 0.06, bevelEnabled: false });
      const pos = wingExtrude.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        pos.setXYZ(i, pos.getZ(i), pos.getY(i), pos.getX(i));
      }

      // Invertir índices para restaurar orientación CCW tras el intercambio de coordenadas X y Z
      if (wingExtrude.index) {
        const arr = wingExtrude.index.array;
        for (let i = 0; i < arr.length; i += 3) {
          const tmp = arr[i];
          arr[i] = arr[i + 2];
          arr[i + 2] = tmp;
        }
        wingExtrude.index.needsUpdate = true;
      }
      wingExtrude.computeVertexNormals();

      // En las alas laterales EdgesGeometry aporta el trazo cel-shaded nítido sin oclusión negra
      const wingMesh = createCelMesh(wingExtrude, bodyMat, 0, 12);
      group.add(wingMesh);

      // Borde de Neón T-Molding en el canto frontal
      const neonPoints = [
        new THREE.Vector3(0.03, 0, 0.62),
        new THREE.Vector3(0.03, 1.30, 0.62),
        new THREE.Vector3(0.03, 1.36, 0.98),
        new THREE.Vector3(0.03, 1.50, 0.98),
        new THREE.Vector3(0.03, 1.70, 0.38),
        new THREE.Vector3(0.03, 2.65, 0.42),
        new THREE.Vector3(0.03, 2.76, 0.78),
        new THREE.Vector3(0.03, 3.22, 0.72),
        new THREE.Vector3(0.03, 3.32, 0.40),
      ];
      const neonCurve = new THREE.CatmullRomCurve3(neonPoints, false, 'catmullrom', 0.1);
      const neonGeo = new THREE.TubeGeometry(neonCurve, 32, 0.014, 6, false);
      const neonMesh = new THREE.Mesh(neonGeo, neonTrimMat);
      group.add(neonMesh);

      // Franja de Acento Lateral Trasera (Addendum R4, Sec. 2)
      const rearTrimGeo = new THREE.BoxGeometry(0.018, 3.20, 0.02);
      const rearTrimMesh = new THREE.Mesh(rearTrimGeo, neonTrimMat);
      rearTrimMesh.position.set(0.03, 1.64, -0.64);
      group.add(rearTrimMesh);

      group.position.x = xPos;
      return group;
    };

    this.add(createSideWing(-0.60));
    this.add(createSideWing(0.54));

    // =========================================================================
    // 7. ILUMINACIÓN Y REFLEJOS (Addendum R4, Sec. 1)
    // =========================================================================
    // 7a. Luz frontal de suelo
    this.floorLight = new THREE.PointLight(config.color, 2.2, 5.5, 1.2);
    this.floorLight.position.set(0, 0.4, 1.4);
    this.add(this.floorLight);

    // 7b. Luz de botonera
    this.deckLight = new THREE.PointLight(config.color, 2.4, 3.0, 1.0);
    this.deckLight.position.set(0, 2.05, 0.75);
    this.add(this.deckLight);

    // 7c. Luces de Relleno Lateral / Rim Lights (Izquierda y Derecha simétricas)
    // Bañan ambos costados y despegan la silueta del respaldo al orbitar la cámara
    this.leftRimLight = new THREE.PointLight(config.color, 2.0, 4.5, 1.2);
    this.leftRimLight.position.set(-0.85, 1.80, -0.20);
    this.add(this.leftRimLight);

    this.rightRimLight = new THREE.PointLight(config.color, 2.0, 4.5, 1.2);
    this.rightRimLight.position.set(0.85, 1.80, -0.20);
    this.add(this.rightRimLight);

    // 7d. Charco de luz en el piso
    const glowGeo = new THREE.PlaneGeometry(2.6, 2.2);
    const glowMat = new THREE.MeshBasicMaterial({
      color: config.color,
      transparent: true,
      opacity: 0.18,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    glowMesh.rotation.x = -Math.PI / 2;
    glowMesh.position.set(0, 0.008, 1.2);
    this.add(glowMesh);
    this.glowMat = glowMat;

    // 7e. Eco de Reflejo en Piso
    const reflectionTex = createFloorReflectionTexture(config.colorHex);
    const reflectGeo = new THREE.PlaneGeometry(2.0, 3.2);
    const reflectMat = new THREE.MeshBasicMaterial({
      map: reflectionTex,
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const reflectMesh = new THREE.Mesh(reflectGeo, reflectMat);
    reflectMesh.rotation.x = -Math.PI / 2;
    reflectMesh.position.set(0, 0.012, 1.5);
    this.add(reflectMesh);
    this.reflectMat = reflectMat;

    // =========================================================================
    // 8. HITBOX DE INTERACCIÓN
    // =========================================================================
    const hitboxGeo = new THREE.BoxGeometry(1.3, 3.4, 1.8);
    hitboxGeo.translate(0, 1.7, 0.1);
    this.hitbox = new THREE.Mesh(
      hitboxGeo,
      new THREE.MeshBasicMaterial({ visible: false })
    );
    this.hitbox.userData = { isCabinet: true, index: 0 };
    this.add(this.hitbox);

    this.flickerTimer = Math.random() * 2;
    this.baseIntensity = 2.2;
    this.baseDeckIntensity = 2.4;
    this.baseRimIntensity = 2.0;
    this.originalColor = new THREE.Color(config.color);

    this.isPoweringOn = false;
    this.powerOnTimer = 0;
  }

  triggerPowerOn(reducedMotion) {
    if (reducedMotion) return;
    this.isPoweringOn = true;
    this.powerOnTimer = 0;
  }

  update(dt, reducedMotion) {
    this.elapsedTime += dt;

    this.screenCRT.update(this.elapsedTime);

    if (reducedMotion) {
      this.screenMat.color.setHex(0xffffff);
      this.marqueeMat.color.setHex(0xffffff);
      this.floorLight.intensity = this.baseIntensity;
      this.deckLight.intensity = this.baseDeckIntensity;
      this.leftRimLight.intensity = this.baseRimIntensity;
      this.rightRimLight.intensity = this.baseRimIntensity;
      if (this.glowMat) this.glowMat.opacity = 0.18;
      if (this.reflectMat) this.reflectMat.opacity = 0.28;
      return;
    }

    const breathFactor = 0.95 + Math.sin(this.elapsedTime * 1.8) * 0.28;

    let powerMultiplier = 1.0;
    if (this.isPoweringOn) {
      this.powerOnTimer += dt;
      const t = this.powerOnTimer / 0.9;
      if (t < 0.18) {
        powerMultiplier = 0.10;
      } else if (t < 0.32) {
        powerMultiplier = 1.60;
      } else if (t < 1.0) {
        powerMultiplier = 0.85 + (t - 0.32) * 0.22;
      } else {
        this.isPoweringOn = false;
        powerMultiplier = 1.0;
      }
    }

    const finalScreenIntensity = breathFactor * powerMultiplier;
    this.screenMat.color.setScalar(finalScreenIntensity);

    // Attract mode neón flicker
    this.flickerTimer -= dt;
    if (this.flickerTimer <= 0) {
      if (Math.random() > 0.82) {
        const flickerFactor = 0.25 + Math.random() * 0.45;
        this.marqueeMat.color.setScalar(flickerFactor);
        this.floorLight.intensity = this.baseIntensity * flickerFactor;
        this.deckLight.intensity = this.baseDeckIntensity * flickerFactor;
        this.leftRimLight.intensity = this.baseRimIntensity * flickerFactor;
        this.rightRimLight.intensity = this.baseRimIntensity * flickerFactor;
        if (this.glowMat) this.glowMat.opacity = 0.18 * flickerFactor;
        if (this.reflectMat) this.reflectMat.opacity = 0.28 * flickerFactor;
        this.flickerTimer = 0.04 + Math.random() * 0.12;
      } else {
        this.marqueeMat.color.setHex(0xffffff);
        this.floorLight.intensity = this.baseIntensity;
        this.deckLight.intensity = this.baseDeckIntensity;
        this.leftRimLight.intensity = this.baseRimIntensity;
        this.rightRimLight.intensity = this.baseRimIntensity;
        if (this.glowMat) this.glowMat.opacity = 0.18;
        if (this.reflectMat) this.reflectMat.opacity = 0.28;
        this.flickerTimer = 0.6 + Math.random() * 2.8;
      }
    }
  }
}
