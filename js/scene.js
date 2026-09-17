import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { cabinetsConfig } from './content.js';
import { Cabinet } from './cabinets.js';
import { openPanel, closePanel, setFocus, isUIOpen } from './ui.js';
import { SecretPortal } from './vault/SecretPortal.js';
import { SecretVault } from './vault/SecretVault.js';
import { VaultDownloadsZone } from './vault/VaultDownloadsZone.js';
import { onMuteChange, toggleMute } from './downloads/audio.js';

// --- Loading Screen Manager ---
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
      setTimeout(() => { loadingScreen.style.display = 'none'; }, 550);
    }
  }, 250);
}

if (document.fonts) {
  document.fonts.ready.then(() => finishLoading());
} else {
  setTimeout(finishLoading, 600);
}

// --- WebGL Setup ---
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
  console.error('WebGL not supported:', e);
}

const scene = new THREE.Scene();
const bgColor = 0x090712;
scene.background = new THREE.Color(bgColor);
scene.fog = new THREE.Fog(bgColor, 4.0, 17.5);

// --- Cámara y Controles ---
let isMobile = window.innerWidth <= 768;
const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.maxPolarAngle = Math.PI / 2 - 0.02;
controls.minDistance = 2.0;
controls.maxDistance = 16;

// --- Estado de Sala Activa ---
// 'main' = Sala de Cabinas Principal | 'vault' = El Cuarto Secreto
let activeRoom = 'main';

// --- Grupos de escena por sala ---
const mainRoomGroup = new THREE.Group();
const vaultGroup = new THREE.Group();
scene.add(mainRoomGroup);
scene.add(vaultGroup);
vaultGroup.visible = false;

// ─── SALA PRINCIPAL ───────────────────────────────────────────────────────────

// Cabinas
const cabinets = [];
const spacing = 2.60;
const startX = -((cabinetsConfig.length - 1) * spacing) / 2;

cabinetsConfig.forEach((config, i) => {
  const cabinet = new Cabinet(config);
  cabinet.position.set(startX + i * spacing, 0, 0);
  cabinet.hitbox.userData.index = i;
  mainRoomGroup.add(cabinet);
  cabinets.push(cabinet);
});

// Portal Secreto (acceso al Vault)
const secretPortal = new SecretPortal();
secretPortal.position.set(-6.8, 0, -2.0);
secretPortal.rotation.y = Math.PI * 0.08; // Girado levemente hacia la sala
mainRoomGroup.add(secretPortal);

// Suelo de la sala principal
const floorGeo = new THREE.PlaneGeometry(60, 60);
const floorMat = new THREE.MeshStandardMaterial({ color: 0x08060f, roughness: 0.28, metalness: 0.35 });
const floorMesh = new THREE.Mesh(floorGeo, floorMat);
floorMesh.rotation.x = -Math.PI / 2;
floorMesh.position.y = -0.005;
mainRoomGroup.add(floorMesh);

// Grid
const gridHelper = new THREE.GridHelper(32, 32, 0x1d1730, 0x110e1f);
gridHelper.position.y = 0.002;
const gridColors = gridHelper.geometry.attributes.color;
if (gridColors) {
  const pos = gridHelper.geometry.attributes.position;
  for (let i = 0; i < gridColors.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    if (x < -5 && z < -3) { gridColors.setXYZ(i, 0.15, 0.7, 0.4); }
    else if (x > 5 && z < -3) { gridColors.setXYZ(i, 0.8, 0.25, 0.25); }
  }
  gridColors.needsUpdate = true;
}
mainRoomGroup.add(gridHelper);

// Brillo de horizonte
function createHorizonGlow() {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 128;
  const ctx = c.getContext('2d');
  const grad = ctx.createLinearGradient(0, 128, 0, 0);
  grad.addColorStop(0.0, 'rgba(28,20,52,0.75)');
  grad.addColorStop(0.4, 'rgba(20,14,38,0.45)');
  grad.addColorStop(1.0, 'rgba(9,7,18,0.0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 128);
  const t = new THREE.CanvasTexture(c);
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(32, 4.5),
    new THREE.MeshBasicMaterial({ map: t, transparent: true, opacity: 0.65, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide })
  );
  m.position.set(0, 1.8, -6.5);
  mainRoomGroup.add(m);
}
createHorizonGlow();

// Partículas atmosféricas
function createParticleTexture() {
  const c = document.createElement('canvas');
  c.width = 64; c.height = 64;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0.0, 'rgba(255,255,255,1.0)');
  g.addColorStop(0.3, 'rgba(200,190,240,0.6)');
  g.addColorStop(0.7, 'rgba(120,100,180,0.15)');
  g.addColorStop(1.0, 'rgba(0,0,0,0.0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
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
  size: 0.12, map: createParticleTexture(), transparent: true,
  opacity: 0.38, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xc8b8f0,
});
const particleSystem = new THREE.Points(particleGeo, particleMat);
mainRoomGroup.add(particleSystem);

// Luces de la sala principal
const ambientLight = new THREE.AmbientLight(0x28223d, 0.9);
mainRoomGroup.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 0.40);
dirLight.position.set(0, 9, 5);
mainRoomGroup.add(dirLight);

// ─── VAULT / CUARTO SECRETO ───────────────────────────────────────────────────
const secretVault = new SecretVault();
// El vault vive en un espacio paralelo fuera del encuadre principal
secretVault.position.set(0, 0, -40);
vaultGroup.add(secretVault);

const vaultDownloads = new VaultDownloadsZone(secretVault);

// ─── AUDIO HUD ────────────────────────────────────────────────────────────────
const audioBtn = document.getElementById('btn-audio-toggle');
const audioIcon = document.getElementById('audio-icon');
if (audioBtn) {
  onMuteChange((muted) => {
    if (audioIcon) audioIcon.textContent = muted ? '🔇' : '🔊';
    audioBtn.classList.toggle('muted', muted);
    audioBtn.setAttribute('title', muted ? 'Sonido 8-bit: Silenciado' : 'Sonido 8-bit: Activo');
  });
  audioBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleMute(); });
}

// ─── FADE OVERLAY (Transición entre salas) ───────────────────────────────────
const fadeOverlay = document.getElementById('room-transition-fade');
const btnVaultExit = document.getElementById('btn-vault-exit');

function roomFadeTransition(onMidpoint) {
  if (!fadeOverlay) { onMidpoint?.(); return; }
  fadeOverlay.classList.add('fade-in');
  fadeOverlay.addEventListener('transitionend', function handler() {
    fadeOverlay.removeEventListener('transitionend', handler);
    onMidpoint?.();
    // Pequeño delay antes de fade-out
    setTimeout(() => {
      fadeOverlay.classList.remove('fade-in');
    }, 60);
  }, { once: true });
}

// ─── TELEPORTACIÓN AL VAULT ───────────────────────────────────────────────────
let _portalActivating = false; // bloquea doble-click durante animación
let _exitActivatingFlag = false;

function enterVault() {
  if (activeRoom === 'vault' || _portalActivating) return;
  _portalActivating = true;
  canvas.style.cursor = 'wait';

  // 1. El portal dispara su animación de 3 pulsos (~700ms)
  secretPortal.activate(() => {
    // 2. Al terminar la animación 3D, iniciar el fade-to-black
    roomFadeTransition(() => {
      mainRoomGroup.visible = false;
      vaultGroup.visible = true;
      activeRoom = 'vault';
      _portalActivating = false;
      canvas.style.cursor = 'grab';

      // Reposicionar cámara dentro del vault
      const target = secretVault.getEntryCameraTarget();
      camera.position.copy(target.pos);
      controls.target.copy(target.look);
      controls.update();

      // Niebla adaptada al vault (cuarto cerrado sin clipping en las esquinas)
      scene.fog.near = 8.0;
      scene.fog.far = 28.0;

      // Mostrar botón de salida
      if (btnVaultExit) btnVaultExit.hidden = false;

      updateMobileAffordance(currentMobileIndex);
    });
  });
}

function exitVault() {
  if (activeRoom === 'main' || _exitActivatingFlag) return;
  _exitActivatingFlag = true;
  canvas.style.cursor = 'wait';

  // 1. La puerta EXIT dispara su animación de 3 pulsos cian (~650ms)
  secretVault.activateExit(() => {
    // 2. Al terminar la animación 3D, iniciar el fade-to-black
    roomFadeTransition(() => {
      mainRoomGroup.visible = true;
      vaultGroup.visible = false;
      activeRoom = 'main';
      _exitActivatingFlag = false;
      canvas.style.cursor = 'grab';

      // Restaurar niebla de la sala principal
      scene.fog.near = 4.0;
      scene.fog.far = 17.5;

      camera.position.copy(initialCameraPos);
      controls.target.copy(initialControlsTarget);
      controls.update();

      if (btnVaultExit) btnVaultExit.hidden = true;
    });
  });
}

if (btnVaultExit) {
  btnVaultExit.addEventListener('click', (e) => {
    e.stopPropagation();
    exitVault();
  });
}


// ─── CÁMARA INICIAL ───────────────────────────────────────────────────────────
let currentMobileIndex = 0;
const initialCameraPos = new THREE.Vector3();
const initialControlsTarget = new THREE.Vector3();

if (isMobile) {
  initialCameraPos.set(startX, 2.05, 4.4);
  initialControlsTarget.set(startX, 1.75, 0);
} else {
  initialCameraPos.set(0, 2.2, 9.5);
  initialControlsTarget.set(0, 1.7, 0);
}

camera.position.copy(initialCameraPos);
controls.target.copy(initialControlsTarget);

// ─── TRANSICIÓN DE CÁMARA ANIMADA ────────────────────────────────────────────
let activeCabinetIndex = -1;
let isTransitioning = false;
let transitionProgress = 0;
let transitionDuration = 900;
let sourcePos = new THREE.Vector3();
let targetPos = new THREE.Vector3();
let sourceTarget = new THREE.Vector3();
let targetTarget = new THREE.Vector3();

const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
let prefersReducedMotion = reducedMotionQuery.matches;
reducedMotionQuery.addEventListener('change', e => { prefersReducedMotion = e.matches; });

let focusedIndex = -1;

function getCabinetTarget(index) {
  const cab = cabinets[index];
  return {
    pos: new THREE.Vector3(cab.position.x, 2.1, cab.position.z + 2.15),
    look: new THREE.Vector3(cab.position.x, 2.05, cab.position.z + 0.3),
  };
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
    const cabX = cabinets[currentMobileIndex]?.position.x ?? 0;
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

// ─── NAVEGACIÓN MÓVIL SECUENCIAL ─────────────────────────────────────────────
const btnPrevCab = document.getElementById('btn-prev-cab');
const btnNextCab = document.getElementById('btn-next-cab');
const mobileTapHint = document.getElementById('mobile-tap-hint');

function updateMobileAffordance(index) {
  if (!mobileTapHint) return;
  if (activeRoom === 'vault') {
    mobileTapHint.textContent = 'THE VAULT';
    mobileTapHint.style.setProperty('--hint-color', '#9333ea');
    mobileTapHint.style.setProperty('--hint-glow', 'rgba(147,51,234,0.4)');
  } else {
    mobileTapHint.textContent = 'TOCA PARA ENTRAR';
    const config = cabinetsConfig[index];
    if (config) {
      mobileTapHint.style.setProperty('--hint-color', config.colorHex);
      mobileTapHint.style.setProperty('--hint-glow', config.colorHex + '66');
    }
  }
  mobileTapHint.classList.remove('bounce-trigger');
  void mobileTapHint.offsetWidth;
  mobileTapHint.classList.add('bounce-trigger');
}

export function goToMobileCabinet(targetIndex) {
  if (isUIOpen() || isTransitioning) return;
  currentMobileIndex = ((targetIndex % cabinets.length) + cabinets.length) % cabinets.length;
  updateMobileAffordance(currentMobileIndex);
  sourcePos.copy(camera.position);
  sourceTarget.copy(controls.target);
  const cabX = cabinets[currentMobileIndex].position.x;
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
  btnPrevCab.addEventListener('click', (e) => { e.stopPropagation(); goToMobileCabinet(currentMobileIndex - 1); });
}
if (btnNextCab) {
  btnNextCab.addEventListener('click', (e) => { e.stopPropagation(); goToMobileCabinet(currentMobileIndex + 1); });
}
if (mobileTapHint) {
  mobileTapHint.addEventListener('click', (e) => {
    e.stopPropagation();
    if (activeRoom === 'vault') return;
    focusCabinet(currentMobileIndex);
  });
  updateMobileAffordance(0);
}

// ─── RAYCASTER & INTERACTIVIDAD ───────────────────────────────────────────────
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Swipe táctil
let touchStartX = 0, touchStartY = 0, touchStartTime = 0;
canvas.addEventListener('touchstart', (e) => {
  if (e.touches.length === 1) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchStartTime = Date.now();
  }
}, { passive: true });

canvas.addEventListener('touchend', (e) => {
  if (isUIOpen() || isTransitioning || activeRoom === 'vault') return;
  if (e.changedTouches.length === 1) {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    const dt = Date.now() - touchStartTime;
    if (Math.abs(dx) > 42 && Math.abs(dy) < 55 && dt < 450) {
      if (dx < 0) goToMobileCabinet(currentMobileIndex + 1);
      else goToMobileCabinet(currentMobileIndex - 1);
    }
  }
}, { passive: true });

let pointerDownPos = { x: 0, y: 0 };
canvas.addEventListener('pointerdown', (e) => { pointerDownPos = { x: e.clientX, y: e.clientY }; });

canvas.addEventListener('pointerup', (e) => {
  if (isUIOpen() || isTransitioning || _portalActivating || _exitActivatingFlag) return;
  const dist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
  if (dist > 7) return;

  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  if (activeRoom === 'vault') {
    // --- Interacciones dentro del Vault ---
    // 1. Puerta de salida EXIT
    const exitIntersects = raycaster.intersectObject(secretVault.exitDoorHitbox);
    if (exitIntersects.length > 0) {
      exitVault();
      return;
    }

    // 2. Cartuchos / Vending Machine
    const dlHit = vaultDownloads.handleClick(raycaster, prefersReducedMotion);
    if (dlHit) return;

  } else {
    // --- Interacciones en la sala principal ---
    // 1. Portal Secreto
    const portalHit = raycaster.intersectObject(secretPortal.hitbox);
    if (portalHit.length > 0) {
      enterVault();
      return;
    }

    // 2. Cabinas
    const hitboxes = cabinets.map(c => c.hitbox);
    const intersects = raycaster.intersectObjects(hitboxes);
    if (intersects.length > 0) {
      const index = intersects[0].object.userData.index;
      focusCabinet(index);
    }
  }
});

canvas.addEventListener('mousemove', (e) => {
  if (isUIOpen() || isTransitioning) { canvas.style.cursor = 'default'; return; }

  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  if (activeRoom === 'vault') {
    const hovCart = vaultDownloads.handlePointerMove(raycaster);
    if (hovCart) { canvas.style.cursor = 'pointer'; return; }

    const exitH = raycaster.intersectObject(secretVault.exitDoorHitbox);
    if (exitH.length > 0) { canvas.style.cursor = 'pointer'; return; }

    const vendH = raycaster.intersectObject(secretVault.vendingMachine.hitbox);
    canvas.style.cursor = vendH.length > 0 ? 'pointer' : 'grab';
  } else {
    // Hover en portal
    const portalH = raycaster.intersectObject(secretPortal.hitbox);
    if (portalH.length > 0) { canvas.style.cursor = 'pointer'; return; }

    const hitboxes = cabinets.map(c => c.hitbox);
    const intersects = raycaster.intersectObjects(hitboxes);
    canvas.style.cursor = intersects.length > 0 ? 'pointer' : 'grab';
  }
});

// Teclado
canvas.addEventListener('keydown', (e) => {
  if (isUIOpen() || isTransitioning) return;
  if (activeRoom === 'vault') {
    if (e.key === 'Escape') exitVault();
    return;
  }
  if (e.key === 'Tab') {
    e.preventDefault();
    focusedIndex = e.shiftKey
      ? (focusedIndex - 1 + cabinets.length) % cabinets.length
      : (focusedIndex + 1) % cabinets.length;
    setFocus(cabinetsConfig[focusedIndex].colorHex);
  } else if ((e.key === 'Enter' || e.key === ' ') && focusedIndex >= 0) {
    e.preventDefault();
    setFocus(null);
    focusCabinet(focusedIndex);
    focusedIndex = -1;
  }
});

canvas.addEventListener('blur', () => { setFocus(null); focusedIndex = -1; });

window.addEventListener('resize', () => {
  isMobile = window.innerWidth <= 768;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ─── ANIMATION LOOP ───────────────────────────────────────────────────────────
const clock = new THREE.Clock();

function easeOutQuart(x) { return 1 - Math.pow(1 - x, 4); }

function animate() {
  requestAnimationFrame(animate);
  const dt = clock.getDelta();
  const time = clock.getElapsedTime();

  if (activeRoom === 'main') {
    cabinets.forEach(cab => cab.update(dt, prefersReducedMotion));
    secretPortal.update(dt, prefersReducedMotion);

    if (!prefersReducedMotion) {
      const posAttr = particleGeo.attributes.position;
      const arr = posAttr.array;
      for (let i = 0; i < particleCount; i++) {
        const idx = i * 3;
        arr[idx + 0] += Math.sin(time * 0.4 + i) * 0.002;
        arr[idx + 1] += particleSpeeds[idx + 1] * dt;
        arr[idx + 2] += Math.cos(time * 0.3 + i) * 0.002;
        if (arr[idx + 1] > 4.5) arr[idx + 1] = 0.3;
      }
      posAttr.needsUpdate = true;
    }
  } else {
    secretVault.update(dt, time, prefersReducedMotion);
    vaultDownloads.update(dt, time, camera.position, prefersReducedMotion);
  }

  // Transición de cámara animada
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
    if (!isUIOpen()) controls.update();
  }

  renderer.render(scene, camera);
}

animate();
