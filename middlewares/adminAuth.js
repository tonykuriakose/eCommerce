const User = require("../models/userSchema");


const adminAuth = (req, res, next) => {
    User.findOne({ isAdmin: true })
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


module.exports = adminAuth;