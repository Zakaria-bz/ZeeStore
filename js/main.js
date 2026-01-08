// variables



//header

// lang 

const langBtn = document.getElementById("lang-btn");
const langList = document.getElementById("lang-list");

langList.querySelectorAll('li').forEach(item => {
    item.addEventListener('click', () => {
        const lang = item.textContent;
        if (lang === 'العربية') {
            document.documentElement.setAttribute('dir', 'rtl');
            document.documentElement.lang = 'ar';
        } else if (lang === 'English') {
            document.documentElement.setAttribute('dir', 'ltr');
            document.documentElement.lang = 'en';
        } else if (lang === 'Français') {
            document.documentElement.setAttribute('dir', 'ltr');
            document.documentElement.lang = 'fr';
        }
    });
});

// heart


let heartBtn = document.querySelector(".fa-heart")
let containerHeart = document.querySelector(".container-hed-bas")

const productsContainer = document.getElementById("products");
const searchForm = document.getElementById("search-form");
const searchInput = document.querySelector(".search-input");

// Prodcuts



// Bringing Products

if (productsContainer) {
    fetch("https://fakestoreapi.com/products")
        .then(res => res.json())
        .then(data => {
            allProducts = data;
            renderProducts(allProducts);
            syncButtons();
        });
}

// Product Display

function renderProducts(products) {
    productsContainer.innerHTML = products.map(p => `
        <div class="product-card" data-id="${p.id}">
            <a href="product.html?id=${p.id}">
                <img src="${p.image}">
            </a>
            <h3>${p.title}</h3>
            <p class="price">${p.price} $</p>
            <button class="basket-btn btn-primary">أضف للسلة</button>
            <button class="heart-button"><i class="fa-regular fa-heart"></i></button>
        </div>
    `).join("");
}

// Filter Products
function filterProducts(category) {
    if (category === "all") {
        renderProducts(allProducts);
    } else {
        renderProducts(allProducts.filter(p => p.category === category));
    }
    syncButtons();
}


// Search Input
if (searchForm && searchInput) {
    searchForm.addEventListener("submit", e => {
        e.preventDefault();
        const q = searchInput.value.toLowerCase();
        renderProducts(allProducts.filter(p => p.title.toLowerCase().includes(q)));
        syncButtons();
    });
}


if (productsContainer) {
    productsContainer.addEventListener("click", e => {
        const card = e.target.closest(".product-card");
        if (!card) return;

        const id = Number(card.dataset.id);

        const heartBtn = e.target.closest(".heart-button");
        const basketBtn = e.target.closest(".basket-btn");

        if (heartBtn) {
            favorites.includes(id)
                ? favorites.splice(favorites.indexOf(id), 1)
                : favorites.push(id);

            localStorage.setItem("favorites", JSON.stringify(favorites));
            favCount.textContent = favorites.length;
            syncButtons();
        }

        if (basketBtn) {
            const item = basketProducts.find(p => p.id === id);

            if (item) {
                item.qty++;
            } else {
                basketProducts.push({ id, qty: 1 });
            }

            localStorage.setItem("basket_products", JSON.stringify(basketProducts));
            updateCartCount();
            syncButtons();
        }

    });
}



function syncButtons() {
    document.querySelectorAll(".product-card").forEach(card => {
        const id = Number(card.dataset.id);

        card.querySelector(".heart-button")
            .classList.toggle("active", favorites.includes(id));

        card.querySelector(".basket-btn")
            .classList.toggle(
                "added",
                basketProducts.some(p => p.id === id)
            );

    });
}



if (langBtn && langList) {
    document.querySelectorAll(".item").forEach(li => {
        li.addEventListener("click", () => {
            langBtn.innerHTML = `${li.textContent} <i class="fa-solid fa-globe"></i>`;
            langList.style.display = "none";
        });
    });

    langBtn.addEventListener("click", e => {
        e.stopPropagation();
        langList.style.display = langList.style.display === "block" ? "none" : "block";
    });

    document.addEventListener("click", () => langList.style.display = "none");
}


const favBtn = document.getElementById("fav-btn");
const favSidebar = document.getElementById("fav-sidebar");

if (favBtn && favSidebar) {
    favBtn.addEventListener("click", () => {
        favSidebar.classList.toggle("open");
        renderFavSidebar();
    });
}

//heart

favBtn.addEventListener("click", e => {
    e.stopPropagation();
    containerHeart.classList.toggle("active");
    renderFavDropdown();
});

document.addEventListener("click", () => {
    containerHeart.classList.remove("active");
});

function renderFavDropdown() {
    containerHeart.innerHTML = "";

    if (favorites.length === 0) {
        containerHeart.innerHTML = `<h3 style="text-align:center; padding:20px;">لا توجد منتجات مفضلة</h3>`;
        return;
    }

    favorites.forEach(favId => {
        const product = allProducts.find(p => p.id === Number(favId));
        if (product) {
            containerHeart.innerHTML += `
                <div class="fav-item">
                    <img src="${product.image}" alt="${product.title}">
                    <div>
                        <h4>${product.title}</h4>
                        <p>${product.price} $</p>
                    </div>
                </div>
            `;
        }
    });
}

// basket 

const cartContainer = document.getElementById("cart-items");
const totalEl = document.getElementById("cart-total");

function renderCart() {
    cartContainer.innerHTML = "";
    let total = 0;

    basketProducts.forEach(item => {
        const product = allProducts.find(p => p.id === item.id);
        if (!product) return;

        const itemTotal = product.price * item.qty;
        total += itemTotal;

        cartContainer.innerHTML += `
      <div class="cart-item">
        <img src="${product.image}">
        <h4>${product.title}</h4>
        <p>${item.qty} × ${product.price}$</p>
        <strong>${itemTotal.toFixed(2)} $</strong>
        <button onclick="removeFromCart(${item.id})">❌</button>
      </div>
    `;
    });

    totalEl.textContent = `المجموع: ${total.toFixed(2)} $`;
}

// 

let basketProducts = JSON.parse(localStorage.getItem("basket_products")) || [];

document.getElementById("add-to-cart").addEventListener("click", () => {
    const item = basketProducts.find(p => p.id === Number(productId));

    if (item) {
        item.qty++;
    } else {
        basketProducts.push({ id: Number(productId), qty: 1 });
    }

    localStorage.setItem("basket_products", JSON.stringify(basketProducts));
});
