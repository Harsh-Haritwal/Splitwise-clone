const mongoose = require("mongoose");

const roundAmount = (value) => {
  return Math.round(value * 100) / 100;
};

const buildEqualSplits = (amount, participants) => {
  const shareEach = roundAmount(amount / participants.length);

  const splits = participants.map((participant) => {
    return { user: participant, amount: shareEach };
  });

  const totalSplit = splits.reduce((sum, split) => (sum += split.amount), 0);
  const difference = roundAmount(amount - totalSplit);

  splits[splits.length - 1].amount = roundAmount(
    splits[splits.length - 1].amount + difference,
  );

  return { splits };
};

const buildCustomSplits = (amount, participants, customSplits) => {
  if (!Array.isArray(customSplits) || customSplits.length === 0) {
    return { error: "Shares are required for custom split" };
  }

  if (customSplits.length !== participants.length) {
    return { error: "Every participant needs a share" };
  }

  const splits = [];

  for (const customSplit of customSplits) {
    if (!customSplit || !mongoose.Types.ObjectId.isValid(customSplit.user)) {
      return { error: "Invalid split user" };
    }

    const isParticipant = participants.some((participant) => {
      return participant.toString() === customSplit.user.toString();
    });
    if (!isParticipant) {
      return { error: "Split user is not a participant" };
    }

    const alreadyAdded = splits.some((split) => {
      return split.user.toString() === customSplit.user.toString();
    });
    if (alreadyAdded) {
      return { error: "Duplicate split user" };
    }

    if (
      typeof customSplit.amount !== "number" ||
      !Number.isFinite(customSplit.amount) ||
      customSplit.amount <= 0
    ) {
      return { error: "Every share must be greater than 0" };
    }

    splits.push({
      user: customSplit.user,
      amount: roundAmount(customSplit.amount),
    });
  }

  const totalSplit = splits.reduce((sum, split) => (sum += split.amount), 0);
  if (roundAmount(totalSplit) !== roundAmount(amount)) {
    return { error: "Shares must add up to the total amount" };
  }

  return { splits };
};

module.exports = { roundAmount, buildEqualSplits, buildCustomSplits };
