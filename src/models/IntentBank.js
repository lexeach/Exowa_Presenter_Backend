const mongoose = require("mongoose");

const intentBankSchema = new mongoose.Schema(
  {
    normalizedText: {
      type: String,
      required: true,
      unique: true
    },

    intent: {
      type: String,
      default: ""
    },

    response: {
      type: String,
      default: ""
    },

    usageCount: {
      type: Number,
      default: 1
    },

    source: {
      type: String,
      default: "llm"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "IntentBank",
  intentBankSchema
);
