require('dotenv').config();
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER.trim(), // El .trim() elimina espacios accidentales
  password: process.env.DB_PASSWORD.trim(),
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 4000,
  ssl: {
    rejectUnauthorized: false // Esto permite que Render se conecte aunque no reconozca el certificado
  }
});

module.exports = pool.promise();