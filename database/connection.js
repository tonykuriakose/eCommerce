const mongoose = require("mongoose");

const db = async () => {
    try {
        const DBUSERNAME = 't4tonykuriakose';
        const DBPASSWORD = 'g8IHPqZVVlw4iEZA';
        const DBNAME = 'ecommerce';
        const MONGODB_URI = `mongodb+srv://${DBUSERNAME}:${DBPASSWORD}@nodecluster.3kpa5zx.mongodb.net/${DBNAME}?retryWrites=true&w=majority&appName=nodecluster`;
        
        await mongoose.connect(MONGODB_URI);
        console.log('DB Connected');
    } catch (error) {
        console.error('DB connection failed:', error);
        process.exit(1);
    }
};

module.exports = db;
