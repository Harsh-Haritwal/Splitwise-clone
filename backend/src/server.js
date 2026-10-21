require("dotenv").config();
const app = require("./app.js");
const connectDB = require("./config/connectDB.js")
const PORT = process.env.PORT || 5000;
const dns = require("dns")

// The public DNS servers help local Atlas connections on some Windows setups.
// Production platforms use their own DNS configuration.
if (process.env.NODE_ENV !== "production") {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
}

const requiredEnv = ["MONGODB_URI", "JWT_SECRET"];
const missingEnv = requiredEnv.filter((name) => !process.env[name]);
if (missingEnv.length > 0) {
    console.log(`Missing required environment variables: ${missingEnv.join(", ")}`);
    process.exit(1);
}

const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Server is running at http://localhost:${PORT}`)
        })

    }catch(error){
        console.log("There is an error while starting the server!")
        throw error;
    }
}

startServer();

