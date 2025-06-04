const { db } = require("./connection");
const messages = require("../lang/messages/en/user.js");

/**
 * Inserts a new row into `api_usage` with the user_id.
 * @param {number} id - The user ID.
 * @param {number} apiCalls - Number of API calls.
 * @param {function(Error, Object):void} callback - Callback function.
 */
const addNewApiUsage = (id, apiCalls, callback) => {
  const query = `INSERT INTO api_usage (user_id, api_calls) VALUES (?, ?)`;
  db.query(query, [id, apiCalls], (err, results) => {
    if (err) return callback(err, null);
    callback(null, results);
  });
};

/**
 * Registers a new user in the database.
 * @param {string} username - The username of the user.
 * @param {string} email - The email address of the user.
 * @param {string} password - The hashed password of the user.
 * @param {function(Error, Object):void} callback - Callback function with error and results.
 */
const registerUser = (username, email, password, callback) => {
  const query = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
  db.query(query, [username, email, password], (err, results) => {
    if (err) return callback(err, null);

    // After inserting the user, insert the API usage
    addNewApiUsage(results.insertId, 20, (apiErr, apiResults) => {
      if (apiErr) return callback(apiErr, null);
      callback(null, { user: results, apiUsage: apiResults });
    });
  });
};

/**
 * Finds a user by email.
 * @param {string} email - The email of the user.
 * @param {function(Error, Object):void} callback - Callback function with error and results.
 */
const findUserByEmail = (email, callback) => {
  const query = `SELECT * FROM users WHERE email = ?`;
  db.query(query, [email], (err, results) => {
    if (err) return callback(err, null);
    callback(null, results);
  });
};

/**
 * Finds a user by ID.
 * @param {number} id - The user ID.
 * @param {function(Error, Object):void} callback - Callback function with error and results.
 */
const findUserById = (id, callback) => {
  const query = `SELECT * FROM users WHERE id = ?`;
  db.query(query, [id], (err, results) => {
    if (err) return callback(err, null);
    callback(null, results);
  });
}

/**
 * Fetches all users from the database.
 * @param {function(Error, Object):void} callback - Callback function with error and results.
 */
const fetchAllUsers = (callback) => {
  const query = "SELECT * FROM users";
  db.query(query, (err, results) => {
    if (err) return callback(err, null);
    callback(null, results);
  });
};

/**
 * Deletes a user from the database by ID.
 * @param {number} id - The user ID to delete.
 * @param {function(Error, Object):void} callback - Callback function with error and results.
 */
const deleteUser = (id, callback) => {
  const query = "DELETE FROM users WHERE id = ?";
  db.query(query, [id], (err, results) => {
    if (err) return callback(err, null);
    callback(null, results);
  });
};

/**
 * Updates a user's username by ID.
 * @param {number} id - The user ID.
 * @param {string} username - The new username.
 * @param {function(Error, Object):void} callback - Callback function with error and results.
 */
const updateUser = (id, username, callback) => {
  const query = "UPDATE users SET username = ? WHERE id = ?";
  db.query(query, [username, id], (err, results) => {
    if (err) return callback(err, null);
    callback(null, results);
  });
};

/**
 * Decrements the API call count for a user. If not found, inserts a new row with 19 API calls.
 * @param {number} id - The user ID.
 * @param {function(Error, Object):void} callback - Callback function with error and results.
 */
const decrementApiCalls = (id, callback) => {
  const updateQuery = `UPDATE api_usage SET api_calls = GREATEST(0, api_calls - 1) WHERE user_id = ?`;

  db.query(updateQuery, [id], (err, results) => {
    if (err) return callback(err, null);

    // No row was updated, meaning the user_id does not exist in api_usage
    if (results.affectedRows === 0) {
      // Insert a new row with 19 API calls
      addNewApiUsage(id, 19, (insertErr, insertResults) => {
        if (insertErr) return callback(insertErr, null);
        callback(null, { message: messages.apiUsageUserNotFound, api_calls: 19 });
      });
    } else {
      callback(null, results);
    }
  });
};

/**
 * Gets the API call count for a user.
 * @param {number} id - The user ID.
 * @param {function(Error, Object):void} callback - Callback function with error and results.
 */
const getApiCallCount= (id, callback) => {
    const query = `SELECT api_calls FROM api_usage WHERE user_id = ?`;
    db.query(query, [id], (err, results) => {
    if (err) return callback(err, null);

    // If no result found, create a new entry
    if (results.length === 0) {
      addNewApiUsage(id, 20, (insertErr, insertResults) => {
        if (insertErr) return callback(insertErr, null);
        callback(null, { message: messages.apiUsageUserNotFound, api_calls: 20 });
      });
    } else {
      // Return api_calls value if user found
      callback(null, { api_calls: results[0].api_calls });
    }
  });
}

/**
 * Increments the request count for an API endpoint.
 * @param {string} route - The API endpoint.
 * @param {string} method - The HTTP method.
 * @param {function(Error, Object):void} callback - Callback function with error and results.
 */
const incrementCountInDB = (route, method, callback) => {
  const checkQuery = `SELECT * FROM resource WHERE endpoint = ? AND method = ?`;

  db.query(checkQuery, [route, method], (err, results) => {
    if (err) return callback(err, null);
    if (results.length > 0) {
      const updateQuery = `UPDATE resource SET requests = requests + 1 WHERE endpoint = ? AND method = ?`;
      db.query(updateQuery, [route, method], (updateErr, updateResults) => {
        if (updateErr) return callback(updateErr, null);
        callback(null, updateResults);
      });
    } else {
      addNewResource(route, method, (insertErr, insertResults) => {
        if (insertErr) return callback(insertErr, null);
        callback(null, insertResults);
      });
    }
  });
};

/**
 * Adds a new API endpoint record to the resource table.
 * @param {string} route - The API endpoint.
 * @param {string} method - The HTTP method.
 * @param {function(Error, Object):void} callback - Callback function with error and results.
 */
const addNewResource = (route, method, callback) => {
  const query = `INSERT INTO resource (endpoint, method, requests) VALUES (?, ?, 1)`;
  db.query(query, [route, method], (err, results) => {
    if (err) return callback(err, null);
    callback(null, results);
  });
};

/**
 * Retrieves all API endpoint usage records.
 * @param {function(Error, Object):void} callback - Callback function with error and results.
 */
const getAllResources = (callback) => {
  const query = "SELECT * FROM resource";
  db.query(query, (err, results) => {
    if (err) return callback(err, null);
    callback(null, results);
  });
};

module.exports = {
  registerUser,
  findUserByEmail,
  findUserById,
  fetchAllUsers,
  deleteUser,
  updateUser,
  decrementApiCalls,
  getApiCallCount,
  addNewApiUsage,
  incrementCountInDB,
  getAllResources,
};
