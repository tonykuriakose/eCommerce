const express = require("express");
const router = express.Router();
const userLogin = require("../middlewares/userAuth");
const userController = require("../controllers/user/userController");

// Error Management
router.get("/pageNotFound", userController.pageNotFound);


router.get('/signup',userController.loadSignup);
router.post('/signup',userController.signup);
router.post("/verify-otp", userController.verifyOtp);
router.post('/resend-otp', userController.resendOtp);


module.exports = router;