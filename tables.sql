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