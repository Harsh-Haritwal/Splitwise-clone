const express = require("express");
const handleAddNewExpense = require("../controllers/handleAddNewExpense");
const authMid = require("../middleware/authMiddleware");

const router = express.Router();

router.post('/add', authMid, handleAddNewExpense);

module.exports = router;