const mongoose = require("mongoose");

const splitSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
});

const expenseSchema = mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: [200, "Description can be at most 200 characters"],
  },
  amount: {
    type: Number,
    required: true,
    max: [10000000, "Amount cannot be more than 10000000"],
    validate: {
      validator: function (value) {
        return value > 0;
      },
      message: `Amount must be greater than 0.`,
    },
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    required: true,
  },
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  participants: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
    required: true,
    validate: {
      validator: function (value) {
        return value.length > 0;
      },
      message: `Atleast one participant is required`,
    },
  },
  splits: {
    type: [splitSchema],
    required: true,
  },
}, { timestamps: true });


expenseSchema.index({ groupId: 1, createdAt: -1 });

const Expense = mongoose.model("Expense", expenseSchema)

module.exports = Expense