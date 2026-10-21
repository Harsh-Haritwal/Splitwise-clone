const Expense = require("../models/expenseModel");
const Settlement = require("../models/settlementModel");
const { roundAmount } = require("./expenseSplits");

const calculateGroupBalances = async (groupId) => {
  const expenses = await Expense.find({ groupId: groupId });
  const settlements = await Settlement.find({ groupId: groupId });

  const totals = {};
  let totalExpenseAmount = 0;

  const getTotal = (userId) => {
    if (!totals[userId]) {
      totals[userId] = {
        user: userId,
        paid: 0,
        share: 0,
        settlementPaid: 0,
        settlementReceived: 0,
      };
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

  for (const settlement of settlements) {
    const payerId = settlement.paidBy.toString();
    const receiverId = settlement.paidTo.toString();

    getTotal(payerId).settlementPaid += settlement.amount;
    getTotal(receiverId).settlementReceived += settlement.amount;
  }

  const balances = Object.keys(totals).map((userId) => {
    const total = totals[userId];
    return {
      user: total.user,
      paid: roundAmount(total.paid),
      share: roundAmount(total.share),
      settlementPaid: roundAmount(total.settlementPaid),
      settlementReceived: roundAmount(total.settlementReceived),
      balance: roundAmount(
        total.paid -
          total.share +
          total.settlementPaid -
          total.settlementReceived,
      ),
    };
  });

  return {
    balances: balances,
    totalExpenseAmount: roundAmount(totalExpenseAmount),
    expenseCount: expenses.length,
    settlementCount: settlements.length,
  };
};

const simplifyDebts = (balances) => {
  const creditors = [];
  const debtors = [];

  for (const balance of balances) {
    if (balance.balance > 0.009) {
      creditors.push({
        user: balance.user.toString(),
        amount: balance.balance,
      });
    } else if (balance.balance < -0.009) {
      debtors.push({
        user: balance.user.toString(),
        amount: Math.abs(balance.balance),
      });
    }
  }

  creditors.sort((first, second) => second.amount - first.amount);
  debtors.sort((first, second) => second.amount - first.amount);

  const transactions = [];
  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];

    const amount = roundAmount(Math.min(debtor.amount, creditor.amount));
    if (amount <= 0) {
      debtorIndex++;
      continue;
    }

    transactions.push({
      from: debtor.user,
      to: creditor.user,
      amount: amount,
    });

    debtor.amount = roundAmount(debtor.amount - amount);
    creditor.amount = roundAmount(creditor.amount - amount);

    if (debtor.amount <= 0) {
      debtorIndex++;
    }
    if (creditor.amount <= 0) {
      creditorIndex++;
    }
  }

  return transactions;
};

module.exports = { calculateGroupBalances, simplifyDebts };
