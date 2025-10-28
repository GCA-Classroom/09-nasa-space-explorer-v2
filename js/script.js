// Use this URL to fetch NASA APOD JSON data.
const apodData = 'https://cdn.jsdelivr.net/gh/GCA-Classroom/apod/data.json';
// Starfield background effect
function createStarfield(numStars = 120) {
	const starfield = document.getElementById('starfield');
	if (!starfield) return;
	// Clear any existing stars
	starfield.innerHTML = '';
	for (let i = 0; i < numStars; i++) {
		const star = document.createElement('div');
		star.className = 'star';
		const size = Math.random() * 2 + 1;
		star.style.width = `${size}px`;
		star.style.height = `${size}px`;
		star.style.top = `${Math.random() * 100}vh`;
		star.style.left = `${Math.random() * 100}vw`;
		star.style.opacity = Math.random() * 0.7 + 0.3;
		star.style.animationDuration = `${1.5 + Math.random() * 2}s`;
		starfield.appendChild(star);
	}
}

window.addEventListener('DOMContentLoaded', () => {
	createStarfield();
	// ...existing code...
});
// Helper function to get date string in YYYY-MM-DD format
function getDateString(daysAgo) {
	const date = new Date();
	date.setDate(date.getDate() - daysAgo);
	return date.toISOString().split('T')[0];
}

// Function to fetch and display APODs for a date range from the provided CDN JSON
function fetchAPODGallery(startDate, endDate) {
	const gallery = document.getElementById("apod-gallery");
	if (gallery) {
		gallery.innerHTML = '<div style="text-align:center; padding:2em; font-size:1.5em; color:#1976d2; font-weight:bold;">Loading...</div>';
	}
	const apiUrl = 'https://cdn.jsdelivr.net/gh/GCA-Classroom/apod/data.json';
	fetch(apiUrl)
		.then(response => response.json())
		.then(data => {
			if (!gallery) return;
			gallery.innerHTML = "";
			// If no date range is given, show the 9 most recent APODs
			let filtered = data;
			if (startDate && endDate) {
				filtered = data.filter(apod => apod.date >= startDate && apod.date <= endDate);
			}
			// If filtering by date and nothing found, show message
			if (startDate && endDate && filtered.length === 0) {
				gallery.innerHTML = '<p style="text-align:center; color:#b00;">No APODs found for this date range.</p>';
				return;
			}
			// If not filtering by date, or if user wants most recent, show 9 most recent
			if (!startDate || !endDate) {
				filtered = [...data].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 9);
			}
			filtered.forEach(apod => {
				const apodDiv = document.createElement("div");
				apodDiv.style.marginBottom = "2em";
				apodDiv.style.border = "1px solid #ccc";
				apodDiv.style.padding = "1em";
				apodDiv.style.borderRadius = "8px";
				apodDiv.style.background = "#f9f9f9";
				const title = document.createElement("h3");
				title.textContent = apod.title;
				apodDiv.appendChild(title);
				// Handle image or video
								if (apod.media_type === "image") {
									const img = document.createElement("img");
									img.src = apod.url;
									img.alt = apod.title;
									img.style.display = "block";
									img.style.margin = "0 auto 1em auto";
									img.style.maxWidth = "350px";
									img.style.width = "100%";
									img.style.height = "auto";
									// Add click event to show modal with full-size image
									img.style.cursor = "pointer";
												img.addEventListener('click', () => {
													const modal = document.getElementById('apod-modal');
													const modalImg = document.getElementById('apod-modal-img');
													const modalTitle = document.getElementById('apod-modal-title');
													const modalDesc = document.getElementById('apod-modal-desc');
													if (modal && modalImg && modalTitle && modalDesc) {
														modalImg.src = apod.hdurl || apod.url;
														modalImg.alt = apod.title;
														modalTitle.textContent = apod.title;
														modalDesc.textContent = apod.explanation;
														modal.style.display = 'flex';
													}
												});
									apodDiv.appendChild(img);
// Modal close logic (run only once on DOMContentLoaded)
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('apod-modal');
  const modalClose = document.getElementById('apod-modal-close');
  if (modal && modalClose) {
    modalClose.addEventListener('click', () => {
      modal.style.display = 'none';
    });
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  }
});
				} else if (apod.media_type === "video") {
					// If thumbnail_url exists, show thumbnail and link
								if (apod.thumbnail_url) {
									const a = document.createElement("a");
									a.href = apod.url;
									a.target = "_blank";
									const thumb = document.createElement("img");
									thumb.src = apod.thumbnail_url;
									thumb.alt = apod.title + ' (video)';
									thumb.style.display = "block";
									thumb.style.margin = "0 auto 1em auto";
									thumb.style.maxWidth = "350px";
									thumb.style.width = "100%";
									thumb.style.height = "auto";
									a.appendChild(thumb);
									apodDiv.appendChild(a);
					} else {
						// Otherwise, just show a link
						const link = document.createElement("a");
						link.href = apod.url;
						link.target = "_blank";
						link.textContent = "Watch Video";
						apodDiv.appendChild(link);
					}
				}
				const date = document.createElement("p");
				date.textContent = apod.date;
				date.style.fontWeight = "bold";
				apodDiv.appendChild(date);
				const desc = document.createElement("p");
				desc.textContent = apod.explanation;
				apodDiv.appendChild(desc);
				gallery.appendChild(apodDiv);
			});
		})
		.catch(error => {
			if (gallery) {
				gallery.innerHTML = `<p style=\"color:red;\">Error loading APODs: ${error.message}</p>`;
			}
		});
}

// On page load, set date pickers to the 9 most recent APODs, but do not show images until button is pressed
window.addEventListener('DOMContentLoaded', () => {
	const startInput = document.getElementById('start-date');
	const endInput = document.getElementById('end-date');
	const apiUrl = 'https://cdn.jsdelivr.net/gh/GCA-Classroom/apod/data.json';
	// Modal close logic
	const modal = document.getElementById('apod-modal');
	const modalClose = document.getElementById('apod-modal-close');
	if (modal && modalClose) {
		modalClose.addEventListener('click', () => {
			modal.style.display = 'none';
		});
		modal.addEventListener('click', (e) => {
			if (e.target === modal) {
				modal.style.display = 'none';
			}
		});
	}

	// Set up date pickers to the 9 most recent APODs
	fetch(apiUrl)
		.then(response => response.json())
		.then(data => {
			// Sort by date descending
			const sorted = [...data].sort((a, b) => b.date.localeCompare(a.date));
			const mostRecent = sorted[0];
			const ninthRecent = sorted[8] || sorted[sorted.length - 1];
			if (startInput && endInput && mostRecent && ninthRecent) {
				startInput.value = ninthRecent.date;
				endInput.value = mostRecent.date;
			}
		});
	const fetchBtn = document.getElementById('fetch-apod-range');
	if (fetchBtn && startInput && endInput) {
		fetchBtn.addEventListener('click', () => {
			const startDate = startInput.value;
			const endDate = endInput.value;
			if (startDate && endDate) {
				fetchAPODGallery(startDate, endDate);
			}
		});
	}
	// Optionally, clear the gallery on load
	const gallery = document.getElementById('apod-gallery');
	if (gallery) {
		gallery.innerHTML = '';
	}
});
