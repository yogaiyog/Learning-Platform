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






// sampah

router.get("/task-home", async (req, res) => {
  if (req.isAuthenticated()) {
    const studentName = req.user[0].nama;
    const studentId = req.user[0].id;
    const tasks = await db.query(`SELECT * FROM student_task WHERE student_id = $1`, [studentId]);

    res.render("task-home.ejs", {
      tasks: tasks.rows,
      page: "task-home",
      studentName
    });
  } else {
    res.render("login/login.ejs");
  }
});

router.post("/task", async (req, res) => {
  if (req.isAuthenticated()) {
    const studentId = req.user[0].id;
    const { taskDescription, dueDate } = req.body;

    try {
      const newTask = await db.query("INSERT INTO student_task (student_id, task_description, due_date) VALUES ($1, $2, $3) RETURNING *", [studentId, taskDescription, dueDate]);
      res.status(201).json({ success: true, task: newTask.rows[0] });
    } catch (error) {
      console.error("Error adding task:", error);
      res.status(500).json({ success: false, message: "Database query error" });
    }
  } else {
    res.status(401).json({ success: false, message: "Unauthorized" });
  }
});

router.put("/task/:id", async (req, res) => {
  if (req.isAuthenticated()) {
    const taskId = req.params.id;
    const { taskDescription, dueDate } = req.body;

    try {
      const updatedTask = await db.query("UPDATE student_task SET task_description = $1, due_date = $2 WHERE student_task_id = $3 RETURNING *", [taskDescription, dueDate, taskId]);
      res.status(200).json({ success: true, task: updatedTask.rows[0] });
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ success: false, message: "Database query error" });
    }
  } else {
    res.status(401).json({ success: false, message: "Unauthorized" });
  }
});

router.delete("/task/:id", async (req, res) => {
  if (req.isAuthenticated()) {
    const taskId = req.params.id;

    try {
      await db.query("DELETE FROM student_task WHERE student_task_id = $1", [taskId]);
      res.status(200).json({ success: true, message: "Task deleted" });
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ success: false, message: "Database query error" });
    }
  } else {
    res.status(401).json({ success: false, message: "Unauthorized" });
  }
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

  {/* tanggal ------------*/}
  function formatDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

// Example usage
const today = new Date();
const formattedDate = formatDate(today);
console.log(formattedDate); // Output: "05-06-2024" (for example) 



router.get("/forum-home", async (req, res) => {
  if (req.isAuthenticated()) {
    const studentName = req.user[0].nama;
    const forums = await db.query(`SELECT * FROM forum ORDER BY forum_id ASC`);

    res.render("forum-home.ejs", {
      forums: forums.rows,
      page: "forum-home",
      studentName
    });
  } else {
    res.render("login/login.ejs");
  }
});

router.post("/forum", async (req, res) => {
  if (req.isAuthenticated()) {
    const studentId = req.user[0].id;
    const { forumTitle, forumContent } = req.body;

    try {
      const newForum = await db.query("INSERT INTO forum (student_id, forum_title, forum_content) VALUES ($1, $2, $3) RETURNING *", [studentId, forumTitle, forumContent]);
      res.status(201).json({ success: true, forum: newForum.rows[0] });
    } catch (error) {
      console.error("Error adding forum:", error);
      res.status(500).json({ success: false, message: "Database query error" });
    }
  } else {
    res.status(401).json({ success: false, message: "Unauthorized" });
  }
});

router.put("/forum/:id", async (req, res) => {
  if (req.isAuthenticated()) {
    const forumId = req.params.id;
    const { forumTitle, forumContent } = req.body;

    try {
      const updatedForum = await db.query("UPDATE forum SET forum_title = $1, forum_content = $2 WHERE forum_id = $3 RETURNING *", [forumTitle, forumContent, forumId]);
      res.status(200).json({ success: true, forum: updatedForum.rows[0] });
    } catch (error) {
      console.error("Error updating forum:", error);
      res.status(500).json({ success: false, message: "Database query error" });
    }
  } else {
    res.status(401).json({ success: false, message: "Unauthorized" });
  }
});

router.delete("/forum/:id", async (req, res) => {
  if (req.isAuthenticated()) {
    const forumId = req.params.id;

    try {
      await db.query("DELETE FROM forum WHERE forum_id = $1", [forumId]);
      res.status(200).json({ success: true, message: "Forum deleted" });
    } catch (error) {
      console.error("Error deleting forum:", error);
      res.status(500).json({ success: false, message: "Database query error" });
    }
  } else {
    res.status(401).json({ success: false, message: "Unauthorized" });
  }
});