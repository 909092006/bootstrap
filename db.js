require('dotenv').config();
const mysql = require('mysql2');

const connection = mysql.createPool(
    {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306 // Agregamos el puerto por si acaso
    }
);

// ESTA ES LA LÍNEA QUE DEBES AGREGAR AL FINAL:
module.exports = connection.promise();