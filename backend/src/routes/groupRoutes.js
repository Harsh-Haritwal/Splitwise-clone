const express = require("express");
const handleCreateGroup = require("../controllers/handleCreateGroup");
const authMid = require("../middleware/authMiddleware");
const handleFetchGroups = require("../controllers/handleFetchGroups");
const handleFetchAGroup = require("../controllers/handleFetchAGroup");

const groupRouter = express.Router();

groupRouter.post("/create", authMid, handleCreateGroup);
groupRouter.get("/my-groups", authMid, handleFetchGroups);
groupRouter.get("/:groupId", authMid, handleFetchAGroup);

module.exports = groupRouter;