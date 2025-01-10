import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

export const connection = mysql.createConnection({
  host: process.env.MYSQL_HOST,       // Replace with your MySQL host (localhost if running locally)
  user: process.env.MYSQL_USER,            // Replace with your MySQL username (root is default)
  password: process.env.MYSQL_PASS ,  // Replace with your MySQL password
  database: process.env.MYSQL_DATABASE // Replace with your MySQL database name
});

