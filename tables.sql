-- Creates a 'login' table
CREATE TABLE IF NOT EXISTS login (
  username TEXT PRIMARY KEY,
  password TEXT NOT NULL
);

-- Creates an 'items' table
CREATE TABLE IF NOT EXISTS items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  type TEXT,
  description TEXT,
  price REAL
);

-- Creates a 'purchases' (or 'ex' as per your database) table
CREATE TABLE IF NOT EXISTS ex (
  username TEXT NOT NULL,
  orderid INTEGER PRIMARY KEY AUTOINCREMENT,
  items TEXT NOT NULL,
  FOREIGN KEY (username) REFERENCES login(username)
);

-- Creates a 'reviews' table
CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  username TEXT NOT NULL,
  rating INTEGER NOT NULL,
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES items(id),
  FOREIGN KEY (username) REFERENCES login(username)
);
