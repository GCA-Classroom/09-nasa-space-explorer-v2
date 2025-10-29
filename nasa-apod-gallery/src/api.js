const API_KEY = 'DEMO_KEY'; // Replace with your NASA API key if you have one
const BASE_URL = 'https://api.nasa.gov/planetary/apod'; // Base URL for the API

/**
 * Fetches the Astronomy Picture of the Day for a given date range.
 * @param {string} startDate - The start date in YYYY-MM-DD format.
 * @param {string} endDate - The end date in YYYY-MM-DD format.
 * @returns {Promise<Array>} - A promise that resolves to an array of APOD data.
 */
const fetchAPODs = async (startDate, endDate) => {
    try {
        const response = await fetch(`${BASE_URL}?start_date=${startDate}&end_date=${endDate}&api_key=${API_KEY}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json(); // Parse the JSON from the response
        return data; // Return the data received from the API
    } catch (error) {
        console.error('Error fetching APOD data:', error); // Log any errors that occur
        throw error; // Rethrow the error for further handling
    }
};

// Export the fetchAPODs function for use in other modules
export { fetchAPODs };