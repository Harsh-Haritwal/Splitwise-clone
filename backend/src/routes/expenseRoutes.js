const express = require("express");
const handleAddNewExpense = require("../controllers/handleAddNewExpense");
const handleFetchGroupExpenses = require("../controllers/handleFetchGroupExpenses");
const handleFetchExpense = require("../controllers/handleFetchExpense");
const authMid = require("../middleware/authMiddleware");

const router = express.Router();

router.post('/add', authMid, handleAddNewExpense);
router.get('/group/:groupId', authMid, handleFetchGroupExpenses);
router.get('/:expenseId', authMid, handleFetchExpense);

module.exports = router;
