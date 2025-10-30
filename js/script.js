document.addEventListener("DOMContentLoaded", () => {
  
  // CLAVE API PROPORCIONADA POR EL USUARIO
  const API_KEY = "pHkUcOcgcv4qGCmizdVlKDxwJ9i6siVfesiGqXHq"; 
  const DATA_BASE_URL = `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`; 

  const form = document.getElementById("date-form");
  const startInput = document.getElementById("start-date");
  const results = document.getElementById("results");
  const message = document.getElementById("message");
  const didYouKnowEl = document.getElementById("did-you-know");
  
  // NUEVO: Referencia al elemento de carga
  const loadingSpinner = document.getElementById("loading-spinner");

  // Modal elements (Omitidos para brevedad)
  const modal = document.getElementById("media-modal");
  const modalBackdrop = document.getElementById("modal-backdrop");
  const modalClose = document.getElementById("modal-close");
  const modalMedia = document.getElementById("modal-media");
  const modalTitle = document.getElementById("modal-title");
  const modalDate = document.getElementById("modal-date");
  const modalExplain = document.getElementById("modal-explain");

  // Did You Know facts
  const DID_YOU_KNOW = [
    "The first photo of Earth from space was taken in 1946.",
    "APOD (Astronomy Picture of the Day) has been published by NASA since 1995.",
    "The Moon is moving away from Earth at about 3.8 cm per year.",
    "Light from the Sun takes about 8 minutes and 20 seconds to reach Earth.",
    "In 1977 the Voyager probes were launched; they still send data from deep space."
  ];

  (function showRandomDidYouKnow() {
    const idx = Math.floor(Math.random() * DID_YOU_KNOW.length);
    if (didYouKnowEl) didYouKnowEl.textContent = `Did you know? ${DID_YOU_KNOW[idx]}`;
  })();
  
  // --- HELPERS ---
  
  function formatDate(d) { return d.toISOString().slice(0,10); }

  function getEndDate(startDateObj) {
      const cur = new Date(startDateObj);
      cur.setDate(cur.getDate() + 8); 
      return formatDate(cur);
  }
  
  function showMessage(text) { if (message) message.textContent = text; }
  
  function renderNineDays(data) {
      results.innerHTML = "";
      let renderedCount = 0;
      
      data.forEach(item => {
        if (item && item.date) {
          results.appendChild(createCard(item));
          renderedCount++;
        } else {
            results.appendChild(createPlaceholder(item.date || 'Unknown Date')); 
        }
      });
      
      if (renderedCount > 0) {
        showMessage(`Showing ${renderedCount} days.`);
      } else {
         showMessage(`No data available for the selected dates.`);
      }
      setTimeout(() => { if (message && message.textContent.includes("Showing")) message.textContent = ""; }, 3000);
  }
  
  // --- CORE LOGIC: FETCHING DATA ---

  async function fetchAndRenderNineDays(startDate) {
      results.innerHTML = "";
      showMessage(`Fetching data from NASA for 9 days starting ${startDate}...`);
      
      const startDateObj = new Date(startDate);
      const endDate = getEndDate(startDateObj);
      const FULL_URL = `${DATA_BASE_URL}&start_date=${startDate}&end_date=${endDate}`;
      
      // MOSTRAR EL SPINNER ANTES DE EMPEZAR
      loadingSpinner.style.display = "block";

      try {
          const resp = await fetch(FULL_URL);
          if (!resp.ok) {
            console.error(`API Request Failed with Status: ${resp.status}`);
            throw new Error(`Network error ${resp.status}. Check API Key and date range constraints.`);
          }
          
          const data = await resp.json();
          const arr = Array.isArray(data) ? data : []; 
          
          arr.sort((a, b) => new Date(a.date) - new Date(b.date));
          
          renderNineDays(arr); 

      } catch (err) {
          console.error("Failed to load data:", err);
          showMessage(`Failed to load data. Error: ${err.message}. Please check the console (F12) for details.`);
      } finally {
          // OCULTAR EL SPINNER SIEMPRE QUE TERMINE
          loadingSpinner.style.display = "none";
      }
  }

  function loadFeed() {
    showMessage("Enter a start date (YYYY-MM-DD) and click 'Show 9 Days' to load images.");
  }
  loadFeed();

  // Form submit handler
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const rawStart = startInput.value;
    
    if (!rawStart) { 
        showMessage("Please select a valid start date."); 
        return; 
    }
    
    const startDateObj = new Date(rawStart);
    const today = new Date();
    if (startDateObj > today) { 
        showMessage("Start date cannot be in the future."); 
        return; 
    }

    fetchAndRenderNineDays(rawStart);
  });

  // --- CARD & MODAL LOGIC (UNCHANGED) ---
  
  function createCard(item) {
    const card = document.createElement("article");
    card.className = "card";
    const mediaWrap = document.createElement("div");
    if (item.media_type === "image") {
      const img = document.createElement("img");
      img.decoding = "async";
      img.loading = "lazy";
      img.alt = item.title || "Astronomy Picture";
      img.src = item.url || item.hdurl || "";
      img.onerror = () => {
        if (item.hdurl && img.src !== item.hdurl) {
          img.src = item.hdurl;
        } else {
          img.style.display = "none";
          const p = document.createElement("div");
          p.style.height = "220px";
          p.style.background = "#000";
          p.style.color = "#fff";
          p.style.display = "flex";
          p.style.alignItems = "center";
          p.style.justifyContent = "center";
          p.textContent = "Image failed to load";
          mediaWrap.appendChild(p);
        }
      };
      img.style.cursor = "pointer";
      img.addEventListener("click", () => openModal(item));
      mediaWrap.appendChild(img);
    } else if (item.media_type === "video") {
      const thumb = item.thumbnail_url || (item.url && extractYouTubeId(item.url) ? `https://img.youtube.com/vi/${extractYouTubeId(item.url)}/hqdefault.jpg` : null);
      if (thumb) {
        const img = document.createElement("img");
        img.decoding = "async";
        img.loading = "lazy";
        img.src = thumb;
        img.alt = item.title || "Video thumbnail";
        img.style.cursor = "pointer";
        img.onerror = () => { img.style.display = "none"; };
        img.addEventListener("click", () => openModal(item));
        mediaWrap.appendChild(img);
      } else {
        const div = document.createElement("div");
        div.style.height = "220px";
        div.style.background = "#000";
        div.style.display = "flex";
        div.style.alignItems = "center";
        div.style.justifyContent = "center";
        const btn = document.createElement("button");
        btn.textContent = "Open Video";
        btn.addEventListener("click", () => openModal(item));
        div.appendChild(btn);
        mediaWrap.appendChild(div);
      }
    } else {
      const placeholder = document.createElement("div");
      placeholder.style.height = "220px";
      placeholder.style.background = "#111";
      placeholder.style.color = "#fff";
      placeholder.style.display = "flex";
      placeholder.style.alignItems = "center";
      placeholder.style.justifyContent = "center";
      placeholder.textContent = "Unsupported Media";
      mediaWrap.appendChild(placeholder);
    }
    card.appendChild(mediaWrap);
    const body = document.createElement("div");
    body.className = "card-body";
    const title = document.createElement("h3");
    title.className = "card-title";
    title.textContent = item.title || "Untitled";
    const date = document.createElement("div");
    date.className = "card-date";
    date.textContent = item.date || "";
    const explain = document.createElement("p");
    explain.className = "card-explain";
    explain.textContent = item.explanation ? truncateText(item.explanation, 180) : "";
    body.appendChild(title);
    body.appendChild(date);
    body.appendChild(explain);
    card.appendChild(body);
    return card;
  }

  function createPlaceholder(dateStr) {
    const placeholder = document.createElement("article");
    placeholder.className = "card";
    placeholder.innerHTML = `
      <div style="height:220px;background:#000;display:flex;align-items:center;justify-content:center;color:#fff">
        No APOD Data
      </div>
      <div class="card-body">
        <h3 class="card-title">No Image Available</h3>
        <div class="card-date">${dateStr}</div>
        <p class="card-explain">No data available for this date.</p>
      </div>`;
    return placeholder;
  }

  function openModal(item) {
    modalMedia.innerHTML = "";
    modalTitle.textContent = item.title || "";
    modalDate.textContent = item.date || "";
    modalExplain.textContent = item.explanation || "";
    if (item.media_type === "image") {
      const img = document.createElement("img");
      img.src = item.hdurl || item.url || "";
      img.alt = item.title || "";
      modalMedia.appendChild(img);
    } else if (item.media_type === "video") {
      const iframe = document.createElement("iframe");
      iframe.src = item.url;
      iframe.width = "100%";
      iframe.height = "480";
      iframe.frameBorder = "0";
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      iframe.allowFullscreen = true;
      modalMedia.appendChild(iframe);
    } else {
      modalMedia.textContent = "Unsupported media";
    }
    modal.setAttribute("aria-hidden", "false");
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
  }
  function closeModal() {
    modal.setAttribute("aria-hidden", "true");
    modal.style.display = "none";
    modalMedia.innerHTML = "";
    document.body.style.overflow = "";
  }
  modalClose.addEventListener("click", closeModal);
  modalBackdrop.addEventListener("click", closeModal);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

  function truncateText(text, maxLen) {
    if (!text) return "";
    if (text.length <= maxLen) return text;
    const sub = text.slice(0, maxLen);
    const lastSpace = sub.lastIndexOf(" ");
    return `${sub.slice(0, lastSpace)}...`;
  }
  function extractYouTubeId(url) {
    try {
      const m = url.match(/(?:\/vi\/|v=|\/embed\/|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
      return m ? m[1] : "";
    } catch {
      return "";
    }
  }
});
