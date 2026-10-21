const mongoose = require("mongoose");

const settlementSchema = mongoose.Schema(
  {
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
    paidTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
    note: {
      type: String,
      trim: true,
      maxlength: [200, "Note can be at most 200 characters"],
    },
  },
  { timestamps: true },
);

const Settlement = mongoose.model("Settlement", settlementSchema);

module.exports = Settlement;
