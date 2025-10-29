// This file contains tests for the functions in api.js, ensuring that the API calls work as expected and return the correct data.

const { fetchAPOD } = require('../src/api'); // Import the function to be tested
const axios = require('axios'); // Import axios for making HTTP requests

jest.mock('axios'); // Mock axios to control its behavior in tests

describe('fetchAPOD', () => {
    it('should fetch the Astronomy Picture of the Day for a given date', async () => {
        const date = '2023-10-01'; // Example date
        const mockResponse = {
            data: {
                title: 'Test Title',
                url: 'https://example.com/test.jpg',
                explanation: 'Test explanation',
            },
        };

        axios.get.mockResolvedValue(mockResponse); // Mock the axios GET request

        const result = await fetchAPOD(date); // Call the function with the test date

        expect(result).toEqual(mockResponse.data); // Check if the result matches the mock response
        expect(axios.get).toHaveBeenCalledWith(`https://api.nasa.gov/planetary/apod?date=${date}&api_key=DEMO_KEY`); // Verify the API call
    });

    it('should handle errors when fetching the APOD', async () => {
        const date = '2023-10-01'; // Example date
        const errorMessage = 'Network Error';

        axios.get.mockRejectedValue(new Error(errorMessage)); // Mock an error response

        await expect(fetchAPOD(date)).rejects.toThrow(errorMessage); // Check if the function throws an error
    });
});