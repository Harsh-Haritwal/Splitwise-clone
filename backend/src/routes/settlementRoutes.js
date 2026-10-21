const express = require("express");
const handleAddSettlement = require("../controllers/handleAddSettlement");
const handleFetchSettlements = require("../controllers/handleFetchSettlements");
const handleFetchSettlementSummary = require("../controllers/handleFetchSettlementSummary");
const authMid = require("../middleware/authMiddleware");

const settlementRouter = express.Router();

settlementRouter.post("/add", authMid, handleAddSettlement);
settlementRouter.get("/group/:groupId", authMid, handleFetchSettlements);
settlementRouter.get(
  "/group/:groupId/summary",
  authMid,
  handleFetchSettlementSummary,
);

module.exports = settlementRouter;
