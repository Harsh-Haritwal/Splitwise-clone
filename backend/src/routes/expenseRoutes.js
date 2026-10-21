const express = require("express");
const handleAddNewExpense = require("../controllers/handleAddNewExpense");
const handleFetchGroupExpenses = require("../controllers/handleFetchGroupExpenses");
const authMid = require("../middleware/authMiddleware");

const router = express.Router();

router.post('/add', authMid, handleAddNewExpense);
router.get('/group/:groupId', authMid, handleFetchGroupExpenses);

module.exports = router;
