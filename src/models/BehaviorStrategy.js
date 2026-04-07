const mongoose = require("mongoose");

const behaviorStrategySchema =
  new mongoose.Schema(
    {
      strategyId: {
        type: String,
        unique: true
      },

      category: String,

      usageCount: {
        type: Number,
        default: 0
      },

      successCount: {
        type: Number,
        default: 0
      },

      successRate: {
        type: Number,
        default: 0
      },

      averageScore: {
        type: Number,
        default: 0
      }
    },
    {
      timestamps: true
    }
  );

module.exports = mongoose.model(
  "BehaviorStrategy",
  behaviorStrategySchema
);