const User = require("../../models/userSchema");
const Product = require("../../models/productSchema");
const brand = require('../../models/brandSchema');
const address = require('../../models/addressSchema');
const order = require('../../models/orderSchema');
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const env = require("dotenv").config();
const session = require("express-session");

// Forgot password management
function generateOtp() {
  const digits = "1234567890";
  var otp = "";
  for (i = 0; i < 6; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
}

const getForgotPassPage = async (req, res) => {
  try {
    res.render("forgot-password");
  } catch (error) {
     res.redirect("/pageNotFound");
  }
};


const getForgotPassOtpPage = async (req, res) => {
  try {
    res.render("forgotPass-otp");
  } catch (error) {
     res.redirect("/pageNotFound");
  }
};

const forgotEmailValid = async (req, res) => {
  try {
    const { email } = req.body;

    const findUser = await User.findOne({ email: email });

    if (findUser) {
      const otp = generateOtp();
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
        html: `<b>  <h4 >Your OTP  ${otp}</h4>    <br>  <a href="">Click here</a></b>`,
      });
      if (info) {
        req.session.userOtp = otp;
        req.session.userData = req.body;
        req.session.email = email;
        res.render("forgotPass-otp");
        console.log("Email sented", info.messageId);
        console.log(otp, "otp");
      } else {
        res.json("email-error");
      }
    } else {
      res.render("forgot-password", {
        message: "User with this email already exists",
      });
    }
  } catch (error) {
     res.redirect("/pageNotFound");
  }
};

const verifyForgotPassOtp = async (req, res) => {
  try {
    const enteredOtp = req.body.otp;
    if (enteredOtp === req.session.userOtp) {
      res.redirect("/resetPassword");
    } else {
      res.render("forgotPass-otp", { message: "Otp not matching" });
    }
  } catch (error) {
     res.redirect("/pageNotFound");
  }
};


const getResetPassPage = async (req, res) => {
  try {
    res.render("reset-password");
  } catch (error) {
     res.redirect("/pageNotFound");
  }
};


const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
     res.redirect("/pageNotFound");
  }
};

const postNewPassword = async (req, res) => {
  try {
    const { newPass1, newPass2 } = req.body;
    const email = req.session.email;
    if (newPass1 === newPass2) {
      const passwordHash = await securePassword(newPass1);
      await User.updateOne(
        { email: email },
        {
          $set: {
            password: passwordHash,
          },
        }
      ).then((data) => console.log(data));
      res.redirect("/login");
    } else {
      res.render("reset-password", { message: "Password not matching" });
    }
  } catch (error) {
     res.redirect("/pageNotFound");
  }
};

// User profile management
const getUserProfile = async (req, res) => {
  try {
    const userId = req.session.user;
    const userData = await User.findById({ _id: userId });
    const addressData = await address.findOne({ userId: userId });
    const orderData = await order
      .find({ userId: userId })
      .sort({ createdOn: -1 });
    res.render("profile", {
      user: userData,
      userAddress: addressData,
      order: orderData,
    });
  } catch (error) {
     res.redirect("/pageNotFound");
  }
};

const getChangePassword = async (req, res) => {
  try {
    res.render("change-password");
  } catch (error) {
     res.redirect("/pageNotFound");
  }
};

const changePasswordValid = async (req, res) => {
  try {
    const { email } = req.body;

    const findUser = await User.findOne({ email: email });

    if (findUser) {
      const otp = generateOtp();
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
        html: `<b>  <h4 >Your OTP  ${otp}</h4>    <br>  <a href="">Click here</a></b>`,
      });
      if (info) {
        req.session.userOtp = otp;
        req.session.userData = req.body;
        req.session.email = email;
        res.render("forgotPass-otp");
        console.log("Email sented", info.messageId);
        console.log(otp, "otp");
      } else {
        res.json("email-error");
      }
    } else {
      res.render("forgot-password", {
        message: "User with this email already exists",
      });
    }
  } catch (error) {
     res.redirect("/pageNotFound");
  }
};

const getChangeEmail = async (req,res)=>{
  try {

    res.render("change-email")
    
  } catch (error) {
    res.redirect("/pageNotFound")
    
  }



}

const changeEmailValid = async (req,res)=>{

  try {
    const { email } = req.body;

    const findUser = await User.findOne({ email: email });

    if (findUser) {
      const otp = generateOtp();
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
        html: `<b>  <h4 >Your OTP  ${otp}</h4>    <br>  <a href="">Click here</a></b>`,
      });
      if (info) {
        req.session.userOtp = otp;
        req.session.userData = req.body;
        req.session.email = email;
        res.render("forgotPass-otp");
        console.log("Email sented", info.messageId);
        console.log(otp, "otp");
      } else {
        res.json("email-error");
      }
    } else {
      res.render("change-email", {
        message: "User with this email already exists",
      });
    }
  } catch (error) {
     res.redirect("/pageNotFound");
  }
};



const editUserDetails = async (req, res) => {
  try {
    const userId = req.query.id;
    const data = req.body;
    await User.updateOne(
      { _id: userId },
      {
        $set: {
          name: data.name,
          phone: data.phone,
          email: data.email,
        },
      }
    ).then((data) => console.log(data));
    res.redirect("/userprofile");
  } catch (error) {
     res.redirect("/pageNotFound");
  }
};


const getAddressAddPage = async (req, res) => {
  try {
    const user = req.session.user;
    res.render("add-address", { user: user });
  } catch (error) {
     res.redirect("/pageNotFound");
  }
};
const postAddress = async (req, res) => {
  try {
    console.log(req.session.user, "user");
    const user = req.session.user;
    console.log(user, "user");
    const userData = await User.findOne({ _id: user });
    const {
      addressType,
      name,
      city,
      landMark,
      state,
      pincode,
      phone,
      altPhone,
    } = req.body;
    const userAddress = await address.findOne({ userId: userData._id });
    console.log(userAddress);
    if (!userAddress) {
      console.log("fst");
      console.log(userData._id);
      const newAddress = new address({
        userId: userData._id,
        address: [
          {
            addressType,
            name,
            city,
            landMark,
            state,
            pincode,
            phone,
            altPhone,
          },
        ],
      });
      await newAddress.save();
    } else {
      console.log("scnd");
      userAddress.address.push({
        addressType,
        name,
        city,
        landMark,
        state,
        pincode,
        phone,
        altPhone,
      });
      await userAddress.save();
    }

    res.redirect("/userprofile");
  } catch (error) {
     res.redirect("/pageNotFound");
  }
};


const getEditAddress = async (req, res) => {
  try {
    const addressId = req.query.id;
    const user = req.session.user;
    const currAddress = await address.findOne({
      "address._id": addressId,
    });

    const addressData = currAddress.address.find((item) => {
      return item._id.toString() == addressId.toString();
    });
    res.render("edit-address", { address: addressData, user: user });
  } catch (error) {
     res.redirect("/pageNotFound");
  }
};

const postEditAddress = async (req, res) => {
  console.log("magesh");
  try {
    const data = req.body;
    const addressId = req.query.id;

    console.log(addressId, "address id");
    const user = req.session.user;
    const findAddress = await address.findOne({ "address._id": addressId });
    const matchedAddress = findAddress.address.find(
      (item) => item._id == addressId
    );
    await address
      .updateOne(
        {
          "address._id": addressId,
          _id: findAddress._id,
        },
        {
          $set: {
            "address.$": {
              _id: addressId,
              addressType: data.addressType,
              name: data.name,
              city: data.city,
              landMark: data.landMark,
              state: data.state,
              pincode: data.pincode,
              phone: data.phone,
              altPhone: data.altPhone,
            },
          },
        }
      )
      .then((result) => {
        res.redirect("/userprofile");
      });
  } catch (error) {
     res.redirect("/pageNotFound");
  }
};

const getDeleteAddress = async (req, res) => {
  try {
    const addressId = req.query.id;
    const findAddress = await address.findOne({ "address._id": addressId });

    if (!findAddress) {
      console.log("Address not found");

      return res.status(404).send("Address not found");
    }

    await address.updateOne(
      { "address._id": addressId },
      {
        $pull: {
          address: {
            _id: addressId,
          },
        },
      }
    );

    res.redirect("/userprofile");
  } catch (error) {
     res.redirect("/pageNotFound");
    res.status(500).send("Internal Server Error");
  }
};




module.exports = {
  getUserProfile,
  getChangePassword,
  changePasswordValid,
  getChangeEmail,
  changeEmailValid,
  editUserDetails,
  getAddressAddPage,
  postAddress,
  getEditAddress,
  postEditAddress,
  getDeleteAddress,
  getForgotPassPage,
  forgotEmailValid,
  verifyForgotPassOtp,
  getResetPassPage,
  postNewPassword,
  getForgotPassOtpPage,
};
