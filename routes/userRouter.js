const express = require("express");
const router = express.Router();
const userLogin = require("../middlewares/userAuth");
const userController = require("../controllers/user/userController");
const userProfileController= require("../controllers/user/userProfileController");
const userAuth = require("../middlewares/userAuth");

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
router.get("/shop", userController.loadShoppingpage);

// User profile management
router.get("/userprofile",userProfileController.getUserProfile)
router.post("/editUserDetails",userProfileController.editUserDetails)
router.get("/addAddress",userProfileController.getAddressAddPage)
router.post("/addAddress",userProfileController.postAddress)
router.get("/editAddress",userProfileController.getEditAddress)
router.post("/editAddress",userProfileController.postEditAddress)
router.get("/deleteAddress",userProfileController.getDeleteAddress)

module.exports = router;