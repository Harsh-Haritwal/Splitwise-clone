const express = require("express");
const handleTestRoute = require("../controllers/handleTestRoute");
const authMid = require("../middleware/authMiddleware");


const testRoute = express.Router();

testRoute.post("/testroute",authMid, handleTestRoute );

module.exports = testRoute;