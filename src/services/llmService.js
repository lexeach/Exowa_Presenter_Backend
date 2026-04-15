const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function getLLMReply(userText) {
  try {
    console.log("🤖 Sending to OpenAI:", userText);

    const response =
      await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a Hindi-speaking polite female sales assistant for Exowa education platform. Reply in short natural Hindi for voice calls."
          },
          {
            role: "user",
            content: userText
          }
        ],
        temperature: 0.7,
        max_tokens: 120
      });

    const reply =
      response.choices?.[0]?.message?.content ||
      "जी, कृपया थोड़ा विस्तार से बताइए।";

    console.log("✅ OpenAI reply:", reply);

    return reply;
  } catch (error) {
    console.error(
      "❌ OpenAI Error:",
      error.message
    );

    return "जी, कृपया थोड़ा विस्तार से बताइए।";
  }
}

module.exports = { getLLMReply };
