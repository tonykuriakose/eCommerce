const Mongoose = require("mongoose");
const { Schema } = Mongoose;

const userSchema = Mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true,
        unique : true
    },
    phone : {
        type : String,
        required : true,
        // unique : true
    },
    password : {
        type : String,
        required : true,
    },
    isBlocked : {
        type : Boolean,
        default : false
    },
    isAdmin : {
        type : Boolean,
        default : false
    },
    cart : {
        type : Array
    },
    wallet : {
        type : Number,
        default : 0
    },
    wishlist : {
        type : Array
    },
    history : {
        type : Array
    },
    createdOn : {
        type : String
    },
    referalCode: {
        type: String,
        required: true,
    },
    redeemed: {
        type: Boolean,
        default: false,
    },
    redeemedUsers: [
        {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        }
    ],
    searchHistory : [
        {
            category : {
                type : Schema.Types.ObjectId,
                ref:"Category"
            },
            brand : {
                type: String
            },
            searchedOn: {
                type:Date,
                default : Date.now
            }
        }
    ]

})

const User = Mongoose.model('User',userSchema);
module.exports = User;