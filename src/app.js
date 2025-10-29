// Entry point: set up UI, fetch the classroom feed, and render results

import { fetchAPODFeed, fetchAPODRange, fetchAPODBetween } from './api.js';
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
  const startDateInput = document.getElementById('startDate');
  const endDateInput = document.getElementById('endDate');
  const apiKeyInput = document.getElementById('apiKey');
  
  // Helper: format YYYY-MM-DD
  const fmt = (d) => d.toISOString().slice(0, 10);

  // Validate date inputs: ensure end >= start when both set. Shows status and disables button when invalid.
  function validateDates() {
    const start = startDateInput && startDateInput.value ? new Date(startDateInput.value) : null;
    const end = endDateInput && endDateInput.value ? new Date(endDateInput.value) : null;

    if (start && end && end < start) {
      setStatus('End date must be the same as or after the start date.', true);
      fetchBtn.disabled = true;
      return false;
    }

    // valid (or not set)
    setStatus('');
    fetchBtn.disabled = false;
    return true;
  }

  // When a start date is chosen and end is empty, auto-fill an end date 8 days later (9-day range)
  if (startDateInput) {
    startDateInput.addEventListener('change', () => {
      const startVal = startDateInput.value;
      if (!startVal) {
        validateDates();
        return;
      }

      // If end is empty, auto-fill to start + 8 days
      if (endDateInput && !endDateInput.value) {
        const d = new Date(startVal);
        d.setDate(d.getDate() + 8);
        endDateInput.value = fmt(d);
      }
      validateDates();
    });
  }

  if (endDateInput) {
    endDateInput.addEventListener('change', validateDates);
  }
  // Click handler to fetch and show gallery
  fetchBtn.addEventListener('click', async () => {
    // Guard: validate again before attempting a network request
    if (!validateDates()) return;

    setStatus('Loading…');
    fetchBtn.disabled = true; // prevent duplicate submissions while fetching
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
      let items;

      // Determine which fetch to call depending on inputs
      const startDate = startDateInput ? startDateInput.value : '';
      const endDate = endDateInput ? endDateInput.value : '';
      const apiKey = apiKeyInput && apiKeyInput.value ? apiKeyInput.value.trim() : 'DEMO_KEY';

      if (startDate && endDate) {
        // Explicit range chosen by user
        // Validate end >= start in the API helper — call it directly
        items = await fetchAPODBetween(startDate, endDate, apiKey);
      } else if (startDate) {
        // Only start date: fetch 9-day range starting at the chosen date
        items = await fetchAPODRange(startDate, 9, apiKey);
      } else {
        // No start date selected — fall back to the classroom CDN feed
        items = await fetchAPODFeed();
      }

      renderGallery(items);
      setStatus(`Loaded ${items.length} item(s).`);
    } catch (err) {
      // Beginners: log to console and show a friendly message
      console.error(err);
      setStatus(`Error: ${err.message}`, true);
    } finally {
      // Re-enable the button after fetch completes (success or error)
      fetchBtn.disabled = false;
    }
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}