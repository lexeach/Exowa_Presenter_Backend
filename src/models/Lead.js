const mongoose = require("mongoose");

const leadSchema =
  new mongoose.Schema(
    {
      parentName: String,
      phone: String,
      studentClass: String,
      city: String,

      referredBy: String,
      referralPhone: String,

      source: {
        type: String,
        enum: [
          "lead",
          "referral"
        ],
        default: "lead"
      },

      status: {
        type: String,
        default: "new"
      }
    },
    {
      timestamps: true
    }
  );

module.exports = mongoose.model(
  "Lead",
  leadSchema
);