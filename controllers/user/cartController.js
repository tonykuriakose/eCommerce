const User = require("../../models/userSchema");
const Product = require("../../models/productSchema");
const mongodb = require("mongodb");



const loadWishlist = async (req, res) => {
  try {
    const userId = req.session.user;
    const user = await User.findById(userId);

    if (!user) {
      return res.redirect("/pageNotFound");
    }
    const products = await Product.find({ _id: { $in: user.wishlist } });

    res.render("wishlist", {
      user,
      wishlist: products,
    });
  } catch (error) {
    console.error(error);
    return res.redirect("/pageNotFound");
  }
};


const addToWishlist = async (req, res) => {
  try {
    const productId = req.body.productId;
    const userId = req.session.user;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }
  
    if (user.wishlist.includes(productId)) {
      return res.status(200).json({ status: false, message: 'Product already in wishlist' });
    }
    user.wishlist.push(productId);
    await user.save();

    return res.status(200).json({ status: true, message: 'Product added to wishlist', wishlistLength: user.wishlist.length });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: 'Server error' });
  }
};



const getCartPage = async (req, res) => {
  try {
    const id = req.session.user;
    const user = await User.findOne({ _id: id });
    const productIds = user.cart.map((item) => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });
    const oid = new mongodb.ObjectId(id);
    let data = await User.aggregate([
      { $match: { _id: oid } },
      { $unwind: "$cart" },
      {
        $project: {
          proId: { $toObjectId: "$cart.productId" },
          quantity: "$cart.quantity",
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "proId",
          foreignField: "_id",
          as: "productDetails",
        },
      },
    ]);
    let quantity = 0;
    for (const i of user.cart) {
      quantity += i.quantity;
    }
    let grandTotal = 0;
    for (let i = 0; i < data.length; i++) {
      if (products[i]) {
        grandTotal += data[i].productDetails[0].salePrice * data[i].quantity;
      }
      req.session.grandTotal = grandTotal;
    }
    res.render("cart", {
      user,
      quantity,
      data,
      grandTotal,
    });
  } catch (error) {
    res.redirect("/pageNotFound");
  }
};


const addToCart = async (req, res) => {
  try {
    const id = req.body.productId;
    const userId = req.session.user;
    const findUser = await User.findById(userId);
    const product = await Product.findById({ _id: id }).lean();
    
    if (!product) {
      return res.json({ status: "Product not found" });
    }
    
    if (product.quantity <= 0) {
      return res.json({ status: "Out of stock" });
    }

    const cartIndex = findUser.cart.findIndex((item) => item.productId == id);

    if (cartIndex === -1) {
      const quantity = 1;
      await User.findByIdAndUpdate(userId, {
        $addToSet: {
          cart: {
            productId: id,
            quantity: quantity,
          },
        },
      });
      return res.json({ status: true, cartLength: findUser.cart.length + 1, user: userId });
    } else {
      const productInCart = findUser.cart[cartIndex];
      if (productInCart.quantity < product.quantity) {
        const newQuantity = productInCart.quantity + 1;
        await User.updateOne(
          { _id: userId, "cart.productId": id },
          { $set: { "cart.$.quantity": newQuantity } }
        );
        return res.json({ status: true, cartLength: findUser.cart.length, user: userId });
      } else {
        return res.json({ status: "Out of stock" });
      }
    }
  } catch (error) {
    console.error(error);
    return res.redirect("/pageNotFound");
  }
};


const changeQuantity = async (req, res) => {
  try {
    // console.log('here--');
    const id = req.body.productId;
    const user = req.session.user;
    console.log(user, "user id1");
    const count = req.body.count;
    // count(-1,+1)

    // console.log(user);
    // console.log(id, "productId");

    const findUser = await User.findOne({ _id: user });
    console.log(findUser);
    const findProduct = await Product.findOne({ _id: id });
    const oid = new mongodb.ObjectId(user);

    if (findUser) {
      const productExistinCart = findUser.cart.find(
        (item) => item.productId === id
      );
      // console.log(productExistinCart, 'this is product in cart');
      let newQuantity;
      if (productExistinCart) {
        console.log(count);
        if (count == 1) {
          newQuantity = productExistinCart.quantity + 1;
        } else if (count == -1) {
          newQuantity = productExistinCart.quantity - 1;
        } else {
          return res
            .status(400)
            .json({ status: false, error: "Invalid count" });
        }
      } else {
      }
      console.log(newQuantity, "this id new Quantity");
      if (newQuantity > 0 && newQuantity <= findProduct.quantity) {
        let quantityUpdated = await User.updateOne(
          { _id: user, "cart.productId": id },
          {
            $set: {
              "cart.$.quantity": newQuantity,
            },
          }
        );
        const totalAmount = findProduct.salePrice * newQuantity;
        const grandTotal = await User.aggregate([
          { $match: { _id: oid } },
          { $unwind: "$cart" },
          {
            $project: {
              proId: { $toObjectId: "$cart.productId" },
              quantity: "$cart.quantity",
            },
          },
          {
            $lookup: {
              from: "products",
              localField: "proId",
              foreignField: "_id",
              as: "productDetails",
            },
          },
          {
            $unwind: "$productDetails", // Unwind the array created by the $lookup stage
          },

          {
            $group: {
              _id: null,
              totalQuantity: { $sum: "$quantity" }, // Sum of quantities from the Cart collection
              totalPrice: {
                $sum: { $multiply: ["$quantity", "$productDetails.salePrice"] },
              }, // Sum of (quantity * price) from the joined collections
            },
          },
        ]);
        console.log(grandTotal, "grand total");
        if (quantityUpdated) {
          // console.log('iam here inside the cart', quantityUpdated, 'ok');

          res.json({
            status: true,
            quantityInput: newQuantity,
            count: count,
            totalAmount: totalAmount,
            grandTotal: grandTotal[0].totalPrice,
          });
        } else {
          res.json({ status: false, error: "cart quantity is less" });
        }
      } else {
        res.json({ status: false, error: "out of stock" });
      }
    }
  } catch (error) {
    res.redirect("/pageNotFound");
    return res.status(500).json({ status: false, error: "Server error" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const id = req.query.id;
    console.log(id, "id");
    const userId = req.session.user;
    const user = await User.findById(userId);
    const cartIndex = user.cart.findIndex((item) => item.productId == id);
    user.cart.splice(cartIndex, 1);
    await user.save();
    console.log("item deleted from cart");
    res.redirect("/cart");
  } catch (error) {
    res.redirect("/pageNotFound");
  }
};


const removeProduct = async (req, res) => {
  try {
    const productId = req.query.productId;
    const userId = req.session.user;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    const index = user.wishlist.indexOf(productId);
    if (index === -1) {
      return res.status(404).json({ status: false, message: 'Product not found in wishlist' });
    }

    user.wishlist.splice(index, 1);
    await user.save();
    console.log("Product removed from wishlist");
    return res.redirect('/wishlist'); 
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: 'Server error' });
  }
};


module.exports = {
  getCartPage,
  addToCart,
  changeQuantity,
  deleteProduct,
  loadWishlist,
  addToWishlist,
  removeProduct,
};
