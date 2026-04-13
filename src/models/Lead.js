const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    phone: {
      type: String,
      required: true,
      unique: true
    },

    studentClass: {
      type: String,
      default: ""
    },

    referredBy: {
      type: String,
      default: ""
    },
    preferredCallTime: {
     type: String,
     default: ""
    },

    source: {
      type: String,
      default: "referral_form"
    },

    status: {
      type: String,
      default: "NEW"
    },

    callStatus: {
      type: String,
      default: "NOT_STARTED"
    },

    demoDate: {
      type: String,
      default: ""
    },
    demoSlot: {
      type: Date,
      default: ""
    },

    demoTime: {
      type: String,
      default: ""
    },

    retryCount: {
      type: Number,
      default: 0
    },

    nextRetryAt: {
      type: Date,
      default: null
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
