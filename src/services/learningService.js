const ConversationLog = require("../models/ConversationLog");

async function saveConversation({
  leadId,
  phone,
  transcript,
  aiReply,
  predictedIntent,
  confidence,
  stage,
  source
}) {
  await ConversationLog.create({
    leadId,
    phone,
    transcript,
    normalizedTranscript: transcript?.toLowerCase(),
    aiReply,
    predictedIntent,
    confidence,
    stage,
    source
  });
}

module.exports = {
  saveConversation
};
