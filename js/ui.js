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

const panelBadges = document.getElementById('panel-badges');
const panelSections = document.getElementById('panel-sections');
const panelContact = document.getElementById('panel-contact');

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

  // Badges
  if (panelBadges) {
    panelBadges.innerHTML = '';
    if (data.badges && data.badges.length > 0) {
      data.badges.forEach(b => {
        const badge = document.createElement('span');
        badge.className = 'panel-badge';
        badge.textContent = b;
        panelBadges.appendChild(badge);
      });
      panelBadges.style.display = 'flex';
    } else {
      panelBadges.style.display = 'none';
    }
  }

  // Sections (subsections with headers and bullets)
  if (panelSections) {
    panelSections.innerHTML = '';
    if (data.sections && data.sections.length > 0) {
      data.sections.forEach(sec => {
        const secDiv = document.createElement('div');
        secDiv.className = 'panel-section';
        
        const secTitle = document.createElement('h3');
        secTitle.className = 'panel-section-title';
        secTitle.textContent = sec.title;
        secDiv.appendChild(secTitle);

        const secList = document.createElement('ul');
        secList.className = 'panel-section-list';
        sec.bullets.forEach(item => {
          const li = document.createElement('li');
          li.textContent = item;
          secList.appendChild(li);
        });
        secDiv.appendChild(secList);
        panelSections.appendChild(secDiv);
      });
      panelSections.style.display = 'block';
    } else {
      panelSections.style.display = 'none';
    }
  }
  
  // Legacy bullets (fallback if sections not defined)
  if (panelBullets) {
    panelBullets.innerHTML = '';
    if (data.bullets && data.bullets.length > 0) {
      data.bullets.forEach(bullet => {
        const li = document.createElement('li');
        li.textContent = bullet;
        panelBullets.appendChild(li);
      });
      panelBullets.style.display = 'flex';
    } else {
      panelBullets.style.display = 'none';
    }
  }

  // Contact Chips
  if (panelContact) {
    panelContact.innerHTML = '';
    if (data.contact && data.contact.length > 0) {
      const header = document.createElement('div');
      header.className = 'panel-contact-header';
      header.textContent = 'CANALES DE CONTACTO';
      panelContact.appendChild(header);

      const grid = document.createElement('div');
      grid.className = 'contact-chips-wrapper';

      data.contact.forEach(c => {
        const el = c.href ? document.createElement('a') : document.createElement('div');
        el.className = 'contact-chip';
        if (c.href) {
          el.href = c.href;
          el.target = '_blank';
          el.rel = 'noopener noreferrer';
        }
        el.innerHTML = `<span class="chip-icon">${c.icon || '▸'}</span> <span class="chip-label">${c.label}:</span> <span class="chip-val">${c.value}</span>`;
        grid.appendChild(el);
      });

      panelContact.appendChild(grid);
      panelContact.style.display = 'block';
    } else {
      panelContact.style.display = 'none';
    }
  }

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
