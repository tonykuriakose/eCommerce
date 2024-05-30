const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin/adminController");
const customerController = require("../controllers/admin/customerController");
const categoryController = require("../controllers/admin/categoryController");
const brandController = require("../controllers/admin/brandController");
const productController = require("../controllers/admin/productController");
const bannerController = require("../controllers/admin/bannerController");
const orderController = require("../controllers/admin/orderController");
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

// Product Management
router.get("/addProducts", adminAuth, productController.getProductAddPage);
router.post("/addProductsm",adminAuth,upload.array("images", 4),productController.addProducts);
router.get("/products", adminAuth, productController.getAllProducts);
router.get("/editProduct", adminAuth, productController.getEditProduct);
router.post("/editProduct/:id",adminAuth,upload.array("images", 5),productController.editProduct);
router.post("/deleteImage", adminAuth, productController.deleteSingleImage);
router.get("/blockProduct", adminAuth, productController.getBlockProduct);
router.get("/unBlockProduct", adminAuth, productController.getUnblockProduct);
router.post("/addProductOffer", adminAuth, productController.addProductOffer);
router.post("/removeProductOffer",adminAuth,productController.removeProductOffer);

// Coupon Management
router.get("/coupon", adminAuth, adminController.loadCoupon);
router.post("/createCoupon", adminAuth, adminController.createCoupon);
router.get("/editCoupon",adminAuth,adminController.editCoupon);
router.get("/deleteCoupon",adminAuth,adminController.deleteCoupon);
router.post("/updatecoupon",adminAuth,adminController.updateCoupon);

// Banner Management
router.get("/banner", adminAuth, bannerController.bannerManagement);
router.get("/addBanner", adminAuth, bannerController.getAddBannerPage);
router.post("/addBanner",adminAuth,upload.single("images"),bannerController.postAddBanner);
router.get("/editBanner", adminAuth, bannerController.getEditBannerPage);
router.post("/editBanner",adminAuth,upload.single("images"),bannerController.postEditBanner);
router.get("/deleteBanner", adminAuth, bannerController.deleteBanner);
router.post("/deletebannerImage", adminAuth, bannerController.deletebannerImage);

// Order Management
router.get("/orderList", adminAuth, orderController.getOrderListPageAdmin)
router.get("/orderDetailsAdmin", adminAuth, orderController.getOrderDetailsPageAdmin)
router.get("/changeStatus", adminAuth, orderController.changeOrderStatus);

// Sales Management
router.get("/salesReport", adminAuth, adminController.getSalesReportPage)
router.get("/salesToday", adminAuth, adminController.salesToday)
router.get("/salesWeekly", adminAuth, adminController.salesWeekly)
router.get("/salesMonthly", adminAuth, adminController.salesMonthly)
router.get("/salesYearly", adminAuth, adminController.salesYearly)
router.post("/generatePdf", adminAuth, adminController.generatePdf)
router.post("/downloadExcel", adminAuth, adminController.downloadExcel)
router.get("/monthly-report", adminAuth,adminController.monthlyreport)
router.get("/dateWiseFilter", adminAuth, adminController.dateWiseFilter)

module.exports = router;