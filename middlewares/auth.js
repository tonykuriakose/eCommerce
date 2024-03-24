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

module.exports = {
    isLogged,
    isAdmin
};
