const mongoose = require("mongoose");
const Group = require("../models/groupModel");
const { calculateGroupBalances } = require("../utils/balanceCalculator");
const { roundAmount } = require("../utils/expenseSplits");

const handleFetchGroupBalanceSummary = async (req, res) => {
  const { id } = req.user;
  if (!id) {
    return res.status(401).json({ msg: "Unauthorized access" });
  }
  const { groupId } = req.params;
  if (!groupId) {
    return res.status(400).json({ msg: "Group id is missing" });
  }
  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    return res.status(400).json({ msg: "Group id is not valid" });
  }

  try {
    const group = await Group.findOne({ _id: groupId, members: id });
    if (!group) {
      return res.status(404).json({ msg: "Group not found" });
    }

    const result = await calculateGroupBalances(groupId);
    const balanceMap = {};
    for (const balance of result.balances) {
      balanceMap[balance.user] = balance;
    }

    let totalGetBack = 0;
    let totalOwe = 0;
    let getBackMembers = 0;
    let oweMembers = 0;
    let settledMembers = 0;

    for (const member of group.members) {
      const found = balanceMap[member.toString()];
      const balance = found ? found.balance : 0;

      if (balance > 0) {
        totalGetBack += balance;
        getBackMembers++;
      } else if (balance < 0) {
        totalOwe += Math.abs(balance);
        oweMembers++;
      } else {
        settledMembers++;
      }
    }

    const myBalance = balanceMap[id.toString()]
      ? balanceMap[id.toString()].balance
      : 0;
    let myStatus = "settled";
    if (myBalance > 0) {
      myStatus = "gets back";
    } else if (myBalance < 0) {
      myStatus = "owes";
    }

    const summary = {
      totalExpenseAmount: result.totalExpenseAmount,
      expenseCount: result.expenseCount,
      memberCount: group.members.length,
      getBackMembers: getBackMembers,
      oweMembers: oweMembers,
      settledMembers: settledMembers,
      totalGetBack: roundAmount(totalGetBack),
      totalOwe: roundAmount(totalOwe),
      myBalance: myBalance,
      myStatus: myStatus,
    };

    return res.status(200).json({
      msg: "Group balance summary fetched successfully",
      summary: summary,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal server error" });
  }
};

module.exports = handleFetchGroupBalanceSummary;
