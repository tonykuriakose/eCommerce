const express = require("express");
const session = require("express-session");
const path = require("path");
const dotenv = require("dotenv");
const db = require('./database/connection');
const userrouter = require("./router/userrouter");
const adminrouter = require("./router/adminrouter");
dotenv.config();
db();
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set view engine and static folder
app.set("view engine", "ejs");
app.set("views", [
  path.join(__dirname, "views/user"),
  path.join(__dirname, "views/admin"),
]);
app.use(express.static(path.join(__dirname, "public")));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 72 * 60 * 60 * 1000,
    httpOnly: true,
  },
}));

// Set Cache-Control header to prevent caching
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

// Routes
app.use("/", userrouter);
app.use("/admin", adminrouter);

// Handle routes not found
app.use("/admin/*", (req, res) => {
  res.render('error');
});
app.use("/*", (req, res) => {
  res.redirect("/pageNotFound");
});

// Start server
app.listen(process.env.PORT, () => {
  console.log("Server Running");
});
