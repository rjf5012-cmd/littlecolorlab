// app.js

const DATA_URL = "/data/coloring-sheets.json";

// If body has data-default-category (e.g., "Christmas"), use that for landing pages
const defaultCategory = document.body.dataset.defaultCategory || "All";

let allSheets = [];
let activeCategory = defaultCategory;

// Core DOM elements (some may be missing on certain pages, so we guard)
const gridEl = document.getElementById("grid");
const categoryButtonsEl = document.getElementById("category-buttons");
const searchInput = document.getElementById("search");
const emptyStateEl = document.getElementById("emptyState");
const newGridEl = document.getElementById("newGrid");

// Set footer year safely
const yearSpan = document.getElementById("year");
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

// -----------------------------------------
// Fetch JSON data on load
// -----------------------------------------
fetch(DATA_URL)
  .then((res) => {
    if (!res.ok) {
      throw new Error("Failed to load coloring sheets.");
    }
    return res.json();
  })
  .then((data) => {
    allSheets = data || [];

    // Build category buttons if container exists
    if (categoryButtonsEl) {
      initCategories();
    }

    // Render main grid if present
    if (gridEl) {
      renderSheets();
    }

    // Render "New Coloring Pages" section if present
    if (newGridEl) {
      renderNewSection();
    }
  })
  .catch((err) => {
    console.error(err);
    if (gridEl) {
      gridEl.innerHTML =
        '<p style="color:#b91c1c;">Error loading coloring sheets. Please try again later.</p>';
    }
  });

// -----------------------------------------
// Category buttons
// -----------------------------------------
function initCategories() {
  const categories = Array.from(new Set(allSheets.map((sheet) => sheet.category))).sort();

  // Always start with "All"
  const allBtn = createCategoryButton("All");
  categoryButtonsEl.appendChild(allBtn);

  categories.forEach((cat) => {
    const btn = createCategoryButton(cat);
    categoryButtonsEl.appendChild(btn);
  });

  // Highlight correct button based on defaultCategory
  // If defaultCategory doesn't exist, fall back to "All"
  const hasDefault = categories.includes(defaultCategory) || defaultCategory === "All";
  activeCategory = hasDefault ? defaultCategory : "All";
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
    if (gridEl) {
      renderSheets();
    }
  });

  return btn;
}

function updateActiveCategoryButton(category) {
  const buttons = categoryButtonsEl.querySelectorAll(".category-btn");
  buttons.forEach((btn) => {
    if (btn.dataset.category === category) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

// -----------------------------------------
// Render main grid (Browse section)
// -----------------------------------------
function renderSheets() {
  if (!gridEl) return;

  const searchTerm = (searchInput?.value || "").trim().toLowerCase();

  let filtered = allSheets.slice();

  if (activeCategory && activeCategory !== "All") {
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

  if (!filtered.length) {
    if (emptyStateEl) {
      emptyStateEl.classList.remove("hidden");
    }
    return;
  } else if (emptyStateEl) {
    emptyStateEl.classList.add("hidden");
  }

  filtered.forEach((sheet) => {
    const card = createSheetCard(sheet);
    gridEl.appendChild(card);
  });
}

function createSheetCard(sheet) {
  const card = document.createElement("article");
  card.className = "sheet-card";

  const imageWrapper = document.createElement("div");
  imageWrapper.className = "sheet-card-image";

  const img = document.createElement("img");
  // Use thumbnail if available, otherwise full image
  img.src = sheet.thumb || sheet.image;
  img.alt = sheet.title;
  img.loading = "lazy";
  imageWrapper.appendChild(img);

  const title = document.createElement("h3");
  title.className = "sheet-card-title";
  title.textContent = sheet.title;

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
  card.appendChild(actions);

  return card;
}

// -----------------------------------------
// "New Coloring Pages" section
// -----------------------------------------
function renderNewSection() {
  if (!newGridEl) return;

  // Sort newest first using "added" if present
  const sorted = allSheets
    .slice()
    .sort((a, b) => {
      const aDate = a.added || "";
      const bDate = b.added || "";
      // Descending (newest first)
      return bDate.localeCompare(aDate);
    });

  // Take the latest 8 items
  const latest = sorted.slice(0, 8);

  if (!latest.length) {
    newGridEl.innerHTML = "<p>No new pages available yet. Check back soon!</p>";
    return;
  }

  newGridEl.innerHTML = latest
    .map((sheet) => {
      const imgSrc = sheet.thumb || sheet.image;
      return `
        <article class="new-card">
          <img 
            src="${imgSrc}" 
            alt="${sheet.title}" 
            loading="lazy" 
          />
          <div class="new-card-title">${sheet.title}</div>
          <div class="new-card-actions">
            <a class="new-btn" href="${sheet.pdf}" target="_blank" rel="noopener">
              View / Download PDF
            </a>
          </div>
        </article>
      `;
    })
    .join("");
}

// -----------------------------------------
// Wire up filters
// -----------------------------------------
if (searchInput) {
  searchInput.addEventListener("input", () => {
    renderSheets();
  });
}
