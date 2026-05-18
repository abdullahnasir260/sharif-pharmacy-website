// ==========================================
// 1. STATE MANAGEMENT & DATABASE
// ==========================================
let cart = JSON.parse(localStorage.getItem('medicareCart')) || [];
let totalAmount = parseInt(localStorage.getItem('medicareTotal')) || 0;

const priceElement = document.getElementById('total-price');
const countElement = document.getElementById('cart-count');
const toastElement = document.getElementById('toast');
const modalElement = document.getElementById('cart-modal');
const modalItemsContainer = document.getElementById('cart-items-container');
const modalTotalPriceElement = document.getElementById('modal-total-price');

// Database for Search Suggestions (200 Items)
const medicineList = [
    "Panadol Advance", "Panadol Extra", "Panadol CF", "Brufen 400mg", "Brufen Syrup", "Risek 20mg", "Risek 40mg", "Augmentin 625mg", "Augmentin 1g", "Augmentin Syrup", "Flagyl 400mg", "Flagyl Syrup", "Entamizole", "Entamizole DS", "Arinac Forte", "Arinac Syrup", "Kestine 10mg", "Softin Tablet", "Softin Syrup", "Rigix Tablet", "Rigix Drop", "Solvin Syrup", "Hydryllin Syrup", "Hydryllin Sugar Free", "Cac-1000 Gold", "Surbex Z", "Theragran-H", "Sangobion", "Fefol Vit", "Disprin Soluble", "Loprin 75mg", "Ascard 75mg", "Zantac 150mg", "Gravinate Tablet", "Gravinate Syrup", "Avil Tablet", "Avil Syrup", "Amoxil 250mg", "Amoxil 500mg", "Velosef 250mg", "Velosef 500mg", "Gaviscon Syrup", "Gaviscon Advance", "Septran DS", "Metodine", "Ponstan Forte", "Ponstan Syrup", "Calpol Syrup", "T-Day Tablet", "Fexo 120mg", "Fexo 180mg", "Montika 5mg", "Montika 10mg", "Getryl 2mg", "Getryl 4mg", "Glucophage 500mg", "Glucophage 850mg", "Daonil", "Jardiance 10mg", "Lipiget 10mg", "Lipiget 20mg", "Sifrol", "Lexotanil 3mg", "Xanax 0.5mg", "Inderal 10mg", "Voren 50mg", "Dicloran 50mg", "Nimesulide", "Synflex", "Xynosine Spray",
    "Pampers Small", "Pampers Medium", "Pampers Large", "Pampers XL", "Molfix S", "Molfix M", "Molfix L", "Canbebe S", "Canbebe M", "Canbebe L", "Lactogen 1", "Lactogen 2", "Lactogen 3", "Meiji BF-1", "Meiji BF-2", "Nan Pro 1", "Nan Pro 2", "Cerelac Rice", "Cerelac Wheat", "Cerelac 3 Fruits", "Woodwards Gripe Water", "Hamdard Naunehal", "Johnson Baby Soap", "Johnson Baby Powder", "Johnson Baby Oil", "Johnson Baby Shampoo", "Johnson Baby Lotion", "Pigeon Baby Wipes", "Mothercare Wipes", "Desitin Ointment", "Sudocrem 60g", "Sudocrem 125g", "Aveeno Baby", "Sebamed Baby", "Baby Feeder Standard", "Pigeon Feeder", "Avent Feeder", "Nuk Pacifier", "Baby Teether", "Cooling Gel Patch", "Bonnisan Syrup", "Digas Syrup", "Colic Aid Drops", "Baby Nail Cutter", "Baby Hair Brush", "Formula Dispenser", "Bottle Sterilizer", "Baby Bath Tub", "Baby Potty Seat", "Baby Cotton Buds",
    "Sensodyne Rapid Relief", "Sensodyne Multi Action", "Colgate Max Fresh", "Colgate Total", "Listerine Cool Mint", "Listerine Green Tea", "Gillette Blue II", "Gillette Mach 3", "Gillette Shaving Foam", "Lifebuoy Soap", "Lifebuoy Handwash", "Dettol Soap", "Dettol Handwash", "Dettol Liquid 250ml", "Safeguard Soap", "Lux Soap", "Sunsilk Shampoo", "Dove Shampoo", "Dove Conditioner", "Pantene Shampoo", "Head & Shoulders", "Clear Men Shampoo", "Nivea Cream", "Nivea Lotion", "Fair & Lovely", "Ponds Face Wash", "Garnier Face Wash", "Clean & Clear", "Strepsils Honey", "Strepsils Orange", "Vicks VapoRub", "Vicks Inhaler", "Polyfax Skin", "Polyfax Eye", "Pyodine Solution", "Pyodine Scrub", "Dermovate Cream", "Betnovate Cream", "Quench Cream", "Hydrozole",
    "Omron BP M2", "Omron BP M3", "Beurer BP Monitor", "Accu-Chek Guide Strips", "Accu-Chek Active Strips", "On Call Plus Strips", "Glucometer Device", "Digital Thermometer", "Infrared Gun Thermometer", "Beurer Nebulizer", "Philips Nebulizer", "Hot Water Bottle", "Ice Bag", "Surgical Mask 50pc", "KN95 Mask", "Examination Gloves", "Cotton Roll 200g", "Crepe Bandage 4 inch", "Crepe Bandage 6 inch", "Surgical Tape", "First Aid Box", "Stethoscope", "Weight Scale Digital", "Weight Scale Manual", "Wheelchair Standard", "Walking Stick", "Commode Chair", "Pulse Oximeter", "Air Mattress", "Oxygen Cylinder Portable"
];

const PRODUCT_INFO = {
    "Panadol Advance": { usage: "1-2 tablets for fever/pain. Max 8 daily.", features: ["Original GSK", "Fast Relief"], img: "Panadol" },
    "Risek 40mg": { usage: "1 capsule daily before breakfast.", features: ["Best for Acidity", "Getz Pharma"], img: "Risek" },
    "Omron BP M2": { usage: "Automatic measurement on upper arm.", features: ["Japanese Tech", "5 Year Warranty"], img: "Omron" },
    "Lactogen 1": { usage: "Mix 1 scoop in 30ml water.", features: ["Nestle Quality", "From 0-6 months"], img: "Lactogen" }
};

// ==========================================
// 2. LIFECYCLE & INITIALIZATION
// ==========================================
let currentVisibleItems = 12; 

window.onload = function() {
    updateHeaderUI();
    checkURLSearch();
    initLoadMore();
    initProductCardClicks();
};

function initProductCardClicks() {
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', function(event) {
            if (event.target.closest('button') || event.target.closest('a')) return;
            const titleElement = card.querySelector('.prod-title');
            if (titleElement) openProductDetail(titleElement.innerText.trim());
        });
    });
}

function checkURLSearch() {
    const urlParams = new URLSearchParams(window.location.search);
    const searchTerm = urlParams.get('search');
    if (searchTerm) {
        const searchInput = document.getElementById('global-search');
        if (searchInput) {
            searchInput.value = searchTerm;
            performSearch();
        }
    }
}

// ==========================================
// 3. PRODUCT DETAIL MODAL LOGIC
// ==========================================
function openProductDetail(name) {
    const data = PRODUCT_INFO[name] || {
        usage: "Take as prescribed by a healthcare professional. Store in a cool, dry place.",
        features: ["100% Genuine Product", "High Quality Standards", "Pharmacist Approved"],
        img: "Med"
    };

    const cards = document.querySelectorAll('.product-card');
    let priceText = "Rs. 0";
    cards.forEach(card => {
        if (card.querySelector('.prod-title').innerText.includes(name)) {
            priceText = card.querySelector('.price').innerText;
        }
    });

    const modalBody = document.getElementById('detail-modal-body');
    modalBody.innerHTML = `
        <div class="detail-grid">
            <div class="detail-img-box">
                <img src="https://placehold.co/300x300?text=${name.split(' ')[0]}" alt="${name}">
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

function closeProductModal() { document.getElementById('product-detail-modal').style.display = 'none'; }

function addToCartFromDetail(name, priceStr) {
    const price = parseInt(priceStr.replace(/[^0-9]/g, ''));
    addToCart(price, name);
}

function buyNow(name, priceStr) {
    const price = parseInt(priceStr.replace(/[^0-9]/g, ''));
    addToCart(price, name);
    closeProductModal();
    openCartModal();
}

// ==========================================
// 4. SEARCH & SUGGESTIONS LOGIC
// ==========================================
function performSearch() {
    const input = document.getElementById('global-search').value.toLowerCase().trim();
    const productCards = document.querySelectorAll('.product-card');
    const noResults = document.getElementById('no-results');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    let foundAny = false;

    productCards.forEach(card => {
        const title = card.querySelector('.prod-title').innerText.toLowerCase();
        card.classList.remove('hidden-product'); // Show filtered items
        if (input === '' || title.includes(input)) {
            card.style.display = "flex";
            foundAny = true;
        } else {
            card.style.display = "none";
        }
    });

    if (noResults) noResults.style.display = (input !== '' && !foundAny) ? "block" : "none";
    if (loadMoreBtn) loadMoreBtn.style.display = (input !== '') ? 'none' : 'inline-flex';
}

function handleGlobalSearch(event) { performSearch(); }
function triggerSearch() { performSearch(); }

const searchInput = document.getElementById('global-search');
const suggestionsBox = document.getElementById('search-suggestions');

if (searchInput) {
    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        suggestionsBox.innerHTML = '';
        if (query.length > 0) {
            const filtered = medicineList.filter(m => m.toLowerCase().includes(query)).slice(0, 6);
            if (filtered.length > 0) {
                suggestionsBox.style.display = 'block';
                filtered.forEach(item => {
                    const div = document.createElement('div');
                    div.className = 'suggestion-item';
                    div.innerHTML = `<i class="fas fa-search"></i> ${item}`;
                    div.onclick = function() {
                        searchInput.value = item;
                        suggestionsBox.style.display = 'none';
                        performSearch();
                    };
                    suggestionsBox.appendChild(div);
                });
            } else { suggestionsBox.style.display = 'none'; }
        } else { suggestionsBox.style.display = 'none'; }
    });
}

// ==========================================
// 5. CART MANAGEMENT
// ==========================================
function updateHeaderUI() {
    let totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if(priceElement) priceElement.innerText = 'Rs. ' + totalAmount.toLocaleString();
    if(countElement) countElement.innerText = totalItems;
    if(modalTotalPriceElement) modalTotalPriceElement.innerText = 'Rs. ' + totalAmount.toLocaleString();
    
    localStorage.setItem('medicareCart', JSON.stringify(cart));
    localStorage.setItem('medicareTotal', totalAmount);
}

function addToCart(price, productName) {
    const existingItem = cart.find(item => item.name === productName);
    if (existingItem) { existingItem.quantity += 1; } 
    else { cart.push({ name: productName, price: price, quantity: 1 }); }
    totalAmount += price;
    updateHeaderUI();
    showToast(`Added ${productName} to cart`);
}

function updateQuantity(index, delta) {
    const item = cart[index];
    if (delta > 0) { item.quantity += 1; totalAmount += item.price; } 
    else {
        if (item.quantity > 1) { item.quantity -= 1; totalAmount -= item.price; } 
        else { totalAmount -= item.price; cart.splice(index, 1); }
    }
    updateHeaderUI();
    openCartModal();
}

function removeFromCart(index) {
    totalAmount -= (cart[index].price * cart[index].quantity);
    cart.splice(index, 1);
    updateHeaderUI();
    openCartModal();
}

function openCartModal() {
    modalItemsContainer.innerHTML = ''; 
    if (cart.length === 0) {
        modalItemsContainer.innerHTML = '<p style="color:#777; text-align:center; padding:20px;">Your cart is empty.</p>';
    } else {
        cart.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'cart-item-row';
            div.innerHTML = `
                <div style="flex-grow:1;"><strong>${item.name}</strong><br><span style="color:#777; font-size:12px;">Rs. ${item.price}</span></div>
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
    modalElement.style.display = "block";
}

// ==========================================
// 6. FILTER, SORT & LOAD MORE
// ==========================================
function filterCategory(category) {
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    if(event) event.target.classList.add('active');

    const cards = document.querySelectorAll('.product-card');
    const loadMoreBtn = document.getElementById('loadMoreBtn');

    cards.forEach(card => {
        const itemCat = card.getAttribute('data-category');
        card.classList.remove('hidden-product'); 
        if (category === 'all' || itemCat === category) { card.style.display = "flex"; } 
        else { card.style.display = "none"; }
    });

    if (loadMoreBtn) loadMoreBtn.style.display = (category === 'all') ? 'inline-flex' : 'none';
    if (category === 'all') initLoadMore();
}

function sortProducts() {
    const sortBy = document.getElementById('priceSort').value;
    const grid = document.getElementById('productGrid');
    const cards = Array.from(grid.querySelectorAll('.product-card'));
    if (sortBy === 'default') return;

    cards.sort((a, b) => {
        const priceA = parseInt(a.getAttribute('data-price'));
        const priceB = parseInt(b.getAttribute('data-price'));
        return sortBy === 'low' ? priceA - priceB : priceB - priceA;
    });

    grid.innerHTML = "";
    cards.forEach(card => grid.appendChild(card));
}

function initLoadMore() {
    const cards = document.querySelectorAll('.product-card');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    cards.forEach((card, index) => {
        if (index >= currentVisibleItems) { card.classList.add('hidden-product'); } 
        else { card.classList.remove('hidden-product'); }
    });
    if (loadMoreBtn) loadMoreBtn.style.display = (currentVisibleItems >= cards.length) ? 'none' : 'inline-flex';
}

function loadMore() {
    currentVisibleItems += 12;
    initLoadMore();
}

// ==========================================
// 7. UTILS & UI EFFECTS
// ==========================================
function showToast(message) {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        document.body.appendChild(toast);
    }
    toast.innerText = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function closeCartModal() { modalElement.style.display = "none"; }

window.onclick = function(event) { 
    if (event.target == modalElement) modalElement.style.display = "none";
    if (event.target == document.getElementById('product-detail-modal')) closeProductModal();
    if (event.target !== searchInput) suggestionsBox.style.display = 'none';
};

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

// Scroll Effects
const nav = document.querySelector('nav');
const backToTop = document.getElementById('backToTop');
window.onscroll = function() {
    if (window.scrollY > 50) {
        if(nav) nav.classList.add('nav-shrunk');
        if(backToTop) backToTop.classList.add('show');
    } else {
        if(nav) nav.classList.remove('nav-shrunk');
        if(backToTop) backToTop.classList.remove('show');
    }
};
if(backToTop) backToTop.onclick = () => window.scrollTo({top: 0, behavior: 'smooth'});
