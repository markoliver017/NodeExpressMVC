// const mysql = require('mysql2/promise');

// const pool = mysql.createPool({
//     host: 'localhost',
//     user: 'root',
//     password: '',
//     database: 'mydb',
//     waitForConnections: true,
//     connectionLimit: 10,
//     queueLimit: 0
// })

// module.exports = pool;

const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");
dotenv.config();

// const sequelize = new Sequelize("mydb", "root", "root", {
const sequelize = new Sequelize(
    process.env.DB_NAME || "blood_donation_db", //database
    process.env.DB_USER || "root", //username
    process.env.DB_PASSWORD || "root", //password
    {
        host: process.env.DB_HOST,
        dialect: "mysql", // Use 'mysql' for MySQL databases
        logging: false, // Disable SQL query logging in console
        // logging: (...msg) => console.log(msg),
    }
);

module.exports = sequelize;
