window.addEventListener("scroll", function() {
    const car = document.querySelector(".car img");
    const scrollTop = window.scrollY; // Get the vertical scroll position
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight; // Total scrollable height

    // Calculate how far the user has scrolled as a percentage of total scrollable height
    const scrollPercentage = scrollTop / documentHeight;

    // Set the vertical range for the car's movement (from 10% to 90% of the viewport height)
    const carStartPosition = 10;  // Car starts at 10% from the top of the viewport
    const carEndPosition = 90;    // Car ends at 90% of the viewport height

    // Calculate the current position of the car based on the scroll percentage
    const carCurrentPosition = carStartPosition + (carEndPosition - carStartPosition) * scrollPercentage;

    // Update the car's position using translateY in viewport height (vh)
    car.parentElement.style.transform = `translateY(${carCurrentPosition}vh)`;

    // Switch the car image to one with headlights when the user is scrolling
    car.src = "CarHeadlights.png"; // Replace with the path to your car image with headlights

    // Clear any existing timeout to reset the delay
    clearTimeout(window.scrollTimeout);

    // Set a timeout to switch back to the original car image after scrolling stops
    window.scrollTimeout = setTimeout(function() {
        car.src = "Car.png"; // Replace with the path to your original car image
    }, 200); // Adjust the delay as needed (200ms in this example)
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
