// NASA Space Explorer - APOD Gallery (JSON Edition)
// Lightweight runtime checks & load trace — helps confirm script loaded in the page
console.log('%c[script.js] loaded', 'color:#0B3D91;font-weight:700');
(function verifyDomPresence() {
  // List of element IDs the script expects to find in the DOM
  const expected = [
    'fetchBtn', 'gallery', 'status', 'factBar',
    'modal', 'modalClose', 'modalMediaWrap', 'modalTitle', 'modalDate', 'modalExplanation'
  ];

  const missing = expected.filter(id => !document.getElementById(id));
  if (missing.length) {
    console.warn(`[script.js] Missing DOM elements: ${missing.join(', ')}. ` +
      'If you load this script before the DOM is ready, wiring may fail. ' +
      'This script is intended to be loaded with `defer` or at the end of <body>.');
  } else {
    console.log('[script.js] All expected DOM elements present.');
  }
})();
// Data source
const DATA_URL = "https://cdn.jsdelivr.net/gh/GCA-Classroom/apod/data.json";

// DOM refs
const fetchBtn = document.getElementById("fetchBtn");
const galleryEl = document.getElementById("gallery");
const statusEl = document.getElementById("status");
const factBarEl = document.getElementById("factBar");

// Modal refs
const modalEl = document.getElementById("modal");
const modalCloseBtn = document.getElementById("modalClose");
const modalMediaWrap = document.getElementById("modalMediaWrap");
const modalTitleEl = document.getElementById("modalTitle");
const modalDateEl = document.getElementById("modalDate");
const modalExplanationEl = document.getElementById("modalExplanation");

// Local state of fetched items for modal access
let apodItems = [];

// Random facts
const FACTS = [
  "Jupiter’s Great Red Spot is a storm bigger than Earth that has raged for centuries.",
  "A day on Venus is longer than its year.",
  "Neutron stars can spin over 600 times per second.",
  "Footprints on the Moon can last for millions of years.",
  "The Sun holds 99.86% of the Solar System’s mass.",
  "Olympus Mons on Mars is ~3× taller than Everest.",
  "Light from the Sun takes ~8 minutes to reach Earth."
];

// Utilities
function formatDate(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return iso || "";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}
function getYouTubeId(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1);
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return v;
      const parts = u.pathname.split("/");
      const i = parts.indexOf("embed");
      if (i !== -1 && parts[i + 1]) return parts[i + 1];
    }
  } catch { /* ignore */ }
  return null;
}
function buildYouTubeIframe(url) {
  const id = getYouTubeId(url);
  if (!id) return null;
  const embed = `https://www.youtube.com/embed/${id}`;
  return `<iframe src="${embed}" title="YouTube video player" frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
}
function showStatus(msg) {
  statusEl.textContent = msg;
  statusEl.style.display = msg ? "block" : "none";
}
function clearNode(node) { while (node.firstChild) node.removeChild(node.firstChild); }

function renderFact() {
  const pick = FACTS[Math.floor(Math.random() * FACTS.length)];
  factBarEl.textContent = pick;
}

// Build one gallery card
function buildCard(item, index) {
  const isVideo = item.media_type === "video";

  // Thumbnail selection
  let thumb = null;
  if (isVideo) {
    thumb = item.thumbnail_url || (getYouTubeId(item.url) ? `https://img.youtube.com/vi/${getYouTubeId(item.url)}/hqdefault.jpg` : null);
  } else {
    thumb = item.url;
  }

  const card = document.createElement("article");
  card.className = "card";
  card.tabIndex = 0;
  card.setAttribute("role", "button");
  card.setAttribute("aria-label", `${item.title || "Untitled"} (${item.date || ""})`);
  card.dataset.index = String(index);

  const media = document.createElement("div");
  media.className = "card__media";

  if (thumb) {
    const img = document.createElement("img");
    img.src = thumb;
    img.alt = `${item.title || "APOD"} - ${formatDate(item.date)}`;
    img.loading = "lazy";
    media.appendChild(img);
  } else {
    const ph = document.createElement("div");
    ph.className = "thumb";
    ph.style.display = "flex";
    ph.style.alignItems = "center";
    ph.style.justifyContent = "center";
    ph.style.color = "white";
    ph.style.background = "#000";
    ph.textContent = "No preview";
    media.appendChild(ph);
  }

  if (isVideo) {
    const badge = document.createElement("div");
    badge.className = "play-badge";
    badge.textContent = "▶ Play";
    media.appendChild(badge);
  }

  const body = document.createElement("div");
  body.className = "card__body";

  const title = document.createElement("h3");
  title.className = "card__title";
  title.textContent = item.title || "Untitled";

  const date = document.createElement("p");
  date.className = "card__date";
  date.textContent = formatDate(item.date || "");

  body.append(title, date);
  card.append(media, body);
  return card;
}

function renderGallery(items) {
  galleryEl.setAttribute("aria-busy", "true");
  clearNode(galleryEl);

  items.forEach((item, idx) => {
    const card = buildCard(item, idx);
    galleryEl.appendChild(card);
  });

  galleryEl.setAttribute("aria-busy", "false");
}

// Fetch & display
async function loadGallery() {
  try {
    showStatus("🔄 Loading space photos…");
    galleryEl.style.display = "none";

    const res = await fetch(DATA_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    apodItems = Array.isArray(data)
      ? data.filter(x => x && (x.media_type === "image" || x.media_type === "video"))
      : [];

    renderGallery(apodItems);
  } catch (err) {
    console.error(err);
    clearNode(galleryEl);
    const errBox = document.createElement("div");
    errBox.className = "status";
    errBox.style.display = "block";
    errBox.style.background = "#fff0f0";
    errBox.style.borderColor = "#ffb3b3";
    errBox.style.color = "#a40000";
    errBox.textContent = `⚠️ Couldn’t load images. ${(err && err.message) || "Unknown error"}`;
    galleryEl.appendChild(errBox);
  } finally {
    galleryEl.style.display = "";
    showStatus("");
  }
}

// Modal
function openModal(index) {
  const item = apodItems[index];
  if (!item) return;

  modalTitleEl.textContent = item.title || "Untitled";
  modalDateEl.textContent = formatDate(item.date || "");
  modalExplanationEl.textContent = item.explanation || "";

  if (item.media_type === "image") {
    const src = item.hdurl || item.url;
    modalMediaWrap.innerHTML = `<img src="${src}" alt="${item.title || "NASA image"}" />`;
  } else if (item.media_type === "video") {
    const iframe = buildYouTubeIframe(item.url);
    if (iframe) {
      modalMediaWrap.innerHTML = iframe;
    } else {
      // Fallback link if not YouTube
      modalMediaWrap.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:center;background:#000;color:#fff;padding:20px;text-align:center;aspect-ratio:16/9;width:100%;">
          <a href="${item.url}" target="_blank" rel="noopener noreferrer" style="color:#7fb3ff;text-decoration:underline;">Open Video</a>
        </div>`;
    }
  } else {
    modalMediaWrap.innerHTML = `<div style="padding:24px;">No preview available.</div>`;
  }

  modalEl.setAttribute("open", "");
  modalEl.setAttribute("aria-hidden", "false");
  modalCloseBtn.focus();
}

function closeModal() {
  modalMediaWrap.innerHTML = ""; // stop video playback
  modalEl.removeAttribute("open");
  modalEl.setAttribute("aria-hidden", "true");
}

// Event wiring
fetchBtn?.addEventListener("click", loadGallery);

galleryEl.addEventListener("click", (e) => {
  const card = e.target.closest(".card");
  if (!card) return;
  const index = Number(card.dataset.index);
  openModal(index);
});
galleryEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const card = e.target.closest(".card");
    if (!card) return;
    const index = Number(card.dataset.index);
    openModal(index);
  }
});

modalEl.addEventListener("click", (e) => {
  if (e.target.dataset.close !== undefined || e.target === modalEl) {
    closeModal();
  }
});
modalCloseBtn.addEventListener("click", closeModal);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modalEl.hasAttribute("open")) closeModal();
});

// On load
renderFact();
