const preloadImage = new Image();
preloadImage.src = "CarHeadlights.png";

window.addEventListener("scroll", function() {
    const car = document.querySelector(".car img");
    const roadLine = document.querySelector(".road-line");
    const scrollTop = window.scrollY; 
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight; 

    const scrollPercentage = scrollTop / documentHeight;

    const carStartPosition = 10;
    const carEndPosition = 90; 

    const carCurrentPosition = carStartPosition + (carEndPosition - carStartPosition) * scrollPercentage;

    car.parentElement.style.transform = `translateY(${carCurrentPosition}vh)`;

    // Move the road lines up as the car moves down
    const roadLineStartPosition = 0;
    const roadLineEndPosition = -100; // Adjust this value as needed
    const roadLineCurrentPosition = roadLineStartPosition + (roadLineEndPosition - roadLineStartPosition) * scrollPercentage;

    roadLine.style.transform = `translateY(${roadLineCurrentPosition}vh)`;

    console.log("Switching to headlights image");
    car.src = "CarHeadlights.png";

    clearTimeout(window.scrollTimeout);

    window.scrollTimeout = setTimeout(function() {
        console.log("Switching back to original car image");
        car.src = "Car.png";
    }, 200); 
});

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
