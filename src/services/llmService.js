const axios = require("axios");

exports.getLLMReply = async (text) => {
  try {
    console.log("🧠 LLM Input:", text);

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a Hindi speaking AI sales executive for Exowa. Keep replies short and natural."
          },
          {
            role: "user",
            content: text
          }
        ],
        temperature: 0.7
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 10000 // 🔥 important
      }
    );

    return response.data.choices[0].message.content;

  } catch (error) {
    console.error("❌ LLM ERROR FULL:", error.response?.data || error.message);

    // 🔥 NEVER BREAK CALL FLOW
    return "जी, क्या आप demo देखना चाहेंगे?";
  }
};
