// Beginner-friendly JS to fetch APOD data and render a simple gallery.
// The API will return objects with image URLs, titles, dates, and explanations.
// We'll use that data to populate the gallery and show a modal with details.

// URL that contains the APOD JSON data
const API_URL = 'https://cdn.jsdelivr.net/gh/GCA-Classroom/apod/data.json';

// Get references to DOM elements
const getImageBtn = document.getElementById('getImageBtn');
const gallery = document.getElementById('gallery');

// Modal elements
const modal = document.getElementById('modal');
const modalBackdrop = document.getElementById('modalBackdrop');
const modalClose = document.getElementById('modalClose');
const modalMedia = document.querySelector('.modal-media');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalExplanation = document.getElementById('modalExplanation');

// Keep the fetched items so clicks on cards can show details in the modal
let apodItems = [];

/* Helper: show a simple message in the gallery area (loading, errors, etc.) */
function showMessage(text) {
  gallery.innerHTML = `<div class="placeholder"><p>${text}</p></div>`;
}

/* Helper: if the APOD 'url' contains iframe HTML, extract its src attribute */
function extractIframeSrc(maybeHtml) {
  if (!maybeHtml || typeof maybeHtml !== 'string') return null;
  const m = maybeHtml.match(/<iframe[^>]*\s+src=(?:'|")([^'"]+)(?:'|")[^>]*>/i);
  return m ? m[1] : null;
}

/* Helper: extract YouTube video id from common URL formats (also accepts iframe src) */
function getYouTubeId(url) {
  if (!url) return null;
  // if it's iframe/html, pull src first
  const src = extractIframeSrc(url) || url;
  // normalize: remove query string / params
  const clean = src.split(/[?#&]/)[0];

  // match common YouTube patterns (youtube.com/watch?v=..., youtu.be/..., youtube.com/embed/...)
  const ytMatch = clean.match(
    /(?:youtube\.com\/(?:watch\/?\?v=|watch\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})$/
  );
  return ytMatch ? ytMatch[1] : null;
}

/* Helper: build thumbnail URL for a video item when possible */
function videoThumbnailFor(item) {
  // prefer explicit thumbnail_url if provided
  if (item.thumbnail_url) return item.thumbnail_url;

  // try to use any iframe src inside item.url
  const src = extractIframeSrc(item.url) || item.url;
  const id = getYouTubeId(src);
  if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;

  return null;
}

/* Helper: create HTML for a single APOD item (image or video)
   Each card includes data-index so we can open the correct item in the modal. */
function createCard(item, index) {
  const title = item.title || 'Untitled';
  const date = item.date || '';
  let mediaHtml = '';

  // If the item is an image, show a thumbnail image
  if (item.media_type === 'image' && item.url) {
    mediaHtml = `<img src="${item.url}" alt="${title}" loading="lazy">`;
  } else if (item.media_type === 'video') {
    // For videos: try to show a thumbnail (YouTube or provided). Add a play overlay.
    const thumb = videoThumbnailFor(item);
    if (thumb) {
      mediaHtml = `
        <div class="video-thumb-wrap">
          <img src="${thumb}" alt="${title}" loading="lazy">
          <div class="play-overlay" aria-hidden="true">▶</div>
        </div>
      `;
    } else {
      // Fallback: clear video placeholder
      mediaHtml = `
        <div class="no-media">
          <div class="play-overlay small" aria-hidden="true">▶</div>
          <div class="no-media-text">Video — click to open</div>
        </div>
      `;
    }
  } else {
    mediaHtml = `<div class="no-media">Media not available</div>`;
  }

  // Card includes accessible button semantics via role and tabindex
  return `
    <article class="card" data-index="${index}" role="button" tabindex="0" aria-pressed="false">
      <div class="media">${mediaHtml}</div>
      <div class="card-body">
        <h3 class="card-title">${title}</h3>
        <small class="card-date">${date}</small>
      </div>
    </article>
  `;
}

/* Render the gallery from an array of items */
function renderGallery(items) {
  if (!Array.isArray(items) || items.length === 0) {
    showMessage('No images found in the data.');
    return;
  }

  // Save items for modal lookups
  apodItems = items;

  // Build cards — show up to 9 items so we get a 3x3 grid (three rows of three)
  const itemsToShow = items.slice(0, 9);
  const cardsHtml = itemsToShow.map((it, i) => createCard(it, i)).join('');
  gallery.innerHTML = `<div class="cards">${cardsHtml}</div>`;
}

/* Open modal for a specific item index
   Handle images and videos appropriately:
   - images: show a larger image
   - videos: embed an iframe if possible (YouTube or other iframe src), otherwise show thumbnail + link */
function openModal(index) {
  const item = apodItems[index];
  if (!item) return;

  // Clear previous media
  modalMedia.innerHTML = '';

  if (item.media_type === 'image') {
    // Create an <img> element for larger image
    const img = document.createElement('img');
    img.src = item.hdurl || item.url || '';
    img.alt = item.title || 'Space image';
    img.loading = 'lazy';
    modalMedia.appendChild(img);
  } else if (item.media_type === 'video') {
    // First, try to extract any iframe src from the data
    const embeddedSrc = extractIframeSrc(item.url);
    const sourceToUse = embeddedSrc || item.url || '';

    // Try to detect YouTube and embed as player
    const ytId = getYouTubeId(sourceToUse);
    if (ytId) {
      const iframe = document.createElement('iframe');
      iframe.setAttribute('src', `https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1`);
      iframe.setAttribute('width', '100%');
      iframe.setAttribute('height', '500');
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
      iframe.setAttribute('allowfullscreen', '');
      iframe.title = item.title || 'Video';
      modalMedia.appendChild(iframe);
    } else if (sourceToUse && (sourceToUse.startsWith('http://') || sourceToUse.startsWith('https://'))) {
      // If the data already contains a usable embed src (non-YouTube), embed it directly.
      // If it's just a page link, show thumbnail (if available) and provide a clear link.
      if (sourceToUse.includes('iframe') || sourceToUse.includes('embed')) {
        const iframe = document.createElement('iframe');
        iframe.setAttribute('src', sourceToUse);
        iframe.setAttribute('width', '100%');
        iframe.setAttribute('height', '500');
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
        iframe.setAttribute('allowfullscreen', '');
        iframe.title = item.title || 'Video';
        modalMedia.appendChild(iframe);
      } else {
        const thumb = videoThumbnailFor(item);
        if
