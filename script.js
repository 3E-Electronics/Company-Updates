// Load Feed Updates
async function loadFeed() {
    const response = await fetch('feed.txt');
    const feedData = await response.text();
    const feedContainer = document.getElementById('feed-container');
    const feedItems = feedData.trim().split('\n').reverse();

    // Display latest 4 items
    feedContainer.innerHTML = feedItems.slice(0, 4).map(item => {
        const now = new Date();
        now.setHours(now.getHours() + 5, now.getMinutes() + 30);
        return `<div class="feed-item"><strong>${now.toISOString().split('T')[0]}</strong> - ${item}</div>`;
    }).join('');
}

// Load Products from CSV
async function loadProducts() {
    const response = await fetch('products.csv');
    const csvText = await response.text();
    const products = csvText.trim().split('\n').slice(1).map(line => {
        const [name, price, stock, imageFolder] = line.split(',');
        return { name, price, stock, imageFolder };
    });

    const productContainer = document.getElementById('product-container');
    const searchInput = document.getElementById('search');

    function displayProducts(filteredProducts) {
        productContainer.innerHTML = filteredProducts.map(p => `
            <div class="product">
                <div class="image-container" 
                    onmouseover="startSlide(this)" 
                    onmouseout="stopSlide(this)" 
                    data-folder="${p.imageFolder}">
                    <img src="${p.imageFolder}/img1.jpg" alt="${p.name}">
                </div>
                <h4>${p.name}</h4>
                <p>Price: ₹${p.price}</p>
                <p>Stock: ${p.stock}</p>
            </div>
        `).join('');
    }

    displayProducts(products);

    // Search Function
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        const filtered = products.filter(p => p.name.toLowerCase().includes(query));
        displayProducts(filtered);
    });
}

// Dynamically Detect Images for Hover
let slideTimers = {};

async function startSlide(container) {
    const folder = container.dataset.folder;

    // Check for images in the folder dynamically
    let imageCount = 0;
    for (let i = 1; i <= 20; i++) {
        try {
            const imageCheck = await fetch(`${folder}/img${i}.jpg`, { method: 'HEAD' });
            if (imageCheck.ok) imageCount++;
            else break; // No more images found
        } catch {
            break; // Handle errors silently
        }
    }

    // Only start slideshow if there are multiple images
    if (imageCount <= 1) return;

    let index = 1;
    slideTimers[folder] = setInterval(() => {
        index = (index % imageCount) + 1;
        container.querySelector('img').src = `${folder}/img${index}.jpg`;
    }, 2000);
}

// Stop the slideshow when mouse leaves
function stopSlide(container) {
    clearInterval(slideTimers[container.dataset.folder]);
}

// Initialize the website on load
window.onload = () => {
    loadFeed();
    loadProducts();
};
