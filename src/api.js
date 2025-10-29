// Simple wrapper to fetch the classroom APOD-style JSON feed for beginners

const FEED_URL = 'https://cdn.jsdelivr.net/gh/GCA-Classroom/apod/data.json';

/**
 * Fetch the APOD-style JSON feed from the CDN.
 * Returns an array of APOD-like objects.
 */
export async function fetchAPODFeed() {
  // Use fetch to get the JSON file from the CDN
  const res = await fetch(FEED_URL);
  if (!res.ok) {
    // Throw an Error so callers can show a useful message
    const text = await res.text();
    throw new Error(`Failed to load feed: ${res.status} ${res.statusText} - ${text}`);
  }
  // Parse JSON (the file returns an array)
  const data = await res.json();
  return data;
}