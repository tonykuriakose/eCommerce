const Product = require("../../models/productSchema");
const Category = require("../../models/categorySchema");
const Brand = require("../../models/brandSchema");
const fs = require("fs");
const path = require("path");
const User = require("../../models/userSchema");
const sharp = require("sharp");


const getProductAddPage = async (req, res) => {
  try {
    const category = await Category.find({ isListed: true });
    const brand = await Brand.find({ isBlocked: false });
    res.render("product-add", { cat: category, brand: brand });
  } catch (error) {
    res.redirect("/pageerror");
  }
};

const addProducts = async (req, res) => {
  try {
    const products = req.body;
    const productExists = await Product.findOne({
      productName: products.productName,
    });
    console.log(productExists, "product");
    if (!productExists) {
      const images = [];
      if (req.files && req.files.length > 0) {
        for (let i = 0; i < req.files.length; i++) {
          const originalImagePath = req.files[i].path;
          const originalImageMetadata = await sharp(originalImagePath).metadata();
          console.log(
            `Original Image Size: ${originalImageMetadata.width}x${originalImageMetadata.height} pixels`
          );
          const resizedImagePath = path.join(
            "public",
            "uploads",
            "product-images",
            req.files[i].filename
          );
          await sharp(originalImagePath)
            .resize({ width: 440, height: 440 })
            .toFile(resizedImagePath);

          console.log(resizedImagePath, "resized image path");
          images.push(req.files[i].filename);
        }
      }
      const categoryId = await Category.findOne({ name: products.category });
      console.log(categoryId._id, "categoryId hain");

      const newProduct = new Product({
        id: Date.now(),
        productName: products.productName,
        description: products.description,
        brand: products.brand,
        category: categoryId._id,
        regularPrice: products.regularPrice,
        salePrice: products.salePrice,
        createdOn: new Date(),
        quantity: products.quantity,
        size: products.size,
        color: products.color,
        productImage: images,
        status: false,
      });
      await newProduct.save();
      res.redirect("/admin/addProducts");
    } else {
      res.json("Product already exist,Please try with another name");
    }
  } catch (error) {
    res.redirect("/admin/pageerror");
  }
};


const getEditProduct = async (req, res) => {
  try {
    const id = req.query.id;
    const findProduct = await Product.findOne({ _id: id });
    const category = await Category.find({});
    const findBrand = await Brand.find({});
    res.render("edit-product", {
      product: findProduct,
      cat: category,
      brand: findBrand,
    });
  } catch (error) {
    res.redirect("/pageerror");
  }
};

const deleteSingleImage = async (req, res) => {
  try {
    const { imageNameTOserver, productIdToServer } = req.body;
    const product = await Product.findByIdAndUpdate(productIdToServer, {
      $pull: { productImage: imageNameTOserver },
    });
    console.log(imageNameTOserver);
    const imagePath = path.join(
      "public",
      "uploads",
      "re-image",
      imageNameTOserver
    );
    if (fs.existsSync(imagePath)) {
      await fs.unlinkSync(imagePath);
      console.log(`Image ${imageNameTOserver} deleted successfully`);
    } else {
      console.log(`Image ${imageNameTOserver} not found`);
    }

    res.send({ status: true });
  } catch (error) {
    res.redirect("/pageerror");
  }
};

const editProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const products = await Product.findOne({ _id: id });
    const data = req.body;
    const existingProduct = await Product.findOne({
      productName: data.productName,
      _id: { $ne: id }
    });

    if (existingProduct) {
      return res.status(400).json({ error: "Product with this name already exists. Please try with another name." });
    }
    const images = [];
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        images.push(req.files[i].filename);
      }
    }

    const categoryId = await Category.findOne({ _id: products.category });

    const updatedFields = {
      id: Date.now(),
      productName: data.productName,
      description: data.description,
      brand: data.brand,
      category: products.category,
      regularPrice: data.regularPrice,
      salePrice: data.salePrice,
      quantity: data.quantity,
      size: data.size,
      color: data.color,
      processor: data.processor,
      createdOn: new Date(),
      status: false
    };

    if (req.files.length > 0) {
      updatedFields.$push = { productImage: { $each: images } };
    }
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updatedFields,
      { new: true }
    );

    console.log("Product updated");
    res.redirect("/admin/products");
  } catch (error) {
    console.error(error);
    res.redirect("/pageerror");
  }
};


const getAllProducts = async (req, res) => {
  try {
    const search = req.query.search || "";
    const page = req.query.page || 1;
    const limit = 4;

    const productData = await Product.find({
      $or: [
        { productName: { $regex: new RegExp(".*" + search + ".*", "i") } },
        { brand: { $regex: new RegExp(".*" + search + ".*", "i") } },
      ],
    })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('category')
    .exec();

    const count = await Product.find({
      $or: [
        { productName: { $regex: new RegExp(".*" + search + ".*", "i") } },
        { brand: { $regex: new RegExp(".*" + search + ".*", "i") } },
      ],
    }).countDocuments();
    
    const category = await Category.find({ isListed: true });
    const brand = await Brand.find({ isBlocked: false });

    if (category && brand) {
      res.render("products", {
        data: productData,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        cat: category,
        brand: brand,
      });
    } else {
      res.render("page-404");
    }
  } catch (error) {
    res.redirect("/pageerror");
  }
};


const getBlockProduct = async (req, res) => {
  try {
    let id = req.query.id;
    await Product.updateOne({ _id: id }, { $set: { isBlocked: true } });
    console.log("product blocked");
    res.redirect("/admin/products");
  } catch (error) {
    res.redirect("/pageerror");
  }
};

const getUnblockProduct = async (req, res) => {
  try {
    let id = req.query.id;
    await Product.updateOne({ _id: id }, { $set: { isBlocked: false } });
    console.log("product unblocked");
    res.redirect("/admin/products");
  } catch (error) {
    res.redirect("/pageerror");
  }
};
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

const addProductOffer = async (req, res) => {
  try {
      console.log(req.body, "req body of add");
      const { productId, percentage } = req.body;
      const findProduct = await Product.findOne({ _id: productId });
      const findCategory = await Category.findOne({ _id: findProduct.category });
      if (findCategory.categoryOffer > percentage) {
          console.log("This product's category already has a category offer. Product offer not added.");
          return res.json({ status: false, message: "This product's category already has a category offer." });
      }
      findProduct.salePrice = findProduct.salePrice - Math.floor(findProduct.regularPrice * (percentage / 100));
      findProduct.productOffer = parseInt(percentage);
      await findProduct.save();
      findCategory.categoryOffer = 0;
      await findCategory.save();
      res.json({ status: true });
  } catch (error) {
      res.redirect("/pageerror");
      res.status(500).json({ status: false, message: "Internal Server Error" });
  }
}

const removeProductOffer = async (req, res) => {
  try {
      const {productId} = req.body
      const findProduct = await Product.findOne({_id : productId})
      const percentage = findProduct.productOffer
      findProduct.salePrice = findProduct.salePrice + Math.floor(findProduct.regularPrice * (percentage / 100))
      findProduct.productOffer = 0
      await findProduct.save()
      res.json({status : true})
  } catch (error) {
      res.redirect("/pageerror");
     
  }
}

module.exports = {
  getProductAddPage,
  addProducts,
  getAllProducts,
  getBlockProduct,
  getUnblockProduct,
  getEditProduct,
  editProduct,
  deleteSingleImage,
  productDetails,
  addProductOffer,
  removeProductOffer
};
