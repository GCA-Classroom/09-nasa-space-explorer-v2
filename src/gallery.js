// Functions to render APOD items into the DOM (simple for beginners)

/**
 * Render a list of APOD items into the #gallery element.
 * For images: show the image.
 * For videos: prefer thumbnail (if available) as a clickable link, otherwise embed the iframe.
 * Clicking a card opens a modal with a larger view and full explanation.
 * @param {Array} items
 */
export function renderGallery(items) {
  const gallery = document.getElementById('gallery');
  gallery.innerHTML = ''; // clear previous

  if (!items || items.length === 0) {
    gallery.textContent = 'No items found in the feed.';
    return;
  }

  // Sort by date descending (newest first)
  items.sort((a, b) => new Date(b.date) - new Date(a.date));

  items.forEach(item => {
    const card = document.createElement('article');
    card.className = 'card';
    card.tabIndex = 0; // make focusable for keyboard users

    // Title and date
    const title = document.createElement('h3');
    title.textContent = `${item.title} — ${item.date}`;

    // Container for media so we can append either img, iframe, or linked thumbnail
    let mediaEl;

    if (item.media_type === 'video') {
      // If there's a thumbnail_url, show the thumbnail image and link to the video (opens in new tab)
      if (item.thumbnail_url) {
        const link = document.createElement('a');
        link.href = item.url;
        link.target = '_blank';
        link.rel = 'noopener';

        const thumb = document.createElement('img');
        thumb.src = item.thumbnail_url;
        thumb.alt = `${item.title} (video thumbnail)`;
        link.appendChild(thumb);

        // Small visual hint for beginners: add a title attribute to indicate it's a video
        link.title = 'Open video in new tab';

        mediaEl = link;
      } else {
        // No thumbnail available — embed the video iframe so users can play inline
        const iframe = document.createElement('iframe');
        iframe.src = item.url;
        iframe.setAttribute('title', item.title);
        iframe.setAttribute('allowfullscreen', '');
        mediaEl = iframe;
      }
    } else {
      // Image entry: use the best available image URL (hdurl preferred)
      const img = document.createElement('img');
      img.src = item.hdurl || item.url || '';
      img.alt = item.title;
      mediaEl = img;
    }

    // Short explanation (trimmed for card)
    const meta = document.createElement('p');
    meta.className = 'meta';
    const explanation = item.explanation || '';
    meta.textContent = explanation.length > 260 ? `${explanation.slice(0, 260)}…` : explanation;

    // Assemble card
    card.appendChild(title);
    card.appendChild(mediaEl);
    card.appendChild(meta);

    // When a user clicks the card (or presses Enter while focused), open the modal
    const openHandler = () => {
      showModal(item);
    };
    card.addEventListener('click', openHandler);
    card.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        openHandler();
      }
    });

    gallery.appendChild(card);
  });
}

/* Modal helper functions - simple, beginner-friendly implementation */

// Keep track of previous focus and esc handler so we can clean up and restore focus.
let _previouslyFocused = null;
let _escHandlerRef = null;

/**
 * Populate and show the modal for a given APOD item.
 * @param {Object} item
 */
function showModal(item) {
  const modal = document.getElementById('modal');
  const modalMedia = document.getElementById('modalMedia');
  const modalTitle = document.getElementById('modalTitle');
  const modalDate = document.getElementById('modalDate');
  const modalExplanation = document.getElementById('modalExplanation');

  // Save currently focused element so we can return focus when modal closes
  _previouslyFocused = document.activeElement;

  // Clear previous media
  modalMedia.innerHTML = '';

  // Title and date
  modalTitle.textContent = item.title || '';
  modalDate.textContent = item.date || '';

  // Full explanation
  modalExplanation.textContent = item.explanation || '';

  // Media: image or video embed
  if (item.media_type === 'video') {
    // If a thumbnail is available, show it larger and also embed the video below it
    if (item.thumbnail_url) {
      const img = document.createElement('img');
      img.src = item.thumbnail_url;
      img.alt = `${item.title} (video thumbnail)`;
      modalMedia.appendChild(img);
    }

    // Embed the video iframe so the user can play it inline
    const iframe = document.createElement('iframe');
    iframe.src = item.url;
    iframe.setAttribute('title', item.title);
    iframe.setAttribute('allowfullscreen', '');
    iframe.style.marginTop = '10px';
    iframe.style.width = '100%';
    iframe.style.minHeight = '360px';
    modalMedia.appendChild(iframe);
  } else {
    // For images prefer hdurl when available for larger view
    const img = document.createElement('img');
    img.src = item.hdurl || item.url || '';
    img.alt = item.title || '';
    modalMedia.appendChild(img);
  }

  // Show modal (remove hidden and mark aria attributes)
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');

  // Wire close behavior
  setupModalClose();

  // Move focus into the modal on the close button for accessibility
  const closeBtn = document.getElementById('modalClose');
  if (closeBtn && typeof closeBtn.focus === 'function') {
    closeBtn.focus();
  }
}

/**
 * Close the modal and remove event listeners attached for it.
 */
function hideModal() {
  const modal = document.getElementById('modal');
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');

  // Remove Escape key listener if present
  if (_escHandlerRef) {
    document.removeEventListener('keydown', _escHandlerRef);
    _escHandlerRef = null;
  }

  // Restore focus to the element that had it before modal opened
  if (_previouslyFocused && typeof _previouslyFocused.focus === 'function') {
    _previouslyFocused.focus();
  }
  _previouslyFocused = null;

  // Remove any listeners attached to modal children by replacing it with a clean clone
  const newModal = modal.cloneNode(true);
  modal.parentNode.replaceChild(newModal, modal);
}

/**
 * Attach listeners to allow closing the modal via:
 * - Close button
 * - Clicking the overlay
 * - Pressing Escape
 */
function setupModalClose() {
  const modal = document.getElementById('modal');
  if (!modal) return;

  const closeBtn = modal.querySelector('#modalClose');
  const overlay = modal.querySelector('.modal-overlay');

  // Close button
  if (closeBtn) {
    closeBtn.addEventListener('click', () => hideModal());
  }

  // Clicking overlay closes modal
  if (overlay) {
    overlay.addEventListener('click', () => hideModal());
  }

  // Escape key closes modal — store handler reference so we can remove it later
  _escHandlerRef = (ev) => {
    // Normalize different key representations for broader browser support
    const key = ev.key || ev.keyIdentifier || ev.keyCode;

    // If Escape was pressed, close the modal
    if (key === 'Escape' || key === 'Esc' || key === 27) {
      hideModal();
    }
  };

  // Attach the Escape key listener so hideModal can be triggered
  document.addEventListener('keydown', _escHandlerRef);
}