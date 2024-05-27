document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.content-nav a');
    const sections = document.querySelectorAll('.section');
  
    navLinks.forEach(link => {
      link.addEventListener('click', function(event) {
        event.preventDefault();
        
        // Remove 'nav-active' class from all links
        navLinks.forEach(link => link.classList.remove('nav-active'));
        
        // Add 'nav-active' class to the clicked link
        this.classList.add('nav-active');
        
        // Remove 'active' class from all sections
        sections.forEach(section => section.classList.remove('active'));
        
        // Add 'active' class to the clicked section
        const targetSection = document.querySelector(`.${this.dataset.section}`);
        targetSection.classList.add('active');
      });
    });
  
    // Set initial active section
    if (sections.length > 0) {
      sections[0].classList.add('active');
    }
  });

//   -------------carousel---------------------------------------------------------------------- //
document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('.slider-nav a');
    const slides = document.querySelectorAll('.slide');
    const slider = document.querySelector('.slider');
    let currentSlide = 0;
  
    links.forEach(link => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        const targetId = event.currentTarget.getAttribute('data-slide');
        const targetSlide = document.getElementById(targetId);
  
        if (targetSlide) {
          const slideIndex = Array.from(slides).indexOf(targetSlide);
          scrollToSlide(slideIndex);
          updateActiveNav(targetId);
        }
      });
    });
  
    function updateActiveNav(targetId) {
      links.forEach(link => {
        if (link.getAttribute('data-slide') === targetId) {
          link.classList.add('nav-active');
        } else {
          link.classList.remove('nav-active');
        }
      });
    }
  
    function scrollToSlide(slideIndex) {
      const slideWidth = slider.clientWidth;
      slider.scrollLeft = slideWidth * slideIndex;
      currentSlide = slideIndex;
    }
  
    function autoSlide() {
      currentSlide = (currentSlide + 1) % slides.length;
      scrollToSlide(currentSlide);
      updateActiveNav(slides[currentSlide].id);
    }
  
    setInterval(autoSlide, 5000);
  });

  // progressbar----------------------------------------------------]
  document.addEventListener("DOMContentLoaded", function() {
    const progressContainers = document.querySelectorAll('.progress-container');
    progressContainers.forEach(container => {
        const progress = container.getAttribute('data-progress');
        const progressBar = container.querySelector('.progress-bar');
        progressBar.style.width = `${progress}%`;
        progressBar.innerText = `${progress}%`;
    });
});