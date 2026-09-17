import * as THREE from 'three';

// Generador de textura canvas 2D para la etiqueta del cartucho
function createCartridgeLabelTexture(name, colorHex) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 384;
  const ctx = canvas.getContext('2d');

  function draw() {
    // Fondo general oscuro de la etiqueta
    ctx.fillStyle = '#0a0814';
    ctx.fillRect(0, 0, 512, 384);

    // Marco exterior con el color del cartucho
    ctx.strokeStyle = colorHex;
    ctx.lineWidth = 14;
    ctx.strokeRect(10, 10, 492, 364);

    // Franja superior de marca retro
    ctx.fillStyle = colorHex;
    ctx.fillRect(17, 17, 478, 70);

    ctx.fillStyle = '#090710';
    ctx.font = '900 20px "Press Start 2P", "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ARCADE ROM · 16-BIT', 256, 52);

    // Fondo del área de título
    ctx.fillStyle = '#141024';
    ctx.fillRect(25, 105, 462, 170);

    // Patrón sutil de rejilla retro
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 2;
    for (let x = 30; x < 480; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 105);
      ctx.lineTo(x, 275);
      ctx.stroke();
    }

    // Título del cartucho (e.g. CV.EXE, CERTIFICADOS)
    ctx.fillStyle = colorHex;
    let fontSize = 28;
    if (name.length > 10) fontSize = 22;
    if (name.length > 14) fontSize = 18;
    ctx.font = `900 ${fontSize}px "Press Start 2P", "JetBrains Mono", monospace`;
    ctx.fillText(name, 256, 175);

    // Subtítulo
    ctx.fillStyle = '#8f88a8';
    ctx.font = '14px "JetBrains Mono", monospace';
    ctx.fillText('OFFICIAL DOCUMENT · JHOJAN RAMOS', 256, 230);

    // Franja inferior con código de barras retro
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.fillRect(25, 290, 462, 70);

    ctx.fillStyle = colorHex;
    for (let i = 0; i < 34; i++) {
      const barX = 45 + i * 12;
      const barW = (i % 3 === 0) ? 6 : ((i % 2 === 0) ? 4 : 2);
      ctx.fillRect(barX, 305, barW, 40);
    }
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

export class Cartridge extends THREE.Group {
  constructor(config) {
    super();
    this.config = config;
    this.slotIndex = config.slotIndex || 0;
    this.fileURL = config.fileURL || '';
    this.cartridgeName = config.name || 'CARTUCHO';
    this.colorHex = config.colorHex || '#ff2fb0';

    // Material base del plástico del cartucho (gris oscuro con tono del tema)
    this.bodyMat = new THREE.MeshStandardMaterial({
      color: 0x22202e,
      roughness: 0.55,
      metalness: 0.15,
      flatShading: true,
      emissive: new THREE.Color(config.color),
      emissiveIntensity: 0.0,
    });

    const edgeLineMat = new THREE.LineBasicMaterial({
      color: 0x05040a,
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

    // 1. Cuerpo Principal del Cartucho
    const width = 0.38;
    const height = 0.48;
    const depth = 0.07;
    const bodyGeo = new THREE.BoxGeometry(width, height, depth);
    const bodyGroup = createCleanMesh(bodyGeo, this.bodyMat, 15);
    this.add(bodyGroup);

    // 2. Muescas superiores de agarre (Ridges)
    const ridgeGeo = new THREE.BoxGeometry(width * 0.88, 0.012, depth * 1.05);
    for (let r = 0; r < 3; r++) {
      const ridge = new THREE.Mesh(
        ridgeGeo,
        new THREE.MeshStandardMaterial({
          color: 0x181524,
          roughness: 0.7,
          flatShading: true
        })
      );
      ridge.position.set(0, height * 0.35 + r * 0.024, 0);
      this.add(ridge);
    }

    // 3. Lengüeta inferior de inserción (Connector lip)
    const lipGeo = new THREE.BoxGeometry(width * 0.82, 0.05, depth * 0.65);
    const lipMesh = new THREE.Mesh(
      lipGeo,
      new THREE.MeshStandardMaterial({
        color: 0x110f1a,
        roughness: 0.8,
        flatShading: true
      })
    );
    lipMesh.position.set(0, -height / 2 - 0.025, 0);
    this.add(lipMesh);

    // Puntos de contacto dorado en la lengüeta
    const pinGeo = new THREE.BoxGeometry(width * 0.75, 0.018, depth * 0.70);
    const pinMesh = new THREE.Mesh(
      pinGeo,
      new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        metalness: 0.85,
        roughness: 0.25
      })
    );
    pinMesh.position.set(0, -height / 2 - 0.03, 0);
    this.add(pinMesh);

    // 4. Etiqueta Frontal con relieve
    this.labelTexture = createCartridgeLabelTexture(config.name, config.colorHex);
    const labelGeo = new THREE.PlaneGeometry(width * 0.86, height * 0.68);
    this.labelMat = new THREE.MeshBasicMaterial({
      map: this.labelTexture,
      toneMapped: false,
    });
    const labelMesh = new THREE.Mesh(labelGeo, this.labelMat);
    labelMesh.position.set(0, -0.01, depth / 2 + 0.002);
    this.add(labelMesh);

    // 5. Franja de Acento Emisivo en el borde
    const trimGeo = new THREE.BoxGeometry(width * 0.92, 0.012, 0.01);
    this.trimMat = new THREE.MeshBasicMaterial({
      color: config.color,
      toneMapped: false
    });
    const trimMesh = new THREE.Mesh(trimGeo, this.trimMat);
    trimMesh.position.set(0, height / 2 - 0.015, depth / 2 + 0.001);
    this.add(trimMesh);

    // 6. Hitbox invisible para interacción táctil y click con raycaster
    const hitboxGeo = new THREE.BoxGeometry(width * 1.15, height * 1.15, depth * 2.2);
    this.hitbox = new THREE.Mesh(
      hitboxGeo,
      new THREE.MeshBasicMaterial({ visible: false })
    );
    this.hitbox.userData = {
      isCartridge: true,
      cartridge: this,
      slotIndex: this.slotIndex,
    };
    this.add(this.hitbox);

    // Coordenadas locales en el slot de la máquina
    this.slotLocalPos = new THREE.Vector3();
    this.slotLocalRot = new THREE.Euler();
    this.isHovered = false;
    this.hoverOffset = 0;
  }

  setSlotTransform(pos, rot) {
    this.slotLocalPos.copy(pos);
    if (rot) this.slotLocalRot.copy(rot);
    this.position.copy(this.slotLocalPos);
    this.rotation.copy(this.slotLocalRot);
  }

  setHover(hovered) {
    if (this.isHovered === hovered) return;
    this.isHovered = hovered;
  }

  update(dt, isInteracting) {
    // Animación suave de hover
    const targetOffset = (this.isHovered && !isInteracting) ? 0.07 : 0.0;
    this.hoverOffset = THREE.MathUtils.lerp(this.hoverOffset, targetOffset, dt * 12);

    const targetEmissive = (this.isHovered || isInteracting) ? 0.45 : 0.0;
    this.bodyMat.emissiveIntensity = THREE.MathUtils.lerp(this.bodyMat.emissiveIntensity, targetEmissive, dt * 10);
  }
}
