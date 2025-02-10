window.addEventListener("scroll", function() {
    const car = document.querySelector(".car");
    const profileSection = document.querySelector("#profile-heading").offsetTop;
    const certificationsSection = document.querySelector("#certifications-heading").offsetTop;
    const experienceSection = document.querySelector("#experience-heading").offsetTop;
    const educationSection = document.querySelector(".education").offsetTop;
    const extracurricularsSection = document.querySelector("#extracurriculars-heading").offsetTop;
    const skillsSection = document.querySelector(".skill").offsetTop;
    const awardsSection = document.querySelector(".awards").offsetTop;

    const scrollTop = window.scrollY; // Get the vertical scroll position

    // Calculate the car's position based on the scroll position
    let carPosition = profileSection;

    if (scrollTop >= profileSection && scrollTop < certificationsSection) {
        carPosition = profileSection;
    } else if (scrollTop >= certificationsSection && scrollTop < experienceSection) {
        carPosition = certificationsSection;
    } else if (scrollTop >= experienceSection && scrollTop < educationSection) {
        carPosition = experienceSection;
    } else if (scrollTop >= educationSection && scrollTop < extracurricularsSection) {
        carPosition = educationSection;
    } else if (scrollTop >= extracurricularsSection && scrollTop < skillsSection) {
        carPosition = extracurricularsSection;
    } else if (scrollTop >= skillsSection && scrollTop < awardsSection) {
        carPosition = skillsSection;
    } else if (scrollTop >= awardsSection) {
        carPosition = awardsSection;
    }

    // Update the car's position using translateY in pixels
    car.style.transform = `translateY(${carPosition}px)`;
});