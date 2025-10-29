# Project: NASA Space Explorer App (JSON Edition)

NASA publishes an [**Astronomy Picture of the Day (APOD)**](https://apod.nasa.gov/apod/archivepixFull.html)—images and videos with short explanations about our universe.

In this project, you’ll build a gallery that fetches APOD-style entries from a **provided JSON feed** (same field names as the real APOD API). Render a grid of items and a modal with details.

---

## Data Source (CDN)

Use this URL in your `fetch` request:

```js
https://cdn.jsdelivr.net/gh/GCA-Classroom/apod/data.json
```

- The file returns an **array** of APOD-like objects.  
- Keys mirror NASA’s APOD API: `date`, `title`, `explanation`, `media_type`, `url`, `hdurl` (images only), optional `thumbnail_url` (videos), and `service_version`.

### Example object (image)

```json
{
  "date": "2025-10-01",
  "title": "NGC 6960: The Witch's Broom Nebula",
  "explanation": "…",
  "media_type": "image",
  "url": "https://apod.nasa.gov/apod/image/2510/WitchBroom_Meyers_1080.jpg",
  "hdurl": "https://apod.nasa.gov/apod/image/2510/WitchBroom_Meyers_6043.jpg",
  "service_version": "v1",
  "copyright": "Brian Meyers"
}
```

### Example object (with video)
Not all APOD entries are images. Some are YouTube videos. Detect video entries and handle them appropriately by either embedding the video, displaying the thumbnail image, or providing a clear, clickable link to the video. 

The goal is to ensure users can easily access or clearly view content regardless of its media type.

```json
{
  "date": "2024-06-30",
  "title": "Earthrise: A Video Reconstruction",
  "explanation": "…",
  "media_type": "video",
  "url": "https://www.youtube.com/embed/1R5QqhPq1Ik",
  "thumbnail_url": "https://img.youtube.com/vi/1R5QqhPq1Ik/hqdefault.jpg",
  "service_version": "v1"
}
```

### Your Task
* **Fetch the JSON:** Request the CDN URL above and parse the returned array.
* **Display the Gallery:** For each item, show the image (or video thumbnail/player), title, and date.

# NASA APOD Gallery (simple)

This is a beginner-friendly static web app that loads NASA's Astronomy Picture of the Day (APOD) for a user-selected date range.

How to run locally (inside the dev container):

1. Open a terminal in the repo root and start a simple static server:
   - Using Python 3:
     cd public
     python3 -m http.server 5500

2. Open the page in the host browser (the dev container exposes $BROWSER):
   $BROWSER http://localhost:5500

Notes:
- The app uses DEMO_KEY by default. For higher rate limits, get a free API key from https://api.nasa.gov and paste it into the API Key field.
- Keep date ranges small (a week or two) to avoid large downloads and rate limits.


