const State = {
    products: [],
    favorites: JSON.parse(localStorage.getItem("favorites")) || [],
    cart: JSON.parse(localStorage.getItem("cart")) || [],
    loading: true
};

const max = Math.max(...State.products.map(p => p.price));

let currentFilters = {
    search: "",
    category: "all",
    minPrice: 0,
};

const UI = {
    products: document.getElementById("products"),
    searchForm: document.getElementById("search-form"),
    searchInput: document.querySelector(".search-input"),
    langBtn: document.querySelector("#lang-btn"),
    liLangBtn: document.querySelectorAll(".item"),
    favBtn: document.getElementById("fav-btn"),
    basBtn: document.getElementById("bas-btn"),
    favCount: document.getElementById("fav-count"),
    cartCount: document.getElementById("cart-count"),
    favDropdown: document.querySelector(".container-hed-bas"),
    basDropdown: document.querySelector(".container-bas-bas")
};

init();

function init() {
    updateCounters();
    bindEvents();
    fetchProducts();
}

function bindEvents() {
    const langList = document.querySelector("#lang-list");

    UI.searchForm?.addEventListener("submit", handleSearch);

    UI.products?.addEventListener("click", handleProductActions);

    UI.favBtn?.addEventListener("click", e => {
        e.stopPropagation();
        UI.favDropdown.classList.toggle("active");
        renderFavorites();
    });

    UI.basBtn?.addEventListener("click", e => {
        e.stopPropagation();
        UI.basDropdown.classList.toggle("active");
        renderBasket();
    });

    UI.langBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    langList.classList.toggle("show");
    });

    langList.addEventListener("click", (e) => {
        e.stopPropagation();
    });

    UI.liLangBtn.forEach(li => {
        li.addEventListener("click", (e) => {
            UI.langBtn.innerHTML = e.target.innerHTML;
            langList.classList.remove("show");
        });
    });

    document.addEventListener("click", () => {
        langList.classList.remove("show");
        UI.favDropdown?.classList.remove("active");
        UI.basDropdown?.classList.remove("active");
    });

    UI.basDropdown?.addEventListener("click", (e) => {
    
        const incBtn = e.target.closest(".incQty");
        const decBtn = e.target.closest(".decQty");
        const rmBtn  = e.target.closest(".rmPrdPa");
    
        if (incBtn) {
            const id = Number(incBtn.dataset.id);
            const item = State.cart.find(i => i.id === id);
            if (item) item.qty++;
        }
    
        if (decBtn) {
            const id = Number(decBtn.dataset.id);
            const item = State.cart.find(i => i.id === id);
        
            if (!item) return;
        
            if (item.qty > 1) {
                item.qty--;
            } else {
                State.cart = State.cart.filter(i => i.id !== id);
            }
        }
    
        if (rmBtn) {
            const id = Number(rmBtn.dataset.id);
            State.cart = State.cart.filter(i => i.id !== id);
        }
    
        localStorage.setItem("cart", JSON.stringify(State.cart));
        updateCounters();
        syncUI();
        renderBasket();
    });
}

function fetchProducts() {
    renderLoading();
    fetch("https://fakestoreapi.com/products")
        .then(r => r.json())
        .then(data => {
            State.products = data;
            State.loading = false;
            applyFilters(currentFilters);
            syncUI();
        })
        .catch(() => {
            UI.products.innerHTML = `<p style="text-align:center">فشل تحميل المنتجات</p>`;
        });
}

function filterProducts(category) {
    currentFilters.category = category;
    applyFilters(currentFilters);
}

function filterByPrice() {
    const min = Number(document.getElementById("minPrice").value) || 0;
    const max = Number(document.getElementById("maxPrice").value) || Infinity;

    currentFilters.minPrice = min;
    currentFilters.maxPrice = max;

    applyFilters(currentFilters);
}

function applyFilters({ search = "", category = "all", minPrice = 0, maxPrice = Infinity }) {
    let result = [...State.products];

    const priceRange = document.getElementById("priceRange");

    if (priceRange) {
        const max = Math.max(...State.products.map(p => p.price));
        priceRange.max = Math.ceil(max);
    }

    if (category !== "all") {
        result = result.filter(p => p.category === category);
    }

    if (search) {
        result = result.filter(p =>
            p.title.toLowerCase().includes(search.toLowerCase())
        );
    }

    result = result.filter(p =>
        p.price >= minPrice && p.price <= maxPrice
    );

    renderProducts(result);
    syncUI();
}

function renderProducts(list) {
    if (!list.length) {
        UI.products.innerHTML = `<p style="text-align:center">لا توجد منتجات</p>`;
        return;
    }

    UI.products.innerHTML = list.map(p => `
    <div class="product-card" data-id="${p.id}" data-category="${p.category}">
      <img src="${p.image}" class="product-img" data-id="${p.id}">
      <h3>${p.title}</h3>
      <p>${p.price} $</p>
      <div class="produc-btns">
        <button class="basket-btn btn-primary">أضف للسلة</button>
        <button class="heart-button"><i class="fa-regular fa-heart"></i></button>
      </div>
    </div>
  `).join("");
      document.querySelectorAll(".product-img").forEach(img => {
        img.addEventListener("click", (e) => {
            const id = e.target.dataset.id;
            window.location.href = `product.html?id=${id}`;
        });
    })
}

function renderLoading() {
    UI.products.innerHTML = `<p style="text-align:center">جاري التحميل...</p>`;
}

function handleSearch(e) {
    e.preventDefault();
    currentFilters.search = UI.searchInput.value;
    applyFilters(currentFilters);
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

function renderBasket() {
    UI.basDropdown.innerHTML = `
    <div class="fav-header">
      <span>السلة</span>
      <small>آخر المنتجات التي اضفتها للسلة :</small>
    </div>
  `;

    if (!State.cart.length) {
        UI.basDropdown.innerHTML += `<p style="padding:20px;text-align:center">لا توجد منتجات مضافة للسلة</p>`;
        return;
    }

    let total = 0;

    State.cart.forEach(item => {
      const p = State.products.find(x => Number(x.id) === Number(item.id));
      if (!p) return;

      total += p.price * item.qty;
    });

    console.log(State.cart);

    UI.basDropdown.innerHTML = `
        <div class="fav-header">
            <span>السلة:</span>
            <small>آخر المنتجات التي أعجبتك قمت باضافتها</small>
        </div>
    `;

    State.cart.forEach(item => {
      const p = State.products.find(x => x.id === item.id);
      if (!p) return;

      const largeQty = item.qty > 1 ? "منتجات" : "منتج";

      const aboutItem = `
        <button class="AboutPrdpa">عرض معلومات عنه</button>
      `;

        const controls = `
          <div class="cart-controls">
            <button class="decQty" data-id="${item.id}">-</button>
            <span>${item.qty}</span>
            <button class="incQty" data-id="${item.id}">+</button>
            <button class="rmPrdPa" data-id="${item.id}">❌</button>
          </div>
        `;

      UI.basDropdown.innerHTML += `
        <div class="fav-item">
          <img src="${p.image}">
          <div>
            <h4>${p.title}</h4>
            <p>سعر الواحد : ${p.price}$</p>
            <p class="total-items"> الكمية: ${controls} </p>
            <p>عدد المنتجات المضافة منه : ${item.qty} ${largeQty} <br /> <div class="content-fav-item">${aboutItem}</div></p>
          </div>
        </div>
      `;
    });

    if (State.cart.length === 0) {
      UI.basDropdown.innerHTML = "<p>السلة فارغة</p>";
      return;
    }

    UI.basDropdown.innerHTML += `
      <div class="cart-total">
        <strong>الإجمالي: ${total.toFixed(2)} $</strong>
        <button class="checkout-btn">إتمام الطلب</button>
      </div>
    `;
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
