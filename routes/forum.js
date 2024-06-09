import express from 'express';
import db from '../db.js'
import { formatDate } from './utils.js'

const router = express.Router();

router.get("/forum", async (req, res)=>{
 
    if (req.isAuthenticated()){
      const studentName = req.user[0].nama
      const admin = req.user[0].admin
      const result = await db.query(`SELECT * FROM public.post ORDER BY id DESC `)
      const result2 = await db.query("SELECT * FROM student ORDER BY id ASC")
      const result3 = await db.query("SELECT * FROM post_comment ORDER BY id ASC")
      const posts = result.rows
      const students = result2.rows
      const comments = result3.rows
      res.render("forum.ejs", {
        page:"forum",
        studentName,
        posts,
        students,
        comments,
        admin
      });
    } else {
      res.render("login/login.ejs")
    }
  })
  
  router.get("/post/content", async (req, res)=>{
  
    if (req.isAuthenticated()){
      const postId = req.query.id
      const studentName = req.user[0].nama
      const studentId = req.user[0].id
      if (!req.query.comment) {
        await db.query("UPDATE post SET view = view + 1 WHERE id=$1",[postId])
      }
      const result1 = await db.query(`SELECT * FROM public.post where id = $1 ORDER BY id ASC`, [postId])
      const result2 = await db.query("SELECT * FROM student ORDER BY id ASC")
      const result3 = await db.query("SELECT * FROM public.post_comment where post_id = $1 ORDER BY id ASC ", [postId])
      const post = result1.rows[0]
      const students = result2.rows
      const comments = result3.rows
      res.render("forum-content.ejs", {
        page:"forum",
        studentName,
        studentId,
        post,
        students,
        comments
      });
    } else {
      res.render("login/login.ejs")
    }
  })

router.get("/post-delete", async (req,res)=>{
  if (req.isAuthenticated()){
    const postId = req.query.id
    try {
      await db.query("DELETE FROM post_comment WHERE post_id=$1", [postId]); // Optional: Delete related comments
      await db.query("DELETE FROM post WHERE id=$1", [postId]);
      res.redirect("/forum")
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: 'Failed to delete post' });
    } 
  } else {
    res.status(401).send({ error: 'User not authenticated' });
  }
}) 

  
  router.post("/forum", async (req,res)=>{
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

  router.post("/post-content", async (req,res)=>{
    if (req.isAuthenticated()) {
      const studentId = req.user[0].id
      const postId = req.query.id
      const body = req.body.comment
      console.log(postId)
      const today = new Date();
      const formattedDate = formatDate(today);
      try {
        const result = await db.query("insert into post_comment (post_id, student_id, body, date) values ($1,$2,$3,$4)", [postId, studentId, body, formattedDate])
        res.redirect(`post/content?id=${postId}&comment=yes`)
      } catch (err) {console.log(err)}
    }
  })
  
  

export default router;
