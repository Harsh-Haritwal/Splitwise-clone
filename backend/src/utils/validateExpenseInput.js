const mongoose = require("mongoose");
const Group = require("../models/groupModel");
const {
  buildEqualSplits,
  buildCustomSplits,
  buildPercentageSplits,
} = require("./expenseSplits");

const error = (msg) => {
  return { error: { status: 400, msg: msg } };
};

const validateExpenseInput = async (userId, body) => {
  const {
    description,
    amount,
    groupId,
    paidBy,
    participants,
    splitType,
    splits: customSplits,
    percentages,
  } = body;

  if (!description || !amount || !groupId || !paidBy || !participants) {
    return error("Incomplete info or invalid amount");
  }
  if (typeof description != "string") {
    return error("Invalid info");
  }

  const newDesc = description.trim();
  if (newDesc === "") {
    return error("Invalid info");
  }

  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    return error("Invalid group");
  }

  const group = await Group.findOne({ _id: groupId, members: userId });
  if (!group) {
    return { error: { status: 404, msg: "Group not found" } };
  }

  if (!mongoose.Types.ObjectId.isValid(paidBy)) {
    return error("paidBy is not having a valid id");
  }
  const isPaidByMember = group.members.some(
    (member) => member.toString() === paidBy.toString(),
  );
  if (!isPaidByMember) {
    return error("paidby is not a member");
  }
  if (!Array.isArray(participants) || participants.length === 0) {
    return error("Invalid participants");
  }
  const areParticipantsIdValid = participants.every((participant) =>
    mongoose.Types.ObjectId.isValid(participant),
  );
  if (!areParticipantsIdValid) {
    return error("Invalid participants");
  }
  const uniqueParticipants = new Set(
    participants.map((participant) => participant.toString()),
  );
  if (uniqueParticipants.size != participants.length) {
    return error("Duplicate members are not allowed");
  }
  const areAllParticipantsMembers = participants.every((participant) => {
    return group.members.some(
      (member) => member.toString() === participant.toString(),
    );
  });
  if (!areAllParticipantsMembers) {
    return error("Invalid participants");
  }
  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
    return error("Invalid amount");
  }

  const selectedSplitType = splitType ? splitType : "equal";
  let splits;

  if (selectedSplitType === "equal") {
    splits = buildEqualSplits(amount, participants).splits;
  } else if (selectedSplitType === "custom") {
    const result = buildCustomSplits(amount, participants, customSplits);
    if (result.error) {
      return error(result.error);
    }
    splits = result.splits;
  } else if (selectedSplitType === "percentage") {
    const result = buildPercentageSplits(amount, participants, percentages);
    if (result.error) {
      return error(result.error);
    }
    splits = result.splits;
  } else {
    return error("Invalid split type");
  }

  return {
    group: group,
    expense: {
      description: newDesc,
      amount: amount,
      groupId: groupId,
      paidBy: paidBy,
      participants: participants,
      splits: splits,
    },
  };
};

module.exports = validateExpenseInput;
