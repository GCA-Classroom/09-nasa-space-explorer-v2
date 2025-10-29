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


/**
 * Fetch a consecutive range of APOD entries from the NASA APOD API.
 * Uses the `start_date` and `end_date` query parameters to fetch multiple
 * days in a single request. Defaults to 9 days total when invoked from the UI.
 *
 * startDateStr: string in YYYY-MM-DD format (or anything the Date constructor accepts)
 * days: number of consecutive days to fetch (default 9)
 * apiKey: NASA API key (string). Defaults to 'DEMO_KEY' when not provided.
 *
 * Returns an array of APOD objects (newest-last order depends on API; callers may sort).
 */
export async function fetchAPODRange(startDateStr, days = 9, apiKey = 'DEMO_KEY') {
  if (!startDateStr) {
    throw new Error('startDateStr is required for fetchAPODRange');
  }

  const startDate = new Date(startDateStr);
  if (Number.isNaN(startDate.getTime())) {
    throw new Error('Invalid start date provided');
  }

  // Compute end date (inclusive) for the requested number of days
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + Math.max(1, days) - 1);

  // Helper to format YYYY-MM-DD
  const fmt = (d) => d.toISOString().slice(0, 10);

  const url = `https://api.nasa.gov/planetary/apod?start_date=${fmt(startDate)}&end_date=${fmt(endDate)}&api_key=${encodeURIComponent(apiKey)}`;

  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`NASA APOD fetch failed: ${res.status} ${res.statusText} - ${text}`);
  }

  const data = await res.json();

  // API returns either an array (when start_date provided) or a single object.
  return Array.isArray(data) ? data : [data];
}


/**
 * Fetch APOD entries for an explicit start and end date (inclusive).
 * startDateStr and endDateStr should be YYYY-MM-DD (or parseable by Date).
 */
export async function fetchAPODBetween(startDateStr, endDateStr, apiKey = 'DEMO_KEY') {
  if (!startDateStr || !endDateStr) {
    throw new Error('Both startDateStr and endDateStr are required for fetchAPODBetween');
  }

  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    throw new Error('Invalid start or end date provided');
  }
  if (endDate < startDate) {
    throw new Error('End date must be the same or after the start date');
  }

  const fmt = (d) => d.toISOString().slice(0, 10);
  const url = `https://api.nasa.gov/planetary/apod?start_date=${fmt(startDate)}&end_date=${fmt(endDate)}&api_key=${encodeURIComponent(apiKey)}`;

  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`NASA APOD fetch failed: ${res.status} ${res.statusText} - ${text}`);
  }

  const data = await res.json();
  return Array.isArray(data) ? data : [data];
}