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
};

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
const getApiCallCount = (id, callback) => {
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
};

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

/**
 * Adds a new story for a user, including inserting any associated tags.
 * If a tag doesn't exist, it will be created.
 * @param {number} userId - ID of the user creating the story.
 * @param {string} title - Title of the story.
 * @param {string} content - Content of the story.
 * @param {string[]} tags - Array of tag names to associate with the story.
 * @param {function(Error, Object):void} callback - Callback function with error and results.
 */
const addNewStory = (userId, title, content, tags, callback) => {
  const insertStoryQuery = `INSERT INTO stories (user_id, title, content, created_at) VALUES (?, ?, ?, NOW())`;

  db.query(insertStoryQuery, [userId, title, content], (err, storyResult) => {
    if (err) return callback(err, null);

    const storyId = storyResult.insertId;

    if (!tags || tags.length === 0) return callback(null, { story: storyResult, tags: [] });

    const tagInsertPromises = tags.map(tag =>
      new Promise((resolve, reject) => {
        const insertTagQuery = `INSERT INTO tags (name) VALUES (?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)`;
        db.query(insertTagQuery, [tag], (tagErr, tagResult) => {
          if (tagErr) return reject(tagErr);
          resolve(tagResult.insertId);
        });
      })
    );

    Promise.all(tagInsertPromises)
      .then(tagIds => {
        const storyTagValues = tagIds.map(tagId => [storyId, tagId]);
        const insertStoryTagsQuery = `INSERT INTO story_tags (story_id, tag_id) VALUES ?`;
        db.query(insertStoryTagsQuery, [storyTagValues], (linkErr, linkResults) => {
          if (linkErr) return callback(linkErr, null);
          callback(null, { story: storyResult, tags: tagIds });
        });
      })
      .catch(tagErr => callback(tagErr, null));
  });
};

/**
 * Deletes a story by ID, including its tag associations.
 * @param {number} storyId - The ID of the story to delete.
 * @param {function(Error, Object):void} callback - Callback function with error and results.
 */
const deleteStory = (storyId, callback) => {
  const deleteLinksQuery = `DELETE FROM story_tags WHERE story_id = ?`;
  db.query(deleteLinksQuery, [storyId], (err) => {
    if (err) return callback(err, null);

    const deleteStoryQuery = `DELETE FROM stories WHERE id = ?`;
    db.query(deleteStoryQuery, [storyId], (storyErr, storyResult) => {
      if (storyErr) return callback(storyErr, null);
      callback(null, storyResult);
    });
  });
};

/**
 * Retrieves all stories created by a user, along with their associated tags.
 * @param {number} userId - The ID of the user whose stories to retrieve.
 * @param {function(Error, Object[]):void} callback - Callback function with error and results (array of stories).
 */
const getStoriesForUser = (userId, callback) => {
  const query = `
    SELECT s.*, GROUP_CONCAT(t.name) AS tags
    FROM stories s
    LEFT JOIN story_tags st ON s.id = st.story_id
    LEFT JOIN tags t ON st.tag_id = t.id
    WHERE s.user_id = ?
    GROUP BY s.id
  `;
  db.query(query, [userId], (err, results) => {
    if (err) return callback(err, null);
    const stories = results.map(row => ({
      id: row.id,
      user_id: row.user_id,
      title: row.title,
      content: row.content,
      is_favorite: row.is_favorite,
      created_at: row.created_at,
      tags: row.tags ? row.tags.split(',') : []
    }));
    callback(null, stories);
  });
};

/**
 * Updates the favorite status of a story.
 * @param {number} storyId - The ID of the story.
 * @param {boolean} isFavorite - True to mark as favorite, false to unmark.
 * @param {function(Error, Object):void} callback - Callback function with error and results.
 */
const setStoryFavoriteStatus = (storyId, isFavorite, callback) => {
  const query = `UPDATE stories SET is_favorite = ? WHERE id = ?`;
  db.query(query, [isFavorite ? 1 : 0, storyId], (err, results) => {
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
  addNewStory,
  deleteStory,
  getStoriesForUser,
  setStoryFavoriteStatus,
};

