const products = [
 {id:1,name:"Blue-Grey Ceramic Plate Set",category:"Home",price:1250,desc:"Hand-crafted glazed stoneware plates",image:"https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=700&q=85"},
 {id:2,name:"Wove Rattan Handbag",category:"Accessories",price:890,desc:"Stylish rattan bag with leather accents",image:"https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=700&q=80"},
 {id:3,name:"Woven Pet Bed",category:"Home",price:1850,desc:"Cozy rattan pet basket bed",image:"https://images.unsplash.com/photo-1600369671236-e74521d4b6ad?auto=format&fit=crop&w=700&q=85"},
 {id:4,name:"Simple White Mug",category:"Lifestyle",price:760,desc:"Minimalist ceramic coffee mug",image:"https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=700&q=80"},
 {id:5,name:"Natural Canvas Tote Bag",category:"Accessories",price:650,desc:"Eco-friendly linen carry-all pouch",image:"https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=700&q=80"},
 {id:6,name:"Quiet Morning Candle",category:"Lifestyle",price:980,desc:"Soy wax candle, warm cedar and soft musk scent",image:"https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=700&q=80"},
 {id:7,name:"Earthy Ceramic Cup Set",category:"Home",price:1450,desc:"Two-tone ceramic cups, modern minimalist design",image:"https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=700&q=85"},
 {id:8,name:"Matte Green Water Bottle",category:"Lifestyle",price:1100,desc:"Insulated stainless steel bottle - eco-friendly daily use",image:"https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=700&q=80"}
];

const peso = n => "₱" + n.toLocaleString("en-PH");
let cart = JSON.parse(localStorage.getItem("velora-cart") || "[]");
let favorites = JSON.parse(localStorage.getItem("velora-favorites") || "[]");
let category = "All";
let favoritesOnly = false;
const grid = document.querySelector("#product-grid");
const toastEl = document.querySelector("#toast");

function toast(message) {
  toastEl.textContent = message;
  toastEl.classList.add("show");
  setTimeout(() => toastEl.classList.remove("show"), 2200);
}

function renderProducts() {
  let list = products.filter(p =>
    (category === "All" || p.category === category) &&
    (!favoritesOnly || favorites.includes(p.id)) &&
    p.name.toLowerCase().includes(document.querySelector("#search-input").value.toLowerCase())
  );

  const sort = document.querySelector("#sort-select").value;
  if (sort === "low") list.sort((a, b) => a.price - b.price);
  if (sort === "high") list.sort((a, b) => b.price - a.price);
  if (sort === "az") list.sort((a, b) => a.name.localeCompare(b.name));

  document.querySelector("#favorites-count").textContent = favorites.length;
  document.querySelector("#favorites-filter").classList.toggle("active", favoritesOnly);

  grid.innerHTML = list.length ? list.map(p => `
    <article class="product-card">
      <div class="product-image">
        <img src="${p.image}" alt="${p.name}" loading="lazy">
        <button class="heart ${favorites.includes(p.id) ? "active" : ""}" data-fav="${p.id}" aria-label="Add ${p.name} to wishlist">${favorites.includes(p.id) ? "♥" : "♡"}</button>
      </div>
      <div class="product-info">
        <div><h3>${p.name}</h3><p>${p.desc}</p></div>
        <span class="price">${peso(p.price)}</span>
      </div>
      <button class="add-button" data-add="${p.id}">ADD TO BAG +</button>
    </article>
  `).join("") : '<p class="empty">No pieces found. Try another search.</p>';
}

function saveCart() {
  localStorage.setItem("velora-cart", JSON.stringify(cart));
  renderCart();
}

function renderCart() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  document.querySelector("#cart-count").textContent = count;
  document.querySelector("#drawer-count").textContent = `(${count})`;
  document.querySelector("#cart-subtotal").textContent = peso(total);
  document.querySelector("#checkout-total").textContent = peso(total);

  document.querySelector("#cart-items").innerHTML = cart.length ? cart.map(i => `
    <div class="cart-row">
      <img src="${i.image}" alt="">
      <div>
        <h3>${i.name}</h3>
        <p>${peso(i.price)}</p>
        <div class="quantity">
          <button data-qty="${i.id}" data-change="-1">−</button>
          ${i.qty}
          <button data-qty="${i.id}" data-change="1">+</button>
        </div>
      </div>
      <button class="remove" data-remove="${i.id}" aria-label="Remove item">×</button>
    </div>
  `).join("") : '<div class="empty">Your bag is waiting for something lovely.</div>';
}

function openCart() {
  document.querySelector("#cart-drawer").classList.add("open");
  document.querySelector("#overlay").classList.add("show");
}

function closeCart() {
  document.querySelector("#cart-drawer").classList.remove("open");
  document.querySelector("#overlay").classList.remove("show");
}

document.querySelector("#filters").addEventListener("click", e => {
  const button = e.target.closest("[data-category]");
  if (!button) return;

  category = button.dataset.category;
  favoritesOnly = false;
  document.querySelectorAll("#filters [data-category]").forEach(item =>
    item.classList.toggle("active", item === button)
  );
  renderProducts();
});

document.querySelector("#favorites-filter").addEventListener("click", () => {
  favoritesOnly = !favoritesOnly;
  category = "All";
  document.querySelectorAll("#filters [data-category]").forEach(item =>
    item.classList.toggle("active", item.dataset.category === "All" && !favoritesOnly)
  );
  renderProducts();
  document.querySelector("#shop").scrollIntoView({ behavior: "smooth" });
});

document.querySelector("#search-input").addEventListener("input", renderProducts);
document.querySelector("#sort-select").addEventListener("change", renderProducts);

grid.addEventListener("click", e => {
  const add = e.target.closest("[data-add]");
  const fav = e.target.closest("[data-fav]");

  if (add) {
    const product = products.find(item => item.id === Number(add.dataset.add));
    const found = cart.find(item => item.id === product.id);
    if (found) found.qty++;
    else cart.push({ ...product, qty: 1 });
    saveCart();
    toast("Added to your bag");
  }

  if (fav) {
    const id = Number(fav.dataset.fav);
    favorites = favorites.includes(id)
      ? favorites.filter(item => item !== id)
      : [...favorites, id];
    localStorage.setItem("velora-favorites", JSON.stringify(favorites));
    toast(favorites.includes(id) ? "Added to favorites" : "Removed from favorites");
    renderProducts();
  }
});

document.querySelector("#cart-items").addEventListener("click", e => {
  const quantityButton = e.target.closest("[data-qty]");
  const removeButton = e.target.closest("[data-remove]");

  if (quantityButton) {
    const item = cart.find(x => x.id === Number(quantityButton.dataset.qty));
    item.qty += Number(quantityButton.dataset.change);
    if (item.qty <= 0) cart = cart.filter(x => x.id !== item.id);
    saveCart();
  }

  if (removeButton) {
    cart = cart.filter(x => x.id !== Number(removeButton.dataset.remove));
    saveCart();
  }
});

document.querySelector("#cart-toggle").addEventListener("click", openCart);
document.querySelector("#close-cart").addEventListener("click", closeCart);
document.querySelector("#overlay").addEventListener("click", closeCart);

document.querySelector("#checkout-button").addEventListener("click", () => {
  if (!cart.length) {
    toast("Your bag is empty");
    return;
  }
  closeCart();
  document.querySelector("#checkout-dialog").showModal();
});

document.querySelector("#close-checkout").addEventListener("click", () =>
  document.querySelector("#checkout-dialog").close()
);

document.querySelector("#checkout-form").addEventListener("submit", e => {
  e.preventDefault();
  const order = {
    items: cart,
    total: cart.reduce((s, i) => s + i.price * i.qty, 0),
    date: new Date().toISOString()
  };
  sessionStorage.setItem("velora-last-order", JSON.stringify(order));
  cart = [];
  saveCart();
  e.target.reset();
  document.querySelector("#checkout-dialog").close();
  toast("Thank you! Your demo order is confirmed.");
});

document.querySelector("#newsletter-form").addEventListener("submit", e => {
  e.preventDefault();
  sessionStorage.setItem("velora-newsletter", document.querySelector("#newsletter-email").value);
  e.target.reset();
  toast("You're on the list. Thank you!");
});

document.querySelector(".menu-toggle").addEventListener("click", () =>
  document.querySelector(".nav-links").classList.toggle("show")
);

document.querySelector("#search-toggle").addEventListener("click", () => {
  document.querySelector("#shop").scrollIntoView();
  document.querySelector("#search-input").focus();
});

// Product Detail Page
let pdpQuantity = 1;
let currentProduct = null;
const detailPage = document.querySelector("#product-detail");

function showProduct(id) {
  currentProduct = products.find(p => p.id === id);
  if (!currentProduct) return;

  pdpQuantity = 1;

  document.querySelectorAll("main > section").forEach(section => {
    section.hidden = true;
  });
  detailPage.hidden = false;

  const p = currentProduct;
  const related = products.filter(item => item.id !== p.id).slice(0, 3);

  detailPage.innerHTML = `
    <button class="pdp-back" data-back>← BACK TO SHOP</button>
    <div class="pdp-layout">
      <img class="pdp-image" src="${p.image}" alt="${p.name}">
      <div class="pdp-info">
        <p class="pdp-category">${p.category}</p>
        <h1 class="pdp-title">${p.name}</h1>
        <p class="pdp-price">${peso(p.price)}</p>
        <p class="pdp-description">${p.desc}. Thoughtfully selected for everyday living.</p>
        <div class="pdp-quantity">
          <span>Quantity</span>
          <button data-qty-change="-1">−</button>
          <span id="pdp-qty">1</span>
          <button data-qty-change="1">+</button>
        </div>
        <div class="pdp-actions">
          <button class="pdp-add" data-pdp-add>ADD TO BAG</button>
          <button class="pdp-favorite" data-pdp-fav>${favorites.includes(p.id) ? "♥ FAVORITED" : "♡ ADD TO FAVORITES"}</button>
        </div>
      </div>
    </div>
    <div class="pdp-related">
      <h2>You May Also Like</h2>
      <div class="pdp-related-grid">
        ${related.map(item => `
          <div class="pdp-related-card" data-related="${item.id}">
            <img src="${item.image}" alt="${item.name}">
            <h3>${item.name}</h3>
            <p>${peso(item.price)}</p>
          </div>
        `).join("")}
      </div>
    </div>
  `;

  // Account for the sticky header and place the detail page at the top.
  window.scrollTo({ top: detailPage.getBoundingClientRect().top + window.scrollY - 90, behavior: "auto" });
}

function backToShop() {
  detailPage.hidden = true;
  document.querySelectorAll("main > section").forEach(section => {
    if (section.id !== "product-detail") section.hidden = false;
  });
  document.querySelector("#shop").scrollIntoView({ behavior: "smooth", block: "start" });
}

grid.addEventListener("click", e => {
  // Keep Add to Bag and Favorites buttons from opening the detail page.
  if (e.target.closest("button")) return;

  const card = e.target.closest(".product-card");
  if (!card) return;

  const productName = card.querySelector("h3").textContent.trim();
  const product = products.find(p => p.name === productName);
  if (product) showProduct(product.id);
});

detailPage.addEventListener("click", e => {
  if (e.target.closest("[data-back]")) {
    backToShop();
    return;
  }

  const quantityButton = e.target.closest("[data-qty-change]");
  if (quantityButton) {
    pdpQuantity = Math.max(1, pdpQuantity + Number(quantityButton.dataset.qtyChange));
    document.querySelector("#pdp-qty").textContent = pdpQuantity;
    return;
  }

  if (e.target.closest("[data-pdp-add]")) {
    const found = cart.find(item => item.id === currentProduct.id);
    if (found) found.qty += pdpQuantity;
    else cart.push({ ...currentProduct, qty: pdpQuantity });
    saveCart();
    toast("Added to your bag");
    return;
  }

  if (e.target.closest("[data-pdp-fav]")) {
    const id = currentProduct.id;
    favorites = favorites.includes(id)
      ? favorites.filter(item => item !== id)
      : [...favorites, id];
    localStorage.setItem("velora-favorites", JSON.stringify(favorites));
    renderProducts();

    e.target.closest("[data-pdp-fav]").textContent =
      favorites.includes(id) ? "♥ FAVORITED" : "♡ ADD TO FAVORITES";
    toast(favorites.includes(id) ? "Added to favorites" : "Removed from favorites");
    return;
  }

  const relatedButton = e.target.closest("[data-related]");
  if (relatedButton) showProduct(Number(relatedButton.dataset.related));
});

renderProducts();
renderCart();
