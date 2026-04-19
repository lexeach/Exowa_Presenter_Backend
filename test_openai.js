require("dotenv").config();
const OpenAI = require("openai");

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error("❌ ERROR: OPENAI_API_KEY is not set in your environment variables.");
  process.exit(1);
}

console.log("🔍 Testing OpenAI connection with API Key starting with:", apiKey.substring(0, 7) + "...");

const openai = new OpenAI({
  apiKey: apiKey,
});

async function testConnection() {
  try {
    console.log("📡 Sending a test request to gpt-4o-mini...");
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "user", content: "Say 'Connection Successful' in Hindi." }
      ],
      timeout: 10000,
    });

    console.log("✅ SUCCESS! OpenAI responded:");
    console.log("💬 Reply:", response.choices[0].message.content);
  } catch (error) {
    console.error("❌ FAILED: OpenAI Connection Error");
    console.error("-----------------------------------");
    console.error("Error Name:", error.name);
    console.error("Error Message:", error.message);
    
    if (error.status) {
      console.error("HTTP Status:", error.status);
    }
    
    if (error.code) {
      console.error("Error Code:", error.code);
    }

    if (error.message.includes("401")) {
      console.error("💡 Tip: 401 means your API key is invalid or has been revoked.");
    } else if (error.message.includes("429")) {
      console.error("💡 Tip: 429 means you've hit a rate limit or your quota is exhausted.");
    } else if (error.message.includes("ENOTFOUND") || error.message.includes("ETIMEDOUT")) {
      console.error("💡 Tip: This looks like a network or DNS issue. Check your internet connection.");
    }
    console.error("-----------------------------------");
  }
}

testConnection();
