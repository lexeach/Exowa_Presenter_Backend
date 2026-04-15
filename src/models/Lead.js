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

    // =========================
    // AI CONVERSATION FIELDS
    // =========================
    conversationStage: {
      type: String,
      default: "intro"
    },

    transcript: {
      type: String,
      default: ""
    },

    lastCallUUID: {
      type: String,
      default: ""
    },

    callSessions: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },

    // =========================
    // DEMO FIELDS
    // =========================
    demoDate: {
      type: String,
      default: ""
    },

    demoSlot: {
      type: Date,
      default: null
    },

    demoTime: {
      type: String,
      default: ""
    },

    // =========================
    // RETRY FIELDS
    // =========================
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
