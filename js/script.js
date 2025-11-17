// Use this URL to fetch NASA APOD JSON data.
const apodData = 'https://cdn.jsdelivr.net/gh/GCA-Classroom/apod/data.json';

// DOM refs
const gallery = document.getElementById('gallery');
const fetchBtn = document.getElementById('getImageBtn');

// Event listeners
fetchBtn.addEventListener('click', () => {
	fetchApodData();
});

// Fetch the JSON and render a gallery
async function fetchApodData() {
	try {
		fetchBtn.disabled = true;
		fetchBtn.textContent = 'Fetching...';

		const res = await fetch(apodData);
		if (!res.ok) throw new Error('Network response was not ok');

		const data = await res.json();
		// Data is an array of APOD-like objects
		renderGallery(data);

		fetchBtn.textContent = 'Fetch Space Images';
		fetchBtn.disabled = false;
	} catch (err) {
		console.error('Fetch error:', err);
		fetchBtn.textContent = 'Fetch Space Images';
		fetchBtn.disabled = false;
		gallery.innerHTML = `<div class="placeholder"><p>Unable to load feed. Try again later.</p></div>`;
	}
}

// Render a grid of items
function renderGallery(items) {
	if (!Array.isArray(items) || items.length === 0) {
		gallery.innerHTML = `<div class="placeholder"><p>No entries available</p></div>`;
		return;
	}

	const html = items.map(item => createGalleryItem(item));
	// Remove placeholder and append items
	gallery.innerHTML = html.join('\n');

	// Set click handlers for open modal
	const nodes = gallery.querySelectorAll('.gallery-item');
	nodes.forEach((el, i) => {
		el.addEventListener('click', () => openModal(items[i]));
		el.addEventListener('keydown', (e) => {
			if (e.key === 'Enter' || e.key === ' ') openModal(items[i]);
		});
	});
}

// Create markup for each gallery item as a string
function createGalleryItem(item) {
	// Show thumbnail for videos if available
	const thumb = item.media_type === 'image' ? item.url : (item.thumbnail_url || item.url);

	const isVideo = item.media_type === 'video';
	return `
		<div class="gallery-item" role="button" tabindex="0">
			${isVideo ? '<div class="video-badge">▶</div>' : ''}
			<img src="${escapeHtml(thumb)}" alt="${escapeHtml(item.title)}" />
			<p><strong>${escapeHtml(item.title)}</strong></p>
			<p>${escapeHtml(item.date)}</p>
		</div>
	`;
}

// Modal: create and manage
function openModal(item) {
	// Build content depending on media type
	const modal = document.createElement('div');
	modal.className = 'modal-overlay';

	const media = item.media_type === 'video'
		? `<div class="modal-media"><iframe src="${escapeHtml(item.url)}" allowfullscreen title="${escapeHtml(item.title)}"></iframe></div>`
		: `<div class="modal-media"><img src="${escapeHtml(item.hdurl || item.url)}" alt="${escapeHtml(item.title)}"></div>`;

	modal.innerHTML = `
		<div class="modal-content">
			<button class="modal-close" aria-label="Close">✕</button>
			<h2>${escapeHtml(item.title)}</h2>
			<p class="meta">${escapeHtml(item.date)}</p>
			${media}
			<p class="explain">${escapeHtml(item.explanation)}</p>
		</div>`;

	modal.querySelector('.modal-close').addEventListener('click', () => closeModal(modal));
	modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(modal); });

	document.body.appendChild(modal);
	document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
	modal.remove();
	document.body.style.overflow = '';
}

// Small helper to escape HTML when injecting strings
function escapeHtml(text = '') {
	return String(text)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}