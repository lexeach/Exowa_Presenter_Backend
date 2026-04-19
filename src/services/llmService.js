const OpenAI = require("openai");

// 🔍 Debug (optional)
console.log("OPENAI KEY:", process.env.OPENAI_API_KEY);

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
      timeout: 15000 // 🔥 safer timeout
    });

    const reply =
      response.choices?.[0]?.message?.content ||
      "जी, कृपया थोड़ा विस्तार से बताइए।";

    return reply;

  } catch (error) {
    console.error("❌ OpenAI Error:", error.message);

    // 🔁 RETRY ONCE (network fix)
    try {
      const retryResponse = await openai.chat.completions.create({
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
        ]
      });

      return retryResponse.choices?.[0]?.message?.content;

    } catch (retryError) {
      console.error("❌ Retry failed:", retryError.message);

      // 🔥 FAST fallback (call कटने से बचाने के लिए)
      return "नमस्ते, क्या आप मुझे सुन पा रहे हैं?";
    }
  }
};
