// =============================================================================
// Motor de Audio Chiptune Retro (Web Audio API)
// Implementa sintetizador 8-bit procedural sin dependencias externas
// =============================================================================

let audioCtx = null;
let isAudioMuted = localStorage.getItem('arcade_audio_muted') === 'true';
let ambientOsc = null;
let ambientGain = null;
const muteListeners = [];

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

// Desbloquear AudioContext en la primera interacción de usuario
function unlockAudio() {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
  window.removeEventListener('pointerdown', unlockAudio);
  window.removeEventListener('keydown', unlockAudio);
}
window.addEventListener('pointerdown', unlockAudio, { passive: true });
window.addEventListener('keydown', unlockAudio, { passive: true });

export function isMuted() {
  return isAudioMuted;
}

export function setMuted(muted) {
  isAudioMuted = !!muted;
  localStorage.setItem('arcade_audio_muted', isAudioMuted ? 'true' : 'false');
  if (isAudioMuted && ambientGain) {
    ambientGain.gain.cancelScheduledValues(0);
    ambientGain.gain.value = 0;
  }
  muteListeners.forEach(cb => cb(isAudioMuted));
}

export function toggleMute() {
  setMuted(!isAudioMuted);
  return isAudioMuted;
}

export function onMuteChange(callback) {
  if (typeof callback === 'function') {
    muteListeners.push(callback);
    callback(isAudioMuted);
  }
}

// 1. Zumbido Eléctrico Retro Ambiental (Loop sutil en la cercanía de la máquina)
export function startAmbientHum() {
  if (isAudioMuted) return;
  const ctx = getAudioContext();
  if (!ctx || ambientOsc) return;

  try {
    ambientOsc = ctx.createOscillator();
    const oscHarmonic = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    ambientGain = ctx.createGain();

    filter.type = 'lowpass';
    filter.frequency.value = 130;

    ambientOsc.type = 'sine';
    ambientOsc.frequency.value = 55; // La (A1)

    oscHarmonic.type = 'triangle';
    oscHarmonic.frequency.value = 110;

    ambientGain.gain.setValueAtTime(0.015, ctx.currentTime);

    ambientOsc.connect(filter);
    oscHarmonic.connect(filter);
    filter.connect(ambientGain);
    ambientGain.connect(ctx.destination);

    ambientOsc.start();
    oscHarmonic.start();
  } catch (e) {
    console.warn('Ambient audio init skipped:', e);
  }
}

export function updateAmbientVolume(proximity) {
  if (!ambientGain || isAudioMuted || !audioCtx) return;
  // proximity entre 0.0 (lejos) y 1.0 (justo al frente de la máquina)
  const targetGain = Math.min(Math.max(proximity, 0), 1) * 0.035;
  ambientGain.gain.setTargetAtTime(targetGain, audioCtx.currentTime, 0.2);
}

export function stopAmbientHum() {
  if (ambientOsc) {
    try {
      ambientOsc.stop();
      ambientOsc.disconnect();
    } catch (e) {}
    ambientOsc = null;
    ambientGain = null;
  }
}

// 2. Blip Corto Agudo al hacer Hover sobre un Cartucho
export function playHoverBlip() {
  if (isAudioMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.045);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  } catch (e) {}
}

// 3. Selección de Cartucho: "Coin Insert" clásico arcade
export function playCoinInsert() {
  if (isAudioMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(987.77, now); // B5
    gain1.gain.setValueAtTime(0.08, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.08);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(1318.51, now + 0.08); // E6
    gain2.gain.setValueAtTime(0.09, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.29);
  } catch (e) {}
}

// 4. Inserción Mecánica: Swoosh + Clack
export function playSwooshClack() {
  if (isAudioMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    // Deslizamiento con oscilador modulado
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(160, now + 0.22);
    gain.gain.setValueAtTime(0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.23);

    // Golpe seco mecánico al encajar
    const thud = ctx.createOscillator();
    const thudGain = ctx.createGain();
    thud.type = 'square';
    thud.frequency.setValueAtTime(140, now + 0.22);
    thud.frequency.exponentialRampToValueAtTime(45, now + 0.32);
    thudGain.gain.setValueAtTime(0.12, now + 0.22);
    thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
    thud.connect(thudGain);
    thudGain.connect(ctx.destination);
    thud.start(now + 0.22);
    thud.stop(now + 0.33);
  } catch (e) {}
}

// 5. Beeps durante la carga por bloques (escalonados)
export function playLoadingBeep(blockIndex = 0) {
  if (isAudioMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    const baseFreq = 440 + (blockIndex * 45);
    osc.frequency.setValueAtTime(baseFreq, now);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.07);
  } catch (e) {}
}

// 6. Jingle de Victoria / Completado (Arpegio ascendente 8-bit)
export function playVictoryJingle() {
  if (isAudioMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const notes = [
      { f: 523.25, d: 0.09, t: 0.00 }, // C5
      { f: 659.25, d: 0.09, t: 0.09 }, // E5
      { f: 783.99, d: 0.09, t: 0.18 }, // G5
      { f: 1046.50, d: 0.28, t: 0.27 } // C6
    ];

    const startTime = ctx.currentTime;
    notes.forEach(note => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(note.f, startTime + note.t);

      gain.gain.setValueAtTime(0.08, startTime + note.t);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + note.t + note.d);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime + note.t);
      osc.stop(startTime + note.t + note.d + 0.01);
    });
  } catch (e) {}
}
