// This file is the entry point of the application.
// It initializes the app, sets up event listeners for user input,
// and manages the overall flow of the application.

const { fetchImages } = require('./api'); // Import the function to fetch images from the API
const { renderGallery } = require('./gallery'); // Import the function to render the gallery

// Function to initialize the application
const initApp = () => {
    const form = document.getElementById('date-range-form'); // Get the form element
    const galleryContainer = document.getElementById('gallery'); // Get the gallery container

    // Event listener for form submission
    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent the default form submission

        const startDate = document.getElementById('start-date').value; // Get the start date
        const endDate = document.getElementById('end-date').value; // Get the end date

        try {
            const images = await fetchImages(startDate, endDate); // Fetch images from the API
            renderGallery(images, galleryContainer); // Render the gallery with the fetched images
        } catch (error) {
            console.error('Error fetching images:', error); // Log any errors
        }
    });
};

// Call the initApp function to start the application
initApp();