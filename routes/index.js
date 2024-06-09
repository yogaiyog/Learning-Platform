import express from 'express';
import db from '../db.js'

const router = express.Router();

router.get("/", async (req, res) => {
  if (req.isAuthenticated()) {
    const studentName = req.user[0].nama;
    const studentId = req.user[0].id;
    const studentProgress = await db.query(`
      SELECT course_id,
        ROUND((SUM(CASE WHEN complete = true THEN 1 ELSE 0 END)::decimal / COUNT(*)) * 100) AS complete
      FROM student_course_progress
      WHERE student_id = $1
      GROUP BY course_id
      ORDER BY course_id ASC
    `, [studentId]);

    const dbStudentTask = await db.query(`SELECT * FROM student_task WHERE student_id = $1 ORDER BY student_task_id ASC`, [studentId]);
    const studentTask = dbStudentTask.rows;

    const dataMainCourse = await db.query(`SELECT * FROM public.main_course ORDER BY id ASC`);
    const mainCourses = dataMainCourse.rows;

    const data = await db.query("SELECT * FROM additional_course");
    const datarows = data.rows;

    await db.query(`
      UPDATE main_course
      SET total_lesson = (
          SELECT COUNT(main_course_lesson.id)
          FROM main_course_lesson
          WHERE main_course.id = main_course_lesson.main_course_id
          GROUP BY main_course_id
      )
      WHERE id IN (
          SELECT DISTINCT main_course_id
          FROM main_course_lesson
      );
    `);

    res.render("index", {
      addCourse: datarows,
      studentProgress: studentProgress.rows,
      mainCourses,
      page: "main",
      studentName,
      studentTask
    });
  } else {
    res.render("login/login.ejs");
  }
});

export default router;
