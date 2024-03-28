const User = require("../models/userSchema");
// Middleware to check if user is logged in
const isLogged = (req, res, next) => {
    console.log("Middleware calling");
    if (req.session.user) {
        User.findById(req.session.user)
            .then(data => {
                if (data && !data.isBlocked) {
                    next();
                } else {
                    res.redirect("/login");
                }
            })
            .catch(error => {
                console.error("Error in isLogged middleware:", error);
                res.status(500).send("Internal Server Error");
            });
    } else {
        console.log("Else case");
        res.redirect("/login");
    }
};

// Middleware to check if user is an admin
const isAdmin = (req, res, next) => {
    User.findOne({ isAdmin: "1" })
        .then(data => {
            if (data) {
                next();
            } else {
                res.redirect("/admin/login");
            }
        })
        .catch(error => {
            console.error("Error in isAdmin middleware:", error);
            res.status(500).send("Internal Server Error");
        });
};

// middleware/cacheControl.js
const cacheControl = () => {
    return (req, res, next) => {
      res.set('Cache-Control', 'no-store');
      next();
    };
  };
  
  // middleware/errorHandler.js

const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error');
  };
  
  module.exports = { errorHandler };
  
  

module.exports = {
    isLogged,
    isAdmin,
    cacheControl,
    errorHandler,
};
