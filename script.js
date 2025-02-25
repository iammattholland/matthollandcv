// Preload car headlights image
const preloadImage = new Image();
preloadImage.src = "CarHeadlights.webp";

// Throttle function for performance
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

// Lazy load images
const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            const newImage = new Image();
            newImage.onload = () => {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            };
            newImage.onerror = () => handleImageError(img);
            newImage.src = img.dataset.src;
            observer.unobserve(img);
        }
    });
}, {
    rootMargin: '50px',
    threshold: 0.1
});

// Car animation variables
let scrollTimeout;
let isScrolling = false;

// Handle scroll end
function handleScrollEnd() {
    isScrolling = false;
    const car = document.querySelector(".car img");
    if (car) car.src = "Car.webp";
}

// Handle scroll
const handleScroll = throttle(() => {
    if (scrollTimeout) window.cancelAnimationFrame(scrollTimeout);
    
    const car = document.querySelector(".car img");
    if (!car) return;
    
    isScrolling = true;
    car.src = "CarHeadlights.webp";
    
    scrollTimeout = window.requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercentage = scrollTop / documentHeight;
        
        const carStartPosition = 10;
        const carEndPosition = 90;
        const carCurrentPosition = carStartPosition + (carEndPosition - carStartPosition) * scrollPercentage;
        
        car.parentElement.style.transform = `translate3d(0, ${carCurrentPosition}vh, 0)`;
    });

    clearTimeout(window.scrollEndTimer);
    window.scrollEndTimer = setTimeout(handleScrollEnd, 50);
}, 16);

// Theme functionality
function initTheme() {
    if (!localStorage.getItem('theme')) {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    } else {
        document.documentElement.setAttribute('data-theme', localStorage.getItem('theme'));
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

// Cleanup function
function cleanup() {
    if (imageObserver) imageObserver.disconnect();
    if (performanceObserver) performanceObserver.disconnect();
    window.removeEventListener("scroll", handleScroll);
}

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", function() {
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
    document.querySelectorAll('img[data-src]').forEach(img => imageObserver.observe(img));
    
    // Add anti-scraping protection
    addAntiScrapingProtection();
});

// Performance monitoring
const performanceObserver = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
        if (entry.entryType === 'largest-contentful-paint') {
            console.log('LCP:', entry.startTime);
        }
    });
});

// Add event listeners
window.addEventListener("scroll", handleScroll, { passive: true });
window.addEventListener('unload', cleanup);
performanceObserver.observe({ entryTypes: ['largest-contentful-paint'] });

// Anti-scraping measures
function addAntiScrapingProtection() {
    // Prevent right-click
    document.addEventListener('contextmenu', event => event.preventDefault());
    
    // Add invisible honeypot elements for scrapers
    const honeypots = ['email', 'phone', 'address'];
    honeypots.forEach(type => {
        const honeypot = document.createElement('div');
        honeypot.style.opacity = '0';
        honeypot.style.position = 'absolute';
        honeypot.style.pointerEvents = 'none';
        honeypot.setAttribute('aria-hidden', 'true');
        honeypot.innerHTML = `<span class="${type}">honeypot-${type}@example.com</span>`;
        document.body.appendChild(honeypot);
    });
    
    // Add content protection
    document.addEventListener('copy', (e) => {
        const selection = window.getSelection();
        if (selection.toString().length > 100) {
            e.clipboardData.setData('text/plain', 'Content from Matt Holland\'s CV. Please visit the original site.');
            e.preventDefault();
        }
    });
    
    // Add invisible watermark to the page
    const watermark = document.createElement('div');
    watermark.innerHTML = `<div style="position:fixed;opacity:0.03;pointer-events:none;z-index:9999;font-size:40px;color:#000;transform:rotate(-45deg);width:100%;height:100%;display:flex;align-items:center;justify-content:center;user-select:none;">Matt Holland CV</div>`;
    document.body.appendChild(watermark);
    
    // Detect and block headless browsers
    if (navigator.webdriver || /HeadlessChrome/.test(navigator.userAgent)) {
        document.body.innerHTML = '<h1>This content is not available in automated browsers</h1>';
    }
}
