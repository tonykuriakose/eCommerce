const Category = require("../models/categorySchema");
const Product=require("../models/productSchema")

// Rendering the category page
const getCategoryInfo = async (req, res) => {
  try {
    const categoryData = await Category.find({});
    res.render("category", { cat: categoryData });
  } catch (error) {
     res.redirect("/pageerror");
  }
};

const addCategory = async (req, res) => {
  console.log(req.body);
  const { name, description } = req.body;

  try {
    // Check if a category with the same name already exists
    const existingCategory = await Category.findOne({ name });

    if (existingCategory) {
      // If a category with the same name exists, return an error
      return res.status(400).json({ error: 'Category already exists' });
    }

    // If no category with the same name exists, create a new category
    const newCategory = new Category({
      name: name,
      description: description,
    });

    // Save the new category
    const result = await newCategory.save();
    console.log(result, "result");

    // Redirect to the page showing all categories
    res.redirect("/admin/allCategory");
  } catch (error) {
    // Handle any errors that occur during the process
    console.error("Error adding category:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



const getAllCategories = async (req, res) => {
  try {
    const categoryData = await Category.find({});
    res.render("category", { cat: categoryData });
  } catch (error) {
     res.redirect("/pageerror");
  }
};

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

const getUnlistCategory = async (req, res) => {
  try {
    let id = req.query.id;
    await Category.updateOne({ _id: id }, { $set: { isListed: true } });
    res.redirect("/admin/category");
  } catch (error) {
     res.redirect("/pageerror");
  }
};

const getEditCategory = async (req, res) => {
  try {
    const id = req.query.id;
    const category = await Category.findOne({ _id: id });
    res.render("edit-category", { category: category });
  } catch (error) {
     res.redirect("/pageerror");
  }
};

const editCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const { categoryName, description } = req.body;
    const existingCategory = await Category.findOne({ name: categoryName });

    if (existingCategory && existingCategory._id.toString() !== id) {
      // Another category with the same name already exists
      return res.status(400).json({ error: "Category exist,Please choose another name." });
    }

    const updatedCategory = await Category.findByIdAndUpdate(id, {
      name: categoryName,
      description: description,
    }, { new: true });

    if (updatedCategory) {
      res.redirect("/admin/category");
    } else {
      // Category not found
      console.log("Category not found");
      res.status(404).json({ error: "Category not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};


const addCategoryOffer = async (req, res) => {
  console.log(req.body,"<><><>");
  try {
      const percentage = parseInt(req.body.percentage);
      const categoryId = req.body.categoryId;

      const findCategory = await Category.findOne({ _id: categoryId });
      const productData = await Product.find({ category: findCategory._id });

      // Check if any product within the category has a non-zero productOffer
      const hasProductOffer = productData.some(product => product.productOffer > percentage);

      if (hasProductOffer) {
          console.log("Products within this category already have product offers. Category offer not added.");
          return res.json({ status: false, message: "Products within this category already have product offers." });
      }

      // Update categoryOffer only if no product within the category has a productOffer
      await Category.updateOne(
          { _id: categoryId },
          { $set: { categoryOffer: percentage } }
      );

      // Update productOffer to zero for all products within the category
      for (const product of productData) {
          product.productOffer = 0;
          product.salePrice = product.regularPrice; // Reset salePrice
          await product.save();
      }

      console.log("Category offer added successfully.");
      res.json({ status: true });

  } catch (error) {
       res.redirect("/pageerror");
      // res.status(500).json({ status: false, message: "Internal Server Error" });
  }
}


const removerCategoryOffer = async (req, res)=>{
  try {
      console.log(req.body,"canceling");
      const categoryId = req.body.categoryId
      const findCategory = await Category.findOne({_id : categoryId})
      console.log(findCategory);

      const percentage = findCategory.categoryOffer
      // console.log(percentage);
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
