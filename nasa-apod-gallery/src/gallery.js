const galleryContainer = document.getElementById('gallery-container');

// Function to create and display the image gallery
const displayGallery = (images) => {
    // Clear the existing gallery
    galleryContainer.innerHTML = '';

    // Loop through each image and create an element for it
    images.forEach(image => {
        const imageElement = document.createElement('div');
        imageElement.classList.add('gallery-item');

        // Create an image element
        const img = document.createElement('img');
        img.src = image.url; // Set the image source
        img.alt = image.title; // Set the alt text for accessibility

        // Create a caption for the image
        const caption = document.createElement('p');
        caption.textContent = image.title; // Set the caption text

        // Append the image and caption to the gallery item
        imageElement.appendChild(img);
        imageElement.appendChild(caption);

        // Append the gallery item to the gallery container
        galleryContainer.appendChild(imageElement);
    });
};

// Export the displayGallery function for use in other modules
export { displayGallery };