import mongoose from "mongoose";
import config from '../config/config.js'


const connectDb = async () => {
    try {
        await mongoose.connect(config.MONGO_URI);
        console.log("MongoDb connected")
    } catch (error) {
        console.error("Error to connecting", error)
        throw error;
    }
}


export default connectDb;
