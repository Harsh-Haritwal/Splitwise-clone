const express = require("express");
const cors = require("cors");
const userRouter = require("./routes/userRoutes");
const testRoute = require("./routes/testRoute");
const authMid = require("./middleware/authMiddleware");
const groupRouter = require("./routes/groupRoutes");
const expenseRouter = require("./routes/expenseRoutes");
const balanceRouter = require("./routes/balanceRoutes");
const settlementRouter = require("./routes/settlementRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }))


app.use("/user", userRouter);
app.use("/group", groupRouter);
app.use("/expense", expenseRouter);
app.use("/balance", balanceRouter);
app.use("/settlement", settlementRouter);
app.use("/user", authMid, testRoute);

app.get("/api/health", (req, res) => {
    res.status(200).json({
        succuss: true,
        msg: "Splitwise clone app is running"
    })
})

app.use(notFound);
app.use(errorHandler);

module.exports = app;