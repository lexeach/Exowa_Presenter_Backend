const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function getLLMReply(transcript) {
  const completion =
    await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are Exowa Hindi sales AI caller."
        },
        {
          role: "user",
          content: transcript
        }
      ]
    });

  return completion.choices[0].message.content;
}

module.exports = { getLLMReply };
