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
  const studentProgress = await db.query(`SELECT
  course_id,
    ROUND((SUM(CASE WHEN complete = true THEN 1 ELSE 0 END)::decimal / COUNT(*)) * 100) AS complete
  FROM
    student_course_progress
  WHERE 
    student_id = $1 AND course_id IN (1, 2, 3)
  GROUP BY
    course_id`,
     [studentId])

  const dataMainCourse = await db.query(`SELECT * FROM public.main_course ORDER BY id ASC`)
  const mainCourses = dataMainCourse.rows

  const data = await db.query("SELECT * FROM additional_course");
  const datarows = data.rows;
  res.render("index", {
    addCourse: datarows,
    studentProgress:studentProgress.rows,
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


app.get("/training/main", async (req,res) => {
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
          type:"main"
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
})



app.get("/training/content", async (req, res) => {
  const courseId = req.query.id;
  const lessonIndex = req.query.lessonIndex ? req.query.lessonIndex : 0;
  const lessonType   = req.query.type ? req.query.type : "additional";
  console.log(courseId)
  if (courseId) {
    try {
      // check dan ambil data sesuai tipe kursus
      var courseQuery
      var lessonQuery 
      var progressQuery
      if (lessonType == "additional") {
          courseQuery = await db.query("SELECT * FROM additional_course WHERE id = $1", [courseId]);
          lessonQuery = await db.query("SELECT * FROM additional_course_lesson WHERE additional_course_id = $1", [courseId]);
          progressQuery = await db.query(`
          SELECT complete FROM public.student_additionalcourse_progress
          where student_id = $1 and course_id = $2
          ORDER BY lesson_id ASC`, [1, courseId]);
      }else {
          courseQuery = await db.query("SELECT * FROM main_course WHERE id = $1", [courseId]);
          lessonQuery = await db.query("SELECT * FROM main_course_lesson WHERE main_course_id = $1", [courseId]);
          progressQuery = await db.query(`
          SELECT complete FROM public.student_course_progress
          where student_id = $1 and course_id = $2
          ORDER BY lesson_id ASC `, [1, courseId]);
      } 
      var progress = progressQuery.rows
      if (courseQuery.rows.length > 0) {
        const course = courseQuery.rows[0];
        res.render("content", { course , lessons:lessonQuery.rows, lessonIndex , lessonType, progress});
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
