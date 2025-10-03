const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');

const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();
app.use(express.json());

// session middleware for /customer routes (secret from PDF)
app.use("/customer", session({
  secret: "fingerprint_customer",
  resave: true,
  saveUninitialized: true
}));

// authentication middleware for protected routes under /customer/auth/*
app.use("/customer/auth/*", function auth(req, res, next) {
  try {
    const auth = req.session && req.session.authorization;
    if (!auth || !auth.accessToken) {
      return res.status(401).json({ message: "Unauthorized - no session" });
    }
    const token = auth.accessToken;
    // verify JWT (secret must match the one used when creating token)
    jwt.verify(token, "access", (err, user) => {
      if (err) return res.status(401).json({ message: "Invalid or expired token" });
      req.user = user; // attach verified payload if needed downstream
      next();
    });
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
});

const PORT = 5000;
app.use("/customer", customer_routes); // routes: /customer/register, /customer/login, /customer/auth/...
app.use("/", genl_routes);               // public routes: / , /isbn/:isbn, /author/:author, /title/:title, /review/:isbn
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
