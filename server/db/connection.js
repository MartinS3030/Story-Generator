const messages = require('../lang/messages/en/user.js');
const mysql = require('mysql2');
require('dotenv').config();

/**
 * Establishes a connection to the MySQL database.
 */
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT

});

db.connect(err => {
    if (err) {
        console.error(messages.dbConnectionError, err.message);
    } else {
        console.log(messages.dbConnectionSuccess);
    }
});

/**
 * Creates the users table if it does not exist.
 */
const createUserTable = () => {
    const query = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            password VARCHAR(255) NOT NULL,
            is_admin BOOLEAN DEFAULT FALSE
        )
    `;
    db.query(query, (err) => {
        if (err) {
            console.error(messages.userTableCreationFailure, err.message);
        }
    });
};

/**
 * Creates the api_usage table if it does not exist.
 */
const createApiUsageTable = () => {
    const query = `
        CREATE TABLE IF NOT EXISTS api_usage (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            api_calls INT DEFAULT 20,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `;
    db.query(query, (err) => {
        if (err) {
            console.error(messages.apiUsageTableCreationFailure, err.message);
        }
    });
}

module.exports = { db, createUserTable, createApiUsageTable };
