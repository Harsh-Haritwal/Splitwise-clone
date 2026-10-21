const mongoose = require("mongoose");
const Group = require("../models/groupModel");
const Settlement = require("../models/settlementModel");

const handleAddSettlement = async (req, res) => {
  const { id } = req.user;
  if (!id) {
    return res.status(401).json({ msg: "Unauthorized access" });
  }

  const { groupId, paidBy, paidTo, amount, note } = req.body;
  if (!groupId || !paidBy || !paidTo || !amount) {
    return res.status(400).json({ msg: "Incomplete info or invalid amount" });
  }
  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    return res.status(400).json({ msg: "Group id is not valid" });
  }
  if (!mongoose.Types.ObjectId.isValid(paidBy)) {
    return res.status(400).json({ msg: "paidBy is not having a valid id" });
  }
  if (!mongoose.Types.ObjectId.isValid(paidTo)) {
    return res.status(400).json({ msg: "paidTo is not having a valid id" });
  }
  if (paidBy.toString() === paidTo.toString()) {
    return res.status(400).json({ msg: "A member cannot pay themselves" });
  }
  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ msg: "Invalid amount" });
  }
  if (note !== undefined && typeof note !== "string") {
    return res.status(400).json({ msg: "Note must be a string" });
  }
  if (note !== undefined && note.trim().length > 200) {
    return res.status(400).json({ msg: "Note can be at most 200 characters" });
  }

  try {
    const group = await Group.findOne({ _id: groupId, members: id });
    if (!group) {
      return res.status(404).json({ msg: "Group not found" });
    }

    const isPayerMember = group.members.some(
      (member) => member.toString() === paidBy.toString(),
    );
    if (!isPayerMember) {
      return res.status(400).json({ msg: "paidBy is not a member" });
    }
    const isReceiverMember = group.members.some(
      (member) => member.toString() === paidTo.toString(),
    );
    if (!isReceiverMember) {
      return res.status(400).json({ msg: "paidTo is not a member" });
    }

    const settlementDetails = {
      groupId: groupId,
      paidBy: paidBy,
      paidTo: paidTo,
      amount: Math.round(amount * 100) / 100,
    };
    if (note !== undefined && note.trim() !== "") {
      settlementDetails.note = note.trim();
    }

    const newSettlement = await Settlement.create(settlementDetails);
    return res.status(201).json({
      msg: "Settlement created successfully",
      settlement: newSettlement,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal server error" });
  }
};

module.exports = handleAddSettlement;
