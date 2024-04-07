const User = require("../../models/userSchema");
const Brand = require("../../models/brandSchema");
const Product = require("../../models/productSchema");
const Category = require("../../models/categorySchema");
const Banner = require("../../models/bannerSchema");
const nodemailer = require("nodemailer");
const env = require('dotenv').config();
const bcrypt = require("bcrypt");



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

// render the OTP verification page
const getOtpPage = async (req, res) => {
  try {
    res.render("verify-otp");
  } catch (error) {
    res.redirect("/pageNotFound");
  }
};
// Verify otp
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
      res.redirect("/login");
    } else {
      return res.render("verify-otp", {
        message: "Invalid OTP. Please try again.",
      });
    }
  } catch (error) {
    res.redirect("/pageNotFound");
  }
};
// Resend OTP
const resendOtp = async (req, res) => {
  try {
    const otp = generateOtp();
    console.log(otp);
    req.session.userOtp = otp;
    const email = req.session.userData.email;
    const emailSent = await sendVerificationEmail(email, otp);
    if (emailSent) {
      console.log("otp:", otp);
      console.log("Email sent:");
      res.status(200).json({ success: true });
    } else {
      res.status(500).json({ success: false, message: "Failed to resend OTP" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
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
};

