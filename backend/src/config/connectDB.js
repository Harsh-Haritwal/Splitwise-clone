const mongoose = require("mongoose"); 

const connectDB = async() => {
    try {
       const connection = await mongoose.connect(process.env.MONGODB_URI)
       if(connection) {
            console.log("Mongo DB connected succusfully!");
       }
    } catch (error) {
        console.log("Error in DB connection", error);
        throw error
    }
}

module.exports = connectDB