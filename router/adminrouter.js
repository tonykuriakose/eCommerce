const express = require("express");
const Router = express.Router();
const adminController = require('../controllers/adminController');
const categoryController = require('../controllers/categoryController');
const productController = require('../controllers/productController');
const customerController = require('../controllers/customerController');
const brandController = require('../controllers/brandController');
const bannerController = require('../controllers/bannerController');
const { isAdmin } = require("../middlewares/auth");
const multer = require("multer");
const storage = require("../helpers/multer");
const upload = multer({ storage: storage });

// Serve uploaded files
Router.use("/public/uploads", express.static("/public/uploads"));
// Error Management
Router.get("/pageerror", adminController.pageNotFound1);
// Admin Actions
Router.get("/login", adminController.getLoginPage);
Router.post("/login", adminController.verifyLogin);
Router.get("/logout", isAdmin, adminController.getLogout);
Router.get("/", isAdmin, adminController.getDashboard);
// Category Management
Router.get("/category", isAdmin, categoryController.getCategoryInfo);
Router.post("/addCategory", isAdmin, categoryController.addCategory);
Router.get("/allCategory", isAdmin, categoryController.getAllCategories);
Router.get("/listCategory", isAdmin, categoryController.getListCategory);
Router.get("/unListCategory", isAdmin, categoryController.getUnlistCategory);
Router.get("/editCategory", isAdmin, categoryController.getEditCategory);
Router.post("/editCategory/:id", isAdmin, categoryController.editCategory);
Router.post("/addCategoryOffer", isAdmin, categoryController.addCategoryOffer);
Router.post("/removeCategoryOffer", isAdmin, categoryController.removerCategoryOffer);
// Product Management
Router.get("/addProducts", isAdmin, productController.getProductAddPage);
Router.post("/addProductsm", isAdmin, upload.array("images", 5), productController.addProducts);
Router.get("/products", isAdmin, productController.getAllProducts);
Router.get("/editProduct", isAdmin, productController.getEditProduct);
Router.post("/editProduct/:id", isAdmin, upload.array("images", 5), productController.editProduct);
Router.post("/deleteImage", isAdmin, productController.deleteSingleImage);
Router.get("/blockProduct", isAdmin, productController.getBlockProduct);
Router.get("/unBlockProduct", isAdmin, productController.getUnblockProduct);
Router.post("/addProductOffer", isAdmin, productController.addProductOffer);
Router.post("/removeProductOffer", isAdmin, productController.removeProductOffer);
// Customer Management
Router.get("/users", isAdmin, customerController.getCustomersInfo);
Router.get("/blockCustomer", isAdmin, customerController.getCustomerBlocked);
Router.get("/unblockCustomer", isAdmin, customerController.getCustomerUnblocked);
// Brand Management
Router.get("/brands", isAdmin, brandController.getBrandPage);
Router.post("/addBrand", isAdmin, upload.single('image'), brandController.addBrand);
Router.get("/allBrands", isAdmin, brandController.getAllBrands);
Router.get("/blockBrand", isAdmin, brandController.blockBrand);
Router.get("/unBlockBrand", isAdmin, brandController.unBlockBrand);
Router.get("/deletebrand", isAdmin, brandController.deletebrand);
// Banner Management
Router.get("/banner", isAdmin, bannerController.bannerManagement);
Router.get("/addBanner", isAdmin, bannerController.getAddBannerPage);
Router.post("/addBanner", isAdmin, upload.single("images"), bannerController.postAddBanner);
Router.get("/editBanner", isAdmin, bannerController.getEditBannerPage);
Router.post("/editBanner", isAdmin, upload.single("images"), bannerController.postEditBanner);
Router.get("/deleteBanner", isAdmin, bannerController.deleteBanner);
Router.post("/deletebannerImage", isAdmin, bannerController.deletebannerImage);

module.exports = Router;
