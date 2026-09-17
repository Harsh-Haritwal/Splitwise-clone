const app = require("./app.js");
const connectDB = require("./config/connectDB.js")
require("dotenv").config();
const PORT = process.env.PORT || 5000;
const dns = require("dns")
dns.setServers(["8.8.8.8", "1.1.1.1"]);

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

