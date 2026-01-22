let cart = JSON.parse(localStorage.getItem('medicareCart')) || [];
let totalAmount = parseInt(localStorage.getItem('medicareTotal')) || 0;

window.onload = function() {
    updateHeaderUI();
};

// SEARCH FUNCTION - Trigger search when clicking icon or pressing Enter
function triggerSearch() {
    const searchInput = document.getElementById('global-search');
    const searchTerm = searchInput ? searchInput.value.trim() : '';
    
    console.log('Search triggered with term:', searchTerm); // Debug log
    
    if (searchTerm) {
        window.location.href = `products.html?search=${encodeURIComponent(searchTerm)}`;
    } else {
        alert('Please enter a medicine name to search');
    }
}

// Handle Enter key press
function handleGlobalSearch(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        triggerSearch();
    }
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

function openCartModal() {
    const modalItemsContainer = document.getElementById('cart-items-container');
    const modalTotalPriceElement = document.getElementById('modal-total-price');
    const modalElement = document.getElementById('cart-modal');

    if (cart.length === 0) {
        modalItemsContainer.innerHTML = '<div class="empty-cart-msg"><i class="fas fa-shopping-basket"></i><p>Your cart is feeling light.</p></div>';
    } else {
        modalItemsContainer.innerHTML = ''; 
        cart.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'cart-item-row';
            div.innerHTML = `
                <div style="flex-grow:1;">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">Rs. ${item.price}</div>
                </div>
                <div class="quantity-controls">
                    <button onclick="updateQuantity(${index}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity(${index}, 1)">+</button>
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
    const toast = document.getElementById('toast');
    toast.innerText = msg;
    toast.className = "show";
    setTimeout(() => toast.className = "", 3000);
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
    "Sunny D Caps", "Softin Tablet", "Digital Thermometer", "Cotton Roll", "Glucometer Strips"
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