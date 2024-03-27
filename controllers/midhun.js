require('dotenv').config()
const bcrypt = require('bcrypt')
const User = require('../models/userModel')
const Product = require('../models/productModel')
const Address = require('../models/addressModel')
const Brand = require('../models/brandModel')
const Category = require('../models/categoryModel')
const HomeCarousel = require('../models/homeCarousel')
const AdCarousel = require('../models/adCarousel')
const Wishlist = require('../models/wishlistModel')
const Cart = require('../models/cartModel')
const nodemailer = require('nodemailer')
const crypto = require("crypto")
const bodyParser = require('body-parser');
const path = require('path')
const fs = require('fs')
const session = require('express-session')
const express = require('express')
const { error, count } = require('console')
const app = express()

app.use(session({
    secret: 'userkey',
    resave: false,
    saveUninitialized: false
}));

app.use(bodyParser.urlencoded({ extended: true }));

//for storing otp
let saveOtp;
let enteredFullname;
let enteredEmail;
let enteredPhone;
let enteredPassword;
let userDetails;
let cartItemCount;

//Generating otp function
const generateOtp = () => {
    const crypto = require('crypto');
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let otp = "";
    for (let i = 0; i < 6; i++) {
        const index = crypto.randomInt(0, chars.length);
        otp += chars[index];
    }
    console.log(otp)
    return otp;
}

//Send otp through email
const sendOtpMail = async(email,otp)=>{
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: "lapshopotp@gmail.com",
                pass: "nyxnnbafpfqznvvh",
            },
      });
      const mailOptions= {
        from: 'lapshopotp@gmail.com',
        to: email,
        subject: "OTP for register in LapShop Ecommerce",
        html:'<p>Hi, Your One Time Password to Login is '+ otp +'</p>'
      }

      transporter.sendMail(mailOptions,function(error,info){
        if(error){
          console.log(error);
        }
        else{
          console.log("Email has been sent: ",info.response);
        }
      })       
    } catch (error) {
      res.status(500).send('Error sending Otp password');
    }
  }

//Sending the register data to otp validation page
const postRegister = async (req, res) => {
    try {
        const otp = generateOtp()
        saveOtp = otp;
        console.log("SaveOtp before =",saveOtp)
        
        function clearSaveOtp() {
            saveOtp = ""; 
            console.log("SaveOtp after =",saveOtp)
        }
        setTimeout(clearSaveOtp, 30000);

        enteredFullname = req.body.fullname;
        enteredEmail = req.body.email;
        enteredPhone = req.body.phone;
        enteredPassword = req.body.password;

        const userEmail =  await User.findOne({email:enteredEmail}); 

        if (!userEmail){
            sendOtpMail(enteredEmail,otp);
            return res.render('user/otpvalidation', { type: "success", message: "Check your email for otp", userDetails})
        } else {
            return res.render('user/registration', { type: "danger", message: "Email already registered.", userDetails})
        }
    } catch (error) {
        console.log(error.message)
        return res.render("user/registration", { type: "danger", message: error.message, userDetails});
    }
}

// Verifying the otp and saving the user in db
const postRegisterOtp = async (req, res) => {
    try {
        const enteredOtp = req.body
        const otp1 = enteredOtp.otp;
        const otp2 = enteredOtp.otp2;
        const otp3 = enteredOtp.otp3;
        const otp4 = enteredOtp.otp4;
        const otp5 = enteredOtp.otp5;
        const otp6 = enteredOtp.otp6;
        const concatenatedOTP = otp1 + otp2 + otp3 + otp4 + otp5 + otp6;
        console.log(concatenatedOTP)

        
        if(concatenatedOTP === saveOtp){

            const hashpassword = await bcrypt.hash(enteredPassword, 10)

            const user = new User({
                fullname : enteredFullname,
                email : enteredEmail,
                phone : enteredPhone,
                password : hashpassword
            })

            const userEmail = await User.findOne({email : enteredEmail})
            const userPhone = await User.findOne({phone : enteredPhone})

            if(!userEmail && !userPhone){
                const userData = await user.save()
                if(userData){
                    res.render('user/login',{type : "success" , message : "Registration has been successfull.", userDetails})
                }else{
                    res.render('user/registration',{type : "danger" , message : "Registration has been failed.", userDetails})
                }
            }else{
                res.render('user/registration',{type : "danger" , message : "User already exist.", userDetails})
              }   
            }else{
              res.render("user/otpvalidation",{type : "danger" , message : "Invalid OTP", userDetails});
            }
        
    } catch (error) {
        console.log("postRegisterotp error")
        console.log(error.message)
    }
}

//Checking the email and password for user from login page
const postLogin = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        const homeCarousel = await HomeCarousel.find()
        const bestOfferProducts = await Product.find({ discountPercentage: {$gte : 20 } , isBlocked : false})
        const category = await Category.find({ isBlocked : false})
        const userId = user._id
        const cart = await Cart.find({ userId : userId})
        console.log("cart :",cart)
        if(cart != ""){
            cartItemCount = cart[0].items.length
        }
        console.log("cartItemCount :",cartItemCount)
        
        const { email, password } = req.body;

        if (user) {
            if (user.isblocked) {
                return res.render("user/login", { type: "danger", message: "Account is blocked, please contact us", userDetails , cartItemCount})
            }
            
            //password matching
            bcrypt.compare(password, user.password, function (err, result) {
                if (err) {
                    console.log(err);
                    return res.status(500).send('An error occurred while comparing the passwords.');
                } if (result) {
                        req.session.user = user;
                        userDetails = req.session.user
                        return res.render('user/home',{userDetails , homeCarousel , bestOfferProducts , category , cartItemCount})
                } else {
                    // Passwords don't match    
                    return res.render("user/login", {type: "danger", message: "Incorrect password", userDetails , cartItemCount})
                }
            });
        } else {
            return res.render("user/login", { type: "danger", message: "No user found", userDetails , cartItemCount})
        }
    } catch (error) {
        console.log(error.message)
    }
}

// To get the user login page
const getLogin = async (req, res) => {
    try {
        return res.render('user/login', {type: "", message: "", userDetails , cartItemCount})
    } catch (error) {
        console.log(error)
    }
}


//To get the user logout function
const getLogout = async(req,res)=>{
    try{
        req.session.user = null 
        userDetails = ""
        cartItemCount = ""
        res.redirect('/')
    }catch(error){
        console.log(error.message)
    }
}


//To get the user home
const getHome = async (req, res) => {
    try {
        const homeCarousel = await HomeCarousel.find({ isBlocked: false });
        const bestOfferProducts = await Product.find({ discountPercentage: {$gte : 20 } , isBlocked : false})
        const category = await Category.find({isBlocked : false})
        console.log("best offer products : ", bestOfferProducts)
        console.log("Category : ", category)
        return res.render('user/home',{userDetails , homeCarousel , bestOfferProducts , category , cartItemCount})
    } catch (error) {
        console.log(error)
    }
}

//To get the user register page
const getRegister = async (req, res) => {
    try {
        res.render('user/registration', { type: "", message: "" , userDetails , cartItemCount})
    } catch (error) {
        console.log(error)
    }
}

//To get the user otp page
const getotppage = async(req,res)=>{
    try{
        res.render('user/otpvalidation',{type : "", message : "" , userDetails , cartItemCount})
    }catch(error){
        console.log(error.message)
    }
}


// For resending the otp
const resendOtp = async(req,res)=>{
    try{
        const otp = generateOtp()
        saveOtp = otp;
        sendOtpMail(enteredEmail,otp);
        function clearSaveOtp() {
            saveOtp = ""; 
            console.log("SaveOtp after resend =",saveOtp)
        }
        setTimeout(clearSaveOtp, 30000);
    }catch(error){
        console.log(error.message)
    }
}

//To get the user profile page
const getUserProfile = async(req,res)=>{
    try{
        const userId = req.session?.user?._id
        const userData = await User.findById(userId)
        const createdDate = new Date(userData.created);
        const address = await Address.find({userId : userId})
        console.log(address)
        const formattedDate = createdDate.toISOString().split('T')[0];
        res.render('user/profile',{userData, formattedDate , userDetails, address , cartItemCount})
    }catch(error){
        console.log(error.message)
        res.status(500).json({ message : "Internal server error"})
    }
}

// To update the user information
const postUserUpdatedInfo = async(req,res)=>{
    try{
        const { userName, phone, userId } = req.body;

        const updateUser = await User.findByIdAndUpdate(userId, { fullname: userName, phone: phone },
            { new: true } );
        
        if (!updateUser) {
            return res.status(404).json({ message: "User not found" });
        } else {
            return res.status(200).json({ message: "User updated successfully", user: updateUser });
        }

    }catch(error){
        console.log(error.message)
        res.status(500).json({ message : "Internal server error "})
    }
}

//To upload profile image
const postUserProfileImage = async(req,res)=>{
    try{
        const userId = req.body.userId
        const user = await User.findById(userId)

        if(user.profileimage){
            existingimage = user.profileimage
            console.log(user.profileimage)
            const imagePath = path.join(__dirname, "../public/images/UserProfile", existingimage);
            fs.unlinkSync(imagePath);
        }

        if(!req.file){
            res.status(400).json({ message : "Image is not uploaded correctly"})
        }

        const updateUserImage = await User.findByIdAndUpdate(userId, {profileimage : req.file.filename})
        if (updateUserImage) {
            return res.status(200).json({ message: "Profile image uploaded successfully" });
        } else {
            return res.status(500).json({ message: "Failed to update profile image" });
        }
        
    }catch(error){
        console.log(error.message)
        return res.status(500).json({ message : "Internal server error"})
    }
}

//To get the shop page
const getUserShop = async(req,res)=>{
    try{
        const productData = await Product.find({ isBlocked: false });
        const totalProducts = await Product.countDocuments({ isBlocked: false }); 
        const adCarousel = await AdCarousel.find({ isBlocked: false });
        const category = await Category.find({ isBlocked : false})
        const brand = await Brand.find({ isBlocked : false})
        let categoryId = []
        let brandId = []
        let prodId =[]

        if(!req.session.user){
            console.log("Session user : no user in session",)
            prodId =[]
        }else{
            console.log("Session user :",req.session.user)
            console.log("User id :",req.session.user._id)
            const user = req.session.user
            const wishlist = await Wishlist.find({ userId : user._id})
            if(wishlist != ""){
                console.log("Wishlist :",wishlist)
                const wishlistProducts = wishlist[0].products
                console.log("WishlistProducts :", wishlistProducts)
                const productsId = wishlistProducts.map(item => item.product);
                prodId = productsId
            }
        }
        console.log("Products id's:", prodId);

        const page = parseInt(req.query.page) || 1;  // This is coming from the first pagination a tag from shop.ejs
        const limit = 6; 
        
        console.log("Get user shop")

        res.render('user/shop',{productData , userDetails , adCarousel , category , brand , categoryId , brandId , currentPage: page, prodId , cartItemCount ,
            totalPages: Math.ceil(totalProducts / limit) })
        
    }catch(error){
        console.log(error.message)
        return res.status(500).json({ message : "Internal server error"})
    }
}


// To get the categorized products
const getCatProduct = async(req,res)=>{
    try{
        console.log("Here")
        console.log("res body :",req.body)
        console.log("res body categories :",req.body.categories)
        console.log("res body brands :",req.body.brands)
        console.log("res body sortCriteria :",req.body.sortCriteria)
        console.log("req body currentPage :", req.body.currentPage)
        let productData
        let prodId =[]

        if(!req.session.user){
            console.log("categorized products api Session user : no user in session",)
            prodId =[]
        }else{
            console.log("categorized products api Session user :",req.session.user)
            console.log("categorized products api User id :",req.session.user._id)
            const user = req.session.user
            const wishlist = await Wishlist.find({ userId : user._id})
            if(wishlist != ""){
                console.log("categorized products api Wishlist :",wishlist)
                const wishlistProducts = wishlist[0].products
                console.log("categorized products apiWishlistProducts :", wishlistProducts)
                const productsId = wishlistProducts.map(item => item.product);
                prodId = productsId
            }
        }
        console.log("categorized products api Products id's:", prodId);
        

        if(req.body){
            // To get the category and brand id's array and filtering to delete null
            const categories = req.body.categories.filter(category => category !== null);
            const brands = req.body.brands.filter(brand => brand !== null);
            
            const sortCriteria = req.body.sortCriteria
            const currentPage = req.body.currentPage

            const perPage = 6;
            const skip = (currentPage - 1) * perPage;

            // The querry to retrieve the product
            let query = { isBlocked: false };
            if (categories.length > 0 && brands.length > 0 ) {
                query = {
                    $and: [
                        { category: { $in: categories } },
                        { brand: { $in: brands } },
                    ],
                    isBlocked: false
                };
            } else if (categories.length > 0 && brands.length == 0) {
                query = {
                    category: { $in: categories },
                    isBlocked: false
                };
            } else if (brands.length > 0 && categories.length == 0) {
                query = {
                    brand: { $in: brands },
                    isBlocked: false
                };
            }

            productData = await Product.find(query).skip(skip).limit(perPage);
            const totalProducts = await Product.countDocuments(query);
            const totalPages = Math.ceil(totalProducts / perPage);
                
            console.log("productData :",productData)
            console.log("totalPages :",totalPages)
            
            // Sorting the products with the user selected sort type
            if(sortCriteria === "highToLow"){
                productData.sort((a,b) => b.offerPrice - a.offerPrice)
            }else if(sortCriteria === "lowToHigh"){
                productData.sort((a,b) => a.offerPrice - b.offerPrice)
            }

            console.log(productData)

            res.status(200).json({ message : "Categorized products", productData , totalPages , prodId})
        }else{
            res.status(400).json({ message : "No categorized found" })
        }
    }catch(error){
        console.log(error.message)
        return res.status(500).json({ message : "Internal server error"})
    }
}

//To get the add address page
const getUserNewAddress = async(req,res)=>{
    try{
        const userId = req.params.userId
        console.log(userId)
        return res.render('user/addAddress',{userDetails , userId , cartItemCount})
    }catch(error){
        console.log(error.message)
        return res.status(500).json({ message : "Internal server error"})
    }
}

//To add user address
const postUserAddress = async(req,res)=>{
    try{
        const { name, addressLine, phone, city, district, state, pincode, country} = req.body
        console.log("req.body : ",name, addressLine, phone, city, district, state, pincode, country)
        const userId = req.params.userId
        console.log(userId)

        const user = await User.findById(userId)
        if(!user){
            return res.status(400).json({ message : "User not found"})
        }
        
            const newAddress = new Address({
                userId: userId,
                name: name,
                addressLine: addressLine,
                phone: phone,
                city: city,
                district: district,
                state: state,
                pincode: pincode,
                country: country
            })
            await newAddress.save()
            return res.status(200).json({ message: "Address added successfully" })
        } catch (error) {
            console.log(error.message);
            return res.status(500).json({ message: "Internal server error" })
        }
    }

//To delete address from user profile
const postAddressDelete = async (req, res) => {
    try {
        const addressId = req.params.addressId;
        console.log(addressId);

        const deletedAddress = await Address.findByIdAndDelete(addressId);
        if (!deletedAddress) {
            return res.status(404).json({ message: "Address not found" });
        }else{
            return res.status(200).json({ message: "Address deleted successfully" });
        }
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
}

//To get the edit address page
const getUserEditAddress = async(req,res)=>{
    try{
        const addressId = req.params.addressId
        console.log(addressId)
        const userAddress = await Address.findById(addressId)
        console.log(userAddress)
        return res.render('user/updateAddress',{userAddress, userDetails , cartItemCount})
    }catch(error){
        console.log(error.message)
        return res.status(500).json({ message : "Internal server error" })
    }
}

//To post the updated address
const postUpdateUserAddress = async (req, res) => {
    try {
        const addressId = req.params.addressId;
        console.log(addressId , req.body)
        
        // Extract form data from req.body
        const newaddress = {
            name: req.body.name,
            addressLine: req.body.addressLine,
            phone: req.body.phone,
            city: req.body.city,
            district: req.body.district,
            state: req.body.state,
            pincode: req.body.pincode,
            country: req.body.country
        };

        // Update the address using the extracted form data
        const updatedAddress = await Address.findOneAndUpdate(
            { _id: addressId },
            newaddress,
            { new: true }
        );

        if (updatedAddress) {
            return res.status(200).json({ message: "Address updated successfully" });
        } else {
            return res.status(500).json({ message: "Failed to update address" });
        }

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

//To send the otp for changing password from user profile
const postOtpForChangePass = async (req, res) => {
    try {
        const { email } = req.body;
        const otp = generateOtp();
        saveOtp = otp;
        console.log("SaveOtp before =", saveOtp);

        function clearSaveOtp() {
            saveOtp = "";
            console.log("SaveOtp after =", saveOtp);
        }
        setTimeout(clearSaveOtp, 30000);

        sendOtpMail(email, saveOtp);

        res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

//To pot the otp from forgot password for verifying
const checkOtpForChangePass = async(req,res)=>{
    try{
        const enteredOtp = req.body.otp
        if (enteredOtp === saveOtp) {
            return res.status(200).json({ message: "OTP matched" });
        } else {
            return res.status(400).json({ message: "Incorrect OTP" });
        }
    }catch(error){
        console.log(error.message)
        return res.status(500).json({ message : "Internal server error"})
    }
}

//To change the password from user profile
const postUserNewPass = async (req, res) => {
    try {
        const { newPass, userId } = req.body;
        console.log(newPass , userId)
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const hashpassword = await bcrypt.hash(newPass, 10);

        user.password = hashpassword;
        await user.save();

        return res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

//To get the forgot password page from login page
const getForgotPassword = async(req,res)=>{
    try{
        return res.render('user/forgotPassword',{userDetails , cartItemCount})
    }catch(error){
        console.log(error.message)
        return res.status(500).json({ message : "Internal server error" })
    }
}

//To post the email for forgot password
const postForgotPasswordEmail = async(req,res)=>{
    try{
        const email = req.body.email
        console.log("Email :",email)
        enteredEmail = email
        const user = await User.findOne({ email : email})
        if(!user){
            return res.status(400).json({ message : "Email is not registered" })
        }else{
            const otp = generateOtp();
            saveOtp = otp;
            console.log("SaveOtp before =", saveOtp);

            function clearSaveOtp() {
                saveOtp = "";
                console.log("SaveOtp after =", saveOtp);
            }
            setTimeout(clearSaveOtp, 30000);

            sendOtpMail(email, saveOtp);

            res.status(200).json({ message: "OTP has been sent to your email." });
        }
    }catch(error){
        console.log(error.message)
        return res.status(500).json({ message : "Intrnal server error" })
    }
}

//To post the otp for forgot password and checking th the otp
const postForgotPasswordOtp = async(req,res)=>{
    try{
        const enteredOtp = req.body.otp
        if(!enteredOtp){
            return res.status(400).json({ message : "Otp sending error"})
        }else{
            if(enteredOtp === saveOtp){
                return res.status(200).json({ message : "Otp is verified" })
            }else{
                return res.status(400).json({ message : "Invalid Otp" })
            }
        }
    }catch(error){
        console.log(error.message)
        return res.status(500).json({ message : "Internal server error" })
    }
}

//To post the new password
const postForgotPasswordNewPass = async (req, res) => {
    try {
        const { newPassword } = req.body; // Assuming enteredEmail is sent in the request body
        console.log("Email :", enteredEmail);
        console.log("newPassword :", newPassword);
        
        const user = await User.findOne({ email: enteredEmail });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        } else {
            const hashpassword = await bcrypt.hash(newPassword, 10);
            if (!hashpassword) {
                return res.status(500).json({ message: "Error hashing password" });
            }
            
            const updatePassword = await User.findOneAndUpdate(
                { email: enteredEmail },
                { password: hashpassword },
                { new: true }
            );
            if (updatePassword) {
                enteredEmail = ""
                return res.status(200).json({ message: "Password reset successfully" });
            } else {
                return res.status(400).json({ message: "Error in password reset" });
            }
        }
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

//To get the product detail page
const getProductDetail = async(req,res)=>{
    try{
        const productId = req.params.productId
        const productData = await Product.findById(productId).populate([ {path : "category"},{path : "brand"}])
        const productCategory = productData.category
        const sameCategoryProduct = await Product.find({category : productCategory._id})
        
        return res.render('user/productDetail',{userDetails , productData , sameCategoryProduct , cartItemCount})
    }catch(error){
        console.log(error.message)
        return res.status(500).json({ success : false, message : "Internal server error" })
    }
}

// To get the wishlist page
const getWishlistPage = async(req,res)=>{
    try{
        let prodId = []
        let wishlistProducts = []
        const user = req.session.user
        const wishlist = await Wishlist.find({ userId : user._id})
        if(wishlist != ""){
            wishlistProducts = wishlist[0].products
            const productsId = wishlistProducts.map(item => item.product);
            prodId = productsId
        }
        const products = await Product.find({_id : {$in : prodId}}).populate("brand")
        res.render('user/wishlist', {userDetails , products ,wishlistProducts , cartItemCount})
    }catch(error){
        console.log(error.message)
        return res.status(500).json({ message : "Internal server error" })
    }
}

//To add and delete a product to and from a wishlist
const AddToWishlist = async(req,res)=>{
    try{
        const productId = req.body.productId
        const userId = req.session.user._id 
        const existingWishlist = await Wishlist.findOne({ userId: userId });

        if (existingWishlist) {
            const isProductInWishlist = existingWishlist.products.some(item => item.product.equals(productId));
            
            if (isProductInWishlist) {
                existingWishlist.products = existingWishlist.products.filter(item => !item.product.equals(productId));
                await existingWishlist.save();
                return res.status(200).json({ added: false, message: "Product deleted from your wishlist." });
            } else {
                existingWishlist.products.push({ product: productId });
                await existingWishlist.save();
                return res.status(200).json({ added: true, message: "Product added to your wishlist." });
            }
        } else {
            
            const newWishlist = new Wishlist({
                userId: userId,
                products: [{ product: productId }]
            });
            await newWishlist.save();
            return res.status(200).json({ message: "Product added to your wishlist." });
        }

    }catch(error){
        console.log(error.message)
        return res.status(500).json({ message : "Internal server error" })
    }
}

//To delete a product from wishlist
const deleteProductFromWishlist = async(req,res)=>{
    try{
  
        const productId = req.body.productId
        const userId = req.session.user._id
        

        if(!productId){
            return res.status(404).json({ messagr : "Product deletion error , please try again."})
        }
        
        const wishlist = await Wishlist.findOneAndUpdate({ userId: userId },
            { $pull: { products: { product: productId } } },
            { new: true }
            );
            
            if (!wishlist) {
                return res.status(404).json({ message: "Wishlist not found." });
            }
    
            return res.status(200).json({ message: "Product deleted from wishlist ." });
    }catch(error){
        console.log(error.message)
        return res.status(500).json({ message : "Internal server error." })
    }
}

//To get the cart page
const getCartPage = async(req,res)=>{
    try{
        const userId = req.session.user._id
        let cart = await Cart.find({userId : userId}).populate({
            path: "items.product",
            populate: { path: "brand" }
          });

        if (!cart || cart.length === 0) {
            cart = [];
            res.render('user/cart', { userDetails, cartItems: [], cart: [] , cartItemCount});
            return;
        }
        const cartItems = cart[0].items
        // console.log("User cart :", cart)
        // console.log("Cart items :",cartItems)
        res.render('user/cart' , {userDetails , cartItems , cart , cartItemCount})
    }catch(error){
        console.log(error.message)
        return res.status(500).json({ message : "Internal server error" })
    }
}

//To add a product to cart
const postProductToCart = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const productId = req.body.productId;
        let product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found." });
        }

        // Get the existing cart of the user
        let existingCart = await Cart.findOne({ userId: userId });

        if (existingCart !== null) {

            // Check if the product already exists in the cart
            const existingItem = existingCart.items.find(item => item.product.equals(productId));

            if (existingItem) {
                // If the product exists, update its quantity and prices
                if(existingItem.quantity >= product.noOfStock){
                    return res.status(409).json({ success : false, status : 409, message : "Selected quantity exceeds available stock"})
                }
                existingItem.quantity++;
                existingItem.totalPrice +=  product.offerPrice,
                existingItem.discountPrice += product.realPrice * (product.discountPercentage / 100)
            } else {
                // If the product does not exist, add it to the cart
                existingCart.items.push({
                    product: productId,
                    quantity: 1,
                    price: product.offerPrice,
                    totalPrice: product.offerPrice,
                    discountPrice: product.realPrice * (product.discountPercentage / 100)
                });
            }
            // Update total cart price and total discount price
            existingCart.totalCartPrice = existingCart.items.reduce((total, item) => total + item.totalPrice, 0);
            existingCart.totalCartDiscountPrice = existingCart.items.reduce((total, item) => total + item.discountPrice, 0);

        } else {
            // If the cart does not exist, create a new cart
            existingCart = new Cart({
                userId: userId,
                items: [{
                    product: productId,
                    quantity: 1,
                    price: product.offerPrice,
                    totalPrice: product.offerPrice,
                    discountPrice: product.realPrice * (product.discountPercentage / 100)
                }],
                totalCartPrice: product.offerPrice,
                totalCartDiscountPrice: product.realPrice * (product.discountPercentage / 100)
            });
        }

        await existingCart.save();

        let cart = await Cart.findOne({ userId : userId})
        if(cart){
            console.log("cart :",cart)
            console.log("array length :",cart.items.length)
            cartItemCount = cart.items.length
        }

        return res.status(200).json({ success: true, message: "Product added to your cart." });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false,  message: "Internal server  error" });
    }
};

//To add a product to cart from shop or product detail page
const postProductToCartFromShop = async (req, res) => {
    try {

        if(!req.session.user){
            let redirectUrl = `/login`;
            return res.json({ redirectUrl: redirectUrl });
        }
        
        const userId = req.session.user._id;
        const productId = req.body.productId;
        let product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found." });
        }

        // Get the existing cart of the user
        let existingCart = await Cart.findOne({ userId: userId });

        if (existingCart !== null) {

            // Check if the product already exists in the cart
            const existingItem = existingCart.items.find(item => item.product.equals(productId));

            if (existingItem) {
                // If the product exists, update its quantity and prices
                if(existingItem.quantity >= product.noOfStock){
                    return res.status(409).json({ success : false, status : 409, message : "Selected quantity exceeds available stock"})
                }
                existingItem.quantity++;
                existingItem.totalPrice +=  product.offerPrice,
                existingItem.discountPrice += product.realPrice * (product.discountPercentage / 100)
            } else {
                // If the product does not exist, add it to the cart
                existingCart.items.push({
                    product: productId,
                    quantity: 1,
                    price: product.offerPrice,
                    totalPrice: product.offerPrice,
                    discountPrice: product.realPrice * (product.discountPercentage / 100)
                });
            }
            // Update total cart price and total discount price
            existingCart.totalCartPrice = existingCart.items.reduce((total, item) => total + item.totalPrice, 0);
            existingCart.totalCartDiscountPrice = existingCart.items.reduce((total, item) => total + item.discountPrice, 0);

        } else {
            // If the cart does not exist, create a new cart
            existingCart = new Cart({
                userId: userId,
                items: [{
                    product: productId,
                    quantity: 1,
                    price: product.offerPrice,
                    totalPrice: product.offerPrice,
                    discountPrice: product.realPrice * (product.discountPercentage / 100)
                }],
                totalCartPrice: product.offerPrice,
                totalCartDiscountPrice: product.realPrice * (product.discountPercentage / 100)
            });
        }
        
        await existingCart.save();
        cartItemCount = existingCart.items.length

        return res.status(200).json({ success: true, message: "Product added to your cart." });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false,  message: "Internal server  error" });
    }
};

//To increment the quantity of the product from cart
const postCartProductQtyInc = async(req,res)=>{
    try{
                
        let userId = req.session.user._id;
        let productId = req.body.productId;

        let cart = await Cart.findOne({ userId : userId}).populate('items.product')
        if(!cart){
            return res.status(404).json({ message : "Cart not found"})
        }

        //Find dthe prosuct to  increment quantity
        let product = cart.items.find(item => item.product._id.toString() === productId)

        if(!product){
            return res.status(404).json({ success : false , message : "Product not found"})
        }

        if(product.quantity >= product.product.noOfStock){
            return res.status(409).json({ success : false , status : 409, message : "Selected quantity exceeds available stock"})
        }

        product.quantity++;
        product.totalPrice += product.product.offerPrice
        product.discountPrice += product.product.realPrice * (product.product.discountPercentage / 100)
        cart.totalCartPrice = cart.items.reduce((total, item) => total + item.totalPrice, 0);
        cart.totalCartDiscountPrice = cart.items.reduce((total, item) => total + item.discountPrice, 0);

        await cart.save()
        return res.status(200).json({ success : true , message : "Quantity incremented"})
  
    }catch(error){
        console.log(error)
        return res.status(500).json({ message : "Internal server error" })
    }
}

//To decrement the quantity of the product from cart
const postCartProductQtyDec = async(req,res)=>{
    try{
        let productId = req.body.productId
        const userId = req.session.user._id

        let cart = await Cart.findOne({ userId : userId}).populate('items.product')
        if(!cart){
            return res.status(404).json({ message : "Cart not found"})
        }

        //Find dthe prosuct to  increment quantity
        let product = cart.items.find(item => item.product._id.toString() === productId)

        if(!product){
            return res.status(404).json({ success : false , message : "Product not found"})
        }

        product.quantity--;
        product.totalPrice -= product.product.offerPrice
        product.discountPrice -= product.product.realPrice * (product.product.discountPercentage / 100)
        cart.totalCartPrice = cart.items.reduce((total, item) => total + item.totalPrice, 0);
        cart.totalCartDiscountPrice = cart.items.reduce((total, item) => total + item.discountPrice, 0);

        await cart.save()
        return res.status(200).json({ success : true , message : "Quantity decremented"})
  
    }catch(error){
        console.log(error.message)
        return res.status(500).json({ success : false , message : "Internal server error" })
    }
}

//To delete a product from cart
const deleteProductFromCart = async(req,res)=>{
    try{
        console.log("req body:",req.body)
        const productId = req.body.productId
        const userId = req.session.user._id
        console.log("productId :",productId)
        console.log("userId :",userId)

        if(!productId){
            return res.status(404).json({ success : false, messagr : "Product deletion error , please try again."})
        }

        const cartDelProd = await Cart.findOneAndUpdate({ userId: userId },
            { $pull: { items: { product: productId } } },
            { new: true }
            );
            
        let cart = await Cart.findOne({ userId : userId})

        if (!cartDelProd) {
            return res.status(404).json({ success : false, message: "Cart not found." });
        }else{
            cartItemCount = cart.items.length
        }

        if(cart.items.length === 0){
            cartItemCount = 0
        }

        cart.totalCartPrice = cart.items.reduce((total, item) => total + item.totalPrice, 0);
        cart.totalCartDiscountPrice = cart.items.reduce((total, item) => total + item.discountPrice, 0);
        await cart.save();

        return res.status(200).json({ success : true, message: "Product deleted from your cart ." });
    }catch(error){
        console.log(error.message)
        return res.status(500).json({ success : false, message : "Internal server error." })
    }
}






module.exports = {
    getHome,
    getLogin,
    getLogout,
    getRegister,
    postRegister,
    postRegisterOtp,
    postLogin,
    getotppage,
    resendOtp,
    getUserProfile,
    postUserUpdatedInfo,
    postUserProfileImage,
    getUserShop,
    postUserAddress,
    postAddressDelete,
    getUserEditAddress,
    postUpdateUserAddress,
    getUserNewAddress,
    postOtpForChangePass,
    checkOtpForChangePass,
    postUserNewPass,
    getForgotPassword,
    postForgotPasswordEmail,
    postForgotPasswordOtp,
    postForgotPasswordNewPass,
    getProductDetail,
    getCatProduct,
    getWishlistPage,
    AddToWishlist,
    deleteProductFromWishlist,
    getCartPage,
    postProductToCart,
    postProductToCartFromShop,
    postCartProductQtyInc,
    postCartProductQtyDec,
    deleteProductFromCart,
}
