const mongoose = require("mongoose");

const conversationLogSchema = new mongoose.Schema(
  {
    leadId: String,
    phone: String,
    transcript: String,
    normalizedTranscript: String,
    aiReply: String,
    predictedIntent: String,
    confidence: Number,
    stage: String,
    source: {
      type: String,
      default: "llm"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "ConversationLog",
  conversationLogSchema
);
