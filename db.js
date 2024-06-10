// db.js
import dotenv from 'dotenv';
import pkg from 'pg';
const { Pool } = pkg;

dotenv.config();

const connectionString = 'postgres://postgres.niubpytvdkskzvmkqxyg:vUBuyv.Jt@EMNF7@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres';

const db = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

db.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log("Connected to Database!");

  // Release the client back to the pool
  release();
});

process.on('SIGINT', async () => {
  try {
    await db.end();
    console.log('Pool has ended');
    process.exit();
  } catch (err) {
    console.error('Error ending pool', err.stack);
    process.exit(1);
  }
});

export default db;
