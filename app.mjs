import express, { query } from "express";
import pg from "pg";
import bodyParser from "body-parser";

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
app.use(bodyParser.json());  // Add this line to parse JSON request bodies
app.set("view engine", "ejs");
app.use(express.static("public"));

// Middleware to set the current route in res.locals
app.use((req, res, next) => {
  res.locals.currentRoute = req.path;
  next();
});


app.get("/", async (req, res) => {
  const studentId = req.query.studentId ? req.query.studentId : 1;
  const studentLesson = await db.query(`SELECT
  course_id,
    ROUND((SUM(CASE WHEN complete = true THEN 1 ELSE 0 END)::decimal / COUNT(*)) * 100) AS percentage_true
  FROM
    student_course_progress
  WHERE 
    student_id = $1 AND course_id IN (1, 2, 3)
  GROUP BY
    course_id`,
     [studentId])
  console.log(studentLesson.rows)


  const data = await db.query("SELECT * FROM additional_course");
  const datarows = data.rows;
  res.render("index", {
    addCourse: datarows,
  });
});

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

app.get("/training/content", async (req, res) => {
  const courseId = req.query.id;
  const lessonIndex = req.query.lessonIndex ? req.query.lessonIndex : 0;

  if (courseId) {
    try {
      // Proses ID kursus yang diterima
      const courseQuery = await db.query("SELECT * FROM additional_course WHERE id = $1", [courseId]);
      const lessonQuery = await db.query("SELECT * FROM additional_course_lesson WHERE additional_course_id = $1", [courseId]);
      if (courseQuery.rows.length > 0) {
        const course = courseQuery.rows[0];
        console.log(course)
        // Lakukan tindakan yang diinginkan, misalnya render halaman konten kursus
        res.render("content", { course , lessons:lessonQuery.rows, lessonIndex});
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

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
