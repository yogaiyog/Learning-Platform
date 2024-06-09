import express from 'express';
import db from '../db.js';  // Ensure the path is correct

const router = express.Router();

router.get("/training-home", async (req, res) => {
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

    const studentProgressAdd = await db.query(`
      SELECT course_id,
        ROUND((SUM(CASE WHEN complete = true THEN 1 ELSE 0 END)::decimal / COUNT(*)) * 100) AS complete
      FROM student_additionalcourse_progress
      WHERE student_id = $1
      GROUP BY course_id
      ORDER BY course_id ASC
    `, [studentId]);

    const dataMainCourse = await db.query(`SELECT * FROM public.main_course ORDER BY id ASC`);
    const mainCourses = dataMainCourse.rows;

    const data = await db.query("SELECT * FROM additional_course ORDER BY id ASC");
    const datarows = data.rows;

    res.render("training.ejs", {
      addCourses: datarows,
      studentProgress: studentProgress.rows,
      mainCourses,
      studentProgressAdd: studentProgressAdd.rows,
      page: "training",
      studentName
    });
  } else {
    res.render("login/login.ejs");
  }
});

router.get("/training", async (req, res) => {
  if (req.isAuthenticated()) {
    const studentName = req.user[0].nama;
    const courseId = req.query.id;
    const studentId = req.user[0].id;
    if (courseId) {
      try {
        const courseQuery = await db.query("SELECT * FROM additional_course WHERE id = $1", [courseId]);
        const lessonQuery = await db.query("SELECT * FROM additional_course_lesson WHERE additional_course_id = $1", [courseId]);

        if (courseQuery.rows.length > 0) {
          const course = courseQuery.rows[0];
          const lessons = lessonQuery.rows;

          res.render("course", {
            course: course,
            lessons: lessons,
            page: "training",
            studentName
          });
        } else {
          res.status(404).json({ success: false, message: "Course not found" });
        }
      } catch (error) {
        console.error("Error querying database:", error);
        res.status(500).json({ success: false, message: "Database query error" });
      }
    } else {
      res.status(400).json({ success: false, message: "No course ID provided" });
    }
  } else {
    res.render("login/login.ejs");
  }
});

router.get("/training/main", async (req, res) => {
  if (req.isAuthenticated()) {
    const studentName = req.user[0].nama;
    const courseId = req.query.id;
    if (courseId) {
      try {
        const courseQuery = await db.query("SELECT * FROM main_course WHERE id = $1", [courseId]);
        const lessonQuery = await db.query("SELECT * FROM main_course_lesson WHERE main_course_id = $1", [courseId]);

        if (courseQuery.rows.length > 0) {
          const course = courseQuery.rows[0];
          const lessons = lessonQuery.rows;

          res.render("course", {
            course: course,
            lessons: lessons,
            type: "main",
            page: "training",
            studentName
          });
        } else {
          res.status(404).json({ success: false, message: "Course not found" });
        }
      } catch (error) {
        console.error("Error querying database:", error);
        res.status(500).json({ success: false, message: "Database query error" });
      }
    } else {
      res.status(400).json({ success: false, message: "No course ID provided" });
    }
  } else {
    res.render("login/login.ejs");
  }
});


router.get("/training/content", async (req, res) => {
    if (req.isAuthenticated()){
      const studentName = req.user[0].nama
      const studentId = req.user[0].id
      const courseId = req.query.id;
      const lessonIndex = req.query.lessonIndex ? req.query.lessonIndex : 0;
      const lessonType = req.query.type ? req.query.type : "additional";

      if (courseId) {
        try {
            var courseQuery, lessonQuery, progressQuery;
            if (lessonType == "additional") {
                courseQuery = await db.query("SELECT * FROM additional_course WHERE id = $1", [courseId]);
                lessonQuery = await db.query("SELECT * FROM additional_course_lesson WHERE additional_course_id = $1", [courseId]);
                progressQuery = await db.query(`
                SELECT complete FROM public.student_additionalcourse_progress
                WHERE student_id = $1 AND course_id = $2
                ORDER BY lesson_id ASC`, [studentId, courseId]);
            } else {
                courseQuery = await db.query("SELECT * FROM main_course WHERE id = $1", [courseId]);
                lessonQuery = await db.query("SELECT * FROM main_course_lesson WHERE main_course_id = $1", [courseId]);
                progressQuery = await db.query(`
                SELECT complete FROM public.student_course_progress
                WHERE student_id = $1 AND course_id = $2
                ORDER BY lesson_id ASC`, [studentId, courseId]);
            } 
        
            var progress = progressQuery.rows;
            const completedCount = progress.filter(item => item.complete).length;
            const totalCount = progress.length;
            const percentage = Math.round((completedCount / totalCount) * 100)
            if (courseQuery.rows.length > 0) {
                const course = courseQuery.rows[0];
                res.render("content", { course, lessons: lessonQuery.rows, lessonIndex, lessonType, progress, percentage,studentName });
            } else {
                res.status(404).json({ success: false, message: "Course not found" });
            }
        } catch (error) {
            console.error("Error querying database:", error);
            res.status(500).json({ success: false, message: "Database query error" });
        }
      } else {
        res.status(400).json({ success: false, message: "No course ID provided" });
      }
    } else {
      res.render("login/login.ejs")
    }
});

router.post("/training/update-progress", async (req, res) => {
  if (req.isAuthenticated()){
    
    const studentId = req.user[0].id
    const courseId = req.query.id;
    const lessonId = req.query.lessonId;
    const lessonType = req.query.lessonType
  
    if (courseId && lessonId) {
      try {
        if (lessonType=="main") {
          await db.query("UPDATE student_course_progress SET complete = true WHERE course_id = $1 AND lesson_id = $2 AND student_id = $3", [courseId, lessonId, studentId]);
        }else{
          await db.query("UPDATE student_additionalcourse_progress SET complete = true WHERE course_id = $1 AND lesson_id = $2 AND student_id = $3", [courseId, lessonId, studentId]);
        }
        
        res.json({ success: true });
      } catch (error) {
        console.error("Error updating progress:", error);
        res.status(500).json({ success: false, message: "Failed to update progress" });
      }
    } else {
      res.status(400).json({ success: false, message: "Invalid course ID or lesson index" });
    }

  } else {
    res.render("login/login.ejs")
  }
  
});

export default router;
