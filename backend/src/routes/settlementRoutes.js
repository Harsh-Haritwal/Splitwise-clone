const express = require("express");
const handleAddSettlement = require("../controllers/handleAddSettlement");
const authMid = require("../middleware/authMiddleware");

const settlementRouter = express.Router();

settlementRouter.post("/add", authMid, handleAddSettlement);

module.exports = settlementRouter;
