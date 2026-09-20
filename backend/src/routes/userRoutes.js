const express = require("express");
const handleUserSignup = require("../controllers/handleUserSignup");
const handleUserLogin = require("../controllers/handleUserLogin");
const handleUserProfile = require("../controllers/handleUserProfile");
const authMid = require("../middleware/authMiddleware");
const handleUpdateProfile = require("../controllers/handleUpdateProfile");
const handleUserDelete = require("../controllers/handleUserDelete");
const handleUserChangePassword = require("../controllers/handleUserChangePassword");

const userRouter = express.Router();

userRouter.post("/signup", handleUserSignup);
userRouter.post("/login", handleUserLogin);
userRouter.get("/profile", authMid, handleUserProfile);
userRouter.patch("/profile", authMid, handleUpdateProfile);
userRouter.delete("/profile", authMid, handleUserDelete);
userRouter.patch("/change-password", authMid, handleUserChangePassword);

module.exports = userRouter;