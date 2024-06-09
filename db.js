// db.js
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const db = new pg.Client({
  user: 'postgres',
  host: "localhost",
  database: "dtr",
  password: "yoga65",
  port: 5432,
});

db.connect((err) => {
  if (err) throw err;
  console.log("Connected to Database!");
});

export default db;
