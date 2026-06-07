import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log("mongodb connections successful!! \n");
        console.log(connectionInstance);
    } catch (error) {
        console.log("mongodb error: ",error);
        process.exit(1);
    }
};
export default connectDB;
