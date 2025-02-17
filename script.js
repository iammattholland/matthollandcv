const preloadImage = new Image();
preloadImage.src = "CarHeadlights.png";

window.addEventListener("scroll", function() {
    const car = document.querySelector(".car img");
    const scrollTop = window.scrollY; 
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight; 

    const scrollPercentage = scrollTop / documentHeight;

    const carStartPosition = 10;
    const carEndPosition = 90; 

    const carCurrentPosition = carStartPosition + (carEndPosition - carStartPosition) * scrollPercentage;

    car.parentElement.style.transform = `translateY(${carCurrentPosition}vh)`;

    console.log("Switching to headlights image");
    car.src = "CarHeadlights.png";

    clearTimeout(window.scrollTimeout);

    window.scrollTimeout = setTimeout(function() {
        console.log("Switching back to original car image");
        car.src = "Car.png"; // Replace with the path to your original car image
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
