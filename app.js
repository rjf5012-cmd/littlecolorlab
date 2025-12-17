// app.js
// Little Color Lab – coloring sheets grid + filters + "New pages" section

document.addEventListener("DOMContentLoaded", () => {
  const gridEl = document.getElementById("grid");
  const emptyStateEl = document.getElementById("emptyState");
  const searchInput = document.getElementById("search");
  const categoryButtonsEl = document.getElementById("category-buttons");
  const newGridEl = document.getElementById("newGrid");

  const YEAR_SPAN = document.getElementById("year");
  if (YEAR_SPAN) {
    YEAR_SPAN.textContent = new Date().getFullYear();
  }

  let allSheets = [];
  let filteredSheets = [];
  let activeCategory = "";
  let searchTerm = "";

  // -------------------------------
  // Fetch data
  // -------------------------------
  fetch("/data/coloring-sheets.json")
    .then((res) => res.json())
    .then((data) => {
      allSheets = data || [];

      // Sort newest first by "added" date if present
      allSheets.sort((a, b) => {
        const da = a.added ? Date.parse(a.added) : 0;
        const db = b.added ? Date.parse(b.added) : 0;
        return db - da;
      });

      buildCategoryButtons(allSheets);
      renderNewSection(allSheets);
      applyFilters();
    })
    .catch((err) => {
      console.error("Error loading coloring-sheets.json", err);
      gridEl.innerHTML = "<p>Sorry, we couldn't load the coloring pages right now.</p>";
    });

  // -------------------------------
  // Category buttons
  // -------------------------------
  function buildCategoryButtons(sheets) {
    const categories = Array.from(new Set(sheets.map((s) => s.category).filter(Boolean))).sort();

    // "All" button
    const allBtn = document.createElement("button");
    allBtn.type = "button";
    allBtn.className = "category-btn active";
    allBtn.textContent = "All";
    allBtn.dataset.category = "";
    categoryButtonsEl.appendChild(allBtn);

    allBtn.addEventListener("click", () => {
      activeCategory = "";
      updateCategoryActiveState("");
      applyFilters();
    });

    categories.forEach((cat) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "category-btn";
      btn.textContent = cat;
      btn.dataset.category = cat;

      btn.addEventListener("click", () => {
        activeCategory = cat;
        updateCategoryActiveState(cat);
        applyFilters();
      });

      categoryButtonsEl.appendChild(btn);
    });
  }

  function updateCategoryActiveState(category) {
    const buttons = categoryButtonsEl.querySelectorAll(".category-btn");
    buttons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.category === category);
    });
  }

  // -------------------------------
  // Search
  // -------------------------------
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchTerm = e.target.value.trim().toLowerCase();
      applyFilters();
    });
  }

  function applyFilters() {
    filteredSheets = allSheets.filter((sheet) => {
      const matchesCategory = !activeCategory || sheet.category === activeCategory;
      if (!matchesCategory) return false;

      if (!searchTerm) return true;

      const haystack =
        (sheet.title || "").toLowerCase() +
        " " +
        (sheet.category || "").toLowerCase() +
        " " +
        (Array.isArray(sheet.tags) ? sheet.tags.join(" ").toLowerCase() : "");

      return haystack.includes(searchTerm);
    });

    renderGrid(filteredSheets);
  }

  // -------------------------------
  // Rendering helpers
  // -------------------------------
  function renderGrid(sheets) {
    gridEl.innerHTML = "";

    if (!sheets.length) {
      emptyStateEl.classList.remove("hidden");
      return;
    }

    emptyStateEl.classList.add("hidden");

    sheets.forEach((sheet) => {
      const card = createSheetCard(sheet);
      gridEl.appendChild(card);
    });
  }

  function renderNewSection(sheets) {
    if (!newGridEl) return;
    newGridEl.innerHTML = "";

    // Show the 8 most recent sheets
    const newest = sheets.slice(0, 8);

    newest.forEach((sheet) => {
      const card = createNewCard(sheet);
      newGridEl.appendChild(card);
    });
  }

  // -------------------------------
  // Card creators
  // -------------------------------

  // Create an image element with safe explicit dimensions (square thumbs)
  function createSheetImage(sheet) {
    const img = document.createElement("img");
    img.src = sheet.thumb || sheet.image;
    img.alt = (sheet.title || "Printable coloring page") + " - Little Color Lab";
    img.loading = "lazy";

    // Use square to avoid stretching portrait/square sources
    // (Frame will handle consistent layout)
    img.width = 300;
    img.height = 300;

    return img;
  }

  // Wrap image in a frame so layout is consistent without distortion
  function createThumbFrame(sheet) {
    const frame = document.createElement("div");
    frame.className = "thumb-frame";

    const img = createSheetImage(sheet);
    frame.appendChild(img);

    return frame;
  }

  function createSheetCard(sheet) {
    const card = document.createElement("article");
    card.className = "sheet-card";

    const imageWrapper = document.createElement("div");
    imageWrapper.className = "sheet-card-image";

    // framed thumbnail (prevents stretching)
    imageWrapper.appendChild(createThumbFrame(sheet));

    const title = document.createElement("h3");
    title.className = "sheet-card-title";
    title.textContent = sheet.title || "Coloring Page";

    const meta = document.createElement("p");
    meta.className = "sheet-card-meta";
    meta.textContent = sheet.category ? `${sheet.category} coloring page` : "Coloring page";

    const actions = document.createElement("div");
    actions.className = "sheet-card-actions";

    const pdfBtn = document.createElement("a");
    pdfBtn.href = sheet.pdf;
    pdfBtn.className = "btn-secondary";
    pdfBtn.textContent = "Download PDF";
    pdfBtn.setAttribute("target", "_blank");
    pdfBtn.setAttribute("rel", "noopener");

    const imgBtn = document.createElement("a");
    imgBtn.href = sheet.image;
    imgBtn.className = "btn-outline";
    imgBtn.textContent = "View Image";
    imgBtn.setAttribute("target", "_blank");
    imgBtn.setAttribute("rel", "noopener");

    actions.appendChild(pdfBtn);
    actions.appendChild(imgBtn);

    card.appendChild(imageWrapper);
    card.appendChild(title);
    card.appendChild(meta);
    card.appendChild(actions);

    return card;
  }

  function createNewCard(sheet) {
    const card = document.createElement("article");
    card.className = "new-card";

    // framed thumbnail (prevents stretching)
    card.appendChild(createThumbFrame(sheet));

    const title = document.createElement("h3");
    title.className = "new-card-title";
    title.textContent = sheet.title || "Coloring Page";

    const meta = document.createElement("p");
    meta.className = "new-card-meta";
    meta.textContent = sheet.category ? `${sheet.category} coloring page` : "Coloring page";

    const actions = document.createElement("div");
    actions.className = "new-card-actions";

    const btn = document.createElement("a");
    btn.href = sheet.pdf;
    btn.className = "new-btn";
    btn.textContent = "Download PDF";
    btn.setAttribute("target", "_blank");
    btn.setAttribute("rel", "noopener");

    actions.appendChild(btn);

    card.appendChild(title);
    card.appendChild(meta);
    card.appendChild(actions);

    return card;
  }
});
