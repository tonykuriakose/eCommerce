const User = require("../../models/userSchema");
const Brand = require("../../models/brandSchema");
const Product = require("../../models/productSchema");
const Category = require("../../models/categorySchema");
const Banner = require("../../models/bannerSchema");
const nodemailer = require("nodemailer");
const env = require('dotenv').config();
const bcrypt = require("bcrypt");

// Error management
const pageNotFound = async (req, res) => {
  try {
    res.render("page-404");
  } catch (error) {
    res.redirect("/pageNotFound");
  }
};

// OTP Generation
function generateOtp() {
  const digits = "1234567890";
  let otp = "";
  for (let i = 0; i < 6; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
}
// Bcrypt password
async function securePassword(password) {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.error(error);
    throw new Error("Error generating password hash");
  }
}
// Send verification email
async function sendVerificationEmail(email, otp) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD,
      },
    });

    const info = await transporter.sendMail({
      from: process.env.NODEMAILER_EMAIL,
      to: email,
      subject: "Verify Your Account ✔",
      text: `Your OTP is ${otp}`,
      html: `<b> <h4>Your OTP: ${otp}</h4> <a href="/verify-otp">Click here to verify</a></b>`,
    });

    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Error sending email");
  }
}

// Signup Management
const loadSignup = async (req, res) => {
  try {
    if (!req.session.user) {
      res.render("signup");
    } else {
      res.redirect("/");
    }
  } catch (error) {
    res.redirect("/pageNotFound");
  }
};

const signup = async (req, res) => {
  try {
    const { email } = req.body;
    const findUser = await User.findOne({ email });
    if (req.body.password === req.body.cPassword) {
      if (!findUser) {
        var otp = generateOtp();
        const info = await sendVerificationEmail(email, otp);
        if (info) {
          req.session.userOtp = otp;
          req.session.userData = req.body;
          res.render("verify-otp");
          console.log("Email sent:", info.messageId);
          console.log(otp);
        } else {
          res.json("email-error");
        }
      } else {
        res.render("signup", {
          message: "User with this email already exists",
        });
      }
    } else {
      res.render("signup", { message: "Passwords not matching" });
    }
  } catch (error) {
    res.redirect("/pageNotFound");
  }
};

const getOtpPage = async (req, res) => {
  try {
    res.render("verify-otp");
  } catch (error) {
    res.redirect("/pageNotFound");
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    if (otp === req.session.userOtp) {
      const user = req.session.userData;
      const passwordHash = await securePassword(user.password);
      const saveUserData = new User({
        name: user.name,
        email: user.email,
        phone: user.phone,
        password: passwordHash,
      });
      await saveUserData.save();
      req.session.user = saveUserData._id;
      res.json({ success: true, redirectUrl: "/login" });
    } else {
      res.status(400).json({ success: false, message: "Invalid OTP. Please try again." });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "An error occurred." });
  }
};

const resendOtp = async (req, res) => {
  try {
    const otp = generateOtp();
    req.session.userOtp = otp;
    const email = req.session.userData.email;
    const emailSent = await sendVerificationEmail(email, otp);
    if (emailSent) {
      console.log("resend otp:", otp);
      res.status(200).json({ success: true, message: "Resend OTP successful" });
    } else {
      res.status(500).json({ success: false, message: "Failed to resend OTP" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Login Management
const loadLogin = async (req, res) => {
  try {
    if (!req.session.user) {
      res.render("login");
    } else {
      res.redirect("/");
    }
  } catch (error) {
    res.redirect("/pageNotFound");
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const findUser = await User.findOne({ isAdmin: "0", email: email });
    if (findUser) {
      const isUserNotBlocked = findUser.isBlocked === false;
      if (isUserNotBlocked) {
        const passwordMatch = await bcrypt.compare(password, findUser.password);
        if (passwordMatch) {
          req.session.user = findUser._id;
          res.redirect("/");
        } else {
          res.render("login", { message: "Password is not matching" });
        }
      } else {
        res.render("login", { message: "User is blocked by admin" });
      }
    } else {
      res.render("login", { message: "User is not found" });
    }
  } catch (error) {
    res.redirect("/pageNotFound");
    res.render("login", { message: "Login failed" });
  }
};

const logout = async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.log(err.message);
      }
      res.redirect("/login");
    });
  } catch (error) {
    res.redirect("/pageNotFound");
  }
};

const loadHomepage = async (req, res) => {
  try {
    const today = new Date().toISOString();
    const user = req.session.user;
    const userData = await User.findOne({ _id: user });
    const findBanner = await Banner.find({
      startDate: { $lt: new Date(today) },
      endDate: { $gt: new Date(today) },
    });
    const brandData = await Brand.find({ isBlocked: false });
    const categories = await Category.find({ isListed: true });
    
    // Fetch products that are not blocked and have non-zero quantity
    let productData = await Product.find({ 
      isBlocked: false,
      category: { $in: categories.map(category => category._id) },
      quantity: { $gt: 0 }  // Filter to exclude out-of-stock items
    });

    // Sort products by creation date in descending order
    productData.sort((a, b) => new Date(b.createdOn) - new Date(a.createdOn));
    
    // Limit the number of products to 4
    productData = productData.slice(0, 4);

    if (user) {
      res.render("home", {
        user: userData,
        data: brandData,
        products: productData,
        banner: findBanner || [],
      });
    } else {
      res.render("home", {
        data: brandData,
        products: productData,
        banner: findBanner || [],
      });
    }
  } catch (error) {
    res.redirect("/pageNotFound");
  }
};



const loadShoppingpage = async (req, res) => {
  try {
    const user = req.session.user;
    const categories = await Category.find({ isListed: true });
    const categoryIds = categories.map((category) => category._id.toString());
    let products = await Product.find({
      isBlocked: false,
      category: { $in: categoryIds },
      quantity: { $gt: 0 } 
    });
    products.sort((a, b) => new Date(b.createdOn) - new Date(a.createdOn));

    const count = products.length;
    const brands = await Brand.find({ isBlocked: false });
    const categoriesWithIds = categories.map(category => ({ _id: category._id, name: category.name }));

    res.render("shop", {
      user: user,
      product: products,
      category: categoriesWithIds,
      brand: brands,
      count: count,
    });
  } catch (error) {
    res.redirect("/pageNotFound");
  }
};

// Search products
const searchProducts = async (req, res) => {
  try {
    const user = req.session.user;
    let search = req.body.query;
    const brands = await Brand.find({});
    const categories = await Category.find({ isListed: true });
    const categoryIds = categories.map(category => category._id.toString());
    let searchResult = await Product.find({
      $or: [
        {
          productName: { $regex: ".*" + search + ".*", $options: "i" },
        },
      ],
      isBlocked: false,
      quantity: { $gt: 0 },
      category: { $in: categoryIds }
    }).lean();
    searchResult.sort((a, b) => new Date(b.createdOn) - new Date(a.createdOn));

    let itemsPerPage = 6;
    let currentPage = parseInt(req.query.page) || 1;
    let startIndex = (currentPage - 1) * itemsPerPage;
    let endIndex = startIndex + itemsPerPage;
    let totalPages = Math.ceil(searchResult.length / itemsPerPage);
    const currentProduct = searchResult.slice(startIndex, endIndex);

    res.render("shop", {
      user: user,
      product: currentProduct,
      category: categories,
      brand: brands,
      totalPages,
      currentPage,
      count: searchResult.length,
    });
  } catch (error) {
    res.redirect("/pageNotFound");
  }
};

// Filter products
const filterProduct = async (req, res) => {
  try {
    const user = req.session.user;
    const category = req.query.category;
    const brand = req.query.brand;
    const brands = await Brand.find({});
    const findCategory = category ? await Category.findOne({ _id: category }) : null;
    const findBrand = brand ? await Brand.findOne({ _id: brand }) : null;
    const query = {
      isBlocked: false,
      quantity: { $gt: 0 }, // Only include products that are in stock
    };

    if (findCategory) {
      query.category = findCategory._id;
    }

    if (findBrand) {
      query.brand = findBrand.brandName;
    }

    // Find and sort products by creation date in descending order
    let findProducts = await Product.find(query).lean();
    findProducts.sort((a, b) => new Date(b.createdOn) - new Date(a.createdOn));

    const categories = await Category.find({ isListed: true });

    let itemsPerPage = 6;
    let currentPage = parseInt(req.query.page) || 1;
    let startIndex = (currentPage - 1) * itemsPerPage;
    let endIndex = startIndex + itemsPerPage;
    let totalPages = Math.ceil(findProducts.length / itemsPerPage);
    const currentProduct = findProducts.slice(startIndex, endIndex);

    res.render("shop", {
      user: user,
      product: currentProduct,
      category: categories,
      brand: brands,
      totalPages,
      currentPage,
      selectedCategory: category || null,
      selectedBrand: brand || null,
    });
  } catch (error) {
    console.log(error);
    res.redirect("/pageNotFound");
    res.status(500).send("Internal Server Error");
  }
};

// Filter by price
const filterByPrice = async (req, res) => {
  try {
    const user = req.session.user;
    const brands = await Brand.find({});
    const categories = await Category.find({ isListed: true });
    let findProducts = await Product.find({
      salePrice: { $gt: req.query.gt, $lt: req.query.lt },
      isBlocked: false,
      quantity: { $gt: 0 }
    }).lean();

    findProducts.sort((a, b) => new Date(b.createdOn) - new Date(a.createdOn));

    let itemsPerPage = 6;
    let currentPage = parseInt(req.query.page) || 1;
    let startIndex = (currentPage - 1) * itemsPerPage;
    let endIndex = startIndex + itemsPerPage;
    let totalPages = Math.ceil(findProducts.length / itemsPerPage);
    const currentProduct = findProducts.slice(startIndex, endIndex);

    res.render("shop", {
      user: user,
      product: currentProduct,
      category: categories,
      brand: brands,
      totalPages,
      currentPage,
    });
  } catch (error) {
    console.log(error);
    res.redirect("/pageNotFound");
  }
};


// Sort products
const getSortProducts = async (req, res) => {
  try {
    let option = req.body.option;
    let itemsPerPage = 6;
    let currentPage = parseInt(req.body.page) || 1;
    let startIndex = (currentPage - 1) * itemsPerPage;
    let endIndex = startIndex + itemsPerPage;
    let sortCriteria = {};
    let query = { isBlocked: false, quantity: { $gt: 0 } };
    if (option === "highToLow") {
      sortCriteria.salePrice = -1;
    } else if (option === "lowToHigh") {
      sortCriteria.salePrice = 1;
    } else if (option === "releaseDate") {
      sortCriteria.createdOn = -1;
    }
    let data = await Product.find(query).sort(sortCriteria);
    let paginatedData = data.slice(startIndex, endIndex);
    let totalPages = Math.ceil(data.length / itemsPerPage);

    res.json({
      status: true,
      data: {
        currentProduct: paginatedData,
        count: data.length,
        totalPages,
        currentPage,
      },
    });
  } catch (error) {
    console.error(error);
    res.redirect("/pageNotFound");
    res.json({ status: false, error: error.message });
  }
};

const applyCoupon = async (req, res) => {
  try {
    const userId = req.session.user;
    const selectedCoupon = await Coupon.findOne({ name: req.body.coupon });

    if (!selectedCoupon) {
      console.log("no coupon");
      res.json({ noCoupon: true });
    } else if (selectedCoupon.userId.includes(userId)) {
      console.log("already used");
      res.json({ used: true });
    } else {
      console.log("coupon exists");
      await Coupon.updateOne(
        { name: req.body.coupon },
        { $addToSet: { userId: userId } }
      );
      const gt = parseInt(req.body.total) - parseInt(selectedCoupon.offerPrice);
      console.log(gt, "----");
      res.json({ gt: gt, offerPrice: parseInt(selectedCoupon.offerPrice) });
    }
  } catch (error) {
    res.redirect("/pageNotFound");
  }
};




module.exports = {
  pageNotFound,
  loadSignup,
  signup,
  getOtpPage,
  verifyOtp,
  securePassword,
  resendOtp,
  loadLogin,
  login,
  logout,
  loadHomepage,
  loadShoppingpage,
  searchProducts,
  filterByPrice,
  filterProduct,
  getSortProducts,
  applyCoupon,
};

