const express = require("express");
const handleCreateGroup = require("../controllers/handleCreateGroup");
const authMid = require("../middleware/authMiddleware");
const handleFetchGroups = require("../controllers/handleFetchGroups");
const handleFetchAGroup = require("../controllers/handleFetchAGroup");
const handleAddNewMembers = require("../controllers/handleAddNewMembers");

const groupRouter = express.Router();

groupRouter.post("/create", authMid, handleCreateGroup);
groupRouter.get("/my-groups", authMid, handleFetchGroups);
groupRouter.get("/:groupId", authMid, handleFetchAGroup);
groupRouter.post("/:groupId/members", authMid, handleAddNewMembers);

module.exports = groupRouter;