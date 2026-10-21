const Expense = require("../models/expenseModel");
const { roundAmount } = require("./expenseSplits");

const calculateGroupBalances = async (groupId) => {
  const expenses = await Expense.find({ groupId: groupId });

  const totals = {};
  let totalExpenseAmount = 0;

  const getTotal = (userId) => {
    if (!totals[userId]) {
      totals[userId] = { user: userId, paid: 0, share: 0 };
    }
    return totals[userId];
  };

  for (const expense of expenses) {
    totalExpenseAmount += expense.amount;

    const payerId = expense.paidBy.toString();
    getTotal(payerId).paid += expense.amount;

    for (const split of expense.splits) {
      const userId = split.user.toString();
      getTotal(userId).share += split.amount;
    }
  }

  const balances = Object.keys(totals).map((userId) => {
    const total = totals[userId];
    return {
      user: total.user,
      paid: roundAmount(total.paid),
      share: roundAmount(total.share),
      balance: roundAmount(total.paid - total.share),
    };
  });

  return {
    balances: balances,
    totalExpenseAmount: roundAmount(totalExpenseAmount),
    expenseCount: expenses.length,
  };
};

module.exports = calculateGroupBalances;
