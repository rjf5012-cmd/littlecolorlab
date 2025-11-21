// app.js

const DATA_URL = "/data/coloring-sheets.json";

let allSheets = [];
let activeCategory = "All";

const gridEl = document.getElementById("grid");
const categoryButtonsEl = document.getElementById("category-buttons");
const searchInput = document.getElementById("search");
const ageSelect = document.getElementById("ageRange");
const emptyStateEl = document.getElementById("emptyState");

// Set footer year
document.getElementById("year").textContent = new Date().getFullYear();

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
  })
  .catch((err) => {
    console.error(err);
    gridEl.innerHTML =
      '<p style="color:#b91c1c;">Error loading coloring sheets. Please try again later.</p>';
  });

// Build category buttons from JSON
function initCategories() {
  const categories = Array.from(
    new Set(allSheets.map((sheet) => sheet.category))
  ).sort();

  // Add "All" button
  const allBtn = createCategoryButton("All");
  allBtn.classList.add("active");
  categoryButtonsEl.appendChild(allBtn);

  categories.forEach((cat) => {
    const btn = createCategoryButton(cat);
    categoryButtonsEl.appendChild(btn);
  });
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
  const buttons = categoryButtonsEl.querySelectorAll(".category-btn");
  buttons.forEach((btn) => {
    if (btn.dataset.category === category) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

// Render sheets based on filters
function renderSheets() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const ageFilter = ageSelect.value;

  let filtered = allSheets.slice();

  if (activeCategory !== "All") {
    filtered = filtered.filter((sheet) => sheet.category === activeCategory);
  }

  if (ageFilter) {
    filtered = filtered.filter((sheet) => sheet.ageRange === ageFilter);
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
    emptyStateEl.classList.remove("hidden");
    return;
  } else {
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
  img.src = sheet.image;
  img.alt = sheet.title;
  imageWrapper.appendChild(img);

  const title = document.createElement("h3");
  title.className = "sheet-card-title";
  title.textContent = sheet.title;

  const meta = document.createElement("div");
  meta.className = "sheet-card-meta";
  meta.textContent = `${sheet.category} • Ages ${sheet.ageRange}`;

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

// Wire up filters
searchInput.addEventListener("input", () => {
  renderSheets();
});

ageSelect.addEventListener("change", () => {
  renderSheets();
});
