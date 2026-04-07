const mongoose = require("mongoose");

const callBehaviorLogSchema =
  new mongoose.Schema(
    {
      leadId: String,

      strategyId: String,

      introStyle: String,

      timingMs: Number,

      objectionStrategy: String,

      closeTiming: String,

      referralTiming: String,

      sentimentScore: Number,

      conversion: {
        type: Boolean,
        default: false
      },

      dropStage: String,

      score: {
        type: Number,
        default: 0
      }
    },
    {
      timestamps: true
    }
  );

module.exports = mongoose.model(
  "CallBehaviorLog",
  callBehaviorLogSchema
);