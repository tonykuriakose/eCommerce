const User = require("../../models/userSchema");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Order = require("../../models/orderSchema");
const Coupon = require("../../models/couponSchema.js")
const Category = require("../../models/categorySchema");
const Product = require("../../models/productSchema");

//Admin Error Page
const pageNotFound1 = async (req, res) => {
  res.render("error"); 
};
//Admin DashBoard
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

      console.log(order, "orders ");
      console.log(category, "category ");
      console.log(product, "product ");

      res.render("dashboard", {
        product: product,
        category: category,
        order: order,
      });
    } catch (error) {
       res.redirect("/pageerror");;
    }
  } else {
    res.redirect("/admin/login");
  }
};

//Admin login page
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
       res.redirect("/pageerror");;
    }
  }
};

const verifyLogin = async (req, res) => {
  console.log("is route calling");
  try {
    const { email, password } = req.body;
    console.log(email, "mail");
    console.log("pass-", password);
    const findAdmin = await User.findOne({ email, isAdmin: true });
    console.log(findAdmin);
    if (findAdmin) {
      const passwordMatch = await bcrypt.compare(password, findAdmin.password);
      if (passwordMatch) {
        req.session.admin = true;
        console.log("Admin Logged In");
        res.redirect("/admin");
      } else {
        console.log("Password is not correct");
        res.redirect("/admin/login");
      }
    } else {
      console.log("He's not an admin");
    }
  } catch (error) {
     res.redirect("/pageerror");;
  }
};
// Admin Logout
const getLogout = async (req, res) => {
  try {
    req.session.admin = null;
    res.redirect("/admin/login");
  } catch (error) {
     res.redirect("/pageerror");;
  }
};

module.exports = {
  getDashboard,
  getLoginPage,
  verifyLogin,
  getLogout,
  pageNotFound1,
}
