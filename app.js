import express from "express";
import pg from "pg";
import bodyParser from "body-parser";
import path from "path"; 
import { fileURLToPath } from 'url';
import env from "dotenv"
import bcrypt from "bcrypt"
import session from "express-session"
import passport from "passport"
import { Strategy } from "passport-local";
import GoogleStrategy from "passport-google-oauth2";


env.config()
const saltRounds = 10;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new pg.Client({
  user:process.env.DB_USER,
  host: "localhost",
  database: "dtr",
  password: "yoga65",
  port: 5432,
});

const app = express();
const port = 3000;
db.connect((err)=> {
  if (err) throw err;
  console.log("Connected to Database!");
});

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 1000*60*60*24 },
}))

app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, "public")));


app.get("/login", (req, res) => {
  res.render("login/login.ejs");
});
app.get("/register", (req, res) => {
  res.render("login/register.ejs");
});


app.post("/login",passport.authenticate("local",{
  successRedirect:"/",
  failureRedirect:"/login",
}))

app.get("/auth/google", passport.authenticate("google", {
  scope: ["profile", "email"]
}))

app.get("/auth/google/duetomorrow", passport.authenticate("google", {
  successRedirect:"/",
  failureRedirect:"/login",
}))

function formatDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

async function NewStudent() {
  try {
    const additionalCoureProgress = await db.query(`
    INSERT INTO student_additionalcourse_progress (nama, student_id, lesson_id, lesson_title, complete,course_id)
    SELECT
        s.nama,
        s.id AS student_id,
        a.id AS lesson_id,
        a.lesson_title,
        FALSE,
      a.additional_course_id
    FROM
        student s
    CROSS JOIN
        additional_course_lesson a
    ON CONFLICT (student_id, lesson_id) DO NOTHING;
    `)

    const mainCourseProgress = await db.query(`
    INSERT INTO student_course_progress (nama, student_id, lesson_id, lesson_title, complete,course_id)
    SELECT
        s.nama,
        s.id AS student_id,
        a.id AS lesson_id,
        a.lesson_title,
        FALSE,
      a.main_course_id
    FROM
        student s
    CROSS JOIN
        main_course_lesson a
    ON CONFLICT (student_id, lesson_id) DO NOTHING;
    `)

    const taskProgress = await db.query(`
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
    
  } catch(err) {
    console.log("failed insert new data to students progress",err)
  }
  
} 

app.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/login");
  });
});

app.get("/", async (req, res) => {
  if (req.isAuthenticated()) {
    const studentName = req.user[0].nama
    const studentId = req.user[0].id
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
  const dbStudentTask = await db.query(`SELECT * FROM student_task where student_id = $1 ORDER BY student_task_id ASC`, [studentId]);
  const studentTask = dbStudentTask.rows

  const dataMainCourse = await db.query(`SELECT * FROM public.main_course ORDER BY id ASC`);
  const mainCourses = dataMainCourse.rows;

  const data = await db.query("SELECT * FROM additional_course");
  const datarows = data.rows;

  const updateProgress = await db.query(`
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
          );`)

  res.render("index", {
    addCourse: datarows,
    studentProgress: studentProgress.rows,
    mainCourses,
    page:"main",
    studentName,
    studentTask
  });
  } else {
    res.render("login/login.ejs")
  }
});

app.post("/register", async (req, res) => {
  var username = req.body.username
  var pwd = req.body.password
  var nama = req.body.nama

  try {
    const checkEmail =  await db.query(`select * from student where email = $1`, [username]) //ambil user berdasarkan email
    if (checkEmail.rows.length == 0) {                                                       //check apa user ada
      bcrypt.hash(pwd, saltRounds, async (err,hash)=>{                                       //hasing password
        if (err) {console.log("error hasing password:",err)}
        else {
          const result = await db.query("INSERT INTO student (nama, email , password) VALUES ($1 , $2 , $3) returning *",[nama, username , hash]) // jika ada data dimasukan ke row baru
          await NewStudent()
          const user = result.rows
          console.log(user[0].nama)
          req.login(user, (err)=>{
            if (err) {
              console.log("login error:",err)
            } else {
              console.log("success")
              res.redirect("/")
            }
          })
        }
      })
    } 
    else {
      res.send("<strong>email sudah terdaftar</strong>") // jika tidak menemukan user di database
    }
  } 
  catch (err) {
    console.log(err)  //jika gagal konek ke database
  }
});



app.get("/training-home", async (req, res) => {
  if (req.isAuthenticated()){
    const studentName = req.user[0].nama
    const studentId = req.user[0].id
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
  
    const studentProgressAdd = await db.query(`
      SELECT course_id,
        ROUND((SUM(CASE WHEN complete = true THEN 1 ELSE 0 END)::decimal / COUNT(*)) * 100) AS complete
      FROM
        student_additionalcourse_progress
      WHERE 
        student_id = $1
      GROUP BY
        course_id
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
      page:"training",
      studentName
    });

  } else {
    res.render("login/login.ejs")
  }
  
});

//--------------task-page--------------------//

app.get("/task", async (req, res)=>{
  if (req.isAuthenticated()){
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
      success:successAlert
    });
  } else {
    res.render("login/login.ejs")
  }

})

app.post("/task-answer", async(req,res)=>{
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


//--------------------forum-page----------------//

app.get("/forum", async (req, res)=>{
 
  if (req.isAuthenticated()){
    const studentName = req.user[0].nama
    const result = await db.query(`SELECT * FROM public.post ORDER BY id DESC `)
    const result2 = await db.query("SELECT * FROM student ORDER BY id ASC")
    const result3 = await db.query("SELECT * FROM post_comment ORDER BY id ASC")
    const posts = result.rows
    const students = result2.rows
    const comments = result3.rows
    console.log(students)
    res.render("forum.ejs", {
      page:"forum",
      studentName,
      posts,
      students,
      comments
    });
  } else {
    res.render("login/login.ejs")
  }
})

app.get("/post/content", async (req, res)=>{

  if (req.isAuthenticated()){
    const postId = req.query.id
    const studentName = req.user[0].nama
    await db.query("UPDATE post SET view = view + 1 WHERE id=$1",[postId])
    const result1 = await db.query(`SELECT * FROM public.post where id = $1 ORDER BY id ASC`, [postId])
    const result2 = await db.query("SELECT * FROM student ORDER BY id ASC")
    const result3 = await db.query("SELECT * FROM public.post_comment where post_id = $1 ORDER BY id ASC ", [postId])
    const post = result1.rows[0]
    const students = result2.rows
    const comments = result3.rows
    console.log(students)
    res.render("forum-content.ejs", {
      page:"forum",
      studentName,
      post,
      students,
      comments
    });
  } else {
    res.render("login/login.ejs")
  }
})

app.post("/forum", async (req,res)=>{
  const title = req.body.title
  const body = req.body.body
  const id = req.user[0].id
  const today = new Date();
  const formattedDate = formatDate(today);
  try {
    const result1 = await db.query("insert into post (student_id, title, body, view, comment_count, date) values ($1,$2,$3,0,0,$4)", [id, title, body,formattedDate ])
    res.redirect("/forum")
  } catch(err) {
    console.log("error insert to db:",err)
  }
})


//-------------------------------------/training--------------------------//
app.get("/training", async (req, res) => {
  if (req.isAuthenticated()){
    const studentName = req.user[0].nama
    const courseId = req.query.id;
    const studentId = req.user[0].id
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
            page:"training",
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
    res.render("login/login.ejs")
  }
  
});

app.get("/training/main", async (req, res) => {
  if (req.isAuthenticated()){
    const studentName = req.user[0].nama
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
            page:"training",
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
    res.render("login/login.ejs")
  }
 
});

//----------------------------------//---------------------

app.get("/training/content", async (req, res) => {
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

// Handle post complete lesson
app.post("/training/update-progress", async (req, res) => {
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

passport.use(new Strategy(async function verify (username, password, cb) {
  try {
    var result = await db.query("SELECT * FROM student WHERE email = $1", [username])
    const user = result.rows
    if (user.length > 0) {                      
      var userStoredPassword = result.rows[0].password
      bcrypt.compare(password,userStoredPassword,(err,same)=>{
        if (err) {
          console.error("error comparing password",err)
          return cb(err)
        }
        else {
          if (same) {
            return cb(null, user)
          }
          else {
            return cb(null,false)
          }}
      })  
    }
    else {
      res.render("login.ejs",{message:"email anda belum terdaftar"})
    }
  } 
  catch(err) {
    console.log(err)
  }
}))

passport.use("google", new GoogleStrategy({
  clientID:process.env.GOOGLE_CLIENT_ID,
  clientSecret:process.env.GOOGLE_CLIENT_SECRET,
  callbackURL:"http://localhost:3000/auth/google/duetomorrow",
  userProfileURL:"https://www.googleapis.com/oauth2/v3/userinfo"
  }, async (accesToken, refreshToken, profile, cb) => {
    try {
      const result = await db.query("select * from student where email = $1", [profile.email])
      if (result.rows.length == 0) {
        const newUser = await db.query("insert into student (nama,email,password) values ($1,$2,$3) returning *",[profile.displayName,profile.email,"google"])
        await NewStudent()
        cb(null, newUser.rows)
      } else {
        const user = result.rows
        console.log(user)
        cb(null, user)
      }
    }catch (err) {
      cb(err)
    }
  })
)



passport.serializeUser((user, cb) => {
  cb(null, user);
});
passport.deserializeUser((user, cb) => {
  cb(null, user);
});




app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
