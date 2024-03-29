const nodemailer = require("nodemailer");
const User = require("../models/userSchema");
const bcrypt = require("bcryptjs");
const Brand = require("../models/brandSchema");
const Product = require("../models/productSchema");
const Category = require("../models/categorySchema");
const Banner = require("../models/bannerSchema");
const { v4: uuidv4 } = require("uuid");
const env = require("dotenv").config();

//OTP Generation
function generateOtp() {
  const digits = "1234567890";
  let otp = "";
  for (let i = 0; i < 6; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
}
//bcrypt password
async function securePassword(password) {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.error(error);
    throw new Error("Error generating password hash");
  }
}
//send verification email
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
//Error management
const pageNotFound = async (req, res) => {
  try {
      res.render("page-404");
  } catch (error) {
      res.redirect("/pageNotFound");
  }
};

// User Login Page
const getLoginPage = async (req, res) => {
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

// User Login
const userLogin = async (req, res) => {
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

const getSignupPage = async (req, res) => {
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

const signupUser = async (req, res) => {
  try {
    const { email } = req.body;
    const findUser = await User.findOne({ email });
    if (req.body.password === req.body.cPassword) {
      if (!findUser) {
        var otp = generateOtp();
        const info = await sendVerificationEmail(email, otp);
        console.log(otp, "otp");
        if (info) {
          req.session.userOtp = otp;
          req.session.userData = req.body;
          res.render("verify-otp");
          console.log("Email sented", info.messageId);
        } else {
          res.json("email-error");
        }
      } else {
        res.render("signup", {
          message: "User with this email already exists",
        });
      }
    } else {
      res.render("signup", { message: "The confirm pass is not matching" });
    }
  } catch (error) {
    res.redirect("/pageNotFound");
  }
};

// render the OTP verification page
const getOtpPage = async (req, res) => {
  try {
    res.render("verify-otp");
  } catch (error) {
    res.redirect("/pageNotFound");
  }
};
// Verify otp from email with generated otp and save the user data to db
const verifyOtp = async (req, res) => {
  try {
      const { otp } = req.body
      if (otp === req.session.userOtp) {
          const user = req.session.userData
          const passwordHash = await securePassword(user.password)
          const referalCode = uuidv4()
          console.log("the referralCode  hain =>" + referalCode);
          const saveUserData = new User({
              name: user.name,
              email: user.email,
              phone: user.phone,
              password: passwordHash,
              referalCode : referalCode
          })
          await saveUserData.save()
          req.session.user = saveUserData._id
          res.redirect("/login")
      } else {
          return res.render("verify-otp", {
            message: "Invalid OTP. Please try again.",
          });
      }
  } catch (error) {
    res.redirect("/pageNotFound");
  }
}

//Loading the Home page
const getHomePage = async (req, res) => {
  try {
    const today = new Date().toISOString();
    const user = req.session.user;
    const userData = await User.findOne({ _id: user });
    const findBanner = await Banner.find({
      startDate: { $lt: new Date(today) },
      endDate: { $gt: new Date(today) }
    });
    const brandData = await Brand.find({ isBlocked: false });
    const productData = await Product.find({ isBlocked: false })
      .sort({ id: -1 })
      .limit(4);
    if (user) {
      res.render("home", {
        user: userData,
        data: brandData,
        products: productData,
        banner: findBanner || []
      });
    } else {
      res.render("home", { data: brandData, products: productData, banner: findBanner || [] });
    }
  } catch (error) {
    res.redirect("/pageNotFound");
  }
};
   
    const getShopPage = async (req, res) => {
      try {
        const user = req.session.id;
        const products = await Product.find({ isBlocked: false });
        const count = await Product.find({ isBlocked: false }).count();
        const brands = await Brand.find({ isBlocked: false });
        const categories = await Category.find({ isListed: true });
        const categoriesWithIds = await Category.find(
          { isListed: true },
          { _id: 1, name: 1 }
        );
        const categoryIds = categoriesWithIds.map(category => category._id.toString());
        const newProductArrayCategoryListed = products.filter((singleProduct) => {
          return categoryIds.includes(singleProduct.category.toString());
        });
        res.render("shop", {
          user: user,
          product: newProductArrayCategoryListed,
          category: categoriesWithIds,
          brand: brands,
          count: count,
        });
      } catch (error) {
        res.redirect("/pageNotFound");
      }
    };
    
    
    const getLogoutUser = async (req, res) => {
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
    
    const resendOtp = async (req, res) => {
      try {
        const otp = generateOtp();
        req.session.userOtp = otp;
        const email = req.session.userData.email;
        const emailSent = await sendVerificationEmail(email, otp);
        if (emailSent) {
          console.log('otp:', otp);
          console.log('Email sent:');
          res.status(200).json({ success: true });
        } else {
          res.status(500).json({ success: false, message: 'Failed to resend OTP' });
        }
      } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    };
    
    
    module.exports = {
      pageNotFound,
      getLoginPage,
      userLogin,
      getSignupPage,
      signupUser,
      getOtpPage,
      verifyOtp,
      securePassword,
      getHomePage,
      getShopPage,
      getLogoutUser,
      resendOtp,
    };
    
