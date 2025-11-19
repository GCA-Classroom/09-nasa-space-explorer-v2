// Use this URL to fetch NASA APOD JSON data.
const apodData = 'https://cdn.jsdelivr.net/gh/GCA-Classroom/apod/data.json';

// Get references to DOM elements
const gallery = document.getElementById('gallery');
const getImageBtn = document.getElementById('getImageBtn');

// Local images to include (fallback or augmentation)
// Cleared: removed the previously-listed local image filenames so they won't appear on the page.
const localImageFiles = [];

function filenameToTitle(path) {
	const parts = path.split('/');
	const file = parts[parts.length - 1];
	const name = file.replace(/\.[^.]+$/, '');
	return name.replace(/[_-]+/g, ' ');
}

// Show a short loading message while we fetch images
function showLoading() {
	if (!gallery) return;
	gallery.innerHTML = `
		<div class="loading">
			<div class="loading-icon">🔄</div>
			<p>Loading space photos…</p>
		</div>
	`;
}

// Render gallery content once data is available
function renderGallery(items) {
	if (!gallery) return;
	if (!items || items.length === 0) {
		gallery.innerHTML = `
			<div class="placeholder">
				<p>No images found.</p>
			</div>
		`;
		return;
	}

	// Only include items that are images
	const imageItems = items.filter(i => i.media_type === 'image');

	const cards = imageItems.map(item => {
		const title = item.title ? item.title : '';
		const url = item.url || item.hdurl || '';
		const date = item.date ? item.date : '';
		const explanation = item.explanation ? item.explanation : '';

		return `
			<figure class="card">
				<img src="${url}" alt="${title}" loading="lazy" />
				<figcaption>
					<strong>${title}</strong>
					<div class="meta">${date}</div>
					<p class="explain">${explanation}</p>
				</figcaption>
			</figure>
		`;
	}).join('');

	gallery.innerHTML = `<div class="cards">${cards}</div>`;

	// After rendering, attach click handlers so users can toggle full descriptions
	attachCardClickHandlers();
}

// Attach click handlers to toggle full description for each card
function attachCardClickHandlers() {
	const cardEls = document.querySelectorAll('.card');
	if (!cardEls) return;

	cardEls.forEach(card => {
		// make keyboard accessible
		card.setAttribute('tabindex', '0');
		card.setAttribute('role', 'button');
		card.setAttribute('aria-expanded', 'false');

		const toggle = () => {
			const expanded = card.classList.toggle('expanded');
			card.setAttribute('aria-expanded', expanded ? 'true' : 'false');
		};

		// Click to toggle
		card.addEventListener('click', toggle);

		// Keyboard: Enter or Space toggles too
		card.addEventListener('keydown', (e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				toggle();
			}
		});
	});
}

// Fetch data and update the UI
async function fetchAndShow() {
	try {
		showLoading();
		if (getImageBtn) getImageBtn.disabled = true;

		const res = await fetch(apodData);
		if (!res.ok) throw new Error('Network response was not ok');

		const data = await res.json();

		// Ensure we have an array
		const apiItems = Array.isArray(data) ? data : [];

		// Normalize API items: only images
		const apiImageItems = apiItems.filter(i => i.media_type === 'image' || (i.url && i.url.match(/\.(jpg|jpeg|png|gif)$/i)));

		// Build fallback items from local files
		const fallbackItems = localImageFiles.map(p => ({
			media_type: 'image',
			url: p,
			title: filenameToTitle(p),
			date: ''
		}));

		// Merge: start with API images, then append local ones not already present
		const merged = [...apiImageItems];
		const existingUrls = new Set(apiImageItems.map(i => (i.url || '').split('/').pop()));
		for (const f of fallbackItems) {
			const name = f.url.split('/').pop();
			if (!existingUrls.has(name)) merged.push(f);
		}

		// If there's nothing from API, use fallback set
		const itemsToRender = merged.length > 0 ? merged : fallbackItems;

		// Sort items by date (newest first). Items with missing/invalid dates are placed last.
		itemsToRender.sort((a, b) => {
			const da = Date.parse(a.date);
			const db = Date.parse(b.date);
			const aInvalid = Number.isNaN(da);
			const bInvalid = Number.isNaN(db);
			if (aInvalid && bInvalid) return 0;
			if (aInvalid) return 1; // a goes after b
			if (bInvalid) return -1; // b goes after a
			return db - da; // newest first
		});

		renderGallery(itemsToRender);
	} catch (err) {
		console.error('Failed to load APOD data', err);
		if (gallery) {
			gallery.innerHTML = `
				<div class="placeholder">
					<p>Couldn't load images. Please try again later.</p>
				</div>
			`;
		}
	} finally {
		if (getImageBtn) getImageBtn.disabled = false;
	}
}

// Attach event handler to the button
if (getImageBtn) getImageBtn.addEventListener('click', fetchAndShow);