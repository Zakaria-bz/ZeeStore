// الحالة العامة للتطبيق (تخزين البيانات)
const State = {
    products: [],
    favorites: JSON.parse(localStorage.getItem("favorites")) || [],
    cart: JSON.parse(localStorage.getItem("cart")) || [],
    loading: true
};

// أقصى سعر (يتم استخدامه لاحقاً في الفلاتر)
const max = State.products.length 
    ? Math.max(...State.products.map(p => p.price)) 
    : 0;

// الفلاتر الحالية
let currentFilters = {
    search: "",
    category: "all",
    minPrice: 0,
    maxPrice: Infinity
};

// عناصر الواجهة
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
    favDropdown: document.getElementById("fav-dropdown"),
    basDropdown: document.getElementById("bas-dropdown")
};

// تشغيل التطبيق بعد تحميل الصفحة
document.addEventListener("DOMContentLoaded", init);

function init() {
    updateCounters();
    bindEvents();

    if (UI.products) {
        fetchProducts();
    }
}

function fetchProducts() {
    renderLoading();

    fetch("https://fakestoreapi.com/products")
        .then(r => r.json())
        .then(data => {

            State.products = data;
            State.loading = false;

            // حفظ اختياري (مش إجباري)
            localStorage.setItem("products", JSON.stringify(data));

            applyFilters(currentFilters);
            syncUI();
        })
        .catch(err => {
            console.error("Fetch error:", err);
            UI.products.innerHTML = `
                <p style="text-align:center;color:red">
                    فشل تحميل المنتجات
                </p>
            `;
        });
}

// فلترة حسب القسم
function filterProducts(category) {
    currentFilters.category = category;
    applyFilters(currentFilters);
}

// فلترة حسب السعر
function filterByPrice() {
    const min = Number(document.getElementById("minPrice").value) || 0;
    const max = Number(document.getElementById("maxPrice").value) || Infinity;

    currentFilters.minPrice = min;
    currentFilters.maxPrice = max;

    applyFilters(currentFilters);
}

// ربط الأحداث (مهم: استخدمنا delegation)
function bindEvents() {

    addEventListener("click", (e) => {
        const favBtn = e.target.closest("#fav-btn");
        const basBtn = e.target.closest("#bas-btn");

        const favDropdown = document.getElementById("fav-dropdown");
        const basDropdown = document.getElementById("bas-dropdown");

        if (favBtn) {
            e.preventDefault();
            e.stopPropagation();
            favDropdown.classList.toggle("active");
            basDropdown?.classList.remove("active");
            renderFavorites();
        }

        if (basBtn) {
            e.preventDefault();
            e.stopPropagation();
            basDropdown.classList.toggle("active");
            favDropdown?.classList.remove("active");
            renderBasket();
        }

        // إغلاق عند الضغط خارج
        if (!e.target.closest(".basket-sidebar") &&
            !e.target.closest(".container-bas-bas") &&
            !e.target.closest(".container-hed-bas")) {

            favDropdown?.classList.remove("active");
            basDropdown?.classList.remove("active");
        }
    });

    const langList = document.querySelector("#lang-list");

    UI.searchForm?.addEventListener("submit", handleSearch);

    if (UI.products) {
        UI.products.addEventListener("click", handleProductActions);
    }

    UI.langBtn?.addEventListener("click", (e) => {
        e.stopPropagation();
        langList.classList.toggle("show");
    });

    UI.liLangBtn.forEach(li => {
        li.addEventListener("click", (e) => {
            UI.langBtn.innerHTML = e.target.innerHTML;
            langList.classList.remove("show");
        });
    });

    // التحكم في السعر (range)
    const priceRange = document.getElementById("priceRange");
    const priceValue = document.getElementById("priceValue");

    if (priceRange && priceValue) {
        priceValue.textContent = priceRange.value;

        priceRange.addEventListener("input", () => {
            priceValue.textContent = priceRange.value;
            currentFilters.maxPrice = Number(priceRange.value);
            applyFilters(currentFilters);
        });
    }
}

// تطبيق الفلاتر
function applyFilters({ search = "", category = "all", minPrice = 0, maxPrice = Infinity }) {

    let result = [...State.products];

    const priceRange = document.getElementById("priceRange");

    if (priceRange && State.products.length) {
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

function generateStars(rating) {
    let stars = "";

    for (let i = 1; i <= 5; i++) {
        if (rating >= i) {
            stars += "★";
        } else if (rating >= i - 0.5) {
            stars += "☆";
        } else {
            stars += "☆";
        }
    }

    return `<div class="rating">${stars} <span>${rating}</span></div>`;
}

// عرض المنتجات
function renderProducts(list) {
    if (!list.length) {
        UI.products.innerHTML = `<p style="text-align:center">لا توجد منتجات</p>`;
        return;
    }

        UI.products.innerHTML = list.map(p => {

        const rating = (Math.random() * 2 + 3).toFixed(1);

        return `
        <div class="product-card" data-id="${p.id}">
            <img src="${p.image}" class="product-img">
            <h3>${p.title}</h3>

            ${generateStars(rating)}

            <p>${p.price} $</p>

            <div class="produc-btns">
                <button class="basket-btn btn-primary">أضف للسلة</button>
                <button class="heart-button">
                    <i class="fa-regular fa-heart"></i>
                </button>
            </div>
        </div>
        `;
    }).join("");
}

// الانتقال لصفحة المنتج
if (UI.products) {
    UI.products.addEventListener("click", (e) => {
        const card = e.target.closest(".product-card");
        if (!card) return;

        if (e.target.closest(".basket-btn") || e.target.closest(".heart-button")) return;

        const id = card.dataset.id;
        window.location.href = `product.html?id=${id}`;
    });
}

// عرض loading
function renderLoading() {
    UI.products.innerHTML = `<p style="text-align:center">جاري التحميل...</p>`;
}

// البحث
function handleSearch(e) {
    e.preventDefault();
    currentFilters.search = UI.searchInput.value;
    applyFilters(currentFilters);
}

// التعامل مع أزرار المنتج
function handleProductActions(e) {
    const card = e.target.closest(".product-card");
    if (!card) return;

    const id = Number(card.dataset.id);

    if (e.target.closest(".heart-button")) toggleFavorite(id);
    if (e.target.closest(".basket-btn")) addToCart(id);
}

// إضافة/حذف من المفضلة
function toggleFavorite(id) {
    State.favorites.includes(id)
        ? State.favorites = State.favorites.filter(f => f !== id)
        : State.favorites.push(id);

    localStorage.setItem("favorites", JSON.stringify(State.favorites));

    updateCounters();
    syncUI();
    renderFavorites();
}

// إضافة للسلة
function addToCart(id, qty = 1) {
    const item = State.cart.find(i => i.id === id);

    if (item) {
        item.qty += qty;
    } else {
        State.cart.push({ id, qty });
    }

    localStorage.setItem("cart", JSON.stringify(State.cart));
    updateCounters();
    updateCounters();
}

// عرض المفضلة
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

UI.basDropdown.addEventListener("click", handleCartActions);

// عرض السلة (أهم جزء: event delegation)
function renderBasket() {

    UI.basDropdown.innerHTML = `
        <div class="fav-header">
            <span>السلة</span>
            <small>آخر المنتجات التي اضفتها للسلة :</small>
        </div>
    `;

    if (!State.cart.length) {
        UI.basDropdown.innerHTML += `<p style="padding:20px;text-align:center">لا توجد منتجات</p>`;
        return;
    }

    let total = 0;

    State.cart.forEach(item => {
        const p = State.products.find(x => x.id === item.id);
        if (!p) return;

        total += p.price * item.qty;

        const largeQty = item.qty > 1 ? "منتجات" : "منتج";

        UI.basDropdown.innerHTML += `
            <div class="fav-item">
                <img src="${p.image}">
                <div>
                    <h4>${p.title}</h4>
                    <p>سعر الواحد : ${p.price}$</p>

                    <!-- التحكم بالكمية -->
                    <div class="cart-controls">
                        <button class="plus" data-id="${item.id}">+</button>
                        <span class="qty">${item.qty}</span>
                        <button class="minus" data-id="${item.id}">-</button>
                        <button class="rmPrdPa" data-id="${item.id}">❌</button>
                    </div>

                    <p>عدد المنتجات: ${item.qty} ${largeQty}</p>
                </div>
            </div>
        `;
    });

    UI.basDropdown.innerHTML += `
        <div class="cart-total">
            <strong>الإجمالي: ${total.toFixed(2)} $</strong>
            <button class="checkout-btn">إتمام الطلب</button>
        </div>
    `;

}

// مزامنة الحالة مع الواجهة
function syncUI() {
    document.querySelectorAll(".product-card").forEach(card => {
        const id = Number(card.dataset.id);

        card.querySelector(".heart-button")
            .classList.toggle("active", State.favorites.includes(id));

        card.querySelector(".basket-btn")
            .classList.toggle("added", State.cart.some(c => c.id === id));
    });
}

// تحديث العدادات
function updateCounters() {
    if (UI.favCount) {
        UI.favCount.textContent = State.favorites.length;
    }

    if (UI.cartCount) {
        UI.cartCount.textContent = State.cart.reduce((t, i) => t + i.qty, 0);
    }
}