// Sample product data
const products = [
    {
        id: 1,
        name: "Smartphone X",
        category: "electronics",
        price: 699.99,
        image: "images/product1.jpg",
        description: "Latest smartphone with advanced features"
    },
    {
        id: 2,
        name: "Laptop Pro",
        category: "electronics",
        price: 1299.99,
        image: "images/product2.jpg",
        description: "High-performance laptop for professionals"
    },
    {
        id: 3,
        name: "Wireless Headphones",
        category: "electronics",
        price: 199.99,
        image: "images/product3.jpg",
        description: "Noise-cancelling wireless headphones"
    },
    {
        id: 4,
        name: "Men's T-Shirt",
        category: "clothing",
        price: 24.99,
        image: "images/product4.jpg",
        description: "Comfortable cotton t-shirt"
    },
    {
        id: 5,
        name: "Women's Jeans",
        category: "clothing",
        price: 49.99,
        image: "images/product5.jpg",
        description: "Stylish and comfortable jeans"
    },
    {
        id: 6,
        name: "Coffee Maker",
        category: "home",
        price: 89.99,
        image: "images/product1.jpg",
        description: "Automatic coffee maker with timer"
    },
    {
        id: 7,
        name: "Blender",
        category: "home",
        price: 59.99,
        image: "images/product2.jpg",
        description: "High-speed blender for smoothies"
    },
    {
        id: 8,
        name: "Desk Lamp",
        category: "home",
        price: 34.99,
        image: "images/product3.jpg",
        description: "Adjustable LED desk lamp"
    }
];

// DOM Elements
const productsContainer = document.getElementById('products-container');
const categoryButtons = document.querySelectorAll('.category-btn');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const cartBtn = document.getElementById('cart-btn');
const cartCount = document.getElementById('cart-count');
const cartModal = document.getElementById('cart-modal');
const closeModal = document.querySelector('.close');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');

// Cart state
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Initialize the app
function init() {
    renderProducts(products);
    updateCartCount();
    setupEventListeners();
}

// Render products to the page
function renderProducts(productsToRender) {
    productsContainer.innerHTML = '';
    
    productsToRender.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <span class="product-category">${product.category}</span>
                <p class="product-price">$${product.price.toFixed(2)}</p>
                <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
            </div>
        `;
        
        productsContainer.appendChild(productCard);
    });
}

// Filter products by category
function filterProducts(category) {
    if (category === 'all') {
        renderProducts(products);
        return;
    }
    
    const filteredProducts = products.filter(product => product.category === category);
    renderProducts(filteredProducts);
}

// Search products by name
function searchProducts(query) {
    const normalizedQuery = query.toLowerCase();
    const searchedProducts = products.filter(product => 
        product.name.toLowerCase().includes(normalizedQuery)
    );
    renderProducts(searchedProducts);
}

// Add product to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }
    
    updateCart();
    showNotification(`${product.name} added to cart`);
}

// Remove item from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
}

// Update item quantity in cart
function updateQuantity(productId, newQuantity) {
    const item = cart.find(item => item.id === productId);
    
    if (item) {
        if (newQuantity < 1) {
            removeFromCart(productId);
        } else {
            item.quantity = newQuantity;
        }
    }
    
    updateCart();
}

// Update cart in UI and localStorage
function updateCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    renderCartItems();
}

// Update cart count in header
function updateCartCount() {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
}

// Render cart items in modal
function renderCartItems() {
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Your cart is empty</p>';
        cartTotal.textContent = '0.00';
        return;
    }
    
    let total = 0;
    
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        cartItem.innerHTML = `
            <div class="cart-item-info">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div>
                    <p class="cart-item-name">${item.name}</p>
                    <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                </div>
            </div>
            <div class="cart-item-quantity">
                <button class="quantity-btn minus" data-id="${item.id}">-</button>
                <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-id="${item.id}">
                <button class="quantity-btn plus" data-id="${item.id}">+</button>
                <button class="remove-item" data-id="${item.id}">Remove</button>
            </div>
        `;
        
        cartItemsContainer.appendChild(cartItem);
    });
    
    cartTotal.textContent = total.toFixed(2);
    
    // Add event listeners to quantity controls
    document.querySelectorAll('.minus').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.getAttribute('data-id'));
            const item = cart.find(item => item.id === id);
            if (item) updateQuantity(id, item.quantity - 1);
        });
    });
    
    document.querySelectorAll('.plus').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.getAttribute('data-id'));
            const item = cart.find(item => item.id === id);
            if (item) updateQuantity(id, item.quantity + 1);
        });
    });
    
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const id = parseInt(e.target.getAttribute('data-id'));
            const newQuantity = parseInt(e.target.value) || 1;
            updateQuantity(id, newQuantity);
        });
    });
    
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.getAttribute('data-id'));
            removeFromCart(id);
        });
    });
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Setup event listeners
function setupEventListeners() {
    // Category filter buttons
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            filterProducts(button.getAttribute('data-category'));
        });
    });
    
    // Search functionality
    searchBtn.addEventListener('click', () => {
        searchProducts(searchInput.value);
    });
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchProducts(searchInput.value);
        }
    });
    
    // Add to cart buttons (delegated)
    productsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart')) {
            const productId = parseInt(e.target.getAttribute('data-id'));
            addToCart(productId);
        }
    });
    
    // Cart modal
    cartBtn.addEventListener('click', () => {
        cartModal.style.display = 'block';
    });
    
    closeModal.addEventListener('click', () => {
        cartModal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === cartModal) {
            cartModal.style.display = 'none';
        }
    });
    
    // Checkout button
    checkoutBtn.addEventListener('click', () => {
        if (cart.length > 0) {
            window.location.href = 'checkout.html';
        }
    });
}

// Initialize the app
init();
