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
        const progressText = container.querySelector('.progress-text');

        progressText.innerText = `${progress}%`;

        // Set initial width to 0 for animation
        progressBar.style.width = '0%';

        // Animate to the actual width
        setTimeout(() => {
            progressBar.style.width = `${progress}%`;
        }, 100); // Small delay to allow initial width to be set
    });
});

document.addEventListener("DOMContentLoaded", () => {
  const links = document.querySelectorAll(".switch-content");
  const sections = document.querySelectorAll(".content-section");

  links.forEach(link => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const target = link.getAttribute("data-target");

      // Remove 'selected-content' class from all links
      links.forEach(l => l.classList.remove("selected-content"));

      // Add 'selected-content' class to the clicked link
      link.classList.add("selected-content");

      // Hide all sections
      sections.forEach(section => section.classList.add("hidden"));

      // Show the target section
      document.getElementById(target).classList.remove("hidden");

      document.getElementById("trainingTitle").innerHTML = `${target} Course`
    });
  });
});

document.addEventListener('DOMContentLoaded', (event) => {
  const dot = document.querySelector('.navbar-right .dot');
  const accountDrop = document.querySelector('.account-drop');
  

  dot.addEventListener('click', () => {
    if (accountDrop.style.display === 'none' || !accountDrop.style.display) {
      accountDrop.style.display = 'flex';
    } else {
      accountDrop.style.display = 'none';
    }
  });

  document.addEventListener('click', (event) => {
    if (!dot.contains(event.target) && !accountDrop.contains(event.target)) {
      accountDrop.style.display = 'none';
    }
  });
});

document.addEventListener('DOMContentLoaded', (event) => {
  const dropdown = document.querySelector('.drop-down');
  const annCardsContainer = document.querySelector('.ann-cards-container');

  dropdown.addEventListener('click', function(e) {
    e.preventDefault();
    annCardsContainer.classList.toggle('expanded');
  });
  
});

document.addEventListener('DOMContentLoaded', (event)=>{

  const add_course = document.querySelector('#add-course')
  if (add_course) {
    add_course.addEventListener('click', (e)=>{
      const option = document.getElementById("option")
      option.classList.toggle("option-close")
    })
  }

  var close = document.getElementById('close-success');
  if (close) {
      close.addEventListener("click", (event)=>{
      document.getElementById('alert-success').classList.add('hidden')
    })
  }

  const cancle_post = document.querySelector('#popup-close');
  if (cancle_post) {
    const newPost = document.querySelector("#newpost")
    const popUp = document.querySelector('#task-popup');
    newPost.addEventListener("click",(e)=>{
      popUp.classList.remove('hidden')
      e.preventDefault();
    })
    cancle_post.addEventListener("click", (event) => {
      event.preventDefault();
      popUp.classList.add('hidden');
    });
  }
  
    
})

document.addEventListener('DOMContentLoaded', (event)=>{
  
})
