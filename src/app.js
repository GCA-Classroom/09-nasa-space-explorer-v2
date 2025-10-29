// Entry point: set up UI, fetch the classroom feed, and render results

import { fetchAPODFeed } from './api.js';
import { renderGallery } from './gallery.js';

// Helper to show status messages to the user
function setStatus(msg, isError = false) {
  const el = document.getElementById('status');
  el.textContent = msg || '';
  el.style.color = isError ? '#ff6b6b' : '';
}

// Wire up UI behavior
function init() {
  const fetchBtn = document.getElementById('fetchBtn');
  // Click handler to fetch and show gallery
  fetchBtn.addEventListener('click', async () => {
    setStatus('Loading…');
    // Show a brief loading placeholder in the gallery so users know images are on the way.
    // This will be replaced by `renderGallery(items)` once the fetch completes.
    const gallery = document.getElementById('gallery');
    if (gallery) {
      gallery.innerHTML = `<div class="placeholder" role="status" aria-live="polite">\
        <div class="placeholder-icon">🔄</div>\
        <p>Loading space photos…</p>\
      </div>`;
    }
    try {
      const items = await fetchAPODFeed();
      renderGallery(items);
      setStatus(`Loaded ${items.length} item(s).`);
    } catch (err) {
      // Beginners: log to console and show a friendly message
      console.error(err);
      setStatus(`Error: ${err.message}`, true);
    }
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}