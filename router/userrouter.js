const express = require("express");
const Router = express.Router();
const userController = require("../controllers/userController");
const userProfileController = require("../controllers/userProfileController");
const productController = require('../controllers/productController');
const { isLogged } = require("../middlewares/auth");

// Error Page
Router.get("/pageNotFound", userController.pageNotFound);

// User Routes
Router.get("/login", userController.getLoginPage);
Router.post("/login", userController.userLogin);
Router.get("/signup", userController.getSignupPage);
Router.post("/signup", userController.signupUser);
Router.post("/verify-otp", userController.verifyOtp);
Router.post('/resend-otp', userController.resendOtp);

// Home page
Router.get("/", userController.getHomePage);
Router.get("/shop", userController.getShopPage);
Router.get("/logout", isLogged, userController.getLogoutUser);

// Forgot Password
Router.get("/forgotPassword", userProfileController.getForgotPassPage);
Router.post("/forgotEmailValid", userProfileController.forgotEmailValid);
Router.post("/verifyPassOtp", userProfileController.verifyForgotPassOtp);
Router.get("/resetPassword", userProfileController.getResetPassPage);
Router.post("/changePassword", userProfileController.postNewPassword);


// Products Routes
Router.get("/productDetails", isLogged, productController.productDetails);

module.exports = Router;
