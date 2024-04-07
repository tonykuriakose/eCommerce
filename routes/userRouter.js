const express = require("express");
const router = express.Router();
const userLogin = require("../middlewares/userAuth");
const userController = require("../controllers/user/userController");

// Error Management
router.get("/pageNotFound", userController.pageNotFound);

// Signup Management
router.get('/signup',userController.loadSignup);
router.post('/signup',userController.signup);
router.post("/verify-otp", userController.verifyOtp);
router.post('/resend-otp', userController.resendOtp);

// Login Management
router.get("/login", userController.loadLogin);
router.post("/login", userController.login);
router.get("/logout", userController.logout);

// Home page & Shopping page
router.get("/", userController.loadHomepage);



module.exports = router;