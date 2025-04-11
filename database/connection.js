const mongoose = require("mongoose");
const dotenv = require("dotenv").config();

const db = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('DB Connected');
    } catch (error) {
        console.error('DB connection failed:', error);
        process.exit(1);
    }
};

module.exports = db;
