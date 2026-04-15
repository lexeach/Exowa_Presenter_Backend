const { findKnownIntent } = require("./intentService");
const { getLLMReply } = require("./llmService");
const { saveConversation } = require("./learningService");

async function getAIReply(payload) {
  const { transcript, lead, stage } = payload;

  const knownIntent = await findKnownIntent(
    transcript || ""
  );

  let reply = "";
  let source = "";
  let confidence = 0;
  let intent = "unknown";

  if (knownIntent.matched) {
    reply = knownIntent.reply;
    source = "intent_bank";
    confidence = knownIntent.confidence;
    intent = knownIntent.intent;
  } else {
    reply = await getLLMReply(payload);
    source = "llm";
    confidence = 0.6;
  }

  await saveConversation({
    leadId: lead?._id,
    phone: lead?.phone,
    transcript,
    aiReply: reply,
    predictedIntent: intent,
    confidence,
    stage,
    source
  });

  return reply;
}

module.exports = {
  getAIReply
};
