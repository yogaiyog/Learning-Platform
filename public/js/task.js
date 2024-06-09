document.addEventListener("DOMContentLoaded", () => {
  const taskCards = document.querySelectorAll(".task-card"); // Changed id selector to class selector
  const popUp = document.querySelector('#task-popup');
  const close = document.querySelector('#popup-close');
  const rClose = document.querySelector('#review-close')
  const review = document.querySelectorAll(".respon-button")
  let reviewPopup 
  
  close.addEventListener("click", (event) => {
    event.preventDefault();
    popUp.classList.add('hidden');
    
    });
    if (rClose){
      rClose.addEventListener("click", (event) => {
        event.preventDefault();
        reviewPopup.classList.add('hidden');
        
        });
  
    }
    
    //  answering task //-----------------------------
    
  taskCards.forEach(link => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const taskBody = link.getAttribute("data-task-body");   // Changed id to data attribute
      const taskTitle = link.getAttribute("data-task-title"); // Changed id to data attribute
      const taskProgress = link.getAttribute("data-task-progress"); // Changed id to data attribute
      const taskId = link.getAttribute("data-task-id")
      const ref = link.getAttribute("ref-note")

      console.log(taskProgress)
      if (taskProgress === "in_review") {
        document.querySelector('.in-review').classList.remove('hidden');
        document.querySelector('.completed').classList.add('hidden');
        document.querySelector('.submit-student').classList.add('hidden');
        document.querySelector('.upload').classList.add('hidden');
      } else if (taskProgress === "completed") {
        document.querySelector('.completed').classList.remove('hidden');
        document.querySelector('.in-review').classList.add('hidden');
        document.querySelector('.submit-student').classList.add('hidden');
        document.querySelector('.upload').classList.add('hidden');
      } else {
        document.querySelector('.completed').classList.add('hidden');
        document.querySelector('.in-review').classList.add('hidden');
        document.querySelector('.submit-student').classList.remove('hidden');
        document.querySelector('.upload').classList.remove('hidden');
      }

      document.querySelector('#title-popup').innerHTML = taskTitle;
      document.querySelector('#body-popup').innerHTML = taskBody;
      document.querySelector('#revision-note').innerHTML = ref;
      document.querySelector('#textarea').setAttribute("placeholder", "paste kode anda disini atau paste link project anda dari codepen atau replit");
      const submit = document.querySelector('#submit-form')
      submit.setAttribute("action", `/task-answer?taskIndex=${taskId}`); // Fixed dynamic action assignment
      submit.addEventListener("click", (e)=>{
        console.log("click")
      })
      popUp.classList.remove("hidden");
    });
  });

  // end aswering task-----------
  if (review) {
    reviewPopup = document.querySelector('#review-popup')
    review.forEach(link => {
      link.addEventListener("click", (e)=>{
        e.preventDefault()
        const Student = link.getAttribute("Student")
        const studentId = link.getAttribute("studentId")
        const taskId = link.getAttribute("taskId")
        const title = link.getAttribute("title")
        const body = link.getAttribute("body")
        const answer = link.getAttribute("answer")
        document.querySelector('#task-body-review').innerHTML = body;
        document.querySelector('#task-answer-review').innerHTML = answer;
        document.querySelector('#task-title-review').innerHTML = title;
        document.querySelector('#task-student-review').innerHTML = `by: ${Student}`;
        const reviewForm = document.querySelector('#review-form')
        reviewForm.setAttribute("action", `/task-admin?studentId=${studentId}&taskId=${taskId}`)
        reviewPopup.classList.remove("hidden")
      })
    })
  }

});