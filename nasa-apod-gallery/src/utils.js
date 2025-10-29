// utils.js
// This file includes utility functions that assist with various tasks in the application.

// Function to format a date to YYYY-MM-DD
const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Function to handle errors and display a message
const handleError = (error) => {
    console.error("An error occurred:", error);
    alert("Something went wrong. Please try again later.");
};

// Exporting the utility functions
export { formatDate, handleError };