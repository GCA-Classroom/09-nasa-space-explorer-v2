// NASA API Configuration
const API_KEY = "Cw4QupJrjrwa8pDnTDBBOxldzUdseVU5kB8gYrHp";
const BASE_URL = "https://api.nasa.gov/planetary/apod";

// DOM elements
const gallery = document.getElementById('gallery');
const loading = document.getElementById('loading');
const fact = document.getElementById('fact');
const modal = document.getElementById('modal');
const closeModal = document.getElementById('closeModal');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalMedia = document.getElementById('modalMedia');
const modalExplanation = document.getElementById('modalExplanation');

// Fetch data when clicking button
document.getElementById('fetchBtn').addEventListener('click', async () => {
  const start = document.getElementById('startDate').value;
  if (!start) return alert("Please select a start date.");

  // Calculate 9-day range
  const startDate = new Date(start);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 8);

  const formattedStart = startDate.toISOString().split('T')[0];
  const formattedEnd = endDate.toISOString().split('T')[0];

  loading.classList.remove('hidden');
  gallery.innerHTML = "";

  try {
    const data = await fetchAPOD(formattedStart, formattedEnd);
    displayGallery(data);
  } catch (err) {
    gallery.innerHTML = `<p>Error fetching data: ${err.message}</p>`;
  } finally {
    loading.classList.add('hidden');
  }
});

// Fetch function
async function fetchAPOD(start, end) {
  const url = `${BASE_URL}?api_key=${API_KEY}&start_date=${start}&end_date=${end}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch NASA data");
  return await response.json();
}

// Display gallery
function displayGallery(data) {
  data.forEach(item => {
    const card = document.createElement('div');
    card.classList.add('card');

    const media =
      item.media_type === "video"
        ? `<iframe src="${item.url}" frameborder="0" allowfullscreen></iframe>`
        : `<img src="${item.url}" alt="${item.title}" loading="lazy" />`;

    card.innerHTML = `
      ${media}
      <h3>${item.title}</h3>
      <p>${item.date}</p>
    `;

    card.addEventListener('click', () => openModal(item));
    gallery.appendChild(card);
  });
}

// Modal logic
function openModal(item) {
  modal.classList.remove('hidden');
  modalTitle.textContent = item.title;
  modalDate.textContent = item.date;
  modalMedia.innerHTML =
    item.media_type === "video"
      ? `<iframe src="${item.url}" width="100%" height="400"></iframe>`
      : `<img src="${item.url}" width="100%">`;
  modalExplanation.textContent = item.explanation;
}

closeModal.addEventListener('click', () => modal.classList.add('hidden'));
modal.addEventListener('click', e => {
  if (e.target === modal) modal.classList.add('hidden');
});

// Random NASA fact
const facts = [
  "NASA was established in 1958.",
  "The Apollo 11 mission landed on the Moon in 1969.",
  "The Sun accounts for 99.86% of the Solar System’s mass.",
  "Jupiter’s Great Red Spot is a storm larger than Earth.",
  "The Milky Way is estimated to be 13.6 billion years old."
];
fact.textContent = "🌠 Did You Know? " + facts[Math.floor(Math.random() * facts.length)];


