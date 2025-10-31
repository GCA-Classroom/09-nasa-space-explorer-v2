document.addEventListener("DOMContentLoaded", () => {
  const apiKey = "Cw4QupJrjrwa8pDnTDBBOxldzUdseVU5kB8gYrHp";
  const fetchBtn = document.getElementById("fetchBtn");
  const startDateInput = document.getElementById("startDate");
  const gallery = document.getElementById("gallery");

  const modal = document.getElementById("modal");
  const modalTitle = document.getElementById("modalTitle");
  const modalDate = document.getElementById("modalDate");
  const modalImg = document.getElementById("modalImg");
  const modalExplanation = document.getElementById("modalExplanation");
  const closeModal = document.getElementById("closeModal");

  // Evita fechas futuras
  const today = new Date().toISOString().split("T")[0];
  startDateInput.max = today;

  fetchBtn.addEventListener("click", async () => {
    const startDate = startDateInput.value;
    if (!startDate) {
      alert("Please select a date first!");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + 8);

    const startStr = start.toISOString().split("T")[0];
    const endStr = end.toISOString().split("T")[0];

    const url = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&start_date=${startStr}&end_date=${endStr}`;

    gallery.innerHTML = "<p>Loading NASA images...</p>";

    try {
      const res = await fetch(url);
      const data = await res.json();
      console.log("NASA API Response:", data);

      if (!Array.isArray(data)) {
        gallery.innerHTML = "<p>No data available for this date. Try an earlier date.</p>";
        return;
      }

      gallery.innerHTML = "";

      data.reverse().forEach(item => {
        const div = document.createElement("div");
        div.classList.add("gallery-item");

        if (item.media_type === "image") {
          div.innerHTML = `
            <img src="${item.url}" alt="${item.title}">
            <h3>${item.title}</h3>
            <p>${item.date}</p>
          `;

          div.querySelector("img").addEventListener("click", () => {
            modal.classList.remove("hidden");
            modalTitle.textContent = item.title;
            modalDate.textContent = item.date;
            modalImg.src = item.hdurl || item.url;
            modalExplanation.textContent = item.explanation;
          });

        } else if (item.media_type === "video") {
          div.innerHTML = `
            <a href="${item.url}" target="_blank">
              <img src="${item.thumbnail_url || 'https://img.youtube.com/vi/1R5QqhPq1Ik/hqdefault.jpg'}" alt="${item.title}">
            </a>
            <h3>${item.title}</h3>
            <p>${item.date}</p>
          `;
        }

        gallery.appendChild(div);
      });
    } catch (err) {
      console.error("Error fetching NASA data:", err);
      gallery.innerHTML = "<p>Failed to load images. Please try again later.</p>";
    }
  });

  closeModal.addEventListener("click", () => {
    modal.classList.add("hidden");
  });
});






