const express = require("express");
const router = express.Router();
const userController = require("../controllers/user/userController");
const userProfileController= require("../controllers/user/userProfileController");
const productController = require("../controllers/user/productController");
const cartController = require("../controllers/user/cartController");
const orderController = require("../controllers/user/orderController");
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
router.get("/forgotPassword", userProfileController.getForgotPassPage);
router.post("/forgotEmailValid", userProfileController.forgotEmailValid);
router.post("/verifyPassOtp", userProfileController.verifyForgotPassOtp);
router.get("/resetPassword", userProfileController.getResetPassPage);
router.post("/changePassword", userProfileController.postNewPassword);


// Home page & Shopping page
router.get("/", userController.loadHomepage);
router.get("/shop", userController.loadShoppingpage);
router.post("/search", userController.searchProducts)
router.get("/filter", userController.filterProduct)
router.get("/filterPrice", userController.filterByPrice)
router.post("/sortProducts", userController.getSortProducts)

// Products Routes
router.get("/productDetails", userAuth, productController.productDetails);

// Cart Management
router.get("/cart", userAuth, cartController.getCartPage)
router.post("/addToCart",userAuth, cartController.addToCart)
router.post("/changeQuantity", userAuth,cartController.changeQuantity)
router.get("/deleteItem", userAuth, cartController.deleteProduct)


// User profile management
router.get("/userprofile",userProfileController.getUserProfile);
router.get("/changePassword",userProfileController.getChangePassword);
router.post("/changePasswordValid", userProfileController.changePasswordValid);
router.get("/changeEmail",userProfileController.getChangeEmail);
router.post("/changeEmail",userProfileController.changeEmailValid);
router.post('/verifyEmailOtp',userProfileController.verifyEmailOtp);
router.post('/updateEmail',userProfileController.updateEmail);

router.post("/editUserDetails",userProfileController.editUserDetails);
router.get("/addAddress",userProfileController.getAddressAddPage);
router.post("/addAddress",userProfileController.postAddress);
router.get("/editAddress",userProfileController.getEditAddress);
router.post("/editAddress",userProfileController.postEditAddress);
router.get("/deleteAddress",userProfileController.getDeleteAddress);


// Order Management
router.get("/checkout", userAuth,orderController.getCheckoutPage)
router.get("/deleteItem", userAuth, orderController.deleteProduct)
router.post("/orderPlaced", userAuth,orderController.orderPlaced)
router.get("/orderDetails", userAuth,orderController.getOrderDetailsPage)
router.get("/cancelOrder",userAuth,orderController.cancelorder)
router.get("/returnrequestOrder",userAuth,orderController.returnorder)
router.post("/verifyPayment", userAuth, orderController.verify)
router.post("/singleProductId",userAuth,orderController.changeSingleProductStatus)
router.post('/paymentConfirm',userAuth,orderController.paymentConfirm)


module.exports = router;