import express from 'express';
import passport from 'passport';
import session from 'express-session';
import bodyParser from 'body-parser';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { Strategy } from "passport-local";
import GoogleStrategy from "passport-google-oauth2";
import db from './db.js';  // Ensure the path is correct
import bcrypt from "bcrypt"
import memorystore from 'memorystore';

const MemoryStore = memorystore(session);
dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({ 
  secret: process.env.SESSION_SECRET, resave: false, 
  saveUninitialized: true,
  cookie: { maxAge: 86400000 },
  store: new MemoryStore({
    checkPeriod: 86400000 // prune expired entries every 24h
  }),

 }));

app.use(passport.initialize());
app.use(passport.session());

// Import routes
import authRoutes from './routes/auth.js';
import indexRoutes from './routes/index.js';
import trainingRoutes from './routes/training.js';
import taskRoutes from './routes/task.js';
import forumRoutes from './routes/forum.js';

// Use routes
app.use(authRoutes);
app.use(indexRoutes);
app.use(trainingRoutes);
app.use(taskRoutes);
app.use(forumRoutes);

// Handle 404
app.use((req, res) => {
  res.status(404).render('404');
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
  
  


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
