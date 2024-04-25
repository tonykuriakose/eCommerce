const Brand = require("../../models/brandSchema");
const Product = require("../../models/productSchema");

// Brand Management
const getBrandPage = async (req, res) => {
  try {
    const page = req.body.page || 1;
    const limit = 3;
    const skip = (page-1)*limit;
    const brandData = await Brand.find({}).sort().skip().limit();
    res.render("brands", { data: brandData });
  } catch (error) {
    res.redirect("/pageerror");
  }
};


const addBrand = async (req, res) => {
  try {
    const brand = req.body.name;
    const findBrand = await Brand.findOne({ brand });
    if (!findBrand) {
      const image = req.file.filename;
      const newBrand = new Brand({
        brandName: brand,
        brandImage: image,
      });
      await newBrand.save();
      res.redirect("/admin/brands");
    }
  } catch (error) {
    res.redirect("/pageerror");
  }
};

const getAllBrands = async (req, res) => {
  try {
    const brandData = await Brand.find({});
    res.render("brands", { data: brandData });
  } catch (error) {
    res.redirect("/pageerror");
  }
};

const blockBrand = async (req, res) => {
  try {
    const id = req.query.id;
    await Brand.updateOne({ _id: id }, { $set: { isBlocked: true } });
    res.redirect("/admin/brands");
  } catch (error) {
    res.redirect("/pageerror");
  }
};

const unBlockBrand = async (req, res) => {
  try {
    const id = req.query.id;
    await Brand.updateOne({ _id: id }, { $set: { isBlocked: false } });
    res.redirect("/admin/brands");
  } catch (error) {
    res.redirect("/pageerror");
  }
};

const deletebrand = async (req, res) => {
  try {
    const id = req.query.id;
    var pink = await Brand.deleteOne({ _id: id });
    res.redirect("/admin/brands");
  } catch (error) {
    res.redirect("/pageerror");
  }
};

module.exports = {
  getBrandPage,
  addBrand,
  getAllBrands,
  blockBrand,
  unBlockBrand,
  deletebrand,
};
