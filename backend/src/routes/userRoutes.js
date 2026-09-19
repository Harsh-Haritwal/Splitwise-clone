const express = require("express");
const handleUserSignup = require("../controllers/handleUserSignup");
const handleUserLogin = require("../controllers/handleUserLogin");
const handleUserProfile = require("../controllers/handleUserProfile");
const authMid = require("../middleware/authMiddleware");

const userRouter = express.Router();

userRouter.post("/signup", handleUserSignup);
userRouter.post("/login", handleUserLogin);
userRouter.get("/profile", authMid, handleUserProfile);

module.exports = userRouter;