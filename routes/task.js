import express from 'express';
import db from '../db.js'
import { formatDate } from './utils.js'

const router = express.Router();

router.get("/task", async (req, res)=>{
  if (req.isAuthenticated()){
      let studentTasks = null
      let tasks = null
      if (req.user[0].admin) {
        const dbStudentTasks = await db.query(`SELECT * FROM student_task ORDER BY student_id ASC`);
        const dbTasks = await db.query(`SELECT * FROM public.task ORDER BY id ASC`);
        studentTasks = dbStudentTasks.rows
        tasks = dbTasks.rows
      }
      let successAlert
      if (req.query.success) {
        successAlert = req.query.success
      }
      const studentId = req.user[0].id
      const dbStudentTask = await db.query(`SELECT * FROM student_task where student_id = $1 ORDER BY student_task_id ASC`, [studentId]);
      const studentTask = dbStudentTask.rows
      const studentName = req.user[0].nama

      res.render("task.ejs", {
        page:"task",
        studentTask,
        studentName,
        success:successAlert,
        studentTasks,
        tasks
      });
    } else {
      res.render("login/login.ejs")
    }
  
  })
  
  router.post("/task-answer", async(req,res)=>{
    if (req.isAuthenticated()){
      const answer = req.body.answer
      const studentId = req.user[0].id
      const taskId = parseInt(req.query.taskIndex)
      try {
        const result = await db.query(`
        UPDATE student_task
        SET answer = $1, on_going = false , in_review = true
        WHERE student_id = $2 and task_id = $3;`,[answer,studentId,taskId])
        console.log("update complete")
        res.redirect("/task?success=yes") //selain redirect saya mau tambahkan locals variabel saat task merender tesk.ejs
      } catch (err) {
        console.log("err upadet to database:",err)
      }
    } else {
      res.redirect("/login")
    }
  })

  router.post('/task-admin', async (req, res) => {
    const taskStatus = req.body['task-status']; 
    const note = req.body.note; 
    const studentId = req.query.studentId
    const taskId  =req.query.taskId
    
    if (taskStatus === 'complete') {
      try {
        const result = await db.query(`
          update student_task
          set complete = true, on_going = false , in_review = false, ref = $1 
          where student_id =$2 and task_id = $3;`,[note,studentId,taskId] )
          res.redirect("/task?success=yes")
      } catch (err) {
        console.log(err)
      }
    } else {
      try {
        const result = await db.query(`
          update student_task
          set complete = false, on_going = true , in_review = false, ref = $1 
          where student_id =$2 and task_id = $3;`,[note,studentId,taskId] )
          res.redirect("/task?success=yes")
      } catch (err) {
        console.log(err)
      }
    }

  
  });
  
  router.post('/task-create', async (req,res)=>{
    const title = req.body.task_title
    const body = req.body.task_body
    const hint = req.body.task_placeholder
    const day = new Date()
    const formattedDate = formatDate(day)
    
    try {
      const result = db.query(`
        insert into task (task_title, task_date, task_placeholder, task_body)
        values ($1,$2,$3,$4)
        `, [title,formattedDate,hint,body])
      const result2 = db.query(`
          INSERT INTO student_task (nama_student, student_id, task_title, task_id, on_going, in_review, complete, task_body)
          SELECT
              s.nama AS nama_student,
              s.id AS student_id,
              t.task_title AS task_title,
              t.id AS task_id,
              TRUE AS on_going,
              FALSE AS in_review,
              FALSE AS complete,
              t.task_body
          FROM
              student s
          CROSS JOIN
              task t
          ON CONFLICT (student_id, task_id) DO NOTHING;
        `)
        res.redirect("/task?success=yes")
    } catch (err) {
      console.log(err)
    }
  })

  router.get("/task-delete", async (req,res)=> {
    const id = req.query.id 
    try {
      const result = await db.query(`
        DELETE FROM student_task
        WHERE task_id = $1;`,[id])
      const result2 = await db.query(`
        DELETE FROM task
        WHERE id = $1;
        `, [id])
        res.redirect("/task?success=yes")
    }catch (err){
      console.log(err)
    }
  })

  router.put('/task-edit', async (req, res) => {
    const { task_id, task_title, task_body } = req.body;
    try {
      await db.query(
        'UPDATE public.task SET task_title = $1, task_body = $2 WHERE id = $3',
        [task_title, task_body, task_id]
      );
      res.status(200).redirect("/task?success=yes")
    } catch (err) {
      console.error(err);
      res.status(500).send('Error updating task');
    }
  });

export default router;
