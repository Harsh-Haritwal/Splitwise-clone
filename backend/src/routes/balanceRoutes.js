const express = require("express");
const handleFetchGroupBalances = require("../controllers/handleFetchGroupBalances");
const handleFetchGroupBalanceSummary = require("../controllers/handleFetchGroupBalanceSummary");
const handleSimplifyGroupDebts = require("../controllers/handleSimplifyGroupDebts");
const handleFetchMyBalance = require("../controllers/handleFetchMyBalance");
const authMid = require("../middleware/authMiddleware");

const balanceRouter = express.Router();

balanceRouter.get("/me", authMid, handleFetchMyBalance);
balanceRouter.get("/group/:groupId", authMid, handleFetchGroupBalances);
balanceRouter.get(
  "/group/:groupId/summary",
  authMid,
  handleFetchGroupBalanceSummary,
);
balanceRouter.get("/group/:groupId/settle", authMid, handleSimplifyGroupDebts);

module.exports = balanceRouter;
