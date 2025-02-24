//Car animation on scroll//

const preloadImage = new Image();
preloadImage.src = "CarHeadlights.webp";

// Add throttling for scroll performance
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

// Add error handling for image loading
function handleImageError(img) {
    img.onerror = null;
    // Set background color instead of placeholder
    img.style.backgroundColor = 'var(--background-color)';
    console.warn(`Failed to load image: ${img.dataset.src}`);
}

// Improve image lazy loading
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

// Add better scroll performance
let scrollTimeout;
let isScrolling = false;

// Handle scroll end
function handleScrollEnd() {
    isScrolling = false;
    const car = document.querySelector(".car img");
    if (car) {  // Add null check
        car.src = "Car.webp";
    }
}

const handleScroll = throttle(() => {
    if (scrollTimeout) {
        window.cancelAnimationFrame(scrollTimeout);
    }
    
    const car = document.querySelector(".car img");
    if (!car) return;  // Exit if car element not found
    
    // Mark as actively scrolling
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

    // Set timeout to handle scroll end
    clearTimeout(window.scrollEndTimer);
    window.scrollEndTimer = setTimeout(handleScrollEnd, 50);
}, 16);

window.addEventListener("scroll", handleScroll, { passive: true });

// Intersection Observer to load sections on scroll
document.addEventListener("DOMContentLoaded", function() {
    const sections = document.querySelectorAll(".section");

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    sections.forEach(section => {
        observer.observe(section);
    });
});

document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
});

// Add performance monitoring
const performanceObserver = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
        if (entry.entryType === 'largest-contentful-paint') {
            console.log('LCP:', entry.startTime);
        }
    });
});

performanceObserver.observe({ entryTypes: ['largest-contentful-paint'] });

// Theme toggle functionality
function initTheme() {
    // Set light mode as default
    if (!localStorage.getItem('theme')) {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    } else {
        // Use stored preference if it exists
        const storedTheme = localStorage.getItem('theme');
        document.documentElement.setAttribute('data-theme', storedTheme);
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

// Initialize theme
initTheme();

// Add theme toggle event listener
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
});

// Cleanup function for observers
function cleanup() {
    if (imageObserver) {
        imageObserver.disconnect();
    }
    if (performanceObserver) {
        performanceObserver.disconnect();
    }
    window.removeEventListener("scroll", handleScroll);
}

// Add cleanup on page unload
window.addEventListener('unload', cleanup);
