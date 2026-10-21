const mongoose = require("mongoose");
const Group = require("../models/groupModel");
const { calculateGroupBalances } = require("../utils/balanceCalculator");

const handleFetchGroupBalances = async (req, res) => {
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
    const group = await Group.findOne({ _id: groupId, members: id }).populate(
      "members",
      "name email avatar",
    );
    if (!group) {
      return res.status(404).json({ msg: "Group not found" });
    }

    const result = await calculateGroupBalances(groupId);
    const balanceMap = {};
    for (const balance of result.balances) {
      balanceMap[balance.user] = balance;
    }

    const balances = group.members.map((member) => {
      const found = balanceMap[member._id.toString()];
      if (!found) {
        return { user: member, paid: 0, share: 0, balance: 0 };
      }
      return {
        user: member,
        paid: found.paid,
        share: found.share,
        balance: found.balance,
      };
    });

    balances.sort((first, second) => second.balance - first.balance);

    return res.status(200).json({
      msg: "Group balances fetched successfully",
      balances: balances,
      totalExpenseAmount: result.totalExpenseAmount,
      expenseCount: result.expenseCount,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal server error" });
  }
};

module.exports = handleFetchGroupBalances;
