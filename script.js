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
        const [name, price, stock, ImageFolder] = line.split(',');
        return { name, price, stock, imageFolder };
    });

    const productContainer = document.getElementById('product-container');
    const searchInput = document.getElementById('search');

    // Display products dynamically
    function displayProducts(filteredProducts) {
        productContainer.innerHTML = filteredProducts.map(p => `
            <div class="product">
                <div class="image-container">
                    <button class="nav-btn left-btn" onclick="prevImage(this, '${p.imageFolder}')">⬅️</button>
                    <img src="${p.imageFolder}/img1.jpg" alt="${p.name}" id="${p.imageFolder.replace(/\//g, '-')}-img">
                    <button class="nav-btn right-btn" onclick="nextImage(this, '${p.imageFolder}')">➡️</button>
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

// Image navigation logic
const imageIndex = {};

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

// Go to the next image
async function nextImage(button, folder) {
    if (!(folder in imageIndex)) {
        imageIndex[folder] = 1;
    }

    const imgElement = button.parentElement.querySelector('img');
    const totalImages = await getImageCount(folder);

    imageIndex[folder] = (imageIndex[folder] % totalImages) + 1;
    imgElement.src = `${folder}/img${imageIndex[folder]}.jpg`;
}

// Go to the previous image
async function prevImage(button, folder) {
    if (!(folder in imageIndex)) {
        imageIndex[folder] = 1;
    }

    const imgElement = button.parentElement.querySelector('img');
    const totalImages = await getImageCount(folder);

    imageIndex[folder] = (imageIndex[folder] - 2 + totalImages) % totalImages + 1;
    imgElement.src = `${folder}/img${imageIndex[folder]}.jpg`;
}

// Initialize the page
window.onload = () => {
    loadFeed();
    loadProducts();
};
