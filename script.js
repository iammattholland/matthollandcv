//Car animation on scroll//

const preloadImage = new Image();
preloadImage.src = "CarHeadlights.webp";

window.addEventListener("scroll", function() {
    const car = document.querySelector(".car img");
    const scrollTop = window.scrollY; 
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight; 

    const scrollPercentage = scrollTop / documentHeight;

    const carStartPosition = 10;
    const carEndPosition = 90; 

    const carCurrentPosition = carStartPosition + (carEndPosition - carStartPosition) * scrollPercentage;

    car.parentElement.style.transform = `translateY(${carCurrentPosition}vh)`;

    car.src = "CarHeadlights.webp";

    clearTimeout(window.scrollTimeout);

    window.scrollTimeout = setTimeout(function() {
        car.src = "Car.webp";
    }, 200); 
});

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
