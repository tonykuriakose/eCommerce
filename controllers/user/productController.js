const Product = require("../../models/productSchema");
const Category = require("../../models/categorySchema");
const Brand = require("../../models/brandSchema");
const fs = require("fs");
const path = require("path");
const User = require("../../models/userSchema");


const productDetails = async (req, res) => {
  try {
    const user = req.session.user;
    const userData = await User.findOne({ _id: user });
    const id = req.query.id;
    const product = await Product.findOne({ id: id });
    const findCategory = await Category.findOne({ _id: product.category });

    let totalOffer;
    if (findCategory.categoryOffer || product.productOffer) {
      totalOffer = findCategory.categoryOffer + product.productOffer;
    }

    const categories = await Category.find({});

    console.log(categories, "fullcategories");
    console.log(product, "product");
    let quantity = product.quantity;
    console.log(quantity, "quantity");

    res.render("productdetail", {
      user: userData,
      product: product,
      quantity: quantity,
      categories: categories,
      totalOffer: totalOffer,
      singlecat:findCategory

    });
  } catch (error) {
    res.redirect("/pageNotFound");
  }
};

module.exports = {
productDetails,
}