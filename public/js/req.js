document.addEventListener("DOMContentLoaded", function() {
    const contentPage = document.querySelector('.content-page');
    const courseId = contentPage.getAttribute('data-course-id');
    const lessonType = contentPage.getAttribute('data-course-type');

    const checkboxes = document.querySelectorAll('.lesson-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function(event) {
            const isChecked = this.checked;

            if (isChecked) {
                this.checked = false;
                alert("You cannot manually check this. Please wait for the timer to finish.");
            }
        });
    });

    // Function to check if done is true and send fetch request
    function checkAndUpdateProgress() {
        if (done) {
            // Mark the checkbox as checked if done is true
            checkboxes.forEach(checkbox => {
                if (checkbox.getAttribute('data-lesson-id') === lessonId) {
                    checkbox.checked = true;
                }
            });

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
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert("An error occurred while updating progress");
            });
            
            // Stop checking after the fetch request is made
            clearInterval(checkInterval);
        }
    }

    // Set interval to check the done variable every second
    const checkInterval = setInterval(checkAndUpdateProgress, 1000);
});
