const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin/adminController");
const customerController = require("../controllers/admin/customerController");
const categoryController = require("../controllers/admin/categoryController");
const brandController = require("../controllers/admin/brandController");
const adminAuth = require("../middlewares/adminAuth");
const multer = require("multer");
const storage = require("../helpers/multer");
const upload = multer({ storage: storage });


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

// Category Management
router.get("/category", adminAuth, categoryController.getCategoryInfo);
router.post("/addCategory", adminAuth, categoryController.addCategory);
router.get("/allCategory", adminAuth, categoryController.getAllCategories);
router.get("/listCategory", adminAuth, categoryController.getListCategory);
router.get("/unListCategory", adminAuth, categoryController.getUnlistCategory);
router.get("/editCategory", adminAuth, categoryController.getEditCategory);
router.post("/editCategory/:id", adminAuth, categoryController.editCategory);
router.post("/addCategoryOffer", adminAuth, categoryController.addCategoryOffer);
router.post("/removeCategoryOffer",adminAuth,categoryController.removerCategoryOffer);

// Brand Management
router.get("/brands", adminAuth, brandController.getBrandPage);
router.post( "/addBrand",adminAuth,upload.single("image"),brandController.addBrand);
router.get("/allBrands", adminAuth, brandController.getAllBrands);
router.get("/blockBrand", adminAuth, brandController.blockBrand);
router.get("/unBlockBrand", adminAuth, brandController.unBlockBrand);
router.get("/deletebrand", adminAuth, brandController.deletebrand);



module.exports = router;