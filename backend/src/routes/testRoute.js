const express = require("express");
const handleTestRoute = require("../controllers/handleTestRoute");
const authMid = require("../middleware/authMiddleware");


const testRoute = express.Router();

testRoute.get("/testroute", authMid, handleTestRoute );

module.exports = testRoute;