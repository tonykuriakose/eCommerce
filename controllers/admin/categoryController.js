const Category = require("../../models/categorySchema");
const Product=require("../../models/productSchema")

// category Page
const getCategoryInfo = async (req, res) => {
  try {
      const page = parseInt(req.query.page) || 1;
      const limit = 2;
      const skip = (page - 1) * limit;
      const categoryData = await Category.find({})
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit);
      const totalCategories = await Category.countDocuments();
      const totalPages = Math.ceil(totalCategories / limit);
      res.render("category", { 
          cat: categoryData,
          currentPage: page,
          totalPages: totalPages,
          totalCategories: totalCategories
      });
  } catch (error) {
      res.redirect("/pageerror");
  }
};

// add new category
const addCategory = async (req, res) => {
  const { name, description } = req.body;
  try {
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ error: 'Category already exists' });
    }
    const newCategory = new Category({
      name: name,
      description: description,
    });
    const savedCategory = await newCategory.save();
    console.log(savedCategory, "savedCategory");
    res.redirect("/admin/category");
  } catch (error) {
    console.error("Error adding category:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//get all categories
const getAllCategories = async (req, res) => {
  try {
    const page = req.query.page;
    const categoryData = await Category.find({});
    res.render("category", { cat: categoryData });
  } catch (error) {
     res.redirect("/pageerror");
  }
};

//category list
const getListCategory = async (req, res) => {
  try {
    let id = req.query.id;
    console.log("wrking");
    await Category.updateOne({ _id: id }, { $set: { isListed: false } });
    res.redirect("/admin/category");
  } catch (error) {
     res.redirect("/pageerror");
  }
};

//unlist categories
const getUnlistCategory = async (req, res) => {
  try {
    let id = req.query.id;
    await Category.updateOne({ _id: id }, { $set: { isListed: true } });
    res.redirect("/admin/category");
  } catch (error) {
     res.redirect("/pageerror");
  }
};

//edit category page
const getEditCategory = async (req, res) => {
  try {
    const id = req.query.id;
    const category = await Category.findOne({ _id: id });
    res.render("edit-category", { category: category });
  } catch (error) {
     res.redirect("/pageerror");
  }
};

//edit category
const editCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const { categoryName, description } = req.body;
    const existingCategory = await Category.findOne({ name: categoryName });
    if (existingCategory && existingCategory._id.toString() !== id) {
      return res.status(400).json({ error: "Category exist,Please choose another name." });
    }
    const updatedCategory = await Category.findByIdAndUpdate(id, {
      name: categoryName,
      description: description,
    }, { new: true });
    if (updatedCategory) {
      res.redirect("/admin/category");
    } else {
      console.log("Category not found");
      res.status(404).json({ error: "Category not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

//add category offer
const addCategoryOffer = async (req, res) => {
  console.log(req.body,"<><><>");
  try {
      const percentage = parseInt(req.body.percentage);
      const categoryId = req.body.categoryId;
      const findCategory = await Category.findOne({ _id: categoryId });
      const productData = await Product.find({ category: findCategory._id });
      const hasProductOffer = productData.some(product => product.productOffer > percentage);
      if (hasProductOffer) {
          return res.json({ status: false, message: "Products within this category already have product offers." });
      }
      await Category.updateOne(
          { _id: categoryId },
          { $set: { categoryOffer: percentage } }
      );
      for (const product of productData) {
          product.productOffer = 0;
          product.salePrice = product.regularPrice;
          await product.save();
      }

      console.log("Category offer added successfully.");
      res.json({ status: true });

  } catch (error) {
       res.redirect("/pageerror");
      res.status(500).json({ status: false, message: "Internal Server Error" });
  }
}

//remove category offer
const removerCategoryOffer = async (req, res)=>{
  try {
      console.log(req.body,"canceling");
      const categoryId = req.body.categoryId
      const findCategory = await Category.findOne({_id : categoryId})
      console.log(findCategory);
      const percentage = findCategory.categoryOffer
      const productData = await Product.find({category : findCategory._id})

      if(productData.length > 0){
          for(const product of productData){
              product.salePrice = product.salePrice +  Math.floor(product.regularPrice * (percentage / 100))
              await product.save()
          }
      }

      findCategory.categoryOffer = 0
      await findCategory.save()

      res.json({status : true})

  } catch (error) {
       res.redirect("/pageerror");
  }
}

module.exports = {
  getCategoryInfo,
  addCategory,
  getAllCategories,
  getListCategory,
  getUnlistCategory,
  editCategory,
  getEditCategory,
  addCategoryOffer,
  removerCategoryOffer
};
