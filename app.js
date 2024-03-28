const express = require("express");
const session = require("express-session");
const path = require("path");
const dotenv = require("dotenv");
const db = require('./database/connection');
const userrouter = require("./router/userrouter");
const adminrouter = require("./router/adminrouter");
const { errorHandler } = require("./middlewares/auth");
const { cacheControl } = require("./middlewares/auth");

dotenv.config();
db();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 72 * 60 * 60 * 5000,
    httpOnly: true,
  },
}));
app.use(cacheControl());

// View engine and static folder
app.set("view engine", "ejs");
app.set("views", [
  path.join(__dirname, "views/user"),
  path.join(__dirname, "views/admin"),
]);
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/", userrouter);
app.use("/admin", adminrouter);

// Error handling
app.use(errorHandler);

// Start server
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log("Server running");
});
