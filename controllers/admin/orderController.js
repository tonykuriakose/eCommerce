const User = require("../../models/userSchema");
const Product = require("../../models/productSchema");
const Address = require("../../models/addressSchema");
const Order = require("../../models/orderSchema");
const mongodb = require("mongodb");
const mongoose = require('mongoose')
const razorpay = require("razorpay");
const env = require("dotenv").config();
const crypto = require("crypto");
const Coupon=require("../../models/couponSchema");
const { v4: uuidv4 } = require('uuid');


const getOrderListPageAdmin = async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdOn: -1 });
    let itemsPerPage = 3;
    let currentPage = parseInt(req.query.page) || 1;
    let startIndex = (currentPage - 1) * itemsPerPage;
    let endIndex = startIndex + itemsPerPage;
    let totalPages = Math.ceil(orders.length / 3);
    const currentOrder = orders.slice(startIndex, endIndex);

    // Generate random unique order IDs
    currentOrder.forEach(order => {
      order.orderId = uuidv4();
    });

    res.render("order-list", { orders: currentOrder, totalPages, currentPage });
  } catch (error) {
    res.redirect("/pageerror");
  }
};



const changeOrderStatus = async (req, res) => {
  try {
    console.log(req.query);
    const orderId = req.query.orderId;
    console.log(orderId);
    const userId = req.query.userId;
      await Order.updateOne({ _id: orderId }, { status: req.query.status }).then(
        (data) => console.log(data)
      );
      const findOrder = await Order.findOne({ _id: orderId });
      console.log(findOrder,"changed order");
      if (findOrder.status.trim() === "Returned"&&(findOrder.payment === "razorpay"||findOrder.payment === "wallet"||findOrder.payment === "cod")) {
          console.log("It's a return");
          const findUser = await User.findOne({ _id:userId});
          console.log(findUser,"findUser1111111");
          if (findUser && findUser.wallet !== undefined) {
            findUser.wallet += findOrder.totalPrice;
            await findUser.save();
        } else {
            console.log("User not found or wallet is undefined");
        }
    await Order.updateOne({ _id: orderId }, { status: "Returned"});
    for (const productData of findOrder.product) {
      const productId = productData._id
      const quantity = productData.quantity
      const product = await Product.findById(productId);
      if (product) {
        product.quantity += quantity;
        await product.save();
      } else if (!product) {
        console.log("no product");
      }
    }
      
      }
     
    res.redirect("/admin/orderList");
  } catch (error) {
    res.redirect("/pageerror");
  }
};


const getOrderDetailsPageAdmin = async (req, res) => {
  try {
    const orderId = req.query.id;
    const findOrder = await Order.findOne({ _id: orderId }).sort({
      createdOn: 1,
    });
    res.render("order-details-admin", { orders: findOrder, orderId });
  } catch (error) {
    res.redirect("/pageerror");
  }
};


module.exports = {
  getOrderListPageAdmin,
  changeOrderStatus,
  getOrderDetailsPageAdmin,
}