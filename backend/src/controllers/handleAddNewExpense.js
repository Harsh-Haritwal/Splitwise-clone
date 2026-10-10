const mongoose = require("mongoose");
const Expense = require("../models/expenseModel");
const Group = require("../models/groupModel");

const handleAddNewExpense = async (req, res) => {
  const { id } = req.user;
  if (!id) {
    return res.status(401).json({ msg: "Unauthorized access" });
  }
  const { description, amount, groupId, paidBy, participants } = req.body;
  if (!description || !amount || !groupId || !paidBy || !participants) {
    return res.status(400).json({ msg: "Incomplete info or invalid amount" });
  }
  if (typeof description != "string") {
    return res.status(400).json({ msg: "Invalid info" });
  }

  const newDesc = description.trim();
  if (newDesc === "") {
    return res.status(400).json({ msg: "Invalid info" });
  }

  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    return res.status(400).json({ msg: "Invalid group" });
  }

  try {
    const isGroupExist = await Group.findOne({ _id: groupId, members: id });
    if (!isGroupExist) {
      return res.status(404).json({ msg: "Group not found" });
    }

    if (!mongoose.Types.ObjectId.isValid(paidBy)) {
      return res.status(400).json({ msg: "paidBy is not having a valid id" });
    }
    const isPaidByMember = isGroupExist.members.some(
      (member) => member.toString() === paidBy.toString(),
    );
    if (!isPaidByMember) {
      return res.status(400).json({ msg: "paidby is not a member" });
    }
    if (!Array.isArray(participants) || participants.length === 0) {
      return res.status(400).json({ msg: "Invalid participants" });
    }
    const areParticipantsIdValid = participants.every((participant) =>
      mongoose.Types.ObjectId.isValid(participant),
    );
    if (!areParticipantsIdValid) {
      return res.status(400).json({ msg: "Invalid participants" });
    }
    const uniqueParticipants = new Set(
      participants.map((participant) => participant.toString()),
    );
    if (uniqueParticipants.size != participants.length) {
      return res.status(400).json({ msg: "Duplicate members are not allowed" });
    }
    const areAllParticipantsMembers = participants.every((participant) => {
      const isValidParticipant = isGroupExist.members.some(
        (member) => member.toString() === participant.toString(),
      );

      return isValidParticipant;
    });
    if (!areAllParticipantsMembers) {
      return res.status(400).json({ msg: "Invalid participants" });
    }
    if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ msg: "Invalid amount" });
    }

    const shareEach = Math.round((amount / participants.length) * 100) / 100;

    const splits = participants.map((participant) => {
      return { user: participant, amount: shareEach };
    });
    const totalSplit = splits.reduce((sum, split) => (sum += split.amount), 0);
    const difference = Math.round((amount - totalSplit) * 100) / 100;

    splits[splits.length - 1].amount =
      Math.round((splits[splits.length - 1].amount + difference) * 100) / 100;

    const newExpense = await Expense.create({
      description: newDesc,
      amount: amount,
      groupId: groupId,
      paidBy: paidBy,
      participants: participants,
      splits: splits,
    });

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
