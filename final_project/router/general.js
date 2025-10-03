const express = require('express');
const axios = require('axios');
const books = require('./booksdb.js').books;

const public_users = express.Router();

// Task 1: Get all books (synchronous)
public_users.get('/', function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4)); // neat formatting per PDF
});

// Task 2: Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).json(books[isbn]);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

// Task 3: Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const matches = Object.keys(books)
    .filter(key => books[key].author.toLowerCase() === author.toLowerCase())
    .map(key => books[key]);
  if (matches.length > 0) return res.status(200).json(matches);
  return res.status(404).json({ message: "No books by that author" });
});

// Task 4: Get books by title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const matches = Object.keys(books)
    .filter(key => books[key].title.toLowerCase() === title.toLowerCase())
    .map(key => books[key]);
  if (matches.length > 0) return res.status(200).json(matches);
  return res.status(404).json({ message: "No books with that title" });
});

// Task 5: Get book reviews
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).json(books[isbn].reviews || {});
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

/* --- Tasks 10-13: Promise / Async-Await versions using Axios --- */

/*
 Note: these use axios to call the server's own endpoints.
 When testing, make sure server is running and requests are to localhost:5000
*/

// Task 10: get all books using Axios + Promise
public_users.get('/promise', (req, res) => {
  const base = `${req.protocol}://${req.get('host')}`;
  axios.get(`${base}/`)
    .then(response => res.status(200).send(response.data))
    .catch(err => res.status(500).json({ error: err.message }));
});

// Task 11: get book by ISBN using async/await + axios
public_users.get('/promise/isbn/:isbn', async (req, res) => {
  try {
    const base = `${req.protocol}://${req.get('host')}`;
    const response = await axios.get(`${base}/isbn/${req.params.isbn}`);
    return res.status(200).json(response.data);
  } catch (err) {
    return res.status(404).json({ message: "Book not found (async)" });
  }
});

// Task 12: get books by author (async)
public_users.get('/promise/author/:author', async (req, res) => {
  try {
    const base = `${req.protocol}://${req.get('host')}`;
    const response = await axios.get(`${base}/author/${encodeURIComponent(req.params.author)}`);
    return res.status(200).json(response.data);
  } catch (err) {
    return res.status(404).json({ message: "No books by that author (async)" });
  }
});

// Task 13: get books by title (async)
public_users.get('/promise/title/:title', async (req, res) => {
  try {
    const base = `${req.protocol}://${req.get('host')}`;
    const response = await axios.get(`${base}/title/${encodeURIComponent(req.params.title)}`);
    return res.status(200).json(response.data);
  } catch (err) {
    return res.status(404).json({ message: "No books with that title (async)" });
  }
});

module.exports.general = public_users;
