const IntentBank = require("../models/IntentBank");

async function findKnownIntent(text) {
  const normalized = text.toLowerCase().trim();

  const intents = await IntentBank.find({
    isActive: true
  });

  for (const intent of intents) {
    for (const phrase of intent.trainingPhrases) {
      if (normalized.includes(phrase.toLowerCase())) {
        return {
          matched: true,
          intent: intent.intentKey,
          reply: intent.replyTemplate,
          confidence: 0.95
        };
      }
    }
  }

  return {
    matched: false,
    confidence: 0
  };
}

module.exports = {
  findKnownIntent
};
