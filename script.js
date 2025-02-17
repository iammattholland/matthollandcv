const preloadImage = new Image();
preloadImage.src = "CarHeadlights.png";

window.addEventListener("scroll", function() {
    const car = document.querySelector(".car img");
    const roadLines = document.querySelectorAll(".road-line");
    const scrollTop = window.scrollY; 
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight; 

    const scrollPercentage = scrollTop / documentHeight;

    const carStartPosition = 10;
    const carEndPosition = 90; 

    const carCurrentPosition = carStartPosition + (carEndPosition - carStartPosition) * scrollPercentage;

    car.parentElement.style.transform = `translateY(${carCurrentPosition}vh)`;

    // Move the road lines up as the car moves down
    roadLines.forEach((roadLine, index) => {
        const roadLineStartPosition = index * 100; // Adjust this value as needed
        const roadLineEndPosition = roadLineStartPosition - 100; // Adjust this value as needed
        const roadLineCurrentPosition = roadLineStartPosition + (roadLineEndPosition - roadLineStartPosition) * scrollPercentage;

        roadLine.style.transform = `translateY(${roadLineCurrentPosition}vh)`;
    });

    // Add new road lines if needed
    const lastRoadLine = roadLines[roadLines.length - 1];
    const lastRoadLinePosition = parseFloat(lastRoadLine.style.transform.replace('translateY(', '').replace('vh)', ''));

    if (lastRoadLinePosition <= 0) {
        const newRoadLine = document.createElement("div");
        newRoadLine.classList.add("road-line");
        newRoadLine.style.transform = `translateY(${100}vh)`; // Adjust this value as needed
        document.body.appendChild(newRoadLine);
    }

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
