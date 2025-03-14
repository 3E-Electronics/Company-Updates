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
            <div class="product" onmouseover="startSlideshow('${p.imageFolder}', this)" onmouseout="stopSlideshow(this)">
                <div class="image-container">
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

// Slideshow logic on hover
const imageSlideshows = new Map();

// Get available images dynamically
async function getImageCount(folder) {
    let count = 0;
    for (let i = 1; i <= 10; i++) {
        try {
            const response = await fetch(`${folder}/img${i}.jpg`, { method: 'HEAD' });
            if (response.ok) count++;
            else break;
        } catch {
            break;
        }
    }
    return count;
}

// Start slideshow on hover
async function startSlideshow(folder, productElement) {
    if (imageSlideshows.has(productElement)) return; // Avoid duplicate slideshows

    const imageElement = productElement.querySelector('img');
    const totalImages = await getImageCount(folder);

    if (totalImages <= 1) return; // No slideshow if only one image

    let currentImage = 1;
    const interval = setInterval(() => {
        currentImage = (currentImage % totalImages) + 1;
        imageElement.src = `${folder}/img${currentImage}.jpg`;
    }, 1500); // Image change every 1.5 seconds

    imageSlideshows.set(productElement, interval);
}

// Stop slideshow on mouse out
function stopSlideshow(productElement) {
    if (imageSlideshows.has(productElement)) {
        clearInterval(imageSlideshows.get(productElement));
        imageSlideshows.delete(productElement);
    }
}

// Initialize the page
window.onload = () => {
    loadFeed();
    loadProducts();
};
