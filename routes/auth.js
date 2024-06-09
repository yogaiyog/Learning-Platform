// routes/auth.js
import express from 'express';
import passport from 'passport';
import bcrypt from 'bcrypt';
import { NewStudent } from './utils.js';  // Ensure the path is correct
import db from '../db.js';  // Ensure the path is correct

const router = express.Router();
const saltRounds = 10;

router.get("/login", (req, res) => {
  res.render("login/login.ejs");
});

router.get("/register", (req, res) => {
  res.render("login/register.ejs");
});

router.post("/login", passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/login",
}));

router.get("/auth/google", passport.authenticate("google", {
  scope: ["profile", "email"]
}));

router.get("/auth/google/duetomorrow", passport.authenticate("google", {
  successRedirect: "/",
  failureRedirect: "/login",
}));

router.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/login");
  });
});

router.post("/register", async (req, res) => {
  const { username, password, nama } = req.body;
  try {
    const checkEmail = await db.query(`SELECT * FROM student WHERE email = $1`, [username]);
    if (checkEmail.rows.length === 0) {
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          console.log("Error hashing password:", err);
        } else {
          const result = await db.query("INSERT INTO student (nama, email, password) VALUES ($1, $2, $3) RETURNING *", [nama, username, hash]);
          await NewStudent();
          const user = result.rows;
          req.login(user, (err) => {
            if (err) {
              console.log("Login error:", err);
            } else {
              res.redirect("/");
            }
          });
        }
      });
    } else {
      res.send("<strong>Email already registered</strong>");
    }
  } catch (err) {
    console.log(err);
  }
});

export default router;
