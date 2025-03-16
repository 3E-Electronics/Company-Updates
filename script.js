// Load Feeds from CSV
async function loadFeed() {
    try {
        const response = await fetch('feeds.csv');
        const feedText = await response.text();

        const feedContainer = document.getElementById('feed-container');
        const feedItems = feedText.trim().split('\n').slice(1).reverse(); // Skip header & reverse for recent feeds

        // Create feed HTML dynamically
        feedContainer.innerHTML = feedItems.map(item => {
            const [date, message, image] = item.split(',');
            return `
                <div class="feed-item">
                    <strong>${date}</strong> - ${message}
                    ${image ? `<br><img src="${image.trim()}" alt="Feed Image" class="feed-image">` : ''}
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading feed:', error);
        document.getElementById('feed-container').innerHTML = `<p>Failed to load feeds.</p>`;
    }
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
        clearInterval(imageSlideshows.get(productElement)); // Stop the interval
        imageSlideshows.delete(productElement); // Remove reference from the map

        // Reset the image back to the default first image
        const imageElement = productElement.querySelector('img');
        const imageFolder = productElement.querySelector('.image-container img').src.split('/img')[0];
        imageElement.src = `${imageFolder}/img1.jpg`;
    }
}

// Initialize the page
window.onload = () => {
    loadFeed();    // Load feeds on page load
    loadProducts(); // Load products on page load
};
