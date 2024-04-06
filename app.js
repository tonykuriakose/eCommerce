const express = require("express");
const db = require('./database/connection');
const app = express();
const env = require("dotenv").config();
db()























app.listen(process.env.PORT,()=>{
    console.log('Server Running');
});