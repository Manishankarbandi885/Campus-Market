
const STORAGE_KEY = "campusMarketProducts";

const sampleProducts = [
  {
    id: "sample-1",
    name: "Engineering Mathematics",
    price: 250,
    category: "books",
    description: "Useful mathematics textbook for engineering students.",
    seller: "Campus Seller",
    date: "2026-09-01",
    emoji: "📚"
  },
  {
    id: "sample-2",
    name: "Wireless Headphones",
    price: 700,
    category: "electronics",
    description: "Wireless headphones for music and online classes.",
    seller: "Campus Seller",
    date: "2026-09-02",
    emoji: "🎧"
  },
  {
    id: "sample-3",
    name: "College Backpack",
    price: 450,
    category: "bags",
    description: "A practical backpack for carrying books and a laptop.",
    seller: "Campus Seller",
    date: "2026-09-03",
    emoji: "🎒"
  },
  {
    id: "sample-4",
    name: "Scientific Calculator",
    price: 350,
    category: "other",
    description: "A handy calculator for engineering calculations.",
    seller: "Campus Seller",
    date: "2026-09-04",
    emoji: "🧮"
  },
  {
    id: "sample-5",
    name: "Programming Notes",
    price: 120,
    category: "books",
    description: "Revision notes for programming fundamentals.",
    seller: "Campus Seller",
    date: "2026-09-05",
    emoji: "📝"
  },
  {
    id: "sample-6",
    name: "USB Keyboard",
    price: 300,
    category: "electronics",
    description: "A USB keyboard suitable for everyday computer use.",
    seller: "Campus Seller",
    date: "2026-09-06",
    emoji: "⌨️"
  }
];

const categoryEmojis = {
  books: "📚",
  electronics: "🎧",
  bags: "🎒",
  other: "✨"
};

const categoryNames = {
  books: "Books",
  electronics: "Electronics",
  bags: "Bags",
  other: "Other"
};

// Read products saved in the browser.
function getProducts() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved !== null) {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    }

    // Import listings from an earlier version of the project.
    const oldSaved = localStorage.getItem("campusProducts");

    if (oldSaved) {
      const oldProducts = JSON.parse(oldSaved);

      if (Array.isArray(oldProducts)) {
        const migrated = oldProducts.map((item, index) => ({
          id: item.id || `old-${Date.now()}-${index}`,
          name: item.name || item.productName || "Untitled item",
          price: Number(item.price || item.productPrice || 0),
          category: normalizeCategory(item.category || item.productCategory),
          description: item.description || item.productDescription || "",
          seller: item.seller || item.sellerName || "Campus Seller",
          date: item.date || new Date().toISOString(),
          emoji: item.emoji || "✨"
        }));

        saveProducts(migrated);
        return migrated;
      }
    }

    return [...sampleProducts];
  } catch (error) {
    console.error("Could not read saved products:", error);
    return [...sampleProducts];
  }
}

// Save products in localStorage.
function saveProducts(products) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    return true;
  } catch (error) {
    console.error("Could not save products:", error);
    return false;
  }
}

function normalizeCategory(category) {
  const value = String(category || "").toLowerCase();

  if (value.includes("book")) return "books";
  if (value.includes("electronic") || value.includes("tech")) {
    return "electronics";
  }
  if (value.includes("bag")) return "bags";

  return "other";
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Number(price) || 0);
}

function getEmoji(product) {
  return product.emoji || categoryEmojis[product.category] || "✨";
}

// Render product cards into a container.
function renderProducts(container, products) {
  if (!container) return;

  if (products.length === 0) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = products.map(product => `
    <article class="product-card">
      <div class="product-visual" aria-hidden="true">
        ${escapeHTML(getEmoji(product))}
      </div>

      <div class="product-content">
        <span class="category-label">
          ${escapeHTML(categoryNames[product.category] || "Other")}
        </span>

        <h3>${escapeHTML(product.name)}</h3>

        <p class="product-description">
          ${escapeHTML(product.description)}
        </p>

        <div class="product-meta">
          <span class="product-price">
            ${formatPrice(product.price)}
          </span>
          <span class="product-seller">
            ${escapeHTML(product.seller || "Campus Seller")}
          </span>
        </div>

        <button class="details-button" data-details="${escapeHTML(product.id)}">
          View details
        </button>
      </div>
    </article>
  `).join("");
}

// Home page: show featured products.
function initHome() {
  const container = document.getElementById("featuredProducts");
  if (!container) return;

  const products = getProducts().slice(0, 3);
  renderProducts(container, products);
}

// Browse page: search, category filtering, sorting.
function initBrowse() {
  const container = document.getElementById("browseProducts");
  if (!container) return;

  const searchInput = document.getElementById("searchInput");
  const clearSearch = document.getElementById("clearSearch");
  const sortSelect = document.getElementById("sortSelect");
  const resultsCount = document.getElementById("resultsCount");
  const emptyState = document.getElementById("emptyState");
  const resetFilters = document.getElementById("resetFilters");
  const filterButtons = document.querySelectorAll(".filter-chip");

  let selectedCategory = "all";

  function updateResults() {
    const query = searchInput.value.trim().toLowerCase();
    let products = getProducts();

    products = products.filter(product => {
      const matchesCategory =
        selectedCategory === "all" ||
        product.category === selectedCategory;

      const searchableText = [
        product.name,
        product.description,
        product.category,
        product.seller
      ].join(" ").toLowerCase();

      return matchesCategory && searchableText.includes(query);
    });

    switch (sortSelect.value) {
      case "price-low":
        products.sort((a, b) => Number(a.price) - Number(b.price));
        break;

      case "price-high":
        products.sort((a, b) => Number(b.price) - Number(a.price));
        break;

      case "name":
        products.sort((a, b) => a.name.localeCompare(b.name));
        break;

      default:
        products.sort((a, b) =>
          new Date(b.date || 0) - new Date(a.date || 0)
        );
    }

    renderProducts(container, products);

    resultsCount.textContent =
      `${products.length} item${products.length === 1 ? "" : "s"} found`;

    emptyState.hidden = products.length !== 0;
    clearSearch.hidden = query.length === 0;
  }

  searchInput.addEventListener("input", updateResults);
  sortSelect.addEventListener("change", updateResults);

  clearSearch.addEventListener("click", () => {
    searchInput.value = "";
    updateResults();
    searchInput.focus();
  });

  filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      selectedCategory = button.dataset.category;

      filterButtons.forEach(item => {
        item.classList.toggle("active", item === button);
      });

      updateResults();
    });
  });

  resetFilters.addEventListener("click", () => {
    selectedCategory = "all";
    searchInput.value = "";
    sortSelect.value = "newest";

    filterButtons.forEach(button => {
      button.classList.toggle(
        "active",
        button.dataset.category === "all"
      );
    });

    updateResults();
  });

  updateResults();
}

// Sell page: validate and save new listings.
function initSellForm() {
  const form = document.getElementById("sellForm");
  if (!form) return;

  const nameInput = document.getElementById("productName");
  const priceInput = document.getElementById("productPrice");
  const categoryInput = document.getElementById("productCategory");
  const descriptionInput = document.getElementById("productDescription");
  const sellerInput = document.getElementById("sellerName");
  const message = document.getElementById("formMessage");
  const descriptionCount = document.getElementById("descriptionCount");

  descriptionInput.addEventListener("input", () => {
    descriptionCount.textContent =
      `${descriptionInput.value.length} / 600`;
  });

  form.addEventListener("submit", event => {
    event.preventDefault();

    message.textContent = "";
    message.className = "form-message";

    const name = nameInput.value.trim();
    const price = Number(priceInput.value);
    const category = categoryInput.value;
    const description = descriptionInput.value.trim();
    const seller = sellerInput.value.trim() || "Campus Seller";

    if (!name || !category || !description) {
      showMessage("Please fill in all required fields.", "error");
      return;
    }

    if (!Number.isFinite(price) || price <= 0 || price > 1000000) {
      showMessage("Enter a valid price between ₹1 and ₹10,00,000.", "error");
      return;
    }

    if (name.length > 80 || description.length > 600) {
      showMessage("Please shorten the item details.", "error");
      return;
    }

    const products = getProducts();

    const newProduct = {
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      price,
      category,
      description,
      seller,
      date: new Date().toISOString(),
      emoji: categoryEmojis[category] || "✨"
    };

    products.unshift(newProduct);

    if (!saveProducts(products)) {
      showMessage(
        "Unable to save this item in your browser. Check your browser storage settings.",
        "error"
      );
      return;
    }

    showMessage("Item posted successfully! Opening Browse Items...", "success");
    form.reset();
    descriptionCount.textContent = "0 / 600";

    // Open Browse after the user sees the confirmation.
    window.setTimeout(() => {
      window.location.href = "browse.html";
    }, 900);
  });

  function showMessage(text, type) {
    message.textContent = text;
    message.className = `form-message ${type}`;
  }
}

// Product details dialog.
function initDetailsDialog() {
  const dialog = document.getElementById("itemDialog");
  const content = document.getElementById("dialogContent");

  if (!dialog || !content) return;

  document.addEventListener("click", event => {
    const button = event.target.closest("[data-details]");
    if (!button) return;

    const product = getProducts().find(
      item => item.id === button.dataset.details
    );

    if (!product) return;

    content.innerHTML = `
      <div class="dialog-emoji">${escapeHTML(getEmoji(product))}</div>
      <p class="category-label">
        ${escapeHTML(categoryNames[product.category] || "Other")}
      </p>
      <h2>${escapeHTML(product.name)}</h2>
      <p class="product-price">${formatPrice(product.price)}</p>
      <p class="dialog-description">${escapeHTML(product.description)}</p>
      <p><strong>Seller:</strong> ${escapeHTML(product.seller || "Campus Seller")}</p>
      <p><strong>Listed:</strong> ${escapeHTML(
        new Date(product.date || Date.now()).toLocaleDateString("en-IN")
      )}</p>
    `;

    dialog.showModal();
  });

  const closeButton = dialog.querySelector(".dialog-close");

  closeButton.addEventListener("click", () => dialog.close());

  dialog.addEventListener("click", event => {
    if (event.target === dialog) dialog.close();
  });
}

// Mobile navigation.
function initNavigation() {
  const toggle = document.querySelector(".menu-toggle");
  const links = document.querySelector(".nav-links");

  if (!toggle || !links) return;

  toggle.addEventListener("click", () => {
    const isOpen = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
}

// Initialize the appropriate features for the current page.
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-year]").forEach(element => {
    element.textContent = new Date().getFullYear();
  });

  initNavigation();
  initHome();
  initBrowse();
  initSellForm();
  initDetailsDialog();
});