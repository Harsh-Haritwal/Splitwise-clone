const express = require("express");
const handleCreateGroup = require("../controllers/handleCreateGroup");
const authMid = require("../middleware/authMiddleware");
const handleFetchGroups = require("../controllers/handleFetchGroups");
const handleAddNewMembers = require("../controllers/handleAddNewMembers");
const handleDeleteGroupMember = require("../controllers/handleDeleteGroupMember");
const handleEditGroupDetails = require("../controllers/handleEditGroupDetails");
const handleDeleteGroup = require("../controllers/handleDeleteGroup");
const handleFetchAGroup = require("../controllers/handleFetchAGroup");

const groupRouter = express.Router();

groupRouter.post("/create", authMid, handleCreateGroup);
groupRouter.get("/my-groups", authMid, handleFetchGroups);
groupRouter.get("/:groupId", authMid, handleFetchAGroup);
groupRouter.post("/:groupId/members", authMid, handleAddNewMembers);
groupRouter.delete("/:groupId/members/:memberId", authMid, handleDeleteGroupMember);
groupRouter.patch("/:groupId", authMid, handleEditGroupDetails);
groupRouter.delete("/:groupId", authMid, handleDeleteGroup);

module.exports = groupRouter;