import { books, categories, faq, initialReviews } from "./data.js";

const STORAGE_KEY = "mock_ui_buyer_store_v1";
const ACCESS_TOKEN_MINUTES = 15;
const REFRESH_TOKEN_DAYS = 7;

const money = (value) => `₹${(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 0 })}`;
const nowIso = () => new Date().toISOString();
const uid = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
const toDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const starSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z"/></svg>`;

function renderStars(rating, count) {
  const full = Math.floor(rating);
  const stars = Array.from({ length: 5 }, (_, i) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="opacity:${i < full ? 1 : 0.25}"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z"/></svg>`
  ).join("");
  const label = count !== "" && count !== undefined ? `${rating} (${count})` : `${rating}`;
  return `<span class="stars">${stars}<span class="stars-count">${label}</span></span>`;
}

function issueTokens(userId) {
  return {
    access: { token: uid("access"), exp: Date.now() + ACCESS_TOKEN_MINUTES * 60 * 1000, userId },
    refresh: { token: uid("refresh"), exp: Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000, userId }
  };
}

const defaultState = () => {
  const seedUser = {
    id: "u-seed",
    fullName: "Seed Buyer",
    email: "buyer@example.com",
    password: "password123",
    avatar: "",
    isActive: true,
    createdAt: "2026-04-01T08:00:00.000Z",
    wishlist: ["b3", "b10"]
  };
  const seedOrder = {
    id: "ord-seed",
    buyerId: "u-seed",
    books: [{ bookId: "b1", price: 449, downloadCount: 1, downloadLimit: 5 }],
    totalAmount: 449,
    razorpayOrderId: "rzp_order_seed",
    razorpayPaymentId: "pay_seed",
    razorpaySignature: "sig_seed",
    status: "paid",
    createdAt: "2026-04-10T11:30:00.000Z"
  };
  return {
    users: [seedUser],
    session: { currentUserId: null, accessToken: null, refreshToken: null },
    cart: [],
    orders: [seedOrder],
    reviews: initialReviews.slice(),
    contactMessages: []
  };
};

let state = loadState();
recalculateBookRatings();
saveState();

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultState();
  try {
    return { ...defaultState(), ...JSON.parse(raw) };
  } catch (_) {
    return defaultState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getCurrentUser() {
  return state.users.find((u) => u.id === state.session.currentUserId) || null;
}

function getBook(bookId) {
  return books.find((b) => b.id === bookId);
}

function isOwned(bookId, userId = getCurrentUser()?.id) {
  if (!userId) return false;
  return state.orders.some(
    (o) => o.buyerId === userId && o.status === "paid" && o.books.some((i) => i.bookId === bookId)
  );
}

function getPaidOrders(userId = getCurrentUser()?.id) {
  if (!userId) return [];
  return state.orders.filter((o) => o.buyerId === userId && o.status === "paid");
}

function ensureSession() {
  const { accessToken, refreshToken } = state.session;
  if (!state.session.currentUserId) return false;
  if (!accessToken || accessToken.exp <= Date.now()) {
    if (!refreshToken || refreshToken.exp <= Date.now() || refreshToken.userId !== state.session.currentUserId) {
      logout(false);
      return false;
    }
    const tokens = issueTokens(state.session.currentUserId);
    state.session.accessToken = tokens.access;
    state.session.refreshToken = tokens.refresh;
    saveState();
    toast("Session refreshed silently (mock /auth/refresh).");
  }
  return true;
}

function requireAuth() {
  if (!ensureSession()) {
    const returnTo = encodeURIComponent(location.pathname.split("/").pop() || "index.html");
    location.href = `login.html?returnTo=${returnTo}`;
    return false;
  }
  return true;
}

function login(user) {
  const tokens = issueTokens(user.id);
  state.session.currentUserId = user.id;
  state.session.accessToken = tokens.access;
  state.session.refreshToken = tokens.refresh;
  saveState();
}

function logout(showToast = true) {
  state.session.currentUserId = null;
  state.session.accessToken = null;
  state.session.refreshToken = null;
  saveState();
  if (showToast) toast("Logged out. Refresh token cleared (mock).");
}

function toast(message) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = message;
  el.classList.remove("hide");
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.add("hide"), 2800);
}

function recalculateBookRatings() {
  books.forEach((book) => {
    const reviewSet = state.reviews.filter((r) => r.bookId === book.id && r.isApproved && !r.isFlagged);
    const count = reviewSet.length;
    const avg = count ? reviewSet.reduce((sum, r) => sum + Number(r.rating || 0), 0) / count : 0;
    book.reviewCount = count;
    book.averageRating = Number(avg.toFixed(1));
  });
}

function bookCard(book) {
  const owned = isOwned(book.id);
  const inCart = state.cart.includes(book.id);
  return `
    <article class="card" onclick="if(!event.target.closest('button'))location.href='book.html?id=${book.id}'">
      <div class="card-media">${book.category}</div>
      <div class="card-body">
        <h3 class="book-title">${book.title}</h3>
        <p class="book-meta">${book.author}</p>
        <div class="book-row">
          <span class="book-price">${money(book.price)}</span>
          ${renderStars(book.averageRating, book.reviewCount)}
        </div>
        <div class="row">
          <button class="btn btn-sm ${owned ? "" : "btn-primary"} add-cart" data-book="${book.id}" ${owned || inCart ? "disabled" : ""}>
            ${owned ? "Owned" : inCart ? "In Cart" : "Add to Cart"}
          </button>
          <button class="btn btn-sm btn-ghost add-wishlist" data-book="${book.id}" aria-label="Add to wishlist">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </button>
        </div>
      </div>
    </article>
  `;
}

function renderShell(page) {
  const header = document.getElementById("app-header");
  const footer = document.getElementById("app-footer");
  const user = getCurrentUser();
  const pageFile = `${page}.html`;

  const navLinks = [
    ["index.html", "Home"],
    ["search.html", "Browse"],
    ["category.html", "Categories"],
    ["library.html", "My Library"],
    ["cart.html", `Cart${state.cart.length ? ` (${state.cart.length})` : ""}`],
    ["orders.html", "Orders"],
    ["contact.html", "Help"]
  ];

  header.innerHTML = `
    <nav class="top-nav">
      <div class="nav-inner">
        <button class="menu-toggle" id="menu-toggle" aria-label="Toggle navigation">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
        <a class="brand" href="index.html"><span>E</span>BookN</a>
        <div class="nav-links" id="nav-links">
          ${navLinks.map(([href, label]) => `<a href="${href}" class="${href === pageFile ? "active" : ""}">${label}</a>`).join("")}
        </div>
        <div class="nav-tools">
          <form class="search-inline" id="global-search">
            <input type="search" id="global-search-input" aria-label="Search books" placeholder="Search books..." />
            <button type="submit" aria-label="Search">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </button>
          </form>
          ${user
            ? `<a class="btn btn-sm btn-ghost" href="profile.html" aria-label="Profile">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <span class="nav-label">${user.fullName.split(" ")[0]}</span>
              </a>
              <button id="logout-btn" class="btn btn-sm btn-ghost" aria-label="Logout">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                <span class="nav-label">Logout</span>
              </button>`
            : `<a class="btn btn-sm btn-primary" href="login.html">Sign In</a>`
          }
        </div>
      </div>
    </nav>
  `;

  footer.innerHTML = `
    <footer class="footer">
      <div class="container">
        <div class="footer-inner">
          <div>
            <div class="footer-brand"><span>E</span>BookN</div>
            <p class="footer-desc">Your digital PDF bookstore. Browse, purchase, and download books securely. Powered by Razorpay checkout.</p>
          </div>
          <div>
            <div class="footer-heading">Browse</div>
            <ul class="footer-links">
              <li><a href="search.html">All Books</a></li>
              <li><a href="category.html">Categories</a></li>
              <li><a href="category.html?name=Fiction">Fiction</a></li>
              <li><a href="category.html?name=Technology">Technology</a></li>
            </ul>
          </div>
          <div>
            <div class="footer-heading">Account</div>
            <ul class="footer-links">
              <li><a href="library.html">My Library</a></li>
              <li><a href="orders.html">Order History</a></li>
              <li><a href="wishlist.html">Wishlist</a></li>
              <li><a href="profile.html">Profile</a></li>
            </ul>
          </div>
          <div>
            <div class="footer-heading">Support</div>
            <ul class="footer-links">
              <li><a href="contact.html">Contact Us</a></li>
              <li><a href="faq.html">FAQ</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          &copy; ${new Date().getFullYear()} EBookN. Digital PDF Bookstore. All rights reserved.
        </div>
      </div>
    </footer>
  `;

  document.getElementById("global-search")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = (document.getElementById("global-search-input")?.value || "").trim();
    location.href = `search.html?q=${encodeURIComponent(q)}`;
  });

  document.getElementById("logout-btn")?.addEventListener("click", () => {
    logout(true);
    location.href = "index.html";
  });

  const menuToggle = document.getElementById("menu-toggle");
  const navLinksEl = document.getElementById("nav-links");

  menuToggle?.addEventListener("click", () => {
    navLinksEl?.classList.toggle("open");
  });

  navLinksEl?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinksEl.classList.remove("open");
    });
  });

  navLinksEl?.addEventListener("click", (e) => {
    if (e.target === navLinksEl) {
      navLinksEl.classList.remove("open");
    }
  });
}

function addToCart(bookId) {
  if (isOwned(bookId)) return toast("Already in your library.");
  if (state.cart.includes(bookId)) return toast("Duplicate cart item blocked.");
  state.cart.push(bookId);
  saveState();
  toast("Added to cart.");
}

function addToWishlist(bookId) {
  if (!requireAuth()) return;
  const user = getCurrentUser();
  if (!user.wishlist) user.wishlist = [];
  if (!user.wishlist.includes(bookId)) {
    user.wishlist.push(bookId);
    saveState();
    toast("Added to wishlist.");
  } else {
    toast("Already in wishlist.");
  }
}

function attachBookActions(scope = document) {
  scope.querySelectorAll(".add-cart").forEach((btn) =>
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      addToCart(btn.dataset.book);
      location.reload();
    })
  );
  scope.querySelectorAll(".add-wishlist").forEach((btn) =>
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      addToWishlist(btn.dataset.book);
    })
  );
}

function pageHome(root) {
  root.innerHTML = `
    <section class="hero">
      <div class="hero-inner">
        <div class="hero-copy">
          <h1>Discover Your Next Favourite Read</h1>
          <p>Browse our curated collection of digital books. Purchase securely and download instantly to your library.</p>
          <div class="row">
            <a href="search.html" class="btn btn-primary">Browse All Books</a>
            <a href="category.html" class="btn btn-ghost">Shop by Category</a>
          </div>
        </div>
        <div class="hero-art" aria-hidden="true"></div>
      </div>
    </section>
    ${renderSection("Featured Books", books.filter((b) => b.featured).slice(0, 8))}
    ${renderSection("New Releases", books.filter((b) => b.newRelease).slice(0, 8))}
    ${renderSection("Bestsellers", books.filter((b) => b.bestseller).slice(0, 8))}
  `;
  attachBookActions(root);
}

function renderSection(title, list) {
  return `
    <section class="section">
      <h2>${title}</h2>
      <div class="card-grid">${list.map((book) => bookCard(book)).join("")}</div>
    </section>
  `;
}

function pageCategory(root) {
  const params = new URLSearchParams(location.search);
  const selected = params.get("name") || categories[0];
  const matched = books.filter((b) => b.category === selected);
  root.innerHTML = `
    <section class="panel section">
      <h1>Browse by Category</h1>
      <div class="row" style="margin-top: var(--sp-4);">
        ${categories.map((c) =>
          `<a class="btn ${c === selected ? "btn-primary" : "btn-ghost"}" href="category.html?name=${encodeURIComponent(c)}">${c}</a>`
        ).join("")}
      </div>
    </section>
    ${renderSection(`${selected}`, matched)}
  `;
  attachBookActions(root);
}

function pageSearch(root) {
  const params = new URLSearchParams(location.search);
  const query = (params.get("q") || "").toLowerCase();
  const pageNo = Number(params.get("page") || 1);
  const selectedCategory = params.get("category") || "all";
  const minRating = Number(params.get("minRating") || 0);
  const maxPrice = Number(params.get("maxPrice") || 99999);

  let filtered = books.filter((b) =>
    [b.title, b.author, b.description].join(" ").toLowerCase().includes(query)
  );
  filtered = filtered.filter(
    (b) => (selectedCategory === "all" || b.category === selectedCategory) && b.averageRating >= minRating && b.price <= maxPrice
  );

  const perPage = 12;
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(Math.max(1, pageNo), totalPages);
  const pageItems = filtered.slice((safePage - 1) * perPage, safePage * perPage);

  root.innerHTML = `
    <section class="panel section">
      <h1>Search Books</h1>
      <form id="search-filter-form" class="filter-bar" style="margin-top: var(--sp-6);">
        <div class="field">
          <label for="sq">Search query</label>
          <input type="text" id="sq" name="q" value="${query}" placeholder="Title, author, or keyword" />
        </div>
        <div class="field">
          <label for="scat">Category</label>
          <select id="scat" name="category">
            <option value="all">All categories</option>
            ${categories.map((c) => `<option value="${c}" ${selectedCategory === c ? "selected" : ""}>${c}</option>`).join("")}
          </select>
        </div>
        <div class="field">
          <label for="srat">Min rating</label>
          <select id="srat" name="minRating">
            ${[0, 1, 2, 3, 4, 5].map((n) =>
              `<option value="${n}" ${Number(minRating) === n ? "selected" : ""}>${n === 0 ? "Any" : n + "+"}</option>`
            ).join("")}
          </select>
        </div>
        <div class="field">
          <label for="sprice">Max price</label>
          <input type="number" id="sprice" min="100" name="maxPrice" value="${maxPrice === 99999 ? "" : maxPrice}" placeholder="No limit" />
        </div>
        <button class="btn btn-primary" type="submit" style="align-self: end; margin-bottom: 0;">Search</button>
      </form>
      <p class="muted-sm" style="margin-top: var(--sp-4);">${filtered.length} result${filtered.length !== 1 ? "s" : ""} found</p>
    </section>
    <section class="section">
      <div class="card-grid">${pageItems.map((book) => bookCard(book)).join("") || `<div class="empty-state" style="grid-column:1/-1;"><p>No books matched your search.</p><a class="btn btn-ghost" href="search.html">Clear filters</a></div>`}</div>
      ${totalPages > 1 ? `<div class="pagination">${Array.from({ length: totalPages }, (_, i) => i + 1)
        .map((n) => `<button class="${n === safePage ? "active" : ""}" data-page="${n}">${n}</button>`)
        .join("")}</div>` : ""}
    </section>
  `;

  root.querySelector("#search-filter-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const next = new URLSearchParams();
    next.set("q", String(data.get("q") || ""));
    next.set("category", String(data.get("category") || "all"));
    next.set("minRating", String(data.get("minRating") || "0"));
    const mp = String(data.get("maxPrice") || "").trim();
    next.set("maxPrice", mp || "99999");
    next.set("page", "1");
    location.href = `search.html?${next.toString()}`;
  });

  root.querySelectorAll(".pagination button").forEach((btn) =>
    btn.addEventListener("click", () => {
      params.set("page", btn.dataset.page);
      location.href = `search.html?${params.toString()}`;
    })
  );
  attachBookActions(root);
}

function pageBook(root) {
  const params = new URLSearchParams(location.search);
  const book = getBook(params.get("id") || "b1");
  if (!book) {
    root.innerHTML = `<div class="empty-state section"><p>Book not found.</p><a class="btn btn-ghost" href="search.html">Browse books</a></div>`;
    return;
  }
  const related = books.filter((b) => b.category === book.category && b.id !== book.id).slice(0, 4);
  const reviews = state.reviews
    .filter((r) => r.bookId === book.id && r.isApproved && !r.isFlagged)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  root.innerHTML = `
    <section class="section layout-2col">
      <article class="panel" style="padding: 0; overflow: hidden;">
        <div class="card-media" style="aspect-ratio: 3 / 4; border-radius: 0; font-size: 1rem;">${book.category} Cover</div>
      </article>
      <article class="panel">
        <p class="pill pill-primary" style="margin-bottom: var(--sp-4);">${book.category}</p>
        <h1 style="margin-bottom: var(--sp-3);">${book.title}</h1>
        <p class="muted" style="margin-bottom: var(--sp-5);">by ${book.author}</p>
        <p style="margin-bottom: var(--sp-6);">${book.description}</p>
        <div class="row" style="margin-bottom: var(--sp-6);">
          <span class="book-price" style="font-size: 1.5rem;">${money(book.price)}</span>
          ${renderStars(book.averageRating, book.reviewCount)}
        </div>
        ${isOwned(book.id) ? `<p class="pill pill-ok" style="margin-bottom: var(--sp-4);">Already in your library</p>` : ""}
        <div class="row">
          <button class="btn btn-primary add-cart" data-book="${book.id}" ${isOwned(book.id) ? "disabled" : ""}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            Add to Cart
          </button>
          <button class="btn btn-ghost add-wishlist" data-book="${book.id}">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            Add to Wishlist
          </button>
        </div>
      </article>
    </section>

    <section class="section panel">
      <h2>Sample Preview</h2>
      <p style="margin-top: var(--sp-3);">${book.samplePdf ? "Sample chapter available (mock PDF preview)." : "No sample chapter available for this book."}</p>
    </section>

    <section class="section panel">
      <h2>Reviews</h2>
      <div class="list" style="margin-top: var(--sp-5);">
        ${reviews.length
          ? reviews.map((r) => `
            <div class="list-item">
              <div class="book-row" style="margin-bottom: var(--sp-2);">
                <strong>${r.buyerName}</strong>
                <span class="muted-sm">${toDate(r.createdAt)}</span>
              </div>
              ${renderStars(r.rating, "")}
              <p style="margin-top: var(--sp-3);">${r.reviewText || "No review text."}</p>
              <button class="btn btn-sm btn-ghost flag-review" data-review="${r.id}" style="margin-top: var(--sp-3);">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
                Flag
              </button>
            </div>
          `).join("")
          : `<div class="empty-state"><p>No reviews yet. Be the first to review this book.</p></div>`
        }
      </div>
    </section>

    <section class="section panel">
      <h2>Write a Review</h2>
      <p class="muted-sm" style="margin-top: var(--sp-2); margin-bottom: var(--sp-5);">Only buyers who purchased this book can submit a review. Re-submission replaces your existing review.</p>
      <form id="review-form">
        <div class="field"><label for="rating">Rating (1-5)</label><input required min="1" max="5" id="rating" name="rating" type="number" placeholder="1-5" /></div>
        <div class="field"><label for="reviewText">Review text (optional)</label><textarea id="reviewText" name="reviewText" placeholder="Share your thoughts about this book..."></textarea></div>
        <button type="submit" class="btn btn-primary">Submit Review</button>
      </form>
    </section>

    ${related.length ? renderSection("Related Books", related) : ""}
  `;

  root.querySelectorAll(".flag-review").forEach((btn) =>
    btn.addEventListener("click", () => {
      if (!requireAuth()) return;
      const review = state.reviews.find((r) => r.id === btn.dataset.review);
      if (!review) return;
      review.isFlagged = true;
      review.isApproved = false;
      saveState();
      toast("Review flagged for moderation.");
      location.reload();
    })
  );

  root.querySelector("#review-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!requireAuth()) return;
    const user = getCurrentUser();
    if (!isOwned(book.id, user.id)) {
      return toast("Only purchasers can submit reviews.");
    }
    const form = new FormData(e.currentTarget);
    const rating = Number(form.get("rating"));
    const reviewText = String(form.get("reviewText") || "").trim();
    const existing = state.reviews.find((r) => r.bookId === book.id && r.buyerId === user.id);
    if (existing) {
      existing.rating = rating;
      existing.reviewText = reviewText;
      existing.isApproved = true;
      existing.isFlagged = false;
      existing.createdAt = nowIso();
    } else {
      state.reviews.push({
        id: uid("r"),
        bookId: book.id,
        buyerId: user.id,
        buyerName: user.fullName,
        rating,
        reviewText,
        isApproved: true,
        isFlagged: false,
        createdAt: nowIso()
      });
    }
    recalculateBookRatings();
    saveState();
    toast("Review saved.");
    location.reload();
  });
  attachBookActions(root);
}

function pageCart(root) {
  const items = state.cart.map((id) => getBook(id)).filter(Boolean);
  const total = items.reduce((sum, b) => sum + b.price, 0);
  root.innerHTML = `
    <section class="panel section">
      <h1>Shopping Cart</h1>
      <p class="muted-sm" style="margin-bottom: var(--sp-6);">${items.length} item${items.length !== 1 ? "s" : ""} in your cart</p>
      <div class="list">
      ${items.length
        ? items.map((book) => `
          <div class="list-item">
            <div class="book-row">
              <div>
                <strong>${book.title}</strong>
                <p class="muted-sm">${book.author} &middot; ${book.category}</p>
              </div>
              <div style="text-align: right;">
                <span class="book-price">${money(book.price)}</span>
              </div>
            </div>
            <button class="btn btn-sm btn-danger remove-cart" data-book="${book.id}" style="margin-top: var(--sp-3);">Remove</button>
          </div>
        `).join("")
        : `<div class="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            <p>Your cart is empty</p>
            <a class="btn btn-ghost" href="search.html">Browse books</a>
          </div>`
      }
      </div>
      ${items.length ? `
        <hr>
        <div class="book-row">
          <strong style="font-size: 1.125rem;">Total</strong>
          <strong class="book-price" style="font-size: 1.25rem;">${money(total)}</strong>
        </div>
        <div class="row" style="margin-top: var(--sp-6);">
          <a class="btn btn-primary" href="checkout.html">Proceed to Checkout</a>
          <a class="btn btn-ghost" href="search.html">Continue Shopping</a>
        </div>
      ` : ""}
    </section>
  `;
  root.querySelectorAll(".remove-cart").forEach((btn) =>
    btn.addEventListener("click", () => {
      state.cart = state.cart.filter((id) => id !== btn.dataset.book);
      saveState();
      location.reload();
    })
  );
}

function pageWishlist(root) {
  if (!requireAuth()) return;
  const user = getCurrentUser();
  user.wishlist = user.wishlist || [];
  const items = user.wishlist.map((id) => getBook(id)).filter(Boolean);
  root.innerHTML = `
    <section class="panel section">
      <h1>Wishlist</h1>
      <p class="muted-sm" style="margin-bottom: var(--sp-6);">${items.length} book${items.length !== 1 ? "s" : ""} saved</p>
      <div class="list">
      ${items.length
        ? items.map((book) => `
          <div class="list-item">
            <div class="book-row">
              <div>
                <strong>${book.title}</strong>
                <p class="muted-sm">${book.author} &middot; ${book.category}</p>
              </div>
              <span class="book-price">${money(book.price)}</span>
            </div>
            <div class="row" style="margin-top: var(--sp-3);">
              <button class="btn btn-sm btn-primary move-cart" data-book="${book.id}">Move to Cart</button>
              <button class="btn btn-sm btn-ghost remove-wish" data-book="${book.id}">Remove</button>
            </div>
          </div>
        `).join("")
        : `<div class="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            <p>Your wishlist is empty</p>
            <a class="btn btn-ghost" href="search.html">Browse books</a>
          </div>`
      }
      </div>
    </section>
  `;
  root.querySelectorAll(".move-cart").forEach((btn) =>
    btn.addEventListener("click", () => {
      addToCart(btn.dataset.book);
      user.wishlist = user.wishlist.filter((id) => id !== btn.dataset.book);
      saveState();
      location.reload();
    })
  );
  root.querySelectorAll(".remove-wish").forEach((btn) =>
    btn.addEventListener("click", () => {
      user.wishlist = user.wishlist.filter((id) => id !== btn.dataset.book);
      saveState();
      location.reload();
    })
  );
}

function pageCheckout(root) {
  if (!requireAuth()) return;
  const items = state.cart.map((id) => getBook(id)).filter(Boolean);
  const total = items.reduce((sum, b) => sum + b.price, 0);
  root.innerHTML = `
    <section class="section" style="max-width: 640px; margin-left: auto; margin-right: auto;">
      <div class="panel">
        <h1>Checkout</h1>
        <p class="muted-sm" style="margin-bottom: var(--sp-6);">Review your order and complete payment via Razorpay.</p>
        ${items.length
          ? `<div class="list">${items.map((book) => `
              <div class="list-item">
                <div class="book-row">
                  <span>${book.title}</span>
                  <span class="book-price">${money(book.price)}</span>
                </div>
              </div>
            `).join("")}</div>`
          : `<div class="empty-state"><p>Your cart is empty.</p></div>`
        }
        ${items.length ? `
          <hr>
          <div class="book-row">
            <strong style="font-size: 1.125rem;">Order Total</strong>
            <strong class="book-price" style="font-size: 1.375rem;">${money(total)}</strong>
          </div>
          <button id="pay-now" class="btn btn-primary" style="width: 100%; margin-top: var(--sp-6); min-height: 48px; font-size: 1rem;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
            Pay Now
          </button>
        ` : ""}
        <div id="checkout-status" class="hide" style="margin-top: var(--sp-6);"></div>
      </div>
    </section>
  `;
  root.querySelector("#pay-now")?.addEventListener("click", () => {
    const user = getCurrentUser();
    const order = {
      id: uid("ord"),
      buyerId: user.id,
      books: items.map((b) => ({ bookId: b.id, price: b.price, downloadCount: 0, downloadLimit: 5 })),
      totalAmount: total,
      razorpayOrderId: uid("rzp_order"),
      razorpayPaymentId: null,
      razorpaySignature: null,
      status: "pending",
      createdAt: nowIso()
    };
    state.orders.push(order);
    saveState();
    const success = window.confirm("Mock Razorpay widget: click OK for success, Cancel for failed payment.");
    if (success) {
      order.status = "paid";
      order.razorpayPaymentId = uid("pay");
      order.razorpaySignature = uid("sig");
      state.cart = [];
      saveState();
      const bookList = items.map((b) => b.title).join(", ");
      const box = root.querySelector("#checkout-status");
      box.classList.remove("hide");
      box.innerHTML = `
        <div class="panel" style="border-color: rgba(16,185,129,0.3); background: var(--ok-soft);">
          <h3 style="color: var(--ok); margin-bottom: var(--sp-3);">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -4px; margin-right: 6px;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            Payment Successful
          </h3>
          <p>Order confirmation email sent to <strong>${user.email}</strong></p>
          <p class="muted-sm" style="margin-top: var(--sp-2);">Order ID: ${order.id}</p>
          <p class="muted-sm">Books: ${bookList}</p>
          <p style="margin-top: var(--sp-3);"><strong>Total: ${money(order.totalAmount)}</strong></p>
          <a class="btn btn-primary" href="library.html" style="margin-top: var(--sp-5);">Go to My Library</a>
        </div>
      `;
      root.querySelector("#pay-now")?.classList.add("hide");
    } else {
      order.status = "failed";
      saveState();
      toast("Payment failed. Order marked as failed.");
      location.reload();
    }
  });
}

function pageLibrary(root) {
  if (!requireAuth()) return;
  const orders = getPaidOrders();
  const purchased = [];
  orders.forEach((order) => {
    order.books.forEach((line) => purchased.push({ order, line, book: getBook(line.bookId) }));
  });
  root.innerHTML = `
    <section class="panel section">
      <h1>My Library</h1>
      <p class="muted-sm" style="margin-bottom: var(--sp-6);">${purchased.length} book${purchased.length !== 1 ? "s" : ""} in your library</p>
      <div class="list">
      ${purchased.length
        ? purchased.map(({ line, book, order }) => `
          <div class="list-item">
            <div class="library-item">
              <div class="library-cover">${book?.category || "Book"}</div>
              <div>
                <strong>${book?.title || line.bookId}</strong>
                <p class="muted-sm">${book?.author || ""}</p>
                <p class="muted-sm" style="margin-top: var(--sp-2);">Downloads: ${line.downloadCount} / ${line.downloadLimit}</p>
              </div>
              <button class="btn btn-primary btn-sm download-btn" data-order="${order.id}" data-book="${line.bookId}">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download
              </button>
            </div>
          </div>
        `).join("")
        : `<div class="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            <p>No purchased books yet</p>
            <a class="btn btn-ghost" href="search.html">Browse books</a>
          </div>`
      }
      </div>
    </section>
  `;
  root.querySelectorAll(".download-btn").forEach((btn) =>
    btn.addEventListener("click", () => {
      const order = state.orders.find((o) => o.id === btn.dataset.order);
      const line = order?.books.find((b) => b.bookId === btn.dataset.book);
      if (!line) return;
      if (line.downloadCount >= line.downloadLimit) {
        return toast("Download limit reached. Contact support.");
      }
      line.downloadCount += 1;
      saveState();
      window.open("about:blank", "_blank");
      toast("Presigned URL generated (mock, 15 min expiry).");
      location.reload();
    })
  );
}

function pageProfile(root) {
  if (!requireAuth()) return;
  const user = getCurrentUser();
  root.innerHTML = `
    <section class="section layout-2col">
      <article class="panel">
        <h2>Profile</h2>
        <form id="profile-form" style="margin-top: var(--sp-5);">
          <div class="field"><label for="fullName">Display Name</label><input id="fullName" name="fullName" value="${user.fullName}" required /></div>
          <div class="field"><label for="avatar">Avatar URL</label><input id="avatar" name="avatar" value="${user.avatar || ""}" placeholder="https://..." /></div>
          <button class="btn btn-primary" type="submit">Update Profile</button>
        </form>
      </article>
      <article class="panel">
        <h2>Change Password</h2>
        <form id="password-form" style="margin-top: var(--sp-5);">
          <div class="field"><label for="currentPassword">Current Password</label><input required type="password" id="currentPassword" name="currentPassword" /></div>
          <div class="field"><label for="newPassword">New Password (min 8 chars)</label><input required minlength="8" type="password" id="newPassword" name="newPassword" /></div>
          <button class="btn btn-primary" type="submit">Change Password</button>
        </form>
      </article>
    </section>
  `;
  root.querySelector("#profile-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    user.fullName = String(data.get("fullName") || "").trim();
    user.avatar = String(data.get("avatar") || "").trim();
    saveState();
    toast("Profile updated.");
    location.reload();
  });
  root.querySelector("#password-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    if (String(data.get("currentPassword")) !== user.password) return toast("Current password is incorrect.");
    user.password = String(data.get("newPassword"));
    saveState();
    toast("Password changed.");
    e.currentTarget.reset();
  });
}

function pageOrders(root) {
  if (!requireAuth()) return;
  const user = getCurrentUser();
  const orders = state.orders.filter((o) => o.buyerId === user.id);
  root.innerHTML = `
    <section class="panel section">
      <h1>Order History</h1>
      <p class="muted-sm" style="margin-bottom: var(--sp-6);">${orders.length} order${orders.length !== 1 ? "s" : ""}</p>
      <div class="list">
      ${orders.length
        ? orders
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map((o) => {
              const names = o.books.map((x) => getBook(x.bookId)?.title || x.bookId).join(", ");
              return `<div class="list-item">
                <div class="book-row" style="margin-bottom: var(--sp-2);">
                  <strong>${o.id}</strong>
                  <span class="status status-${o.status}">${o.status}</span>
                </div>
                <p class="muted-sm">${toDate(o.createdAt)}${o.razorpayPaymentId ? ` &middot; Payment: ${o.razorpayPaymentId}` : ""}</p>
                <p style="margin-top: var(--sp-2);">${names}</p>
                <p style="margin-top: var(--sp-2);"><strong class="book-price">${money(o.totalAmount)}</strong></p>
              </div>`;
            })
            .join("")
        : `<div class="empty-state"><p>No orders yet.</p><a class="btn btn-ghost" href="search.html">Browse books</a></div>`
      }
      </div>
    </section>
  `;
}

function pageContact(root) {
  root.innerHTML = `
    <section class="section" style="max-width: 640px; margin-left: auto; margin-right: auto;">
      <div class="panel">
        <h1>Contact Support</h1>
        <p class="muted-sm" style="margin-bottom: var(--sp-6);">Have a question? Fill out the form below and we'll get back to you.</p>
        <form id="contact-form">
          <div class="field"><label for="name">Name</label><input id="name" name="name" required placeholder="Your full name" /></div>
          <div class="field"><label for="email">Email</label><input id="email" name="email" required type="email" placeholder="you@example.com" /></div>
          <div class="field"><label for="subject">Subject</label><input id="subject" name="subject" required placeholder="What's this about?" /></div>
          <div class="field"><label for="message">Message</label><textarea id="message" name="message" required placeholder="Describe your issue or question..."></textarea></div>
          <button class="btn btn-primary" type="submit" style="width: 100%;">Send Message</button>
        </form>
      </div>
    </section>
  `;
  root.querySelector("#contact-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    state.contactMessages.push({
      id: uid("contact"),
      name: String(data.get("name")),
      email: String(data.get("email")),
      subject: String(data.get("subject")),
      message: String(data.get("message")),
      createdAt: nowIso()
    });
    saveState();
    e.currentTarget.reset();
    toast("Message sent successfully. We'll respond shortly.");
  });
}

function pageFaq(root) {
  root.innerHTML = `
    <section class="section" style="max-width: 720px; margin-left: auto; margin-right: auto;">
      <div class="panel">
        <h1>Frequently Asked Questions</h1>
        <div class="list" style="margin-top: var(--sp-6);">
          ${faq.map((item) => `
            <div class="list-item">
              <strong>${item.q}</strong>
              <p class="muted" style="margin-top: var(--sp-2);">${item.a}</p>
            </div>
          `).join("")}
        </div>
      </div>
    </section>
  `;
}

function pageLogin(root) {
  if (getCurrentUser() && ensureSession()) {
    location.href = "index.html";
    return;
  }
  const params = new URLSearchParams(location.search);
  const returnTo = params.get("returnTo") || "index.html";
  root.innerHTML = `
    <section class="section auth-layout">
      <div class="panel">
        <h1 style="text-align: center;">Welcome back</h1>
        <p class="muted-sm" style="text-align: center; margin-bottom: var(--sp-6);">Sign in to access your library and orders</p>

        <button class="btn btn-ghost" id="google-login" style="width: 100%; justify-content: center;">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Continue with Google
        </button>

        <div class="auth-divider">or</div>

        <form id="login-form">
          <div class="field"><label for="email">Email</label><input id="email" name="email" type="email" required placeholder="buyer@example.com" /></div>
          <div class="field"><label for="password">Password</label><input id="password" name="password" type="password" required placeholder="Enter your password" /></div>
          <button class="btn btn-primary" type="submit" style="width: 100%; margin-top: var(--sp-2);">Sign In</button>
        </form>

        <p class="muted-sm" style="text-align: center; margin-top: var(--sp-6);">
          Don't have an account? <a href="register.html" style="color: var(--primary); font-weight: 600;">Create one</a>
        </p>
      </div>
    </section>
  `;

  root.querySelector("#login-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") || "").trim().toLowerCase();
    const password = String(data.get("password") || "");
    const user = state.users.find((u) => u.email === email);
    if (!user || user.password !== password) return toast("Invalid credentials");
    if (!user.isActive) return toast("Your account has been suspended. Contact support.");
    login(user);
    location.href = returnTo;
  });

  root.querySelector("#google-login")?.addEventListener("click", () => {
    let user = state.users.find((u) => u.email === "googlebuyer@example.com");
    if (!user) {
      user = {
        id: uid("u"),
        fullName: "Google Buyer",
        email: "googlebuyer@example.com",
        password: "",
        avatar: "",
        isActive: true,
        createdAt: nowIso(),
        wishlist: []
      };
      state.users.push(user);
    }
    login(user);
    saveState();
    location.href = returnTo;
  });
}

function pageRegister(root) {
  root.innerHTML = `
    <section class="section auth-layout">
      <div class="panel">
        <h1 style="text-align: center;">Create an Account</h1>
        <p class="muted-sm" style="text-align: center; margin-bottom: var(--sp-6);">Join EBookN to purchase and download digital books</p>
        <form id="register-form">
          <div class="field"><label for="fullName">Full Name</label><input required id="fullName" name="fullName" placeholder="Your full name" /></div>
          <div class="field"><label for="email">Email</label><input required type="email" id="email" name="email" placeholder="you@example.com" /></div>
          <div class="field"><label for="password">Password (min 8 characters)</label><input required minlength="8" type="password" id="password" name="password" placeholder="Choose a strong password" /></div>
          <button class="btn btn-primary" type="submit" style="width: 100%; margin-top: var(--sp-2);">Create Account</button>
        </form>
        <p class="muted-sm" style="text-align: center; margin-top: var(--sp-6);">
          Already have an account? <a href="login.html" style="color: var(--primary); font-weight: 600;">Sign in</a>
        </p>
      </div>
    </section>
  `;
  root.querySelector("#register-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const fullName = String(data.get("fullName")).trim();
    const email = String(data.get("email")).trim().toLowerCase();
    const password = String(data.get("password"));
    if (password.length < 8) return toast("Password must be minimum 8 characters.");
    if (state.users.some((u) => u.email === email)) return toast("An account with this email already exists.");
    const user = {
      id: uid("u"),
      fullName,
      email,
      password,
      avatar: "",
      isActive: true,
      createdAt: nowIso(),
      wishlist: []
    };
    state.users.push(user);
    saveState();
    toast("Account created. Please sign in.");
    setTimeout(() => (location.href = "login.html"), 600);
  });
}

function init() {
  const page = document.body.dataset.page || "index";
  renderShell(page);
  const root = document.getElementById("app-main");
  const routes = {
    index: pageHome,
    category: pageCategory,
    search: pageSearch,
    book: pageBook,
    cart: pageCart,
    wishlist: pageWishlist,
    checkout: pageCheckout,
    library: pageLibrary,
    profile: pageProfile,
    orders: pageOrders,
    contact: pageContact,
    faq: pageFaq,
    login: pageLogin,
    register: pageRegister
  };
  if (routes[page]) routes[page](root);
}

document.addEventListener("DOMContentLoaded", init);
