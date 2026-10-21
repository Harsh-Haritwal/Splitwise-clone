const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const userRouter = require("./routes/userRoutes");
const testRoute = require("./routes/testRoute");
const authMid = require("./middleware/authMiddleware");
const groupRouter = require("./routes/groupRoutes");
const expenseRouter = require("./routes/expenseRoutes");
const balanceRouter = require("./routes/balanceRoutes");
const settlementRouter = require("./routes/settlementRoutes");
const sanitizeInput = require("./middleware/sanitizeInput");
const { apiLimiter, authLimiter } = require("./middleware/rateLimiters");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const app = express();

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((origin) => origin.trim().replace(/\/$/, ""))
  : ["http://localhost:5173", "http://127.0.0.1:5173"];

if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
}

app.use(helmet());
app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: "100kb" }))
app.use(sanitizeInput);
app.use(apiLimiter);

app.use("/user/login", authLimiter);
app.use("/user/signup", authLimiter);


app.use("/user", userRouter);
app.use("/group", groupRouter);
app.use("/expense", expenseRouter);
app.use("/balance", balanceRouter);
app.use("/settlement", settlementRouter);
app.use("/user", authMid, testRoute);

app.get("/api/health", (req, res) => {
    const databaseConnected = mongoose.connection.readyState === 1;
    res.status(databaseConnected ? 200 : 503).json({
        success: databaseConnected,
        msg: databaseConnected
            ? "Splitwise clone app is running"
            : "Database is not connected",
        database: databaseConnected ? "connected" : "disconnected"
    })
})

app.use(notFound);
app.use(errorHandler);

module.exports = app;