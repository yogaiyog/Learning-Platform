document.addEventListener("DOMContentLoaded", () => {
    const taskCards = document.querySelectorAll("#task-card");
    const popUp = document.querySelector('#task-popup')
    const close = document.querySelector('#popup-close')
        close.addEventListener("click", (event)=>{
            event.preventDefault();
            popUp.classList.add('hidden')
    })
    taskCards.forEach(link => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        const taskIndex = link.getAttribute("taskIndex");
        const taskBody = link.getAttribute("taskBody");
        const taskTitle = link.getAttribute("taskTitle");
        const taskProgress = link.getAttribute("task-progress")
        
        if (taskProgress == "in_review") {
          document.querySelector('.in-review').classList.remove('hidden')
          document.querySelector('.completed').classList.add('hidden')
          document.querySelector('.submit').classList.add('hidden')
          document.querySelector('.upload').classList.add('hidden')
        } else if (taskProgress == "completed") {
          document.querySelector('.completed').classList.remove('hidden')
          document.querySelector('.in-review').classList.add('hidden')
          document.querySelector('.submit').classList.add('hidden')
          document.querySelector('.upload').classList.add('hidden')
        } else {
          document.querySelector('.completed').classList.add('hidden')
          document.querySelector('.in-review').classList.add('hidden')
          document.querySelector('.submit').classList.remove('hidden')
          document.querySelector('.upload').classList.remove('hidden')
        }

        document.querySelector('#title-popup').innerHTML = taskTitle
        document.querySelector('#body-popup').innerHTML = taskBody
        document.querySelector('#textarea').setAttribute("placeholder", "paste kode anda disini atau paste link project anda dari codepen atau replit");
        

        popUp.classList.remove("hidden")
        
      });
    });
    
  });
  
  
