const mongoose = require("mongoose");
const Group = require("../models/groupModel");
const Settlement = require("../models/settlementModel");
const { calculateGroupBalances } = require("../utils/balanceCalculator");
const { roundAmount } = require("../utils/expenseSplits");

const handleFetchSettlementSummary = async (req, res) => {
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

    const settlements = await Settlement.find({ groupId: groupId })
      .populate("paidBy", "name email avatar")
      .populate("paidTo", "name email avatar")
      .sort({ createdAt: -1 });

    let totalSettled = 0;
    for (const settlement of settlements) {
      totalSettled += settlement.amount;
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
      totalSettled: roundAmount(totalSettled),
      settlementCount: settlements.length,
      lastSettlement: settlements.length > 0 ? settlements[0] : null,
      totalGetBack: roundAmount(totalGetBack),
      totalOwe: roundAmount(totalOwe),
      getBackMembers: getBackMembers,
      oweMembers: oweMembers,
      settledMembers: settledMembers,
      myBalance: myBalance,
      myStatus: myStatus,
    };

    return res.status(200).json({
      msg: "Settlement summary fetched successfully",
      summary: summary,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal server error" });
  }
};

module.exports = handleFetchSettlementSummary;
