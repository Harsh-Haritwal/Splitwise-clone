const express = require("express");
const handleCreateGroup = require("../controllers/handleCreateGroup");
const authMid = require("../middleware/authMiddleware");

const groupRouter = express.Router();

groupRouter.post("/create", authMid, handleCreateGroup);

module.exports = groupRouter;