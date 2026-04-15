const IntentBank = require("../models/IntentBank");

function normalize(text = "") {
  return text
    .toLowerCase()
    .replace(/[^\u0900-\u097Fa-zA-Z0-9 ]/g, "")
    .trim();
}

async function findIntent(text) {
  const normalizedText = normalize(text);

  const match = await IntentBank.findOne({
    normalizedText
  });

  if (match) {
    match.usageCount += 1;
    await match.save();

    return {
      matched: true,
      response: match.response,
      intent: match.intent
    };
  }

  return {
    matched: false,
    normalizedText
  };
}

async function saveIntent({
  normalizedText,
  intent,
  response
}) {
  await IntentBank.findOneAndUpdate(
    { normalizedText },
    {
      normalizedText,
      intent,
      response,
      source: "llm"
    },
    { upsert: true }
  );
}

module.exports = {
  findIntent,
  saveIntent
};
