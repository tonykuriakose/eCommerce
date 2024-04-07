const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin/adminController");

// Error Management
router.get("/pageerror", adminController.pageNotFound1);

// Admin Actions
router.get("/login", adminController.getLoginPage);
router.post("/login", adminController.verifyLogin);
router.get("/logout",  adminController.getLogout);
router.get("/", adminController.getDashboard);





module.exports = router;