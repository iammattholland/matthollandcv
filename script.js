window.addEventListener("scroll", function() {
    const scrollTop = window.scrollY; // Updated to use window.scrollY
    const car = document.querySelector(".car");

    // Adjust this factor to control how fast the car moves as you scroll.
    const carSpeed = 0.3;

    // Update the car's vertical position based on scroll
    car.style.transform = `translateY(${scrollTop * carSpeed}px)`;
});