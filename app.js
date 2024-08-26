'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3');
const path = require('path');

const app = express();
const db = new sqlite3.Database('data.db');

const ten = 10;
const ninety = 90;
const fourHundred = 400;
const fourHundredOne = 401;
const fourHundredThree = 403;
const fourHundredFour = 404;
const fiveHundred = 500;
const threeThousand = 3000;

// Middlewares
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.static('public'));
app.use('/images', express.static(path.join(__dirname, 'img')));

// Serve index.html for the base route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API route to get all products or product data matching a given search term
app.get('/api/products', async (req, res) => {
  try {
    let query;
    if (req.query.search) {
      const searchTerm = req.query.search;
      query = 'SELECT id, name, category, type, description, price FROM items WHERE TRIM(name) LIKE\
        ? ORDER BY id ASC';
      const results = await runQuery(query, [`%${searchTerm}%`]);
      if (results.length === 0) {
        res.status(fourHundredFour).send('Yikes. Product does not exist.');
      } else {
        res.json(results);
      }
    } else {
      query = 'SELECT id, name, category, type, description, price FROM items ORDER BY id ASC';
      const results = await runQuery(query);
      res.json(results);
    }
  } catch (err) {
    console.error(err);
    res.status(fiveHundred).send('An error occurred on the server. Try again later.');
  }
});

// API route for fetching products by category
app.get('/api/products/:category', async (req, res) => {
  try {
    const query = 'SELECT id, name, category, type, description, price FROM items WHERE category =\
      ? ORDER BY id ASC';
    const results = await runQuery(query, [req.params.category]);

    if (results.length === 0) {
      res.status(fourHundredFour).send('Product does not exist.');
    } else {
      res.json(results);
    }
  } catch (err) {
    console.error(err);
    res.status(fiveHundred).send('An error occurred on the server. Try again later.');
  }
});

// API route for fetching products by type
app.get('/api/type/:type', async (req, res) => {
  try {
    const query = 'SELECT id, name, category, type, description, price FROM items WHERE type = ?\
      ORDER BY id ASC';
    const results = await runQuery(query, [req.params.type]);

    if (results.length === 0) {
      res.status(fourHundredFour).send('Product does not exist.');
    } else {
      res.json(results);
    }
  } catch (err) {
    console.error(err);
    res.status(fiveHundred).send('An error occurred on the server. Try again later.');
  }
});

// API route for login
app.post('/api/login', (req, res) => {
  const {username, password} = req.body;

  // Replace these hardcoded credentials with your authentication logic
  const hardcodedUsername = "cooluser";
  const hardcodedPassword = "dawgs123";

  if (username === hardcodedUsername && password === hardcodedPassword) {
    res.json({success: true, message: "Login successful"});
  } else {
    res.status(fourHundredOne).json({success: false, message: "Invalid username or password"});
  }
});

// API route for purchase
app.post('/api/purchase', async (req, res) => {
  const {userId, itemId} = req.body;

  // Check for hardcoded username
  if (userId !== "cooluser") {
    return res.status(fourHundredOne).json({success: false, message: 'Unauthorized user'});
  }

  // Validate the item ID
  const itemQuery = 'SELECT * FROM items WHERE id = ?';
  const item = await runQuery(itemQuery, [itemId]);
  if (item.length === 0) {
    return res.status(fourHundred).json({success: false, message: 'Invalid item ID'});
  }

  try {
    const orderid = Math.floor(ten + Math.random() * ninety);

    const purchaseQuery = 'INSERT INTO ex (username, items, orderid) VALUES (?, ?, ?)';
    await runQuery(purchaseQuery, [userId, JSON.stringify([itemId]), orderid]);

    res.json({success: true, message: 'Purchase successful', orderid: orderid});
  } catch (error) {
    console.error('Purchase API Error:', error);
    res.status(fiveHundred).json({success: false, message: 'An error occurred on the server.'});
  }
});

// API route to search a user's purchase history by username
app.get('/api/purchase-history/:username', async (req, res) => {
  const {username} = req.params;

  if (username !== "cooluser") { // Check for hardcoded username
    return res.status(fourHundredThree).json({success: false, message: 'Unauthorized'});
  }

  try {
    // Using simple line breaks and indentation for readability
    const query = 'SELECT orderid, items ' +
                  'FROM ex ' +
                  'WHERE username = ?';
    const history = await runQuery(query, [username]);

    // Map each order to include item details
    const purchaseHistory = await Promise.all(history.map(async (purchase) => {
      const itemIds = JSON.parse(purchase.items);

      // Use the same line break and concatenation approach for consistency
      const itemDetailsQuery = 'SELECT id, name, category, type, description, price ' +
                               'FROM items ' +
                               'WHERE id IN (' + itemIds.map(() => '?').join(',') + ')';
      const items = await runQuery(itemDetailsQuery, itemIds);
      return {
        orderid: purchase.orderid,
        items: items
      };
    }));

    res.json({success: true, purchaseHistory});
  } catch (error) {
    console.error('Purchase History API Error:', error);
    res.status(fiveHundred).json({success: false, message: 'An error occurred while retrieving\
      purchase history.'});
  }
});

// API route for recommendations
app.post('/api/recommendations', async (req, res) => {
  try {
    const {itemIds} = req.body;

    // Ensure itemIds is an array
    if (!Array.isArray(itemIds)) {
      return res.status(fourHundred).json({success: false, message: 'Invalid itemIds format'});
    }

    // Fetch recommendations based on the provided itemIds
    const recommendations = await fetchRecommendations(itemIds);

    res.json({success: true, recommendations});
  } catch (error) {
    console.error('Recommendations API Error:', error);
    res.status(fiveHundred).json({success: false, message: 'An error occurred on the server.'});
  }
});

/**
 * Fetch recommendations based on provided itemIds
 * @param {Array} itemIds item IDs
 * @returns {Array} list of recommendations
 */
async function fetchRecommendations(itemIds) {
  try {
    const placeholder = itemIds.map(() => '?').join(',');
    const query = 'SELECT id, name, category, type, description, price ' +
                  'FROM items ' +
                  'WHERE id NOT IN (' + placeholder + ') ' +
                  'ORDER BY RANDOM() LIMIT 3';

    const recommendations = await runQuery(query, itemIds);

    return recommendations;
  } catch (error) {
    throw error;
  }
}

/**
 * Runs a query against the database
 * @param {SQL} query The SQL query
 * @param {Array} params An array of parameters
 * @returns {Promise} A promise that resolves with a result and rejects with an error
 */
function runQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// Server setup
const PORT = process.env.PORT || threeThousand;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});