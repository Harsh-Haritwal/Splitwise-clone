const express = require("express");
const handleAddSettlement = require("../controllers/handleAddSettlement");
const handleFetchSettlements = require("../controllers/handleFetchSettlements");
const authMid = require("../middleware/authMiddleware");

const settlementRouter = express.Router();

settlementRouter.post("/add", authMid, handleAddSettlement);
settlementRouter.get("/group/:groupId", authMid, handleFetchSettlements);

module.exports = settlementRouter;
