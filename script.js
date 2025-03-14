// Load Feed Updates
async function loadFeed() {
    const response = await fetch('feed.txt');
    const feedData = await response.text();
    const feedContainer = document.getElementById('feed-container');
    const feedItems = feedData.trim().split('\n').reverse();

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

    // Display products dynamically
    function displayProducts(filteredProducts) {
        productContainer.innerHTML = filteredProducts.map(p => `
            <div class="product">
                <div class="image-container" 
                     onmouseover="startSlide(this, '${p.imageFolder}')" 
                     onmouseout="stopSlide(this)">
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

// Hover Logic - Dynamic Image Slideshow
let slideTimers = {};

async function startSlide(container, folder) {
    try {
        // Dynamically count available images
        let imageCount = 0;
        for (let i = 1; i <= 10; i++) {
            const imageCheck = await fetch(`${folder}/img${i}.jpg`, { method: 'HEAD' });
            if (imageCheck.ok) imageCount++;
            else break;
        }

        // If only one image, do not start slideshow
        if (imageCount <= 1) return;

        let index = 1;
        slideTimers[folder] = setInterval(() => {
            index = (index % imageCount) + 1;
            container.querySelector('img').src = `${folder}/img${index}.jpg`;
        }, 2000);

    } catch (error) {
        console.error('Error loading images:', error);
    }
}

// Stop slideshow when mouse leaves
function stopSlide(container) {
    const folder = container.dataset.folder;
    if (folder && slideTimers[folder]) {
        clearInterval(slideTimers[folder]);
    }
}

// Initialize the page
window.onload = () => {
    loadFeed();
    loadProducts();
};
