let cart = JSON.parse(localStorage.getItem('medicareCart')) || [];
let totalAmount = parseInt(localStorage.getItem('medicareTotal')) || 0;

function normalizeSearchBar() {
    const searchContainer = document.querySelector('.search-container');
    const searchInput = document.getElementById('global-search');
    if (!searchContainer || !searchInput) return;

    let suggestionsBox = document.getElementById('search-suggestions');
    if (!suggestionsBox) {
        suggestionsBox = document.createElement('div');
        suggestionsBox.id = 'search-suggestions';
        suggestionsBox.className = 'suggestions-box';
        searchContainer.appendChild(suggestionsBox);
    }

    searchInput.setAttribute('autocomplete', 'off');
    searchInput.setAttribute('placeholder', 'Search medicines...');
    searchInput.onkeyup = handleGlobalSearch;
    searchInput.onkeydown = function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            triggerSearch();
        }
    };

    const searchIcon = searchContainer.querySelector('.fa-search');
    if (searchIcon) {
        searchIcon.onclick = triggerSearch;
        searchIcon.style.cursor = 'pointer';
    }
}

window.onload = function() {
    normalizeSearchBar();
    updateHeaderUI();
    initProductCardClicks();
};

// SEARCH FUNCTION - Trigger search when clicking icon or pressing Enter
function isHomePage() {
    return window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/') || window.location.pathname.endsWith('\\');
}

function performHomeSearch() {
    const searchInput = document.getElementById('global-search');
    if (!searchInput) return;

    const input = searchInput.value.toLowerCase().trim();
    const productCards = document.querySelectorAll('.product-card');
    let foundAny = false;

    productCards.forEach(card => {
        const title = card.querySelector('.prod-title')?.innerText.toLowerCase() || '';
        if (input === '' || title.includes(input)) {
            card.style.display = 'flex';
            foundAny = true;
        } else {
            card.style.display = 'none';
        }
    });

    let noResults = document.getElementById('home-no-results');
    if (!noResults) {
        noResults = document.createElement('div');
        noResults.id = 'home-no-results';
        noResults.style.color = '#444';
        noResults.style.padding = '18px 0';
        noResults.style.fontSize = '16px';
        noResults.style.fontWeight = '700';
        noResults.style.textAlign = 'center';
        const container = document.querySelector('.container');
        if (container) {
            container.insertBefore(noResults, container.firstChild.nextSibling);
        }
    }
    noResults.innerText = foundAny ? '' : 'No matching products found on this page.';
    noResults.style.display = foundAny ? 'none' : 'block';
}

function triggerSearch() {
    const searchInput = document.getElementById('global-search');
    const searchTerm = searchInput ? searchInput.value.trim() : '';

    if (!searchTerm) {
        alert('Please enter a medicine name to search');
        return;
    }

    if (isHomePage()) {
        performHomeSearch();
        return;
    }

    window.location.href = `products.html?search=${encodeURIComponent(searchTerm)}`;
}

// Handle Enter key press
function handleGlobalSearch(event) {
    if (isHomePage()) {
        performHomeSearch();
    }
    if (event.key === 'Enter') {
        event.preventDefault();
        triggerSearch();
    }
}

function initProductCardClicks() {
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', function(event) {
            if (event.target.closest('button') || event.target.closest('a')) return;
            const titleElement = card.querySelector('.prod-title');
            if (titleElement) openProductDetail(titleElement.innerText.trim());
        });
    });
}

const PRODUCT_INFO = {
    "Panadol Advance": { usage: "1-2 tablets for fever/pain. Max 8 daily.", features: ["Original GSK", "Fast Relief"], img: "Panadol" },
    "Risek 40mg": { usage: "1 capsule daily before breakfast.", features: ["Best for Acidity", "Getz Pharma"], img: "Risek" },
    "Omron BP M2": { usage: "Automatic measurement on upper arm.", features: ["Japanese Tech", "5 Year Warranty"], img: "Omron" },
    "Lactogen 1": { usage: "Mix 1 scoop in 30ml water.", features: ["Nestle Quality", "From 0-6 months"], img: "Lactogen" }
};

function openProductDetail(name) {
    const data = PRODUCT_INFO[name] || {
        usage: "Take as prescribed by a healthcare professional. Store in a cool, dry place.",
        features: ["100% Genuine Product", "High Quality Standards", "Pharmacist Approved"],
        img: "Med"
    };

    const cards = document.querySelectorAll('.product-card');
    let priceText = "Rs. 0";
    let imageUrl = '';
    cards.forEach(card => {
        const title = card.querySelector('.prod-title');
        const price = card.querySelector('.price');
        const img = card.querySelector('.prod-img');
        const titleText = title ? title.innerText.trim() : '';

        if (titleText && (titleText === name || titleText.includes(name) || name.includes(titleText))) {
            if (price) priceText = price.innerText;
            if (!imageUrl && img) imageUrl = img.src;
        }
    });

    if (!imageUrl) {
        imageUrl = `https://placehold.co/300x300?text=${encodeURIComponent(name.split(' ')[0])}`;
    }

    const modalBody = document.getElementById('detail-modal-body');
    modalBody.innerHTML = `
        <div class="detail-grid">
            <div class="detail-img-box">
                <img src="${imageUrl}" alt="${name}">
            </div>
            <div class="detail-text-box">
                <span class="detail-tag">Authentic Medicine</span>
                <h1 class="detail-name">${name}</h1>
                <p class="detail-price">${priceText}</p>
                <div class="detail-info-section">
                    <h4>Usage / Dosage</h4>
                    <p>${data.usage}</p>
                </div>
                <div class="detail-info-section">
                    <h4>Key Features</h4>
                    <ul>${data.features.map(f => `<li><i class="fas fa-check-circle"></i> ${f}</li>`).join('')}</ul>
                </div>
                <div class="detail-buttons">
                    <button class="btn-buy-now" onclick="buyNow('${name}', '${priceText}')">Buy Now</button>
                    <button class="btn-add-cart" onclick="addToCartFromDetail('${name}', '${priceText}')">Add to Cart</button>
                </div>
            </div>
        </div>
    `;
    document.getElementById('product-detail-modal').style.display = 'block';
}

function closeProductModal() {
    document.getElementById('product-detail-modal').style.display = 'none';
}

function addToCartFromDetail(name, priceStr) {
    const price = parseInt(priceStr.replace(/[^0-9]/g, '')) || 0;
    addToCart(price, name);
}

function buyNow(name, priceStr) {
    const price = parseInt(priceStr.replace(/[^0-9]/g, '')) || 0;
    addToCart(price, name);
    closeProductModal();
    openCartModal();
}

function updateHeaderUI() {
    const priceElement = document.getElementById('total-price');
    const countElement = document.getElementById('cart-count');
    
    let count = cart.reduce((acc, item) => acc + item.quantity, 0);
    priceElement.innerText = 'Rs. ' + totalAmount.toLocaleString();
    countElement.innerText = count;

    // Classy Animation for badge
    countElement.classList.add('pulse-animation');
    setTimeout(() => countElement.classList.remove('pulse-animation'), 500);

    localStorage.setItem('medicareCart', JSON.stringify(cart));
    localStorage.setItem('medicareTotal', totalAmount);
}

function addToCart(price, productName) {
    const existingItem = cart.find(item => item.name === productName);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name: productName, price: price, quantity: 1 });
    }
    totalAmount += price;
    updateHeaderUI();
    showToast(`Added ${productName} to cart`);
}

function updateQuantity(index, delta) {
    const item = cart[index];
    if (delta > 0) {
        item.quantity += 1;
        totalAmount += item.price;
    } else {
        if (item.quantity > 1) {
            item.quantity -= 1;
            totalAmount -= item.price;
        } else {
            totalAmount -= item.price;
            cart.splice(index, 1);
        }
    }
    updateHeaderUI();
    openCartModal();
}

function removeFromCart(index) {
    totalAmount -= (cart[index].price * cart[index].quantity);
    cart.splice(index, 1);
    updateHeaderUI();
    if (cart.length === 0) {
        closeCartModal();
    } else {
        openCartModal();
    }
}

function openCartModal() {
    const modalItemsContainer = document.getElementById('cart-items-container');
    const modalTotalPriceElement = document.getElementById('modal-total-price');
    const modalElement = document.getElementById('cart-modal');

    modalItemsContainer.innerHTML = '';
    if (cart.length === 0) {
        modalItemsContainer.innerHTML = '<div class="empty-cart-msg"><i class="fas fa-shopping-basket"></i><p>Your cart is feeling light.</p></div>';
    } else {
        cart.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'cart-item-row';
            div.innerHTML = `
                <div style="flex-grow:1;">
                    <strong>${item.name}</strong><br>
                    <span style="color:#777; font-size:12px;">Rs. ${item.price}</span>
                </div>
                <div class="quantity-controls">
                    <button onclick="updateQuantity(${index}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity(${index}, 1)">+</button>
                </div>
                <div class="flex">
                    <span style="font-weight:600; margin-left:10px;">Rs. ${(item.price * item.quantity).toLocaleString()}</span>
                    <button class="btn-remove" onclick="removeFromCart(${index})"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;
            modalItemsContainer.appendChild(div);
        });
    }
    modalTotalPriceElement.innerText = 'Rs. ' + totalAmount.toLocaleString();
    modalElement.style.display = "block";
}

function checkoutWhatsApp() {
    if (cart.length === 0) { alert("Cart is empty"); return; }
    const phoneNumber = "923329588433"; 
    let message = "Hi Sharif Pharmacy, I want to order:\n\n";
    cart.forEach((item, i) => { 
        message += `${i + 1}. ${item.name} (Qty: ${item.quantity}) - Rs. ${(item.price * item.quantity).toLocaleString()}\n`; 
    });
    message += `\n*Total Order Amount: Rs. ${totalAmount.toLocaleString()}*`;
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
}

// --- SCROLL EFFECTS ---
const nav = document.querySelector('nav');
const backToTop = document.getElementById('backToTop');

window.onscroll = function() {
    if (window.scrollY > 50) {
        nav.classList.add('nav-shrunk');
        backToTop.classList.add('show');
    } else {
        nav.classList.remove('nav-shrunk');
        backToTop.classList.remove('show');
    }
};

backToTop.onclick = () => window.scrollTo({top: 0, behavior: 'smooth'});

function showToast(msg) {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        document.body.appendChild(toast);
    }
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function closeCartModal() { 
    document.getElementById('cart-modal').style.display = "none"; 
}

// Accordion Toggle
function toggleAccordion(element) {
    const content = element.nextElementSibling;
    const isOpen = content.classList.contains('open');
    
    // Close all accordions
    document.querySelectorAll('.accordion-content').forEach(acc => {
        acc.classList.remove('open');
        acc.style.maxHeight = null;
    });
    
    // Open clicked one if it was closed
    if (!isOpen) {
        content.classList.add('open');
        content.style.maxHeight = content.scrollHeight + "px";
    }
}



















// 1. Data: List of all your products (Make sure these match your product titles)
const medicineList = [
    "Panadol Advance", "Brufen 400mg", "Surbex Z", "Arinac Forte", "Insulin Injection",
    "First Aid Bandage", "Disprin Soluble", "Dettol Antiseptic", "CaC-1000 Plus",
    "Flagyl 400mg", "Gaviscon Syrup", "Rigix Tablet", "Augmentin 625mg",
    "Surgical Mask", "Hand Sanitizer", "Pampers Small", "Cerelac Wheat",
    "Vicks VapoRub", "Strepsils Honey", "Move Spray", "Polyfax Skin",
    "Pyodine Solution", "ORS Orange", "Voltral Emulgel", "Risek 40mg",
    "Sunny D Caps", "Softin Tablet", "Digital Thermometer", "Cotton Roll", "Glucometer Strips",
    "Dietary Supplement", "Nitrile Disposable Gloves", "Womens Multi Vitamins", "Liquid Hand Soap",
    "Gencell Collagen Peptides", "Nature's Bounty D3", "Vitamin D 1000 IU", "Physician's Daily Multi",
    "Anagrow Hair Growth Bundle", "Certeza Nebulizer", "Life-care Walker", "Toothbrush",
    "Herbiotics Collagen Powder with Biotin, Vitamin C & Vitamin D3", "Herbiotics Magnesium Glycinate 500mg",
    "Spectra Block SPF 60 PA+++", "Tracnesan cream (Tretinoin 0.05%)"
];

const searchInput = document.getElementById('global-search');
const suggestionsBox = document.getElementById('search-suggestions');

// 2. Function to show suggestions
searchInput.addEventListener('input', function() {
    const query = this.value.toLowerCase().trim();
    suggestionsBox.innerHTML = ''; // Clear old ones

    if (query.length > 0) {
        const filtered = medicineList.filter(medicine => 
            medicine.toLowerCase().includes(query)
        ).slice(0, 6); // Show top 6 matches

        if (filtered.length > 0) {
            suggestionsBox.style.display = 'block';
            filtered.forEach(item => {
                const div = document.createElement('div');
                div.className = 'suggestion-item';
                div.innerHTML = `<i class="fas fa-search"></i> ${item}`;
                div.onclick = function() {
                    searchInput.value = item;
                    suggestionsBox.style.display = 'none';
                    triggerSearch(); // Automatically go to search
                };
                suggestionsBox.appendChild(div);
            });
        } else {
            suggestionsBox.style.display = 'none';
        }
    } else {
        suggestionsBox.style.display = 'none';
    }
});

// 3. Hide suggestions when clicking outside
document.addEventListener('click', function(e) {
    if (e.target !== searchInput) {
        suggestionsBox.style.display = 'none';
    }
});
