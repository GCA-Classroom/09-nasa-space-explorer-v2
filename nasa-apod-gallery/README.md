# NASA Astronomy Picture of the Day Gallery

This project is a web application that connects to NASA's public API to display the Astronomy Picture of the Day (APOD) in a dynamic gallery. Users can select a date range to view images from that period.

## Project Structure

```
nasa-apod-gallery
├── public
│   ├── index.html          # Main HTML document for the web application
│   └── styles
│       └── main.css       # Styles for the web application
├── src
│   ├── app.js             # Entry point of the application
│   ├── api.js             # Functions to interact with NASA's API
│   ├── gallery.js         # Functions to render the image gallery
│   └── utils.js           # Utility functions for various tasks
├── tests
│   └── api.test.js        # Tests for API functions
├── package.json           # Configuration file for npm
├── .gitignore             # Files and directories to ignore by Git
└── README.md              # Documentation for the project
```

## Getting Started

To set up and run the application, follow these steps:

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd nasa-apod-gallery
   ```

2. **Install dependencies:**
   ```
   npm install
   ```

3. **Run the application:**
   Open `public/index.html` in your web browser to view the application.

## Usage

- Select a start and end date to filter the Astronomy Pictures of the Day.
- The gallery will dynamically update to display images from the selected date range.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is open-source and available under the MIT License.