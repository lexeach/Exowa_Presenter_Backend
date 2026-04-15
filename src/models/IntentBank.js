const mongoose = require("mongoose");

const intentBankSchema = new mongoose.Schema(
  {
    intentKey: {
      type: String,
      unique: true
    },
    trainingPhrases: [String],
    replyTemplate: String,
    stage: String,
    confidenceThreshold: {
      type: Number,
      default: 0.85
    },
    isActive: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "IntentBank",
  intentBankSchema
);
