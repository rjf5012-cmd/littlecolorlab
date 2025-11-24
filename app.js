// app.js

const DATA_URL = "/data/coloring-sheets.json";

const defaultCategory = document.body.dataset.defaultCategory || "All";
let allSheets = [];
let activeCategory = defaultCategory;

// DOM elements
const gridEl = document.getElementById("grid");
const categoryButtonsEl = document.getElementById("category-buttons");
const searchInput = document.getElementById("search");
const emptyStateEl = document.getElementById("emptyState");
const newGridEl = document.getElementById("newGrid");

// Set footer year (safe even if span doesn't exist)
const yearSpan = document.getElementById("year");
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

// Fetch JSON data on load
fetch(DATA_URL)
  .then((res) => {
    if (!res.ok) {
      throw new Error("Failed to load coloring sheets.");
    }
    return res.json();
  })
  .then((data) => {
    allSheets = data;
    initCategories();
    renderSheets();
    renderNewSection();
  })
  .catch((err) => {
    console.error(err);
    if (gridEl) {
      gridEl.innerHTML =
        '<p style="color:#b91c1c;">Error loading coloring sheets. Please try again later.</p>';
    }
  });

// Build category buttons from JSON
function initCategories() {
  if (!categoryButtonsEl || !allSheets.length) return;

  const categories = Array.from(
    new Set(allSheets.map((sheet) => sheet.category))
  ).sort();

  // "All" button
  const allBtn = createCategoryButton("All");
  categoryButtonsEl.appendChild(allBtn);

  categories.forEach((cat) => {
    const btn = createCategoryButton(cat);
    categoryButtonsEl.appendChild(btn);
  });

  // Highlight correct button based on defaultCategory
  updateActiveCategoryButton(activeCategory);
}

function createCategoryButton(category) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "category-btn";
  btn.textContent = category;
  btn.dataset.category = category;

  btn.addEventListener("click", () => {
    activeCategory = category;
    updateActiveCategoryButton(category);
    renderSheets();
  });

  return btn;
}

function updateActiveCategoryButton(category) {
  if (!categoryButtonsEl) return;
  const buttons = categoryButtonsEl.querySelectorAll(".category-btn");
  buttons.forEach((btn) => {
    if (btn.dataset.category === category) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

// Render main grid based on filters
function renderSheets() {
  if (!gridEl || !allSheets.length) return;

  const searchTerm = (searchInput?.value || "").trim().toLowerCase();

  let filtered = allSheets.slice();

  if (activeCategory !== "All") {
    filtered = filtered.filter((sheet) => sheet.category === activeCategory);
  }

  if (searchTerm) {
    filtered = filtered.filter((sheet) => {
      const titleMatch = sheet.title.toLowerCase().includes(searchTerm);
      const tagsMatch = (sheet.tags || [])
        .join(" ")
        .toLowerCase()
        .includes(searchTerm);
      return titleMatch || tagsMatch;
    });
  }

  gridEl.innerHTML = "";

  if (filtered.length === 0) {
    if (emptyStateEl) emptyStateEl.classList.remove("hidden");
    return;
  } else {
    if (emptyStateEl) emptyStateEl.classList.add("hidden");
  }

  filtered.forEach((sheet) => {
    const card = createSheetCard(sheet);
    gridEl.appendChild(card);
  });
}

// Create individual sheet card (no ages shown)
function createSheetCard(sheet) {
  const card = document.createElement("article");
  card.className = "sheet-card";

  const imageWrapper = document.createElement("div");
  imageWrapper.className = "sheet-card-image";

  const img = document.createElement("img");
  img.src = sheet.image;
  img.alt = sheet.title;
  img.loading = "lazy"; // lazy-loading thumbnails
  imageWrapper.appendChild(img);

  const title = document.createElement("h3");
  title.className = "sheet-card-title";
  title.textContent = sheet.title;

  const meta = document.createElement("div");
  meta.className = "sheet-card-meta";
  // Only show category, not ages
  meta.textContent = sheet.category;

  const actions = document.createElement("div");
  actions.className = "sheet-card-actions";

  const downloadBtn = document.createElement("a");
  downloadBtn.href = sheet.pdf;
  downloadBtn.className = "btn-secondary";
  downloadBtn.textContent = "Download PDF";
  downloadBtn.setAttribute("download", "");

  const openBtn = document.createElement("a");
  openBtn.href = sheet.pdf;
  openBtn.className = "btn-outline";
  openBtn.textContent = "Open in Browser";
  openBtn.target = "_blank";
  openBtn.rel = "noopener";

  actions.appendChild(downloadBtn);
  actions.appendChild(openBtn);

  card.appendChild(imageWrapper);
  card.appendChild(title);
  card.appendChild(meta);
  card.appendChild(actions);

  return card;
}

// "New Coloring Pages" section
function renderNewSection() {
  if (!newGridEl || !allSheets.length) return;

  // Sort newest first (using "added" string, newer date should sort ahead)
  const sorted = allSheets.slice().sort((a, b) => {
    if (a.added && b.added) {
      return b.added.localeCompare(a.added);
    }
    if (a.added) return -1;
    if (b.added) return 1;
    return 0;
  });

  const latest = sorted.slice(0, 6); // show most recent 6

  newGridEl.innerHTML = latest
    .map((sheet) => {
      return `
        <div class="new-card">
          <img src="${sheet.image}" alt="${sheet.title}" loading="lazy" />
          <div class="new-card-title">${sheet.title}</div>
          <div class="new-card-meta">${sheet.category}</div>
          <div class="new-card-actions">
            <a class="new-btn" href="${sheet.pdf}" target="_blank" rel="noopener">View / Download PDF</a>
          </div>
        </div>
      `;
    })
    .join("");
}

// Wire up search
if (searchInput) {
  searchInput.addEventListener("input", () => {
    renderSheets();
  });
}
