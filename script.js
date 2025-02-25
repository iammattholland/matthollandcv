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

// Anti-scraping measures - simplified for better performance
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
            // Make all sections visible regardless of scroll position
            document.querySelectorAll('.section').forEach(section => {
                section.classList.add('visible');
                
                // Force load any lazy-loaded images
                const lazyImages = section.querySelectorAll('img[data-src]');
                lazyImages.forEach(img => {
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                });
            });
            
            // Force load the car image if it exists
            const carImg = document.querySelector('.car img');
            if (carImg && carImg.dataset.src) {
                carImg.src = carImg.dataset.src;
                carImg.removeAttribute('data-src');
            }
        });
        
        // Restore normal visibility after printing
        window.addEventListener('afterprint', function() {
            // Re-initialize section animations for non-visible sections
            const sections = document.querySelectorAll('.section:not(.visible)');
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
        console.error('Error in print preparation:', error);
    }
}

// Theme functionality
function initTheme() {
    try {
        if (!localStorage.getItem('theme')) {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.setAttribute('data-theme', localStorage.getItem('theme'));
        }
    } catch (error) {
        console.error('Error initializing theme:', error);
        // Fallback to light theme
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

// Performance monitoring
const performanceObserver = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
        if (entry.entryType === 'largest-contentful-paint') {
            console.log('LCP:', entry.startTime);
        }
    });
});

// Car animation variables
let scrollTimeout;
let isScrolling = false;
let lastScrollPosition = 0;
let ticking = false;

// Handle scroll end
function handleScrollEnd() {
    isScrolling = false;
    const car = document.querySelector(".car img");
    if (car) car.src = "Car.webp";
}

// Handle scroll with improved performance
const handleScroll = throttle(() => {
    isScrolling = true;
    
    if (!ticking) {
        window.requestAnimationFrame(() => {
            try {
                const car = document.querySelector(".car img");
                if (!car) return;
                
                car.src = "CarHeadlights.webp";
                
                const scrollTop = window.scrollY;
                const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
                const scrollPercentage = scrollTop / documentHeight;
                
                const carStartPosition = 10;
                const carEndPosition = 90;
                const carCurrentPosition = carStartPosition + (carEndPosition - carStartPosition) * scrollPercentage;
                
                car.parentElement.style.transform = `translate3d(0, ${carCurrentPosition}vh, 0)`;
                
                ticking = false;
            } catch (error) {
                console.error('Error in scroll handler:', error);
                ticking = false;
            }
        });
        
        ticking = true;
    }

    clearTimeout(window.scrollEndTimer);
    window.scrollEndTimer = setTimeout(handleScrollEnd, 50);
}, 20);

// Cleanup function
function cleanup() {
    try {
        if (imageObserver) imageObserver.disconnect();
        if (performanceObserver) performanceObserver.disconnect();
        window.removeEventListener("scroll", handleScroll);
    } catch (error) {
        console.error('Error in cleanup:', error);
    }
}

// Preload car headlights image
const preloadImage = new Image();
preloadImage.src = "CarHeadlights.webp";

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
        
        // Start performance monitoring
        performanceObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (error) {
        console.error('Error initializing page:', error);
    }
});

// Add event listeners
window.addEventListener("scroll", handleScroll, { passive: true });
window.addEventListener('unload', cleanup);
