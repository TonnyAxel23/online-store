// ===== Product Data =====
const products = [
    { id: 1, name: "Smartphone X", category: "electronics", price: 699.99, image: "https://picsum.photos/seed/phone/400/300", description: "Latest smartphone with advanced features" },
    { id: 2, name: "Laptop Pro", category: "electronics", price: 1299.99, image: "https://picsum.photos/seed/laptop/400/300", description: "High-performance laptop for professionals" },
    { id: 3, name: "Wireless Headphones", category: "electronics", price: 199.99, image: "https://picsum.photos/seed/headphones/400/300", description: "Noise-cancelling wireless headphones" },
    { id: 4, name: "Men's T-Shirt", category: "clothing", price: 24.99, image: "https://picsum.photos/seed/tshirt/400/300", description: "Comfortable cotton t-shirt" },
    { id: 5, name: "Women's Jeans", category: "clothing", price: 49.99, image: "https://picsum.photos/seed/jeans/400/300", description: "Stylish and comfortable jeans" },
    { id: 6, name: "Coffee Maker", category: "home", price: 89.99, image: "https://picsum.photos/seed/coffee/400/300", description: "Automatic coffee maker with timer" },
    { id: 7, name: "Blender", category: "home", price: 59.99, image: "https://picsum.photos/seed/blender/400/300", description: "High-speed blender for smoothies" },
    { id: 8, name: "Desk Lamp", category: "home", price: 34.99, image: "https://picsum.photos/seed/lamp/400/300", description: "Adjustable LED desk lamp" }
];

// ===== State =====
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentCategory = 'all';
let searchQuery = '';

// ===== DOM References =====
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const DOM = {
    products: $('#products-container'),
    categoryBtns: $$('.category-btn'),
    searchInput: $('#search-input'),
    searchBtn: $('#search-btn'),
    cartBtn: $('#cart-btn'),
    cartCount: $('#cart-count'),
    cartModal: $('#cart-modal'),
    closeModal: $('.close'),
    cartItems: $('#cart-items'),
    cartTotal: $('#cart-total'),
    checkoutBtn: $('#checkout-btn')
};

// ===== Utility Functions =====
const formatPrice = (price) => `$${price.toFixed(2)}`;
const getTotalItems = () => cart.reduce((sum, item) => sum + item.quantity, 0);
const getCartTotal = () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

// ===== Notification System =====
function showNotification(message, type = 'success') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 400);
    }, 2500);
}

// ===== Cart Functions =====
function updateCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    renderCartItems();
}

function updateCartCount() {
    DOM.cartCount.textContent = getTotalItems();
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    updateCart();
    showNotification(`${product.name} added to cart!`, 'success');
}

function removeFromCart(productId) {
    const item = cart.find(i => i.id === productId);
    cart = cart.filter(item => item.id !== productId);
    updateCart();
    if (item) showNotification(`${item.name} removed from cart`, 'error');
}

function updateQuantity(productId, newQuantity) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;

    if (newQuantity < 1) {
        removeFromCart(productId);
    } else {
        item.quantity = newQuantity;
        updateCart();
    }
}

// ===== Render Functions =====
function renderProducts(productsToRender) {
    if (!productsToRender || productsToRender.length === 0) {
        DOM.products.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <div class="empty-icon">🔍</div>
                <h3>No products found</h3>
                <p>Try adjusting your search or filter</p>
            </div>
        `;
        return;
    }

    DOM.products.innerHTML = productsToRender.map(product => `
        <div class="product-card" data-id="${product.id}">
            <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy">
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <span class="product-category">${product.category}</span>
                <p class="product-price">${formatPrice(product.price)}</p>
                <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
            </div>
        </div>
    `).join('');
}

function renderCartItems() {
    if (cart.length === 0) {
        DOM.cartItems.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🛒</div>
                <h3>Your cart is empty</h3>
                <p>Start shopping to add items!</p>
            </div>
        `;
        DOM.cartTotal.textContent = '0.00';
        DOM.checkoutBtn.disabled = true;
        return;
    }

    DOM.cartItems.innerHTML = cart.map(item => `
        <div class="cart-item" data-id="${item.id}">
            <div class="cart-item-info">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <p class="cart-item-name">${item.name}</p>
                    <p class="cart-item-price">${formatPrice(item.price)}</p>
                </div>
            </div>
            <div class="cart-item-quantity">
                <button class="quantity-btn minus" data-id="${item.id}">−</button>
                <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-id="${item.id}">
                <button class="quantity-btn plus" data-id="${item.id}">+</button>
                <button class="remove-item" data-id="${item.id}">✕</button>
            </div>
        </div>
    `).join('');

    DOM.cartTotal.textContent = getCartTotal().toFixed(2);
    DOM.checkoutBtn.disabled = false;

    // Event listeners for cart controls
    DOM.cartItems.querySelectorAll('.minus').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            const item = cart.find(i => i.id === id);
            if (item) updateQuantity(id, item.quantity - 1);
        });
    });

    DOM.cartItems.querySelectorAll('.plus').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            const item = cart.find(i => i.id === id);
            if (item) updateQuantity(id, item.quantity + 1);
        });
    });

    DOM.cartItems.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', () => {
            const id = parseInt(input.dataset.id);
            const val = parseInt(input.value);
            if (!isNaN(val) && val > 0) {
                updateQuantity(id, val);
            } else {
                input.value = cart.find(i => i.id === id)?.quantity || 1;
            }
        });
    });

    DOM.cartItems.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            removeFromCart(id);
        });
    });
}

// ===== Filter & Search =====
function filterProducts(category) {
    currentCategory = category;
    applyFilters();
}

function searchProducts(query) {
    searchQuery = query.trim().toLowerCase();
    applyFilters();
}

function applyFilters() {
    let filtered = [...products];

    // Apply category filter
    if (currentCategory !== 'all') {
        filtered = filtered.filter(p => p.category === currentCategory);
    }

    // Apply search filter
    if (searchQuery) {
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(searchQuery) ||
            p.description.toLowerCase().includes(searchQuery)
        );
    }

    renderProducts(filtered);
}

// ===== Modal Functions =====
function openCartModal() {
    renderCartItems();
    DOM.cartModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeCartModal() {
    DOM.cartModal.style.display = 'none';
    document.body.style.overflow = '';
}

// ===== Event Listeners =====
function setupEventListeners() {
    // Category buttons
    DOM.categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            DOM.categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterProducts(btn.dataset.category);
        });
    });

    // Search
    DOM.searchBtn.addEventListener('click', () => searchProducts(DOM.searchInput.value));
    DOM.searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchProducts(DOM.searchInput.value);
    });

    // Add to cart (delegated)
    DOM.products.addEventListener('click', (e) => {
        const btn = e.target.closest('.add-to-cart');
        if (btn) {
            const id = parseInt(btn.dataset.id);
            addToCart(id);
        }
    });

    // Cart modal
    DOM.cartBtn.addEventListener('click', openCartModal);
    DOM.closeModal.addEventListener('click', closeCartModal);
    window.addEventListener('click', (e) => {
        if (e.target === DOM.cartModal) closeCartModal();
    });

    // Checkout
    DOM.checkoutBtn.addEventListener('click', () => {
        if (cart.length > 0) {
            window.location.href = 'checkout.html';
        }
    });

    // Keyboard shortcut: Escape to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && DOM.cartModal.style.display === 'block') {
            closeCartModal();
        }
    });
}

// ===== Initialize =====
function init() {
    renderProducts(products);
    updateCartCount();
    setupEventListeners();
}

init();
