// Utility functions
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Image error handling
function handleImageError(img) {
    img.onerror = null;
    img.style.backgroundColor = 'var(--background-color)';
    console.warn(`Failed to load image: ${img.dataset.src}`);
}

// Anti-scraping measures
function addAntiScrapingProtection() {
    try {
        // Prevent right-click
        document.addEventListener('contextmenu', event => event.preventDefault());
        
        // Add content protection for large selections
        document.addEventListener('copy', (e) => {
            const selection = window.getSelection();
            if (selection.toString().length > 100) {
                e.clipboardData.setData('text/plain', 'Content from Matt Holland\'s CV. Please visit the original site.');
                e.preventDefault();
            }
        });
        
        // Detect and block headless browsers
        if (navigator.webdriver || /HeadlessChrome/.test(navigator.userAgent)) {
            document.body.innerHTML = '<h1>This content is not available in automated browsers</h1>';
        }
    } catch (error) {
        console.error('Error in anti-scraping protection:', error);
    }
}

// Print preparation function
function preparePrint() {
    try {
        // Force all sections to be visible for printing
        window.addEventListener('beforeprint', function() {
            // Make all sections visible
            document.querySelectorAll('.section').forEach(section => {
                section.classList.add('visible');
            });
            
            // Force load all lazy-loaded images
            const lazyImages = document.querySelectorAll('img[data-src]');
            const imagePromises = [];
            
            lazyImages.forEach(img => {
                if (img.dataset.src && img.src.startsWith('data:')) {
                    const promise = new Promise((resolve) => {
                        const newImg = new Image();
                        newImg.onload = () => {
                            img.src = img.dataset.src;
                            img.classList.add('image-loaded');
                            resolve();
                        };
                        newImg.onerror = () => {
                            console.warn(`Failed to load image: ${img.dataset.src}`);
                            resolve();
                        };
                        newImg.src = img.dataset.src;
                    });
                    imagePromises.push(promise);
                }
            });
            
            // Wait for all images to load or timeout after 1 second
            Promise.race([
                Promise.all(imagePromises),
                new Promise(resolve => setTimeout(resolve, 1000))
            ]).then(() => {
                // Force browser to recognize the changes
                document.body.style.display = 'none';
                setTimeout(() => document.body.style.display = '', 0);
            });
        });
    } catch (error) {
        console.error('Error in print preparation:', error);
    }
}

// Theme functionality
function initTheme() {
    try {
        const savedTheme = localStorage.getItem('theme');
        document.documentElement.setAttribute('data-theme', savedTheme || 'light');
        if (!savedTheme) localStorage.setItem('theme', 'light');
    } catch (error) {
        document.documentElement.setAttribute('data-theme', 'light');
    }
}

function toggleTheme() {
    try {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    } catch (error) {
        console.error('Error toggling theme:', error);
    }
}

// Lazy load images
const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            try {
                const img = entry.target;
                const newImage = new Image();
                newImage.onload = () => {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    img.classList.add('image-loaded');
                };
                newImage.onerror = () => handleImageError(img);
                newImage.src = img.dataset.src;
                observer.unobserve(img);
            } catch (error) {
                console.error('Error lazy loading image:', error);
            }
        }
    });
}, {
    rootMargin: '100px',
    threshold: 0.1
});

// Car animation variables
let isScrolling = false;
let ticking = false;

// Handle scroll end
function handleScrollEnd() {
    isScrolling = false;
    const car = document.querySelector(".car img");
    if (car) car.src = "Car.webp";
}

// Update car position based on scroll
function updateCarPosition() {
    try {
        const car = document.querySelector(".car");
        if (!car) return;
        
        const scrollTop = window.scrollY;
        const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercentage = scrollTop / documentHeight;
        
        const carStartPosition = 10;
        const carEndPosition = 90;
        const carCurrentPosition = carStartPosition + (carEndPosition - carStartPosition) * scrollPercentage;
        
        car.style.transform = `translate3d(0, ${carCurrentPosition}vh, 0)`;
        
        // Change to headlights version during scroll
        const carImg = car.querySelector("img");
        if (carImg) {
            if (isScrolling) {
                carImg.src = "CarHeadlights.webp";
            } else {
                carImg.src = "Car.webp";
            }
        }
    } catch (error) {
        console.error('Error updating car position:', error);
    }
}

// Handle scroll with improved performance
const handleScroll = throttle(() => {
    isScrolling = true;
    
    if (!ticking) {
        window.requestAnimationFrame(() => {
            updateCarPosition();
            ticking = false;
        });
        
        ticking = true;
    }

    clearTimeout(window.scrollEndTimer);
    window.scrollEndTimer = setTimeout(handleScrollEnd, 50);
}, 20);

// Make car draggable for scrolling
function initDraggableCar() {
    const car = document.querySelector('.car');
    if (!car) return;
    
    let isDragging = false;
    let startY = 0;
    let startScrollY = 0;
    let lastScrollTop = 0;
    
    // Calculate how much to scroll based on car drag
    function calculateScroll(currentY) {
        const deltaY = currentY - startY;
        const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollFactor = 2; // Adjust this to control scroll speed
        
        // Calculate new scroll position
        const newScrollY = startScrollY + (deltaY * scrollFactor);
        
        // Clamp scroll position between 0 and document height
        return Math.max(0, Math.min(documentHeight, newScrollY));
    }
    
    // Handle mouse/touch down
    function handleDragStart(e) {
        isDragging = true;
        car.classList.add('dragging');
        
        // Get starting position
        startY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        startScrollY = window.scrollY;
        
        // Change car image to headlights version
        const carImg = car.querySelector('img');
        if (carImg) carImg.src = "CarHeadlights.webp";
        
        // Prevent default behavior
        e.preventDefault();
    }
    
    // Handle mouse/touch move
    function handleDragMove(e) {
        if (!isDragging) return;
        
        // Get current position
        const currentY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        
        // Calculate and set new scroll position
        const newScrollY = calculateScroll(currentY);
        window.scrollTo({
            top: newScrollY,
            behavior: 'auto' // Use 'auto' for immediate response
        });
        
        // Update car position manually to avoid lag
        updateCarPosition();
        
        // Determine scroll direction for headlights
        isScrolling = true;
        
        // Prevent default behavior
        e.preventDefault();
    }
    
    // Handle mouse/touch up
    function handleDragEnd(e) {
        if (!isDragging) return;
        
        isDragging = false;
        car.classList.remove('dragging');
        
        // Change car image back to normal version
        setTimeout(() => {
            const carImg = car.querySelector('img');
            if (carImg) carImg.src = "Car.webp";
            isScrolling = false;
        }, 100);
        
        // Prevent default behavior
        e.preventDefault();
    }
    
    // Add event listeners for mouse
    car.addEventListener('mousedown', handleDragStart);
    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleDragEnd);
    
    // Add event listeners for touch
    car.addEventListener('touchstart', handleDragStart, { passive: false });
    window.addEventListener('touchmove', handleDragMove, { passive: false });
    window.addEventListener('touchend', handleDragEnd);
    window.addEventListener('touchcancel', handleDragEnd);
}

// Cleanup function
function cleanup() {
    if (imageObserver) imageObserver.disconnect();
    window.removeEventListener("scroll", handleScroll);
}

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", function() {
    try {
        // Initialize theme
        initTheme();
        
        // Set up theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
        
        // Set up section animations
        const sections = document.querySelectorAll(".section");
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        sections.forEach(section => observer.observe(section));
        
        // Set up lazy loading
        document.querySelectorAll('img[data-src]').forEach(img => {
            img.classList.add('image-loading');
            imageObserver.observe(img);
        });
        
        // Add anti-scraping protection
        addAntiScrapingProtection();
        
        // Add print preparation
        preparePrint();
        
        // Initialize draggable car
        initDraggableCar();
        
        // Update car position initially
        updateCarPosition();
        
        // Preload car headlights image
        new Image().src = "CarHeadlights.webp";
    } catch (error) {
        console.error('Error initializing page:', error);
    }
});

// Add event listeners
window.addEventListener("scroll", handleScroll, { passive: true });
window.addEventListener('unload', cleanup);
