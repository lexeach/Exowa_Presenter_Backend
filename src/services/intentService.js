const IntentBank = require("../models/IntentBank");

function normalize(text = "") {
  if (!text || typeof text !== "string") {
    return "";
  }

  return text
    .toLowerCase()
    .replace(/[^\u0900-\u097Fa-zA-Z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function findIntent(text = "") {
  try {
    const normalizedText = normalize(text);

    console.log(
      "🧠 Intent search text:",
      normalizedText
    );

    // Empty text protection
    if (!normalizedText) {
      return {
        matched: false,
        normalizedText: ""
      };
    }

    const match = await IntentBank.findOne({
      normalizedText
    });

    if (match) {
      match.usageCount =
        (match.usageCount || 0) + 1;

      match.lastUsedAt = new Date();

      await match.save();

      console.log("✅ Intent matched");

      return {
        matched: true,
        response: match.response,
        intent: match.intent,
        normalizedText
      };
    }

    return {
      matched: false,
      normalizedText
    };
  } catch (error) {
    console.error(
      "❌ findIntent Error:",
      error.message
    );

    return {
      matched: false,
      normalizedText: normalize(text)
    };
  }
}

async function saveIntent({
  normalizedText = "",
  intent = "auto_learned",
  response = ""
}) {
  try {
    const cleanText =
      normalize(normalizedText);

    // MOST IMPORTANT FIX
    if (!cleanText) {
      console.log(
        "⚠️ Empty normalizedText skipped"
      );
      return null;
    }

    if (!response?.trim()) {
      console.log(
        "⚠️ Empty response skipped"
      );
      return null;
    }

    const saved =
      await IntentBank.findOneAndUpdate(
        { normalizedText: cleanText },
        {
          normalizedText: cleanText,
          intent,
          response,
          source: "llm",
          lastUsedAt: new Date()
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true
        }
      );

    console.log("✅ New intent saved");

    return saved;
  } catch (error) {
    console.error(
      "❌ saveIntent Error:",
      error.message
    );

    return null;
  }
}

module.exports = {
  findIntent,
  saveIntent,
  normalize
};
