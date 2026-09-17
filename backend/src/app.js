const express = require("express");
const cors = require("cors");
const userRouter = require("./routes/userRoutes");
const app = express();

app.use(cors());
app.use(express.json())


app.use("/user", userRouter);

app.get("/api/health", (req, res) => {
    res.status(200).json({
        succuss: true,
        msg: "Splitwise clone app is running"
    })
})

module.exports = app;