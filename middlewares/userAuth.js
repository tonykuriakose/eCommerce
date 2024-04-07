const User = require("../models/userSchema");


const userAuth = (req, res, next) => {
    console.log("user login");
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


module.exports = userAuth;