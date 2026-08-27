import { cabinetsConfig } from './content.js';

const panel = document.getElementById('panel');
const panelEyebrow = document.getElementById('panel-eyebrow');
const panelTitle = document.getElementById('panel-title');
const panelBody = document.getElementById('panel-body');
const panelBullets = document.getElementById('panel-bullets');
const panelClose = document.getElementById('panel-close');
const focusOverlay = document.getElementById('focus-overlay');
const root = document.documentElement;

let isPanelOpen = false;
let onCloseCallback = null;

// Opens the panel with data from a specific cabinet
export function openPanel(cabinetIndex, onClose) {
  if (isPanelOpen) return;
  isPanelOpen = true;
  onCloseCallback = onClose;

  const data = cabinetsConfig[cabinetIndex];

  // Set colors
  root.style.setProperty('--panel-color', data.colorHex);
  
  // Populate content
  panelEyebrow.textContent = data.eyebrow;
  panelTitle.textContent = data.title;
  panelBody.textContent = data.body;
  
  // Populate bullets
  panelBullets.innerHTML = '';
  data.bullets.forEach(bullet => {
    const li = document.createElement('li');
    li.textContent = bullet;
    panelBullets.appendChild(li);
  });

  // Show panel
  panel.classList.add('open');
  document.body.classList.add('panel-open');
}

// Closes the panel
export function closePanel() {
  if (!isPanelOpen) return;
  isPanelOpen = false;
  panel.classList.remove('open');
  document.body.classList.remove('panel-open');
  if (onCloseCallback) {
    onCloseCallback();
    onCloseCallback = null;
  }
}

// Event listeners for closing
panelClose.addEventListener('click', closePanel);

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && isPanelOpen) {
    closePanel();
  }
});

// Click outside panel to close
document.addEventListener('mousedown', (e) => {
  if (isPanelOpen && !document.getElementById('panel-inner').contains(e.target)) {
    closePanel();
  }
});

// Focus overlay management
export function setFocus(colorHex) {
  if (colorHex) {
    root.style.setProperty('--focus-color', colorHex);
    focusOverlay.classList.add('active');
  } else {
    focusOverlay.classList.remove('active');
  }
}

export function isUIOpen() {
  return isPanelOpen;
}
