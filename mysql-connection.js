import mysql from 'mysql2';

const connection = mysql.createConnection({
  host: '',       // Replace with your MySQL host (localhost if running locally)
  user: '',            // Replace with your MySQL username (root is default)
  password: '',  // Replace with your MySQL password
  database: '' // Replace with your MySQL database name
});

// Test the connection
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL successfully!');

  // Close the connection after testing
  connection.end();
});