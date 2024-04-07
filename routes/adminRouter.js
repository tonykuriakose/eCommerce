const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin/adminController");
const customerController = require("../controllers/admin/customerController");
const adminAuth = require("../middlewares/adminAuth");

// Error Management
router.get("/pageerror", adminController.pageNotFound1);

// Admin login and Dashboard
router.get("/login", adminController.getLoginPage);
router.post("/login", adminController.verifyLogin);
router.get("/logout",  adminController.getLogout);
router.get("/", adminAuth,adminController.getDashboard);

// Customer Management
router.get("/users", adminAuth, customerController.getCustomersInfo);
router.get("/blockCustomer", adminAuth, customerController.getCustomerBlocked);
router.get("/unblockCustomer",adminAuth,customerController.getCustomerUnblocked);


module.exports = router;