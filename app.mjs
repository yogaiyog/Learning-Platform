import express from "express";
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
app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", async (req, res) => {
  const data = await db.query("SELECT * FROM additional_course");
  const datarows = data.rows;
  res.render("index", {
    addCourse: datarows,
  });
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
