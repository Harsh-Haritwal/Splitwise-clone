const express = require("express");
const handleFetchGroupBalances = require("../controllers/handleFetchGroupBalances");
const authMid = require("../middleware/authMiddleware");

const balanceRouter = express.Router();

balanceRouter.get("/group/:groupId", authMid, handleFetchGroupBalances);

module.exports = balanceRouter;
