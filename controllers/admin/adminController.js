const User = require("../../models/userSchema");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Order = require("../../models/orderSchema");
const Coupon = require("../../models/couponSchema.js");
const Category = require("../../models/categorySchema");
const Product = require("../../models/productSchema");
const moment = require("moment");
const ExcelJS = require("exceljs"); // Assuming you have this or similar package installed for Excel generation
const PDFDocument = require("pdfkit"); // Assuming you have this or similar package installed for PDF generation

// Admin Error Page
const pageNotFound1 = async (req, res) => {
  res.render("error");
};

// Login Management
const getLoginPage = async (req, res) => {
  if (req.session.admin) {
    try {
      let order = await Order.aggregate([
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalPrice: { $sum: "$totalPrice" },
          },
        },
      ]);
      let category = await Category.aggregate([
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
          },
        },
      ]);
      let product = await Product.aggregate([
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
          },
        },
      ]);
      res.render("dashboard", {
        product: product,
        category: category,
        order: order,
      });
    } catch (error) {
      res.redirect("/pageerror");
    }
  } else {
    try {
      res.render("admin-login");
    } catch (error) {
      res.redirect("/pageerror");
    }
  }
};

const verifyLogin = async (req, res) => {
  console.log("is route calling");
  try {
    const { email, password } = req.body;
    const findAdmin = await User.findOne({ email, isAdmin: true });
    if (findAdmin) {
      const passwordMatch = await bcrypt.compare(password, findAdmin.password);
      if (passwordMatch) {
        req.session.admin = true;
        return res.redirect("/admin"); // Use return to ensure only one response is sent
      } else {
        return res.redirect("/login"); // Use return to ensure only one response is sent
      }
    } else {
      console.log("He's not an admin");
      return res.redirect("/login"); // Ensure a response is always sent for non-admins
    }
  } catch (error) {
    console.error(error);
    return res.redirect("/pageerror"); // Ensure a response is always sent on error
  }
};

const getLogout = async (req, res) => {
  try {
    req.session.admin = null;
    res.redirect("/login");
  } catch (error) {
    res.redirect("/pageerror");
  }
};

// Admin Dashboard Management
const getDashboard = async (req, res) => {
  if (req.session.admin) {
    try {
      let order = await Order.aggregate([
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalPrice: { $sum: "$totalPrice" },
          },
        },
      ]);
      let category = await Category.aggregate([
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
          },
        },
      ]);
      let product = await Product.aggregate([
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
          },
        },
      ]);                                                                                                                                     
      res.render("dashboard", {
        product: product,                                                                                                                                                                           
        category: category,
        order: order,
      });
    } catch (error) {
      res.redirect("/pageerror");
    }
  } else {
    res.redirect("/login");
  }
};

// Coupon Management
const loadCoupon = async (req, res) => {
  try {
    const findCoupons = await Coupon.find({});
    res.render("coupon", { coupons: findCoupons });
  } catch (error) {
    res.redirect("/pageerror");
  }                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
};

const createCoupon = async (req, res) => {
  try {
    const data = {
      couponName: req.body.couponName,
      startDate: new Date(req.body.startDate + "T00:00:00"),
      endDate: new Date(req.body.endDate + "T00:00:00"),
      offerPrice: parseInt(req.body.offerPrice),
      minimumPrice: parseInt(req.body.minimumPrice),
    };

    const newCoupon = new Coupon({
      name: data.couponName,
      createdOn: data.startDate,
      expireOn: data.endDate,
      offerPrice: data.offerPrice,
      minimumPrice: data.minimumPrice,
    });

    await newCoupon.save();
    return res.redirect("/admin/coupon");

  } catch (error) {
    res.redirect("/pageerror");
  }
};

const editCoupon = async (req, res) => {
  try {
    const id = req.query.id;
    const findCoupon = await Coupon.findOne({ _id: id });
    res.render("edit-coupon", {
      findCoupon: findCoupon,
    });
  } catch (error) {
    res.redirect("/pageerror");
  }
};

const deleteCoupon = async (req, res) => {
  try {
    const id = req.query.id;
    await Coupon.deleteOne({ _id: id });
    res.redirect("/admin/coupon");
  } catch (error) {
    res.redirect("/pageerror");
  }
};

const updateCoupon = async (req, res) => {
  try {
    const couponId = req.body.couponId;
    const oid = new mongoose.Types.ObjectId(couponId);
    const selectedCoupon = await Coupon.findOne({ _id: oid });
    if (selectedCoupon) {
      const startDate = new Date(req.body.startDate);
      const endDate = new Date(req.body.endDate);
      const updatedCoupon = await Coupon.updateOne(
        { _id: oid },
        {
          $set: {
            name: req.body.couponName,
            createdOn: startDate,
            expireOn: endDate,
            offerPrice: parseInt(req.body.offerPrice),
            minimumPrice: parseInt(req.body.minimumPrice),
          },
        },
        { new: true }
      );

      if (updatedCoupon !== null) {
        res.send("Coupon updated successfully");
      } else {
        res.status(500).send("Coupon update failed");
      }
    }
  } catch (error) {
    res.redirect("/pageerror");
  }
};

// Sales Reports Management
const getSalesReportPage = async (req, res) => {
  try {
    const orders = await Order.find({ status: "Delivered" }).sort({ createdOn: -1 });
    let itemsPerPage = 5;
    let currentPage = parseInt(req.query.page) || 1;
    let startIndex = (currentPage - 1) * itemsPerPage;
    let endIndex = startIndex + itemsPerPage;
    let totalPages = Math.ceil(orders.length / itemsPerPage);
    const currentOrder = orders.slice(startIndex, endIndex);

    res.render("salesReport", {
      data: currentOrder,
      totalPages,
      currentPage,
    });

    console.log(req.query.day);
    let filterBy = req.query.day;
    if (filterBy) {
      res.redirect(`/${filterBy}`);
    } else {
      res.redirect(`/salesMonthly`);
    }
  } catch (error) {
    res.redirect("/pageerror");
  }
};

const salesToday = async (req, res) => {
  try {
    let today = new Date();
    const startOfTheDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      0,
      0,
      0,
      0
    );

    const endOfTheDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59,
      999
    );

    const orders = await Order.aggregate([
      {
        $match: {
          createdOn: {
            $gte: startOfTheDay,
            $lt: endOfTheDay,
          },
          status: "Delivered",
        },
      },
    ]).sort({ createdOn: -1 });

    let itemsPerPage = 5;
    let currentPage = parseInt(req.query.page) || 1;
    let startIndex = (currentPage - 1) * itemsPerPage;
    let endIndex = startIndex + itemsPerPage;
    let totalPages = Math.ceil(orders.length / itemsPerPage);
    const currentOrder = orders.slice(startIndex, endIndex);

    res.render("salesReport", {
      data: currentOrder,
      totalPages,
      currentPage,
      salesToday: true,
    });
  } catch (error) {
    res.redirect("/pageerror");
  }
};

const salesWeekly = async (req, res) => {
  try {
    let currentDate = new Date();
    const startOfTheWeek = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate() - currentDate.getDay()
    );

    const endOfTheWeek = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate() + (6 - currentDate.getDay()),
      23,
      59,
      59,
      999
    );

    const orders = await Order.aggregate([
      {
        $match: {
          createdOn: {
            $gte: startOfTheWeek,
            $lt: endOfTheWeek,
          },
          status: "Delivered",
        },
      },
    ]).sort({ createdOn: -1 });

    let itemsPerPage = 5;
    let currentPage = parseInt(req.query.page) || 1;
    let startIndex = (currentPage - 1) * itemsPerPage;
    let endIndex = startIndex + itemsPerPage;
    let totalPages = Math.ceil(orders.length / itemsPerPage);
    const currentOrder = orders.slice(startIndex, endIndex);

    res.render("salesReport", {
      data: currentOrder,
      totalPages,
      currentPage,
      salesWeekly: true,
    });
  } catch (error) {
    res.redirect("/pageerror");
  }
};

const salesMonthly = async (req, res) => {
  try {
    let currentDate = new Date();
    let startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    let endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);

    const orders = await Order.aggregate([
      {
        $match: {
          createdOn: {
            $gte: startOfMonth,
            $lt: endOfMonth,
          },
          status: "Delivered",
        },
      },
    ]).sort({ createdOn: -1 });

    let itemsPerPage = 5;
    let currentPage = parseInt(req.query.page) || 1;
    let startIndex = (currentPage - 1) * itemsPerPage;
    let endIndex = startIndex + itemsPerPage;
    let totalPages = Math.ceil(orders.length / itemsPerPage);
    const currentOrder = orders.slice(startIndex, endIndex);

    res.render("salesReport", {
      data: currentOrder,
      totalPages,
      currentPage,
      salesMonthly: true,
    });
  } catch (error) {
    res.redirect("/pageerror");
  }
};

const salesYearly = async (req, res) => {
  try {
    let currentDate = new Date();
    let startOfYear = new Date(currentDate.getFullYear(), 0, 1);
    let endOfYear = new Date(currentDate.getFullYear(), 11, 31, 23, 59, 59, 999);

    const orders = await Order.aggregate([
      {
        $match: {
          createdOn: {
            $gte: startOfYear,
            $lt: endOfYear,
          },
          status: "Delivered",
        },
      },
    ]).sort({ createdOn: -1 });

    let itemsPerPage = 5;
    let currentPage = parseInt(req.query.page) || 1;
    let startIndex = (currentPage - 1) * itemsPerPage;
    let endIndex = startIndex + itemsPerPage;
    let totalPages = Math.ceil(orders.length / itemsPerPage);
    const currentOrder = orders.slice(startIndex, endIndex);

    res.render("salesReport", {
      data: currentOrder,
      totalPages,
      currentPage,
      salesYearly: true,
    });
  } catch (error) {
    res.redirect("/pageerror");
  }
};

// Download Excel Report
const downloadExcel = async (req, res) => {
  try {
    const orders = await Order.find({ status: "Delivered" }).sort({ createdOn: -1 });
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sales Report");

    worksheet.columns = [
      { header: "Order ID", key: "id", width: 20 },
      { header: "User", key: "user", width: 25 },
      { header: "Product", key: "product", width: 30 },
      { header: "Quantity", key: "quantity", width: 10 },
      { header: "Total Price", key: "totalPrice", width: 15 },
      { header: "Status", key: "status", width: 10 },
      { header: "Created On", key: "createdOn", width: 20 },
    ];

    orders.forEach((order) => {
      worksheet.addRow({
        id: order._id,
        user: order.user,
        product: order.products.map((p) => p.productName).join(", "),
        quantity: order.products.length,
        totalPrice: order.totalPrice,
        status: order.status,
        createdOn: moment(order.createdOn).format("DD-MM-YYYY HH:mm:ss"),
      });
    });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=sales_report.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.redirect("/pageerror");
  }
};

// Generate PDF Report
const generatePdf = async (req, res) => {
  try {
    const orders = await Order.find({ status: "Delivered" }).sort({ createdOn: -1 });

    const doc = new PDFDocument();
    let filename = "sales_report.pdf";
    filename = encodeURIComponent(filename);
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "application/pdf");

    doc.text("Sales Report", {
      align: "center",
    });

    orders.forEach((order) => {
      doc.text(`Order ID: ${order._id}`);
      doc.text(`User: ${order.user}`);
      doc.text(`Product(s): ${order.products.map((p) => p.productName).join(", ")}`);
      doc.text(`Quantity: ${order.products.length}`);
      doc.text(`Total Price: ${order.totalPrice}`);
      doc.text(`Status: ${order.status}`);
      doc.text(`Created On: ${moment(order.createdOn).format("DD-MM-YYYY HH:mm:ss")}`);
      doc.moveDown();
    });

    doc.pipe(res);
    doc.end();
  } catch (error) {
    res.redirect("/pageerror");
  }
};

// Monthly Report
const monthlyreport = async (req, res) => {
  try {
    const { year, month } = req.query;

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const orders = await Order.find({
      createdOn: { $gte: startOfMonth, $lt: endOfMonth },
      status: "Delivered",
    }).sort({ createdOn: -1 });

    res.render("salesReport", {
      data: orders,
      salesMonthly: true,
    });
  } catch (error) {
    res.redirect("/pageerror");
  }
};

// Datewise Filter
const datewiseFilter = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = new Date(startDate);
    const end = new Date(new Date(endDate).setHours(23, 59, 59, 999));

    const orders = await Order.find({
      createdOn: { $gte: start, $lt: end },
      status: "Delivered",
    }).sort({ createdOn: -1 });

    res.render("salesReport", {
      data: orders,
      salesDatewise: true,
    });
  } catch (error) {
    res.redirect("/pageerror");
  }
};

module.exports = {
  pageNotFound1,
  getLoginPage,
  verifyLogin,
  getLogout,
  getDashboard,
  loadCoupon,
  createCoupon,
  editCoupon,
  deleteCoupon,
  updateCoupon,
  getSalesReportPage,
  salesToday,
  salesWeekly,
  salesMonthly,
  salesYearly,
  downloadExcel,
  generatePdf,
  monthlyreport,
  datewiseFilter,
};
