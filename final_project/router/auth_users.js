const express = require('express');
const jwt = require('jsonwebtoken');
const books = require('./booksdb.js').books;

const regd_users = express.Router();

// simple in-memory user store (array of {username,password})
let users = [];

const isValid = (username) => {
  return users.some(user => user.username === username);
};

const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
};

// Task 6 - Register a new user (POST /customer/register)
regd_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: "Username and password required" });
  if (isValid(username)) return res.status(400).json({ message: "User already exists" });
  users.push({ username, password });
  return res.status(200).json({ message: "User registered successfully" });
});

// Task 7 - Login (POST /customer/login)
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: "Username and password required" });
  if (!authenticatedUser(username, password)) return res.status(401).json({ message: "Invalid credentials" });

  // create a JWT and store it in session as per PDF instructions
  const accessToken = jwt.sign({ username: username }, "access", { expiresIn: "1h" });

  // save credentials in session
  req.session.authorization = {
    accessToken,
    username
  };

  return res.status(200).json({ message: "Logged in successfully", accessToken });
});

// Task 8 - Add or modify a review (PUT /customer/auth/review/:isbn?review=...)
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const reviewText = req.query.review;
  const username = req.session && req.session.authorization && req.session.authorization.username;

  if (!username) return res.status(401).json({ message: "You must be logged in to post a review" });
  if (!reviewText) return res.status(400).json({ message: "Please provide review text as query parameter: ?review=..." });
  if (!books[isbn]) return res.status(404).json({ message: "Book not found" });

  books[isbn].reviews = books[isbn].reviews || {};
  // add or modify user's review
  books[isbn].reviews[username] = reviewText;

  return res.status(200).json({ message: "Review added/modified", reviews: books[isbn].reviews });
});

// Task 9 - Delete a review (DELETE /customer/auth/review/:isbn)
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session && req.session.authorization && req.session.authorization.username;
  if (!username) return res.status(401).json({ message: "You must be logged in to delete a review" });
  if (!books[isbn]) return res.status(404).json({ message: "Book not found" });
  if (books[isbn].reviews && books[isbn].reviews[username]) {
    delete books[isbn].reviews[username];
    return res.status(200).json({ message: "Review deleted", reviews: books[isbn].reviews });
  } else {
    return res.status(404).json({ message: "Review by user not found" });
  }
});

module.exports = { authenticated: regd_users, users, isValid, authenticatedUser };
