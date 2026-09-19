const express = require("express");
const cors = require("cors");
const userRouter = require("./routes/userRoutes");
const testRoute = require("./routes/testRoute");
const app = express();

app.use(cors());
app.use(express.json())


app.use("/user", userRouter);
app.use("/user", testRoute);

app.get("/api/health", (req, res) => {
    res.status(200).json({
        succuss: true,
        msg: "Splitwise clone app is running"
    })
})

module.exports = app;