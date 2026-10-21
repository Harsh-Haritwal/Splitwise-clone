const mongoose = require("mongoose");
const Expense = require("../models/expenseModel");
const Group = require("../models/groupModel");

const handleFetchExpense = async (req, res) => {
  const { id } = req.user;
  if (!id) {
    return res.status(401).json({ msg: "Unauthorized access" });
  }
  const { expenseId } = req.params;
  if (!expenseId) {
    return res.status(400).json({ msg: "Expense id is missing" });
  }
  if (!mongoose.Types.ObjectId.isValid(expenseId)) {
    return res.status(400).json({ msg: "Expense id is not valid" });
  }

  try {
    const expense = await Expense.findById(expenseId)
      .populate("paidBy", "name email avatar")
      .populate("participants", "name email avatar")
      .populate("splits.user", "name email avatar");

    if (!expense) {
      return res.status(404).json({ msg: "Expense not found" });
    }

    const group = await Group.findOne({ _id: expense.groupId, members: id });
    if (!group) {
      return res.status(404).json({ msg: "Expense not found" });
    }

    return res.status(200).json({
      msg: "Expense fetched successfully",
      expense: expense,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal server error" });
  }
};

module.exports = handleFetchExpense;
