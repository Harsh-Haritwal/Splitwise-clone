const app = require("./app.js");
const connectDB = require("./config/connectDB.js")
const PORT = process.env.PORT || 5000;
require("dotenv").config();



const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Server is running at https://localhost:${PORT}`)
        })

    }catch(error){
        console.log("There is an error while starting the server!")
        throw error;
    }
}

startServer();

