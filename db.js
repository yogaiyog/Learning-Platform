// db.js
import pg from 'pg'; // tiidak digunakan lagi
import dotenv from 'dotenv';
import pkg from 'pg';
const { Client } = pkg;

dotenv.config();

// const db = new pg.Client({
//   user: 'postgres',
//   host: "localhost",
//   database: "dtr",
//   password: "yoga65",
//   port: 5432,
// });

const connectionString = 'postgres://postgres.niubpytvdkskzvmkqxyg:vUBuyv.Jt@EMNF7@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres';


const db = new Client({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});


db.connect((err) => {
  if (err) throw err;
  console.log("Connected to Database!");
});


process.on('SIGINT', async () => {
  try {
    await client.end();
    console.log('Connection closed');
    process.exit();
  } catch (err) {
    console.error('Error closing connection', err.stack);
    process.exit(1);
  }
});


export default db;
