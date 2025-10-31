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
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalExplanation = document.getElementById('modalExplanation');

// Keep the fetched items so clicks on cards can show details in the modal
let apodItems = [];

// Helper: show a simple message in the gallery area (loading, errors, etc.)
function showMessage(text) {
  gallery.innerHTML = `<div class="placeholder"><p>${text}</p></div>`;
}

// Helper: create HTML for a single APOD item (image or video)
// Each card includes data-index so we can open the correct item in the modal.
function createCard(item, index) {
  const title = item.title || 'Untitled';
  const date = item.date || '';
  const thumb = item.url || '';
  let mediaHtml = '';

  // Show an img thumbnail for image media; videos get a placeholder thumbnail (or skip)
  if (item.media_type === 'image' && thumb) {
    mediaHtml = `<img src="${thumb}" alt="${title}" loading="lazy">`;
  } else if (item.media_type === 'video' && item.thumbnail_url) {
    // If a thumbnail_url is available, use it (some datasets include it)
    mediaHtml = `<img src="${item.thumbnail_url}" alt="${title}" loading="lazy">`;
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

// Render the gallery from an array of items
function renderGallery(items) {
  if (!Array.isArray(items) || items.length === 0) {
    showMessage('No images found in the data.');
    return;
  }

  // Save items for modal lookups
  apodItems = items;

  // Build cards (show up to 12 for beginners)
  const itemsToShow = items.slice(0, 12);
  const cardsHtml = itemsToShow.map((it, i) => createCard(it, i)).join('');
  gallery.innerHTML = `<div class="cards">${cardsHtml}</div>`;
}

// Open modal for a specific item index
function openModal(index) {
  const item = apodItems[index];
  if (!item) return;

  // Larger image — for images use url; for video show a poster if available
  if (item.media_type === 'image') {
    modalImage.src = item.hdurl || item.url || '';
    modalImage.alt = item.title || 'Space image';
    modalImage.style.display = ''; // ensure visible
  } else {
    // For videos, we prefer to show the provided URL in an iframe.
    // For simplicity in this beginner example, show the thumbnail if no direct embed is used.
    modalImage.src = item.thumbnail_url || item.url || '';
    modalImage.alt = item.title || 'Space media';
  }

  modalTitle.textContent = item.title || '';
  modalDate.textContent = item.date || '';
  modalExplanation.textContent = item.explanation || '';

  modal.setAttribute('aria-hidden', 'false');
  modal.classList.add('open');
  document.body.classList.add('modal-open');
}

// Close the modal and clear media to stop playback where applicable
function closeModal() {
  modal.setAttribute('aria-hidden', 'true');
  modal.classList.remove('open');
  document.body.classList.remove('modal-open');

  // Clear image src to stop network activity / video playback
  modalImage.src = '';
  modalExplanation.textContent = '';
}

// Fetch data from the JSON file and render the gallery
async function fetchApodData() {
  try {
    // Show a clear loading message while data downloads
    showMessage('🔄 Loading space photos…');

    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`Network response was not ok (${response.status})`);
    }

    const data = await response.json();

    // The API will return a set of objects that include image URLs, titles, dates, and explanations.
    // Use that data to populate the gallery.
    renderGallery(data);
  } catch (error) {
    console.error('Fetch error:', error);
    showMessage('Sorry, something went wrong while fetching images.');
  }
}

// Event: click on the "Get Space Images" button
getImageBtn.addEventListener('click', () => {
  fetchApodData();
});

// Event delegation: open modal when a card is clicked or activated via keyboard
gallery.addEventListener('click', (e) => {
  const card = e.target.closest('.card');
  if (!card) return;
  const idx = Number(card.getAttribute('data-index'));
  openModal(idx);
});

gallery.addEventListener('keydown', (e) => {
  // open on Enter or Space when a card is focused
  if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('.card')) {
    e.preventDefault();
    const card = e.target.closest('.card');
    const idx = Number(card.getAttribute('data-index'));
    openModal(idx);
  }
});

// Modal UI events: backdrop, close button, and Escape key
modalBackdrop.addEventListener('click', closeModal);
modalClose.addEventListener('click', closeModal);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.classList.contains('open')) {
    closeModal();
  }
});
