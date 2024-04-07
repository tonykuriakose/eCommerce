const express = require("express");
const router = express.Router();
const userLogin = require("../middlewares/userAuth");
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

// Home page & Shopping page
router.get("/", userController.loadHomepage);
router.get("/shop", userController.loadShoppingpage);

// User profile management
router.get("/userprofile",userProfileController.getUserProfile);
router.post("/editUserDetails",userProfileController.editUserDetails);
router.get("/addAddress",userProfileController.getAddressAddPage);
router.post("/addAddress",userProfileController.postAddress);
router.get("/editAddress",userProfileController.getEditAddress);
router.post("/editAddress",userProfileController.postEditAddress);
router.get("/deleteAddress",userProfileController.getDeleteAddress);

// Products Routes
router.get("/productDetails", userLogin, productController.productDetails);

// Cart Management
router.get("/cart", userLogin, cartController.getCartPage)
router.post("/addToCart",userLogin, cartController.addToCart)
router.post("/changeQuantity", userLogin,cartController.changeQuantity)
router.get("/deleteItem", userLogin, cartController.deleteProduct)

// Order Management
router.get("/checkout", userLogin,orderController.getCheckoutPage)
router.post("/orderPlaced", userLogin,orderController.orderPlaced)
router.get("/orderDetails", userLogin,orderController.getOrderDetailsPage)
router.get("/cancelOrder",userLogin,orderController.cancelorder)
router.get("/returnrequestOrder",userLogin,orderController.returnorder)
router.post("/verifyPayment", userLogin, orderController.verify)
router.post("/singleProductId",userLogin,orderController.changeSingleProductStatus)
router.post('/paymentConfirm',userLogin,orderController.paymentConfirm)


module.exports = router;