import express from "express";
import pg from "pg";
import bodyParser from "body-parser";
import path from "path"; 
import { fileURLToPath } from 'url'; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "dtr",
  password: "yoga65",
  port: 5432,
});

const app = express();
const port = 3000;
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set("view engine", "ejs");

// Menambahkan path.join untuk menetapkan direktori views
app.set('views', path.join(__dirname, 'views'));

// Menggunakan path untuk menetapkan direktori 'public' sebagai static
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  res.locals.currentRoute = req.path;
  next();
});

app.get("/", async (req, res) => {
  const studentId = req.query.studentId ? req.query.studentId : 1;
  const studentProgress = await db.query(`
    SELECT course_id,
      ROUND((SUM(CASE WHEN complete = true THEN 1 ELSE 0 END)::decimal / COUNT(*)) * 100) AS complete
    FROM
      student_course_progress
    WHERE 
      student_id = $1 
    GROUP BY
      course_id
    ORDER BY course_id ASC 
  `, [studentId]);

  const dataMainCourse = await db.query(`SELECT * FROM public.main_course ORDER BY id ASC`);
  const mainCourses = dataMainCourse.rows;

  const data = await db.query("SELECT * FROM additional_course");
  const datarows = data.rows;

  res.render("index", {
    addCourse: datarows,
    studentProgress: studentProgress.rows,
    mainCourses
  });
});

//-------------------------------------/training--------------------------//
app.get("/training", async (req, res) => {
  const courseId = req.query.id;
  if (courseId) {
    try {
      const courseQuery = await db.query("SELECT * FROM additional_course WHERE id = $1", [courseId]);
      const lessonQuery = await db.query("SELECT * FROM additional_course_lesson WHERE additional_course_id = $1", [courseId]);

      if (courseQuery.rows.length > 0) {
        const course = courseQuery.rows[0];
        const lessons = lessonQuery.rows;

        res.render("course", {
          course: course,
          lessons: lessons
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
});

app.get("/training/main", async (req, res) => {
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
          type: "main"
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
});

app.get("/training/content", async (req, res) => {
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
          ORDER BY lesson_id ASC`, [1, courseId]);
      } else {
        courseQuery = await db.query("SELECT * FROM main_course WHERE id = $1", [courseId]);
        lessonQuery = await db.query("SELECT * FROM main_course_lesson WHERE main_course_id = $1", [courseId]);
        progressQuery = await db.query(`
          SELECT complete FROM public.student_course_progress
          WHERE student_id = $1 AND course_id = $2
          ORDER BY lesson_id ASC`, [1, courseId]);
      } 

      var progress = progressQuery.rows;
      const completedCount = progress.filter(item => item.complete).length;
      const totalCount = progress.length;
      const percentage = Math.round((completedCount / totalCount) * 100)
      if (courseQuery.rows.length > 0) {
        const course = courseQuery.rows[0];
        res.render("content", { course, lessons: lessonQuery.rows, lessonIndex, lessonType, progress, percentage });
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
});

// Handle post complete lesson
app.post("/training/update-progress", async (req, res) => {
  const courseId = req.query.id;
  const lessonId = req.query.lessonId;
  const lessonType = req.query.lessonType

  console.log(lessonType)

  if (courseId && lessonId) {
    try {
      if (lessonType=="main") {
        await db.query("UPDATE student_course_progress SET complete = true WHERE course_id = $1 AND lesson_id = $2", [courseId, lessonId]);
      }else{
        await db.query("UPDATE student_additionalcourse_progress SET complete = true WHERE course_id = $1 AND lesson_id = $2", [courseId, lessonId]);
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating progress:", error);
      res.status(500).json({ success: false, message: "Failed to update progress" });
    }
  } else {
    res.status(400).json({ success: false, message: "Invalid course ID or lesson index" });
  }
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
