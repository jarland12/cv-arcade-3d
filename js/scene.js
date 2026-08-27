import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { cabinetsConfig } from './content.js';
import { Cabinet } from './cabinets.js';
import { openPanel, closePanel, setFocus, isUIOpen } from './ui.js';

// --- Loading Screen Manager (Addendum R2, Sec. 2) ---
const loadingScreen = document.getElementById('loading-screen');
const loadingProgress = document.getElementById('loading-progress');
const loadingPercent = document.getElementById('loading-percent');

let loadProgress = 0;
function updateLoadingProgress(val) {
  loadProgress = Math.min(Math.max(loadProgress, val), 100);
  if (loadingProgress) loadingProgress.style.width = `${loadProgress}%`;
  if (loadingPercent) loadingPercent.textContent = `${Math.round(loadProgress)}%`;
}

const loadInterval = setInterval(() => {
  if (loadProgress < 85) {
    updateLoadingProgress(loadProgress + 15);
  }
}, 80);

function finishLoading() {
  clearInterval(loadInterval);
  updateLoadingProgress(100);
  setTimeout(() => {
    if (loadingScreen) {
      loadingScreen.classList.add('fade-out');
      setTimeout(() => {
        loadingScreen.style.display = 'none';
      }, 550);
    }
  }, 250);
}

if (document.fonts) {
  document.fonts.ready.then(() => {
    finishLoading();
  });
} else {
  setTimeout(finishLoading, 600);
}

// --- WebGL Check & Setup ---
const noWebGLDiv = document.getElementById('no-webgl');
const canvas = document.getElementById('canvas');

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
} catch (e) {
  if (noWebGLDiv) noWebGLDiv.hidden = false;
  if (loadingScreen) loadingScreen.style.display = 'none';
  console.error("WebGL not supported:", e);
}

const scene = new THREE.Scene();
const bgColor = 0x090712; // Fondo oscuro azul-violeta
scene.background = new THREE.Color(bgColor);

// 0. Corrección Calibrada de Niebla (Addendum R3, Sec. 0)
scene.fog = new THREE.Fog(bgColor, 4.0, 17.5);

// --- Detección de Dispositivo y Cámara Inicial (Addendum R5, Sec. 1 & 5) ---
let isMobile = window.innerWidth <= 768;

const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.maxPolarAngle = Math.PI / 2 - 0.02; // No traspasar el suelo
controls.minDistance = 2.0;
controls.maxDistance = 16;

// --- Cabinets en Fila Recta ---
const cabinets = [];
const spacing = 2.60;
const startX = -((cabinetsConfig.length - 1) * spacing) / 2;

cabinetsConfig.forEach((config, i) => {
  const cabinet = new Cabinet(config);
  cabinet.position.set(startX + i * spacing, 0, 0);
  cabinet.rotation.set(0, 0, 0);
  cabinet.hitbox.userData.index = i;
  scene.add(cabinet);
  cabinets.push(cabinet);
});

// Posición inicial de cámara
let currentMobileIndex = 0;
const initialCameraPos = new THREE.Vector3();
const initialControlsTarget = new THREE.Vector3();

if (isMobile) {
  // Mobile: Enfoque directo en la primera cabina (CHARACTER SELECT)
  initialCameraPos.set(startX, 2.05, 4.4);
  initialControlsTarget.set(startX, 1.75, 0);
} else {
  // Desktop: Vista panorámica general de las 4 cabinas
  initialCameraPos.set(0, 2.2, 9.5);
  initialControlsTarget.set(0, 1.7, 0);
}

camera.position.copy(initialCameraPos);
controls.target.copy(initialControlsTarget);

// --- Environment: Piso Reflectante y Grid ---
const floorGeo = new THREE.PlaneGeometry(60, 60);
const floorMat = new THREE.MeshStandardMaterial({
  color: 0x08060f,
  roughness: 0.28,
  metalness: 0.35,
});
const floorMesh = new THREE.Mesh(floorGeo, floorMat);
floorMesh.rotation.x = -Math.PI / 2;
floorMesh.position.y = -0.005;
scene.add(floorMesh);

// Grid con acentos tenues en esquinas
const gridHelper = new THREE.GridHelper(32, 32, 0x1d1730, 0x110e1f);
gridHelper.position.y = 0.002;

const gridColors = gridHelper.geometry.attributes.color;
if (gridColors) {
  const pos = gridHelper.geometry.attributes.position;
  for (let i = 0; i < gridColors.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    if (x < -5 && z < -3) {
      gridColors.setXYZ(i, 0.15, 0.7, 0.4);
    } else if (x > 5 && z < -3) {
      gridColors.setXYZ(i, 0.8, 0.25, 0.25);
    }
  }
  gridColors.needsUpdate = true;
}
scene.add(gridHelper);

// Brillo de Horizonte
function createHorizonGlow() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 128, 0, 0);
  grad.addColorStop(0.0, 'rgba(28, 20, 52, 0.75)');
  grad.addColorStop(0.4, 'rgba(20, 14, 38, 0.45)');
  grad.addColorStop(1.0, 'rgba(9, 7, 18, 0.0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 128);

  const texture = new THREE.CanvasTexture(canvas);
  const glowGeo = new THREE.PlaneGeometry(32, 4.5);
  const glowMat = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: 0.65,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });

  const horizonMesh = new THREE.Mesh(glowGeo, glowMat);
  horizonMesh.position.set(0, 1.8, -6.5);
  scene.add(horizonMesh);
}
createHorizonGlow();

// Partículas de Polvo / Atmósfera
function createParticleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  const radGrad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  radGrad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
  radGrad.addColorStop(0.3, 'rgba(200, 190, 240, 0.6)');
  radGrad.addColorStop(0.7, 'rgba(120, 100, 180, 0.15)');
  radGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');

  ctx.fillStyle = radGrad;
  ctx.fillRect(0, 0, 64, 64);

  return new THREE.CanvasTexture(canvas);
}

const particleCount = isMobile ? 80 : 180;
const particleGeo = new THREE.BufferGeometry();
const particlePositions = new Float32Array(particleCount * 3);
const particleSpeeds = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount; i++) {
  particlePositions[i * 3 + 0] = (Math.random() - 0.5) * 17;
  particlePositions[i * 3 + 1] = 0.3 + Math.random() * 4.2;
  particlePositions[i * 3 + 2] = -2.5 + Math.random() * 11;

  particleSpeeds[i * 3 + 0] = (Math.random() - 0.5) * 0.08;
  particleSpeeds[i * 3 + 1] = 0.04 + Math.random() * 0.06;
  particleSpeeds[i * 3 + 2] = (Math.random() - 0.5) * 0.06;
}

particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

const particleMat = new THREE.PointsMaterial({
  size: 0.12,
  map: createParticleTexture(),
  transparent: true,
  opacity: 0.38,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  color: 0xc8b8f0,
});

const particleSystem = new THREE.Points(particleGeo, particleMat);
scene.add(particleSystem);

// Luces ambientales y cenitales
const ambientLight = new THREE.AmbientLight(0x28223d, 0.9);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.40);
dirLight.position.set(0, 9, 5);
scene.add(dirLight);

// --- Raycaster & Interactividad ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

let activeCabinetIndex = -1;
let isTransitioning = false;
let transitionProgress = 0;
let transitionDuration = 900;
let sourcePos = new THREE.Vector3();
let targetPos = new THREE.Vector3();
let sourceTarget = new THREE.Vector3();
let targetTarget = new THREE.Vector3();

// Accesibilidad
const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
let prefersReducedMotion = reducedMotionQuery.matches;
reducedMotionQuery.addEventListener('change', e => {
  prefersReducedMotion = e.matches;
});

let focusedIndex = -1;

function getCabinetTarget(index) {
  const cab = cabinets[index];
  const pos = new THREE.Vector3(cab.position.x, 2.1, cab.position.z + 2.15);
  const look = new THREE.Vector3(cab.position.x, 2.05, cab.position.z + 0.3);
  return { pos, look };
}

export function focusCabinet(index) {
  if (isUIOpen() || isTransitioning) return;

  activeCabinetIndex = index;
  currentMobileIndex = index;
  updateMobileAffordance(index);

  const { pos, look } = getCabinetTarget(index);

  cabinets[index].triggerPowerOn(prefersReducedMotion);

  sourcePos.copy(camera.position);
  sourceTarget.copy(controls.target);
  targetPos.copy(pos);
  targetTarget.copy(look);

  transitionDuration = 900;

  if (prefersReducedMotion) {
    camera.position.copy(targetPos);
    controls.target.copy(targetTarget);
    openPanel(index, resetCamera);
  } else {
    isTransitioning = true;
    transitionProgress = 0;
    controls.enabled = false;
  }
}

export function resetCamera() {
  activeCabinetIndex = -1;
  sourcePos.copy(camera.position);
  sourceTarget.copy(controls.target);

  if (isMobile) {
    const cabX = cabinets[currentMobileIndex].position.x;
    targetPos.set(cabX, 2.05, 4.4);
    targetTarget.set(cabX, 1.75, 0);
  } else {
    targetPos.copy(initialCameraPos);
    targetTarget.copy(initialControlsTarget);
  }

  transitionDuration = 700;

  if (prefersReducedMotion) {
    camera.position.copy(targetPos);
    controls.target.copy(targetTarget);
    controls.enabled = true;
  } else {
    isTransitioning = true;
    transitionProgress = 0;
    controls.enabled = false;
  }
}

// =============================================================================
// NAVEGACIÓN MÓVIL SECUENCIAL Y AFFORDANCE (Addendum R5)
// =============================================================================
const btnPrevCab = document.getElementById('btn-prev-cab');
const btnNextCab = document.getElementById('btn-next-cab');
const mobileTapHint = document.getElementById('mobile-tap-hint');

function updateMobileAffordance(index) {
  if (!mobileTapHint) return;
  const config = cabinetsConfig[index];
  mobileTapHint.style.setProperty('--hint-color', config.colorHex);
  mobileTapHint.style.setProperty('--hint-glow', config.colorHex + '66');
  mobileTapHint.classList.remove('bounce-trigger');
  void mobileTapHint.offsetWidth; // Trigger reflow
  mobileTapHint.classList.add('bounce-trigger');
}

export function goToMobileCabinet(targetIndex) {
  if (isUIOpen() || isTransitioning) return;

  currentMobileIndex = (targetIndex + cabinets.length) % cabinets.length;
  updateMobileAffordance(currentMobileIndex);

  const cabX = cabinets[currentMobileIndex].position.x;
  sourcePos.copy(camera.position);
  sourceTarget.copy(controls.target);
  targetPos.set(cabX, 2.05, 4.4);
  targetTarget.set(cabX, 1.75, 0);

  transitionDuration = 650;

  if (prefersReducedMotion) {
    camera.position.copy(targetPos);
    controls.target.copy(targetTarget);
  } else {
    isTransitioning = true;
    transitionProgress = 0;
    controls.enabled = false;
  }
}

if (btnPrevCab) {
  btnPrevCab.addEventListener('click', (e) => {
    e.stopPropagation();
    goToMobileCabinet(currentMobileIndex - 1);
  });
}

if (btnNextCab) {
  btnNextCab.addEventListener('click', (e) => {
    e.stopPropagation();
    goToMobileCabinet(currentMobileIndex + 1);
  });
}

if (mobileTapHint) {
  mobileTapHint.addEventListener('click', (e) => {
    e.stopPropagation();
    focusCabinet(currentMobileIndex);
  });
  updateMobileAffordance(0);
}

// Swipe Táctil Horizontal en Móvil (Addendum R5, Sec. 2)
let touchStartX = 0;
let touchStartY = 0;
let touchStartTime = 0;

canvas.addEventListener('touchstart', (e) => {
  if (e.touches.length === 1) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchStartTime = Date.now();
  }
}, { passive: true });

canvas.addEventListener('touchend', (e) => {
  if (isUIOpen() || isTransitioning) return;

  if (e.changedTouches.length === 1) {
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    const deltaY = e.changedTouches[0].clientY - touchStartY;
    const deltaTime = Date.now() - touchStartTime;

    // Detectar swipe horizontal rápido con umbral claro
    if (Math.abs(deltaX) > 42 && Math.abs(deltaY) < 55 && deltaTime < 450) {
      if (deltaX < 0) {
        goToMobileCabinet(currentMobileIndex + 1); // Swipe hacia la izquierda -> siguiente
      } else {
        goToMobileCabinet(currentMobileIndex - 1); // Swipe hacia la derecha -> anterior
      }
    }
  }
}, { passive: true });

// Click / Tap en Cabina
let pointerDownPos = { x: 0, y: 0 };
canvas.addEventListener('pointerdown', (e) => {
  pointerDownPos = { x: e.clientX, y: e.clientY };
});

canvas.addEventListener('pointerup', (e) => {
  if (isUIOpen() || isTransitioning) return;

  const dist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
  if (dist > 7) return; // Fue arrastre/órbita o swipe

  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const hitboxes = cabinets.map(c => c.hitbox);
  const intersects = raycaster.intersectObjects(hitboxes);

  if (intersects.length > 0) {
    const index = intersects[0].object.userData.index;
    focusCabinet(index);
  }
});

canvas.addEventListener('mousemove', (e) => {
  if (isUIOpen() || isTransitioning) {
    canvas.style.cursor = 'default';
    return;
  }

  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const hitboxes = cabinets.map(c => c.hitbox);
  const intersects = raycaster.intersectObjects(hitboxes);

  canvas.style.cursor = intersects.length > 0 ? 'pointer' : 'grab';
});

// Navegación por teclado (Desktop: Tab, Enter/Espacio)
canvas.addEventListener('keydown', (e) => {
  if (isUIOpen() || isTransitioning) return;

  if (e.key === 'Tab') {
    e.preventDefault();
    if (e.shiftKey) {
      focusedIndex = (focusedIndex - 1 + cabinets.length) % cabinets.length;
    } else {
      focusedIndex = (focusedIndex + 1) % cabinets.length;
    }
    setFocus(cabinetsConfig[focusedIndex].colorHex);
  } else if (e.key === 'Enter' || e.key === ' ') {
    if (focusedIndex >= 0) {
      e.preventDefault();
      setFocus(null);
      focusCabinet(focusedIndex);
      focusedIndex = -1;
    }
  }
});

canvas.addEventListener('blur', () => {
  setFocus(null);
  focusedIndex = -1;
});

window.addEventListener('resize', () => {
  isMobile = window.innerWidth <= 768;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- Animation Loop ---
const clock = new THREE.Clock();

function easeOutQuart(x) {
  return 1 - Math.pow(1 - x, 4);
}

function animate() {
  requestAnimationFrame(animate);

  const dt = clock.getDelta();
  const time = clock.getElapsedTime();

  // Actualizar cabinas
  cabinets.forEach(cab => cab.update(dt, prefersReducedMotion));

  // Animación de partículas atmosféricas
  if (!prefersReducedMotion) {
    const posAttr = particleGeo.attributes.position;
    const array = posAttr.array;
    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      array[idx + 0] += Math.sin(time * 0.4 + i) * 0.002;
      array[idx + 1] += particleSpeeds[idx + 1] * dt;
      array[idx + 2] += Math.cos(time * 0.3 + i) * 0.002;

      if (array[idx + 1] > 4.5) {
        array[idx + 1] = 0.3;
      }
    }
    posAttr.needsUpdate = true;
  }

  // Animación Cinemática de Cámara (Dolly / Mobile switch)
  if (isTransitioning) {
    transitionProgress += (dt * 1000) / transitionDuration;
    if (transitionProgress >= 1) {
      transitionProgress = 1;
      isTransitioning = false;

      if (activeCabinetIndex !== -1) {
        openPanel(activeCabinetIndex, resetCamera);
      } else {
        controls.enabled = true;
      }
    }

    const t = easeOutQuart(transitionProgress);
    camera.position.lerpVectors(sourcePos, targetPos, t);
    controls.target.lerpVectors(sourceTarget, targetTarget, t);
  } else {
    if (!isUIOpen()) {
      controls.update();
    }
  }

  renderer.render(scene, camera);
}

animate();
