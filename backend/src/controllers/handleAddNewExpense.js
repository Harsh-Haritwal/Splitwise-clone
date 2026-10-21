const Expense = require("../models/expenseModel");
const validateExpenseInput = require("../utils/validateExpenseInput");

const handleAddNewExpense = async (req, res) => {
  const { id } = req.user;
  if (!id) {
    return res.status(401).json({ msg: "Unauthorized access" });
  }

  try {
    const result = await validateExpenseInput(id, req.body);
    if (result.error) {
      return res.status(result.error.status).json({ msg: result.error.msg });
    }

    const newExpense = await Expense.create(result.expense);
    if (!newExpense) {
      return res.status(403).json({ msg: "Unable to create new expense" });
    }
    return res.status(201).json({ msg: "New expense created", newExpense });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal server error" });
  }
};

module.exports = handleAddNewExpense;
