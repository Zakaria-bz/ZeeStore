const productsContainer = document.getElementById("products");




// header 




// lang 


const langBtn = document.getElementById("lang-btn");
const langList = document.getElementById("lang-list");


const items = document.querySelectorAll(".item");

items.forEach(li => {
    li.addEventListener("click", () => {
        langBtn.innerHTML = `${li.textContent} <i class="fa-solid fa-globe"></i>`;
    });
});


langBtn.addEventListener("click", () => {
    langList.style.display = langList.style.display === "block" ? "none" : "block"
})

document.addEventListener("click", (e) => {
    if (
        !e.target.closest(".language-selector") ||
        e.target.closest(".lang-list li")
    ) {
        langList.style.display = "none";
    }
});


// search-work 

const search_input = document.querySelector(".search-input");
const form = document.querySelector("#search-form");

form.addEventListener("submit", (e) => {
    e.preventDefault();
    console.log(search_input.value);
});


// جلب المنتجات عن طريق fetch

let allProducts = [];
let currentCategory = "all";

// جلب المنتجات
fetch("https://fakestoreapi.com/products")
    .then(res => res.json())
    .then(data => {
        allProducts = data;
        displayProducts(allProducts);
        syncButtons();
    })
    .catch(err => console.log("خطأ في جلب المنتجات"));

// دالة العرض
function displayProducts(products) {
    let html = "";

    products.forEach(product => {
        html += `
        <div class="product-card">
            <img src="${product.image}">
            <h3>${product.title}</h3>
            <p class="price">${product.price} $</p>
            <button class="basket-btn btn-primary">أضف للسلة</button>
            <button class="heart-button">️<i class="fa-regular fa-heart"></i></button>
        </div>
        `;
    });

    productsContainer.innerHTML = html;
}


// دالة الفلترة عند الضغط على الأصناف
function filterProducts(category) {
    currentCategory = category;

    if (category === "all") {
        displayProducts(allProducts);
    } else {
        const filtered = allProducts.filter(product => product.category === category);
        displayProducts(filtered);
    }
}


//heart and basket

const fav_count = document.querySelector("#fav-count");
const cart_count = document.querySelector("#cart-count");

let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let basket_products = JSON.parse(localStorage.getItem("basket_products")) || [];

fav_count.textContent = favorites.length;
cart_count.textContent = basket_products.length;

productsContainer.addEventListener("click", (e) => {

    /* ❤️ زر القلب */
    const heartBtn = e.target.closest(".heart-button");
    if (heartBtn) {
        const card = heartBtn.closest(".product-card");
        const title = card.querySelector("h3").textContent;

        const index = favorites.indexOf(title);

        if (index !== -1) {
            favorites.splice(index, 1);
            heartBtn.classList.remove("active");
        } else {
            favorites.push(title);
            heartBtn.classList.add("active");
        }

        fav_count.textContent = favorites.length;
        localStorage.setItem("favorites", JSON.stringify(favorites));
        return;
    }

    /* 🛒 زر السلة */
    const basketBtn = e.target.closest(".basket-btn");
    if (basketBtn) {
        const card = basketBtn.closest(".product-card");
        const title = card.querySelector("h3").textContent;

        const index = basket_products.indexOf(title);

        if (index !== -1) {
            basket_products.splice(index, 1);
            basketBtn.classList.remove("added");
        } else {
            basket_products.push(title);
            basketBtn.classList.add("added");
        }

        cart_count.textContent = basket_products.length;
        localStorage.setItem("basket_products", JSON.stringify(basket_products));
    }
});

function syncButtons() {
    document.querySelectorAll(".product-card").forEach(card => {
        const title = card.querySelector("h3").textContent;

        if (favorites.includes(title)) {
            card.querySelector(".heart-button").classList.add("active");
        }

        if (basket_products.includes(title)) {
            card.querySelector(".basket-btn").classList.add("added");
        }
    });
}



form.addEventListener("submit", (e) => {
    e.preventDefault();

    const query = search_input.value.toLowerCase();

    const filteredProducts = allProducts.filter(product =>
        product.title.toLowerCase().includes(query)
    );

    displayProducts(filteredProducts);
    syncButtons();
});
