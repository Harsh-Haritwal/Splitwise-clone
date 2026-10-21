const mongoose = require("mongoose");
const Group = require("../models/groupModel");
const Settlement = require("../models/settlementModel");

const handleFetchSettlements = async (req, res) => {
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

    return res.status(200).json({
      msg: "Settlements fetched successfully",
      settlements: settlements,
      count: settlements.length,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal server error" });
  }
};

module.exports = handleFetchSettlements;
