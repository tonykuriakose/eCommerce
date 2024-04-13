const User = require("../../models/userSchema");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Order = require("../../models/orderSchema");
const Coupon = require("../../models/couponSchema.js");
const Category = require("../../models/categorySchema");
const Product = require("../../models/productSchema");

//Admin Error Page
const pageNotFound1 = async (req, res) => {
  res.render("error");
};

// Login Management
const getLoginPage = async (req, res) => {
  if (req.session.admin) {
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
        res.redirect("/admin");
      } else {
        res.redirect("/admin/login");
      }
    } else {
      console.log("He's not an admin");
    }
  } catch (error) {
    res.redirect("/pageerror");
  }
};

const getLogout = async (req, res) => {
  try {
    req.session.admin = null;
    res.redirect("/admin/login");
  } catch (error) {
    res.redirect("/pageerror");
  }
};

// Admin DashBoard Management
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
    res.redirect("/admin/login");
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

    await newCoupon.save().then((data) => console.log(data));

    res.redirect("/admin/coupon");

    console.log(data);
  } catch (error) {
    res.redirect("/pageerror");
  }
};

const editCoupon = async (req, res) => {
  console.log("coupon wrking");
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
    var pink = await Coupon.deleteOne({ _id: id });
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
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  getDashboard,
  getLoginPage,
  verifyLogin,
  getLogout,
  pageNotFound1,
  loadCoupon,
  createCoupon,
  editCoupon,
  deleteCoupon,
  updateCoupon,
};
