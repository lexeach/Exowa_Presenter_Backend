const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    phone: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true
    },

    studentClass: {
      type: String,
      required: true,
      trim: true
    },

    referredBy: {
      type: String,
      default: ""
    },

    source: {
      type: String,
      default: "html_form"
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