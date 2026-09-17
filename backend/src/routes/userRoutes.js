const express = require("express");
const handleUserSignup = require("../controllers/handleUserSignup");
const handleUserLogin = require("../controllers/handleUserLogin");

const userRouter = express.Router();

userRouter.post("/signup", handleUserSignup);
userRouter.post("/login", handleUserLogin);

module.exports = userRouter;