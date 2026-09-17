const express = require("express");
const handleUserSignup = require("../controllers/handleUserSignup");

const userRouter = express.Router();

userRouter.post("/signup", handleUserSignup);

module.exports = userRouter;