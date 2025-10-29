// Debug helpers: log when the script loads and show uncaught errors on the page
console.log('%c[script.js] loaded', 'color:#0b3d91;font-weight:700');

function _showFatal(msg) {
  const gallery = document.getElementById('gallery');
  if (gallery) {
    gallery.innerHTML = `<div class="placeholder" role="alert" style="color:#ffb4b4;"><strong>App error:</strong> ${String(msg)}</div>`;
  } else {
    // fallback to alert if DOM not yet ready
    try { console.error('App error:', msg); } catch {}
  }
}

// Global error handlers
window.addEventListener('error', (ev) => {
  console.error('Uncaught error:', ev.error || ev.message);
  _showFatal(ev.error ? ev.error.message : ev.message);
});
window.addEventListener('unhandledrejection', (ev) => {
  console.error('Unhandled rejection:', ev.reason);
  _showFatal(ev.reason && ev.reason.message ? ev.reason.message : String(ev.reason));
});

const FEED_URL = 'https://cdn.jsdelivr.net/gh/GCA-Classroom/apod/data.json';

/* ===== Random "Did you know?" facts ===== */
const SPACE_FACTS = [
  'A day on Venus is longer than a year on Venus — it rotates very slowly.',
  'There are more stars in the observable universe than grains of sand on all the world’s beaches.',
  'Neutron stars can spin up to 700 times per second.',
  'Jupiter’s magnetic field is about 20,000 times stronger than Earth’s.',
  'A tablespoon of a neutron star would weigh about 10 million tons on Earth.',
  'Footprints on the Moon will likely remain for millions of years — there is no wind to erase them.',
  'Saturn could float in water because it’s mostly gas and has an average density lower than water.',
  'The largest volcano in the solar system is Olympus Mons on Mars — three times the height of Everest.'
];

/* Helper to create elements */
function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
}

/* Show one random fact above the gallery */
function showRandomFact() {
  const factText = SPACE_FACTS[Math.floor(Math.random() * SPACE_FACTS.length)];
  const factEl = el('div', 'did-you-know', '');
  factEl.innerHTML = `<strong>Did you know?</strong> ${factText}`;
  const filters = document.querySelector('.filters');
  if (filters && filters.parentNode) filters.insertAdjacentElement('afterend', factEl);
  else (document.querySelector('.container') || document.body).insertBefore(factEl, document.body.firstChild);
}

/* Convert YouTube URLs to embeddable form */
function toEmbedUrl(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube.com') && u.searchParams.has('v')) {
      return `https://www.youtube.com/embed/${u.searchParams.get('v')}`;
    }
    if (u.hostname === 'youtu.be') {
      return `https://www.youtube.com/embed${u.pathname}`;
    }
  } catch (e) { /* ignore */ }
  return url;
}

/* Render a single gallery card (image or video thumbnail/embed) */
function renderCard(item) {
  const card = el('article', 'card');
  const title = el('h3', '', `${item.title} — ${item.date}`);
  let media;

  if (item.media_type === 'video') {
    if (item.thumbnail_url) {
      const thumb = document.createElement('img');
      thumb.src = item.thumbnail_url;
      thumb.alt = `${item.title} (video thumbnail)`;
      thumb.loading = 'lazy';

      const wrapper = el('div', 'video-thumb');
      wrapper.style.position = 'relative';
      wrapper.appendChild(thumb);

      const play = el('div', 'play-overlay', '▶');
      play.style.position = 'absolute';
      play.style.left = '50%';
      play.style.top = '50%';
      play.style.transform = 'translate(-50%, -50%)';
      play.style.fontSize = '28px';
      play.style.color = 'rgba(255,255,255,0.9)';
      wrapper.appendChild(play);

      // Accessibility: make the thumbnail act like a button
      wrapper.setAttribute('role', 'button');
      wrapper.setAttribute('tabindex', '0');
      wrapper.setAttribute('aria-label', `Play video: ${item.title}`);
      wrapper.addEventListener('click', () => openModal(item));
      wrapper.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          openModal(item);
        }
      });

      media = wrapper;
    } else {
      const iframe = document.createElement('iframe');
      iframe.src = toEmbedUrl(item.url);
      iframe.title = item.title || 'Video';
      iframe.setAttribute('allowfullscreen', '');
      iframe.style.minHeight = '160px';
      iframe.style.width = '100%';
      media = iframe;
    }
  } else {
    const img = document.createElement('img');
    img.src = item.hdurl || item.url || '';
    img.alt = item.title || 'APOD image';
    img.loading = 'lazy';
    media = img;
  }

  const meta = el('p', 'meta', (item.explanation || '').slice(0, 240) + ((item.explanation || '').length > 240 ? '…' : ''));

  card.appendChild(title);
  card.appendChild(media);
  card.appendChild(meta);

  // Make card keyboard accessible and open modal on activation
  const open = () => openModal(item);
  card.addEventListener('click', open);
  card.tabIndex = 0;
  card.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault();
      open();
    }
  });

  return card;
}

/* Render gallery array into the DOM */
function renderGallery(items) {
  const gallery = document.getElementById('gallery');
  gallery.innerHTML = ''; // replace loading message
  if (!items || items.length === 0) {
    gallery.appendChild(el('div', 'placeholder', 'No items found.'));
    return;
  }

  items.sort((a, b) => new Date(b.date) - new Date(a.date));
  const frag = document.createDocumentFragment();
  items.forEach(it => frag.appendChild(renderCard(it)));
  gallery.appendChild(frag);
}

/* Modal implementation (reusable) */
let modalRoot = null;
function ensureModal() {
  if (modalRoot) return modalRoot;

  modalRoot = el('div', 'modal hidden');
  modalRoot.setAttribute('role', 'dialog');
  modalRoot.setAttribute('aria-modal', 'true');

  const overlay = el('div', 'modal-overlay');
  const panel = el('div', 'modal-panel');
  panel.setAttribute('role', 'document');
  panel.setAttribute('aria-labelledby', 'modalTitle');
  panel.setAttribute('aria-describedby', 'modalExplanation');

  const closeBtn = el('button', 'modal-close', '×');
  closeBtn.setAttribute('aria-label', 'Close dialog');

  const mediaWrap = el('div', 'modal-media'); mediaWrap.id = 'modalMedia';
  const title = el('h2'); title.id = 'modalTitle';
  const date = el('p', 'meta'); date.id = 'modalDate';
  const explanation = el('p'); explanation.id = 'modalExplanation';

  panel.appendChild(closeBtn);
  panel.appendChild(mediaWrap);
  panel.appendChild(title);
  panel.appendChild(date);
  panel.appendChild(explanation);

  modalRoot.appendChild(overlay);
  modalRoot.appendChild(panel);
  document.body.appendChild(modalRoot);

  function hide() {
    modalRoot.classList.add('hidden');
    document.removeEventListener('keydown', escHandler);
    if (modalRoot._previousFocus && typeof modalRoot._previousFocus.focus === 'function') {
      modalRoot._previousFocus.focus();
    }
  }
  closeBtn.addEventListener('click', hide);
  overlay.addEventListener('click', hide);
  const escHandler = (ev) => { if (ev.key === 'Escape') hide(); };
  modalRoot._hide = hide;
  modalRoot._escHandler = escHandler;

  return modalRoot;
}

function openModal(item) {
  const modal = ensureModal();
  const mediaWrap = modal.querySelector('#modalMedia');
  const title = modal.querySelector('#modalTitle');
  const date = modal.querySelector('#modalDate');
  const explanation = modal.querySelector('#modalExplanation');

  modal._previousFocus = document.activeElement;

  mediaWrap.innerHTML = '';
  title.textContent = item.title || '';
  date.textContent = item.date || '';
  explanation.textContent = item.explanation || '';

  if (item.media_type === 'video') {
    if (item.thumbnail_url) {
      const thumb = document.createElement('img');
      thumb.src = item.thumbnail_url;
      thumb.alt = `${item.title} (video thumbnail)`;
      thumb.style.maxWidth = '100%';
      thumb.style.borderRadius = '8px';
      thumb.loading = 'lazy';
      mediaWrap.appendChild(thumb);
    }

    const iframe = document.createElement('iframe');
    iframe.src = toEmbedUrl(item.url);
    iframe.title = item.title || 'Video';
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
    iframe.style.width = '100%';
    iframe.style.minHeight = '420px';
    iframe.style.marginTop = '12px';
    iframe.setAttribute('aria-label', `Video player: ${item.title}`);
    mediaWrap.appendChild(iframe);

    const link = el('a', 'video-link', 'Open video in new tab');
    link.href = item.url;
    link.target = '_blank';
    link.rel = 'noopener';
    link.style.display = 'inline-block';
    link.style.marginTop = '8px';
    mediaWrap.appendChild(link);
  } else {
    const img = document.createElement('img');
    img.src = item.hdurl || item.url || '';
    img.alt = item.title || '';
    img.style.maxWidth = '100%';
    img.style.borderRadius = '8px';
    img.loading = 'lazy';
    mediaWrap.appendChild(img);
  }

  modal.classList.remove('hidden');
  document.addEventListener('keydown', modal._escHandler);
  const closeBtn = modal.querySelector('.modal-close');
  if (closeBtn && typeof closeBtn.focus === 'function') closeBtn.focus();
}

/* ===== Fetch + UI wiring ===== */
document.addEventListener('DOMContentLoaded', () => {
  showRandomFact();
  const btn = document.getElementById('getImageBtn');
  const gallery = document.getElementById('gallery');

  // Show a brief accessible loading placeholder if the gallery is currently empty.
  // This informs users that images are on the way and will be replaced when data loads.
  const loadingMarkup = `<div class="placeholder" role="status" aria-live="polite">
      <div class="placeholder-icon">🔄</div>
      <p>Loading space photos…</p>
    </div>`;
  try {
    if (gallery && gallery.children.length === 0) {
      gallery.innerHTML = loadingMarkup;
    }
  } catch (e) {
    // If anything goes wrong inserting the placeholder, fail silently and continue.
    console.warn('Could not insert initial loading placeholder', e);
  }
  if (!btn) {
    console.error('Button with id "getImageBtn" not found.');
    return;
  }

  btn.addEventListener('click', async () => {
    // disable to avoid duplicate clicks and show an accessible loading status
    btn.disabled = true;
    // reuse the same loading markup we inserted on load
    if (gallery) gallery.innerHTML = loadingMarkup;

    // Ensure the browser paints the loading message before we start the fetch.
    // Wait one animation frame, then a tiny timeout so the paint happens on slow browsers.
    await new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 30)));

    try {
      const res = await fetch(FEED_URL, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`Network error: ${res.status} ${res.statusText}`);
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error('Feed did not return an array');
      renderGallery(data); // replaces the loading message with the gallery
    } catch (err) {
      console.error('Failed to load feed:', err);
      gallery.innerHTML = `<div class="placeholder"><p class="error">Failed to load images: ${err.message}</p><p class="muted">Open DevTools (F12) for details.</p></div>`;
    } finally {
      btn.disabled = false;
    }
  });
});