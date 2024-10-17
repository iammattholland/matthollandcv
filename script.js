window.addEventListener("scroll", function() {
    const car = document.querySelector(".car");
    const scrollTop = window.scrollY; // Get the vertical scroll position
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight; // Total scrollable height

    // Calculate how far the user has scrolled as a percentage of total scrollable height
    const scrollPercentage = scrollTop / documentHeight;

    // Set the vertical range for the car's movement (from 10% to 90% of the viewport height)
    const carStartPosition = 5;  // Car starts at 10% from the top of the viewport
    const carEndPosition = 90;    // Car ends at 90% of the viewport height

    // Calculate the current position of the car based on the scroll percentage
    const carCurrentPosition = carStartPosition + (carEndPosition - carStartPosition) * scrollPercentage;

    // Update the car's position using translateY in viewport height (vh)
    car.style.transform = `translateY(${carCurrentPosition}vh)`;
});