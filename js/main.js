const State = {
    products: [],
    favorites: JSON.parse(localStorage.getItem("favorites")) || [],
    cart: JSON.parse(localStorage.getItem("cart")) || [],
    loading: true
};

const UI = {
    products: document.getElementById("products"),
    searchForm: document.getElementById("search-form"),
    searchInput: document.querySelector(".search-input"),
    favBtn: document.getElementById("fav-btn"),
    favCount: document.getElementById("fav-count"),
    cartCount: document.getElementById("cart-count"),
    favDropdown: document.querySelector(".container-hed-bas")
};

init();

function init() {
    updateCounters();
    bindEvents();
    fetchProducts();
}

function bindEvents() {
    UI.searchForm?.addEventListener("submit", handleSearch);

    UI.products?.addEventListener("click", handleProductActions);

    UI.favBtn?.addEventListener("click", e => {
        e.stopPropagation();
        UI.favDropdown.classList.toggle("active");
        renderFavorites();
    });

    document.addEventListener("click", () => {
        UI.favDropdown.classList.remove("active");
    });
}

function fetchProducts() {
    renderLoading();
    fetch("https://fakestoreapi.com/products")
        .then(r => r.json())
        .then(data => {
            State.products = data;
            State.loading = false;
            renderProducts(data);
            syncUI();
        })
        .catch(() => {
            UI.products.innerHTML = `<p style="text-align:center">فشل تحميل المنتجات</p>`;
        });
}

function renderProducts(list) {
    if (!list.length) {
        UI.products.innerHTML = `<p style="text-align:center">لا توجد منتجات</p>`;
        return;
    }

    UI.products.innerHTML = list.map(p => `
    <div class="product-card" data-id="${p.id}">
      <img src="${p.image}">
      <h3>${p.title}</h3>
      <p>${p.price} $</p>
      <button class="basket-btn btn-primary">أضف للسلة</button>
      <button class="heart-button"><i class="fa-regular fa-heart"></i></button>
    </div>
  `).join("");
}

function renderLoading() {
    UI.products.innerHTML = `<p style="text-align:center">جاري التحميل...</p>`;
}

function handleSearch(e) {
    e.preventDefault();
    const q = UI.searchInput.value.toLowerCase();
    const filtered = State.products.filter(p =>
        p.title.toLowerCase().includes(q)
    );
    renderProducts(filtered);
    syncUI();
}

function handleProductActions(e) {
    const card = e.target.closest(".product-card");
    if (!card) return;
    const id = Number(card.dataset.id);

    if (e.target.closest(".heart-button")) toggleFavorite(id);
    if (e.target.closest(".basket-btn")) addToCart(id);
}

function toggleFavorite(id) {
    State.favorites.includes(id)
        ? State.favorites = State.favorites.filter(f => f !== id)
        : State.favorites.push(id);

    localStorage.setItem("favorites", JSON.stringify(State.favorites));
    updateCounters();
    syncUI();
    renderFavorites();
}

function addToCart(id) {
    const item = State.cart.find(i => i.id === id);
    item ? item.qty++ : State.cart.push({ id, qty: 1 });
    localStorage.setItem("cart", JSON.stringify(State.cart));
    updateCounters();
    syncUI();
}

function renderFavorites() {
    UI.favDropdown.innerHTML = `
    <div class="fav-header">
      <span>المفضلة</span>
      <small>آخر المنتجات التي أعجبتك</small>
    </div>
  `;

    if (!State.favorites.length) {
        UI.favDropdown.innerHTML += `<p style="padding:20px;text-align:center">لا توجد منتجات</p>`;
        return;
    }

    State.favorites.forEach(id => {
        const p = State.products.find(x => x.id === id);
        if (!p) return;
        UI.favDropdown.innerHTML += `
      <div class="fav-item">
        <img src="${p.image}">
        <div>
          <h4>${p.title}</h4>
          <p>${p.price} $</p>
        </div>
      </div>
    `;
    });
}

function syncUI() {
    document.querySelectorAll(".product-card").forEach(card => {
        const id = Number(card.dataset.id);
        card.querySelector(".heart-button")
            .classList.toggle("active", State.favorites.includes(id));
        card.querySelector(".basket-btn")
            .classList.toggle("added", State.cart.some(c => c.id === id));
    });
}

function updateCounters() {
    UI.favCount.textContent = State.favorites.length;
    UI.cartCount.textContent = State.cart.reduce((t, i) => t + i.qty, 0);
}
