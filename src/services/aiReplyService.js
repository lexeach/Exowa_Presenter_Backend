const {
  findIntent,
  saveIntent
} = require("./intentService");

const {
  getLLMReply
} = require("./llmService");

async function getAIReply({
  transcript = "",
  lead = null,
  stage = "intro"
}) {
  try {
    console.log(
      "🧠 AI Reply Input:",
      transcript
    );

    const intentResult =
      await findIntent(transcript);

    console.log(
      "🧠 Intent Result:",
      intentResult
    );

    if (intentResult.matched) {
      console.log(
        "✅ Intent matched from bank"
      );

      return intentResult.response;
    }

    console.log("🤖 Calling OpenAI");

    const reply =
      await getLLMReply(transcript);

    await saveIntent({
      normalizedText:
        intentResult.normalizedText,
      intent: "auto_learned",
      response: reply
    });

    console.log("✅ New intent saved");

    return reply;
  } catch (error) {
    console.error(
      "❌ getAIReply Error:",
      error.message
    );

    return "माफ कीजिए, कृपया दोबारा बताइए।";
  }
}

module.exports = { getAIReply };
