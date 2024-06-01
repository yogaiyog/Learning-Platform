document.addEventListener("DOMContentLoaded", function() {
    const contentPage = document.querySelector('.content-page');
    const courseId = contentPage.getAttribute('data-course-id');
    const lessonType = contentPage.getAttribute('data-course-type');


    const checkboxes = document.querySelectorAll('.lesson-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function(event) {
            const lessonId = this.getAttribute('data-lesson-id');
            const isChecked = this.checked;

            if (isChecked) {
                if (done) { 
                    if (confirm("Complete this lesson?")) {
                        // Send request to update progress
                        fetch(`/training/update-progress?id=${courseId}&lessonId=${lessonId}&lessonType=${lessonType}`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ complete: true })
                        })
                        .then(response => response.json())
                        .then(data => {
                            if (!data.success) {
                                alert("Failed to update progress");
                                this.checked = false;
                            }
                        })
                        .catch(error => {
                            console.error('Error:', error);
                            alert("An error occurred while updating progress");
                            this.checked = false;
                        });
                    } else {
                        this.checked = false;
                    } 
                } else {
                    this.checked = false
                    alert("please wait timer until it finished")
                }
            }
        });
    });
});



<header>
    <nav class="navbar">
      <div class="navbar-left">
        <div class="logo">
          <a href="/"><img src="/image/logo.png" alt="Logo" /></a>
        </div>
      </div>
      
      <ul class="nav-links">
        <li> 
          <a href="/" id="home" class="nav-select" >
            <i class="fa-solid fa-house" style="color: #a3a3a3"></i> 
            Home
          </a>
        </li>
        <li><a href="/training-home" id="training">Training</a></li>
        <li><a href="/task" id="task">Task</a></li>
        <li><a href="/forum" id="forum">Forum</a></li>
      </ul>
      <div class="navbar-right">
        <a href="#notifications"
          ><i class="fa-regular fa-bell" style="color: #a3a3a3"></i
        ></a>
        <a href="#login">Login</a>
      </div>
    </nav>
  </header>
