import dotenv from "dotenv";

import mongoose  from "mongoose";
import {DB_NAME} from "./constants.js";
import connectDB from "./db/index.js";

dotenv.config({
    path: './.env'
});
// non-professional approach

// import express from "express";
// const app = express();
// ;(async ()=>{
//     try{
//         await mongoose.connect('${process.env.MONGODB_URI}/${DB_NAME}');
//     }catch(error){
//         console.log("ERROR:",error);
//     }
// })();
connectDB()
.then(() => {
    console.log("connection successfully");
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
});


import {app} from "./app.js";

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})