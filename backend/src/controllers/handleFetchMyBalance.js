const Group = require("../models/groupModel");
const { calculateGroupBalances } = require("../utils/balanceCalculator");
const { roundAmount } = require("../utils/expenseSplits");

const handleFetchMyBalance = async (req, res) => {
  const { id } = req.user;
  if (!id) {
    return res.status(401).json({ msg: "Unauthorized access" });
  }

  try {
    const groups = await Group.find({ members: id }).select("name");

    const groupBalances = [];
    let overallBalance = 0;

    for (const group of groups) {
      const result = await calculateGroupBalances(group._id);
      const myBalance = result.balances.find((balance) => {
        return balance.user === id.toString();
      });

      const balance = myBalance ? myBalance.balance : 0;
      overallBalance += balance;

      groupBalances.push({
        group: { _id: group._id, name: group.name },
        balance: balance,
        totalExpenseAmount: result.totalExpenseAmount,
      });
    }

    return res.status(200).json({
      msg: "Overall balance fetched successfully",
      overallBalance: roundAmount(overallBalance),
      groups: groupBalances,
      groupCount: groupBalances.length,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal server error" });
  }
};

module.exports = handleFetchMyBalance;
