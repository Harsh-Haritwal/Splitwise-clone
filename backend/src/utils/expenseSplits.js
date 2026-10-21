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

const buildPercentageSplits = (amount, participants, percentages) => {
  if (!Array.isArray(percentages) || percentages.length === 0) {
    return { error: "Percentages are required for percentage split" };
  }

  if (percentages.length !== participants.length) {
    return { error: "Every participant needs a percentage" };
  }

  const shares = [];
  let totalPercentage = 0;

  for (const item of percentages) {
    if (!item || !mongoose.Types.ObjectId.isValid(item.user)) {
      return { error: "Invalid split user" };
    }

    const isParticipant = participants.some((participant) => {
      return participant.toString() === item.user.toString();
    });
    if (!isParticipant) {
      return { error: "Split user is not a participant" };
    }

    const alreadyAdded = shares.some((share) => {
      return share.user.toString() === item.user.toString();
    });
    if (alreadyAdded) {
      return { error: "Duplicate split user" };
    }

    if (
      typeof item.percentage !== "number" ||
      !Number.isFinite(item.percentage) ||
      item.percentage <= 0 ||
      item.percentage > 100
    ) {
      return { error: "Every percentage must be greater than 0 and at most 100" };
    }

    const percentage = roundAmount(item.percentage);
    totalPercentage += percentage;
    shares.push({ user: item.user, percentage: percentage });
  }

  if (roundAmount(totalPercentage) !== 100) {
    return { error: "Percentages must add up to 100" };
  }

  const splits = shares.map((share) => {
    return {
      user: share.user,
      amount: roundAmount((amount * share.percentage) / 100),
    };
  });

  const totalSplit = splits.reduce((sum, split) => (sum += split.amount), 0);
  const difference = roundAmount(amount - totalSplit);
  splits[splits.length - 1].amount = roundAmount(
    splits[splits.length - 1].amount + difference,
  );

  const hasInvalidAmount = splits.some((split) => split.amount <= 0);
  if (hasInvalidAmount) {
    return { error: "Share amount is too small for this percentage" };
  }

  return { splits };
};

module.exports = {
  roundAmount,
  buildEqualSplits,
  buildCustomSplits,
  buildPercentageSplits,
};
