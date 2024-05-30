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
            }
        });
    });
});
