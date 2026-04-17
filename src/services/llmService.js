const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.getLLMReply = async (userMessage) => {
  try {
    console.log("🤖 Sending to OpenAI:", userMessage);

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a Hindi speaking AI sales executive for Exowa. Talk naturally and keep responses short."
        },
        {
          role: "user",
          content: userMessage
        }
      ],

      // 🔥 VERY IMPORTANT (call cut fix)
      timeout: 10000
    });

    const reply =
      response.choices?.[0]?.message?.content ||
      "जी, कृपया थोड़ा विस्तार से बताइए।";

    return reply;

  } catch (error) {
    console.error("❌ OpenAI Error:", error.message);

    // 🔥 fallback fast return (VERY IMPORTANT)
    return "जी, कृपया थोड़ा विस्तार से बताइए।";
  }
};
