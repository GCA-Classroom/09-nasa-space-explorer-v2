// Use this URL to fetch NASA APOD JSON data.
const apodData = 'https://cdn.jsdelivr.net/gh/GCA-Classroom/apod/data.json';

// Array of space fun facts
const spaceFacts = [
    "One day on Venus is longer than one year on Venus - it takes 243 Earth days to rotate once!",
    "Jupiter has 95 known moons, with four large ones discovered by Galileo in 1610.",
    "A single teaspoon of neutron star material would weigh about 6 billion tons on Earth.",
    "The Sun accounts for 99.86% of all the mass in our solar system.",
    "Mars has the largest volcano in the solar system - Olympus Mons is 13.6 miles high!",
    "Saturn's moon Titan has lakes and rivers of liquid methane and ethane.",
    "Space is completely silent because there's no atmosphere to carry sound waves.",
    "The footprints left by Apollo astronauts on the Moon will last for millions of years.",
    "There are more possible games of chess than there are atoms in the observable universe.",
    "Pluto is smaller than Earth's moon and takes 248 Earth years to orbit the Sun once.",
    "The International Space Station orbits Earth at 17,500 miles per hour.",
    "Mercury experiences temperature swings from 800°F to -300°F between day and night.",
    "A year on Neptune lasts 165 Earth years - it hasn't completed one orbit since its discovery!",
    "The Milky Way galaxy contains an estimated 100-400 billion stars.",
    "Uranus rotates on its side, likely due to an ancient collision with another celestial body."
];

// Get DOM elements
const getImagesBtn = document.getElementById('getImagesBtn');
const gallery = document.getElementById('gallery');
const modal = document.getElementById('imageModal');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalExplanation = document.getElementById('modalExplanation');
const closeModal = document.querySelector('.close');
const factSection = document.getElementById('factSection');

// Add event listeners
getImagesBtn.addEventListener('click', fetchAndDisplayImages);
closeModal.addEventListener('click', hideModal);
modal.addEventListener('click', (e) => {
    if (e.target === modal) hideModal();
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hideModal();
});

// Function to get a random space fact
function getRandomSpaceFact() {
    const randomIndex = Math.floor(Math.random() * spaceFacts.length);
    return spaceFacts[randomIndex];
}

// Function to display a random space fact
function displaySpaceFact() {
    const randomFact = getRandomSpaceFact();
    if (factSection) {
        factSection.innerHTML = `
            <div class="fact-content">
                <h3>🚀 Space Fun Fact</h3>
                <p>${randomFact}</p>
            </div>
        `;
    }
}

// Fetch and display images from NASA APOD API
async function fetchAndDisplayImages() {
    try {
        // Show loading state
        getImagesBtn.textContent = 'Loading...';
        getImagesBtn.disabled = true;
        
        // Display a random space fact
        displaySpaceFact();
        
        // Show loading message in gallery
        gallery.innerHTML = '<div class="loading-message">🔄 Loading space photos…</div>';
        
        // Fetch the data with cache-busting to ensure fresh data
        const response = await fetch(apodData + '?t=' + Date.now());
        const data = await response.json();
        
        // Randomly select 9 images from the dataset
        const shuffledData = data.sort(() => Math.random() - 0.5);
        const selectedImages = shuffledData.slice(0, 9);
        
        // Clear loading message and create gallery items
        gallery.innerHTML = '';
        selectedImages.forEach(item => {
            const galleryItem = createGalleryItem(item);
            gallery.appendChild(galleryItem);
        });
        
        // Reset button
        getImagesBtn.textContent = 'Get Space Images';
        getImagesBtn.disabled = false;
        
    } catch (error) {
        console.error('Error fetching space images:', error);
        gallery.innerHTML = '<div class="error-message">❌ Failed to load images. Please try again.</div>';
        getImagesBtn.textContent = 'Error - Try Again';
        getImagesBtn.disabled = false;
    }
}

// Create a gallery item element
function createGalleryItem(item) {
    const galleryItem = document.createElement('div');
    galleryItem.className = 'gallery-item';
    
    // Handle different media types
    if (item.media_type === 'video') {
        // Extract YouTube video ID and create thumbnail
        const videoId = extractYouTubeId(item.url);
        const thumbnailUrl = videoId ? 
            `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : 
            item.thumbnail_url || 'https://via.placeholder.com/480x360?text=Video';
        
        galleryItem.innerHTML = `
            <div class="video-container">
                <img src="${thumbnailUrl}" alt="${item.title}" loading="lazy" 
                     onerror="this.src='https://via.placeholder.com/480x360?text=Video'">
                <div class="play-overlay">▶</div>
            </div>
            <div class="gallery-info">
                <h3>${item.title}</h3>
                <p class="date">${item.date}</p>
                <p class="media-type">Video</p>
            </div>
        `;
    } else {
        galleryItem.innerHTML = `
            <img src="${item.url}" alt="${item.title}" loading="lazy">
            <div class="gallery-info">
                <h3>${item.title}</h3>
                <p class="date">${item.date}</p>
            </div>
        `;
    }
    
    // Add click event to open modal
    galleryItem.addEventListener('click', () => showModal(item));
    
    return galleryItem;
}

// Extract YouTube video ID from URL
function extractYouTubeId(url) {
    // Handle multiple YouTube URL formats
    const patterns = [
        /(?:youtube\.com\/watch\?v=)([^&\n?#]+)/,
        /(?:youtu\.be\/)([^&\n?#]+)/,
        /(?:youtube\.com\/embed\/)([^&\n?#]+)/,
        /(?:youtube\.com\/v\/)([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
            return match[1];
        }
    }
    
    return null;
}

// Show modal with image or video details
function showModal(item) {
    modalTitle.textContent = item.title;
    modalDate.textContent = item.date;
    modalExplanation.textContent = item.explanation;
    
    // Handle different media types in modal
    if (item.media_type === 'video') {
        // Hide image and show video link
        modalImage.style.display = 'none';
        
        // Create or update video link container
        let videoContainer = document.getElementById('modalVideoContainer');
        if (!videoContainer) {
            videoContainer = document.createElement('div');
            videoContainer.id = 'modalVideoContainer';
            videoContainer.className = 'modal-video-container';
            modalImage.parentNode.insertBefore(videoContainer, modalImage);
        }
        
        const videoId = extractYouTubeId(item.url);
        
        if (videoId) {
            // YouTube video - embed it with better error handling
            videoContainer.innerHTML = `
                <iframe 
                    width="100%" 
                    height="400" 
                    src="https://www.youtube.com/embed/${videoId}?rel=0" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowfullscreen
                    title="${item.title}">
                </iframe>
                <div class="video-fallback" style="display: none; text-align: center; padding: 20px;">
                    <p>Video not available for embedding.</p>
                    <a href="${item.url}" target="_blank" style="color: #4CAF50; text-decoration: underline;">
                        Watch on YouTube
                    </a>
                </div>
            `;
            
            // Add fallback if iframe fails to load
            const iframe = videoContainer.querySelector('iframe');
            iframe.addEventListener('error', () => {
                iframe.style.display = 'none';
                videoContainer.querySelector('.video-fallback').style.display = 'block';
            });
            
        } else {
            // Non-YouTube video or fallback - show thumbnail with link
            const thumbnailUrl = item.thumbnail_url || 'https://via.placeholder.com/480x360?text=Video';
            videoContainer.innerHTML = `
                <div class="video-preview" style="cursor: pointer;">
                    <img src="${thumbnailUrl}" alt="${item.title}" 
                         onerror="this.src='https://via.placeholder.com/480x360?text=Video'">
                    <div class="video-overlay">
                        <div class="play-button">▶</div>
                        <p>Click to watch video</p>
                    </div>
                </div>
                <div style="text-align: center; margin-top: 10px;">
                    <a href="${item.url}" target="_blank" style="color: #4CAF50; text-decoration: underline;">
                        Open Video Link
                    </a>
                </div>
            `;
            
            // Add click event to open video in new tab
            videoContainer.querySelector('.video-preview').addEventListener('click', () => {
                window.open(item.url, '_blank');
            });
        }
        
        videoContainer.style.display = 'block';
        
    } else {
        // Hide video container if it exists
        const videoContainer = document.getElementById('modalVideoContainer');
        if (videoContainer) {
            videoContainer.style.display = 'none';
        }
        modalImage.style.display = 'block';
        modalImage.src = item.url;
        modalImage.alt = item.title;
    }
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Hide modal
function hideModal() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}