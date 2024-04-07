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

// Coupon Management
const loadCoupon = async (req, res) => {
  try {
      const findCoupons = await Coupon.find({})
      res.render("coupon", { coupons: findCoupons })
  } catch (error) {
       res.redirect("/pageerror");;
  }
}

const createCoupon = async (req, res) => {
  try {

      const data = {
          couponName: req.body.couponName,
          startDate: new Date(req.body.startDate + 'T00:00:00'),
          endDate: new Date(req.body.endDate + 'T00:00:00'),
          offerPrice: parseInt(req.body.offerPrice),
          minimumPrice: parseInt(req.body.minimumPrice)
      };

      const newCoupon = new Coupon({
          name: data.couponName,
          createdOn: data.startDate,
          expireOn: data.endDate,
          offerPrice: data.offerPrice,
          minimumPrice: data.minimumPrice
      })

      await newCoupon.save()
          .then(data => console.log(data))

      res.redirect("/admin/coupon")

      console.log(data);

  } catch (error) {
       res.redirect("/pageerror");;
  }
}


const editCoupon=async(req,res)=>{
  console.log("coupon wrking");
  try {
    console.log(req.query,"======>");
    const id = req.query.id;
    console.log(id,"iddddddd");
    
    const findCoupon = await Coupon.findOne({ _id: id });
console.log(findCoupon,"findCoupon");
    res.render("edit-coupon",{
      findCoupon:findCoupon
    })
  } catch (error) {
     res.redirect("/pageerror");;
  }

}
const deleteCoupon=async(req,res)=>{
  console.log("deleteworking");
  try {
    const id =req.query.id
    console.log(id,"idddd");
   var pink= await Coupon.deleteOne({_id : id})
   
    res.redirect("/admin/coupon")
    
  } catch (error) {
     res.redirect("/pageerror");
  }

}
const updateCoupon = async (req, res) => {
  console.log("update working");
  try {
    const couponId = req.body.couponId;
    console.log(req.body,"req  body");   

    const oid = new mongoose.Types.ObjectId(couponId);
    console.log(oid, "oid");
    // Attempt to find the coupon
    const selectedCoupon = await Coupon.findOne({ _id: oid });
     console.log(selectedCoupon,"oko");
    if (selectedCoupon) {
      console.log(selectedCoupon, "coupon found");
      const startDate = new Date(req.body.startDate);
      const endDate = new Date(req.body.endDate);
      console.log(req.body.minimumPrice,"mininprice");
      const updatedCoupon = await Coupon.updateOne(
        { _id: oid },
        {
          $set: {
              name: req.body.couponName,
              createdOn: startDate,
              expireOn: endDate,
              offerPrice: parseInt(req.body.offerPrice),
              minimumPrice: parseInt(req.body.minimumPrice)
          }
      },
      { new: true } 
      );

      if (updatedCoupon !== null) { 
        console.log(updatedCoupon, "coupon updated successfully");
        res.send("Coupon updated successfully");
      } else {
        console.log("Coupon update failed");
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

}
