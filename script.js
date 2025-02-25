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
    // Limit error details in production
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.warn(`Failed to load image: ${img.dataset.src}`);
    } else {
        console.warn('Image loading failed');
    }
}

// Anti-scraping measures with improved security
function addAntiScrapingProtection() {
    try {
        // Prevent right-click except for search engine crawlers
        document.addEventListener('contextmenu', event => {
            // Allow legitimate crawlers
            const userAgent = navigator.userAgent.toLowerCase();
            const isCrawler = /googlebot|bingbot|yandexbot|slurp|duckduckbot/i.test(userAgent);
            
            if (!isCrawler) {
                event.preventDefault();
            }
        });
        
        // Add content protection for large selections
        document.addEventListener('copy', (e) => {
            const selection = window.getSelection();
            if (selection.toString().length > 100) {
                // Add attribution but don't completely block copying
                const originalText = selection.toString();
                const attributedText = originalText + '\n\nSource: Matt Holland\'s CV - https://matthollandcv.com';
                e.clipboardData.setData('text/plain', attributedText);
                e.preventDefault();
            }
        });
        
        // More robust headless browser detection
        const isHeadless = (
            navigator.webdriver || 
            /HeadlessChrome/.test(navigator.userAgent) ||
            window.navigator.plugins.length === 0 ||
            window.navigator.languages.length === 0 ||
            (window.callPhantom || window._phantom || window.phantom)
        );
        
        const isCrawler = /googlebot|bingbot|yandexbot|slurp|duckduckbot/i.test(navigator.userAgent.toLowerCase());
        
        if (isHeadless && !isCrawler) {
            // Use a safer approach than innerHTML
            const headlessMessage = document.createElement('h1');
            headlessMessage.textContent = 'This content is not available in automated browsers';
            
            document.body.innerHTML = '';
            document.body.appendChild(headlessMessage);
        }
    } catch (error) {
        // Limit error details in production
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.error('Error in anti-scraping protection:', error);
        } else {
            console.error('Error in protection features');
        }
    }
}

// Print preparation function with improved reliability
function preparePrint() {
    try {
        let printPreparationComplete = false;
        
        // Force all sections to be visible for printing
        window.addEventListener('beforeprint', function(event) {
            // If we're already prepared, don't do it again
            if (printPreparationComplete) return;
            
            // In some browsers, we can delay the print dialog
            if (event.preventDefault) {
                event.preventDefault();
            }
            
            // Make all sections visible
            document.querySelectorAll('.section').forEach(section => {
                section.classList.add('visible');
            });
            
            // Force load ALL lazy-loaded images, especially company logos
            const lazyImages = document.querySelectorAll('img[data-src]');
            const imagePromises = [];
            
            lazyImages.forEach(img => {
                if (img.dataset.src) {
                    // Create a promise for each image load
                    const promise = new Promise((resolve) => {
                        // Create a new image to preload
                        const newImg = new Image();
                        
                        newImg.onload = () => {
                            // Replace the placeholder with the actual image
                            img.src = img.dataset.src;
                            img.classList.add('image-loaded');
                            img.classList.remove('image-loading');
                            resolve();
                        };
                        
                        newImg.onerror = () => {
                            // Limit error details in production
                            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                                console.warn(`Failed to load image for printing: ${img.dataset.src}`);
                            }
                            // Still resolve to not block printing
                            resolve();
                        };
                        
                        // Start loading the image
                        newImg.src = img.dataset.src;
                    });
                    
                    imagePromises.push(promise);
                }
            });
            
            // Wait for all images to load or timeout after 2 seconds
            Promise.race([
                Promise.all(imagePromises),
                new Promise(resolve => setTimeout(resolve, 2000))
            ]).then(() => {
                // Force browser to recognize the changes
                document.body.style.display = 'none';
                setTimeout(() => {
                    document.body.style.display = '';
                    printPreparationComplete = true;
                    
                    // Now trigger the print dialog if we prevented it
                    if (event.preventDefault) {
                        window.print();
                    }
                }, 50);
            });
        });
        
        // After print, restore the original behavior
        window.addEventListener('afterprint', function() {
            printPreparationComplete = false;
            
            // Re-initialize the intersection observers for sections that weren't visible
            const sections = document.querySelectorAll(".section:not(.visible)");
            const observer = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });
            
            sections.forEach(section => observer.observe(section));
        });
    } catch (error) {
        // Limit error details in production
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.error('Error in print preparation:', error);
        } else {
            console.error('Error preparing for print');
        }
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
        // Limit error details in production
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.error('Error initializing theme:', error);
        }
    }
}

function toggleTheme() {
    try {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    } catch (error) {
        // Limit error details in production
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.error('Error toggling theme:', error);
        } else {
            console.error('Error changing theme');
        }
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
                // Limit error details in production
                if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                    console.error('Error lazy loading image:', error);
                } else {
                    console.error('Error loading image');
                }
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
        // Limit error details in production
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.error('Error updating car position:', error);
        }
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

// Store event listeners for proper cleanup
const eventListeners = {
    carDrag: {
        mousedown: null,
        mousemove: null,
        mouseup: null,
        touchstart: null,
        touchmove: null,
        touchend: null,
        touchcancel: null
    },
    scroll: handleScroll
};

// Make car draggable for scrolling
function initDraggableCar() {
    const car = document.querySelector('.car');
    if (!car) return;
    
    let isDragging = false;
    let startY = 0;
    let startScrollY = 0;
    
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
        
        // Prevent default behavior if it's a touch event
        if (e.type.includes('touch')) {
            e.preventDefault();
        }
    }
    
    // Store event listeners for cleanup
    eventListeners.carDrag.mousedown = handleDragStart;
    eventListeners.carDrag.mousemove = handleDragMove;
    eventListeners.carDrag.mouseup = handleDragEnd;
    eventListeners.carDrag.touchstart = handleDragStart;
    eventListeners.carDrag.touchmove = handleDragMove;
    eventListeners.carDrag.touchend = handleDragEnd;
    eventListeners.carDrag.touchcancel = handleDragEnd;
    
    // Add event listeners for mouse
    car.addEventListener('mousedown', eventListeners.carDrag.mousedown);
    window.addEventListener('mousemove', eventListeners.carDrag.mousemove);
    window.addEventListener('mouseup', eventListeners.carDrag.mouseup);
    
    // Add event listeners for touch
    car.addEventListener('touchstart', eventListeners.carDrag.touchstart, { passive: false });
    window.addEventListener('touchmove', eventListeners.carDrag.touchmove, { passive: false });
    window.addEventListener('touchend', eventListeners.carDrag.touchend);
    window.addEventListener('touchcancel', eventListeners.carDrag.touchcancel);
}

// Improved cleanup function to prevent memory leaks
function cleanup() {
    try {
        // Disconnect observers
        if (imageObserver) imageObserver.disconnect();
        
        // Remove scroll event listener
        window.removeEventListener("scroll", eventListeners.scroll);
        
        // Remove car drag event listeners
        const car = document.querySelector('.car');
        if (car && eventListeners.carDrag.mousedown) {
            car.removeEventListener('mousedown', eventListeners.carDrag.mousedown);
            car.removeEventListener('touchstart', eventListeners.carDrag.touchstart);
        }
        
        if (eventListeners.carDrag.mousemove) {
            window.removeEventListener('mousemove', eventListeners.carDrag.mousemove);
            window.removeEventListener('touchmove', eventListeners.carDrag.touchmove);
        }
        
        if (eventListeners.carDrag.mouseup) {
            window.removeEventListener('mouseup', eventListeners.carDrag.mouseup);
            window.removeEventListener('touchend', eventListeners.carDrag.touchend);
            window.removeEventListener('touchcancel', eventListeners.carDrag.touchcancel);
        }
        
        // Clear any remaining timeouts
        clearTimeout(window.scrollEndTimer);
    } catch (error) {
        // Limit error details in production
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.error('Error during cleanup:', error);
        }
    }
}

// Add print button to the page with improved security
function addPrintButton() {
    try {
        const printButton = document.createElement('button');
        printButton.className = 'print-button';
        printButton.setAttribute('aria-label', 'Print CV');
        printButton.setAttribute('title', 'Print CV');
        
        // Create printer icon SVG
        printButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M19 8h-2V5H7v3H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zM8 5h8v3H8V5zm8 14H8v-7h8v7zm2-4v-2h2v2h-2zm-1-9H7V7h10v-1z"/>
            </svg>
        `;
        
        // Add click event to trigger print with manual preparation
        printButton.addEventListener('click', function() {
            // Create loading indicator with safe DOM methods
            const loadingIndicator = document.createElement('div');
            Object.assign(loadingIndicator.style, {
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'rgba(255, 255, 255, 0.9)',
                padding: '20px',
                borderRadius: '5px',
                boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
                zIndex: '9999'
            });
            
            // Use textContent instead of innerHTML for security
            loadingIndicator.textContent = 'Preparing CV for printing...';
            document.body.appendChild(loadingIndicator);
            
            // Make all sections visible
            document.querySelectorAll('.section').forEach(section => {
                section.classList.add('visible');
            });
            
            // Force load all lazy-loaded images
            const lazyImages = document.querySelectorAll('img[data-src]');
            const imagePromises = [];
            
            lazyImages.forEach(img => {
                if (img.dataset.src) {
                    const promise = new Promise((resolve) => {
                        const newImg = new Image();
                        newImg.onload = () => {
                            img.src = img.dataset.src;
                            img.classList.add('image-loaded');
                            img.classList.remove('image-loading');
                            resolve();
                        };
                        newImg.onerror = () => {
                            // Limit error details in production
                            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                                console.warn(`Failed to load image: ${img.dataset.src}`);
                            }
                            resolve();
                        };
                        newImg.src = img.dataset.src;
                    });
                    imagePromises.push(promise);
                }
            });
            
            // Wait for all images to load or timeout after 2 seconds
            Promise.race([
                Promise.all(imagePromises),
                new Promise(resolve => setTimeout(resolve, 2000))
            ]).then(() => {
                try {
                    // Remove loading indicator safely
                    if (document.body.contains(loadingIndicator)) {
                        document.body.removeChild(loadingIndicator);
                    }
                    
                    // Force browser to recognize the changes
                    document.body.style.display = 'none';
                    setTimeout(() => {
                        document.body.style.display = '';
                        
                        // Trigger the print dialog after a short delay
                        setTimeout(() => {
                            window.print();
                        }, 100);
                    }, 50);
                } catch (error) {
                    // Cleanup in case of error
                    if (document.body.contains(loadingIndicator)) {
                        document.body.removeChild(loadingIndicator);
                    }
                    // Limit error details in production
                    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                        console.error('Error finalizing print preparation:', error);
                    }
                    // Still try to print
                    window.print();
                }
            });
        });
        
        // Add button to the body
        document.body.appendChild(printButton);
    } catch (error) {
        // Limit error details in production
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.error('Error adding print button:', error);
        }
    }
}

// Initialize all functionality
function initializeAll() {
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
        
        // Add print button
        addPrintButton();
    } catch (error) {
        // Limit error details in production
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.error('Error initializing page:', error);
        } else {
            console.error('Error during initialization');
        }
    }
}

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", initializeAll);

// Add event listeners
window.addEventListener("scroll", eventListeners.scroll, { passive: true });
window.addEventListener('unload', cleanup);

document.addEventListener("DOMContentLoaded", function() {
    let footer = document.querySelector("footer");
    if (footer) {
        let link = document.createElement("a");
        link.href = "https://matthollandcv.com";
        link.textContent = "matthollandcv.com";
        link.style.color = "#666"; // Optional styling
        link.style.textDecoration = "none";

        let text = document.createTextNode("Printed from ");
        let container = document.createElement("p");
        container.appendChild(text);
        container.appendChild(link);
        footer.appendChild(container);
    }
});