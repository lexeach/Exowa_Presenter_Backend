const Lead = require("../models/Lead");

/* =========================================
   AI REPLY ENGINE
========================================= */
async function aiReplyEngine(transcript, phone) {
  try {
    const lead = await Lead.findOne({
      phone: phone?.replace(/^91/, "")
    });

    const referredBy =
      lead?.referredBy || "आपके परिचित";

    const studentClass =
      lead?.studentClass || "";

    // Opening fallback
    if (!transcript || transcript.trim() === "") {
      return `नमस्ते, मैं Exowa से मीरा बोल रही हूँ।
आपका नंबर हमें ${referredBy} जी से मिला है।
उन्होंने सुझाव दिया कि मैं आपसे बात करके Exowa के बारे में बताऊँ।
क्या अभी 2 मिनट बात करने का सही समय है?`;
    }

    const text = transcript.trim();

    // YES intent
    if (
      text.includes("हाँ") ||
      text.includes("जी") ||
      text.includes("बिल्कुल") ||
      text.includes("ठीक है")
    ) {
      return `बहुत धन्यवाद।
Exowa में class ${studentClass} के बच्चों के लिए daily practice tests, instant feedback और personalized learning support मिलता है।
क्या मैं आपके लिए एक free demo session book कर दूँ?`;
    }

    // Busy intent
    if (
      text.includes("बाद में") ||
      text.includes("अभी नहीं") ||
      text.includes("व्यस्त")
    ) {
      return "कोई बात नहीं। मैं बाद में आपसे संपर्क कर लूँगी। धन्यवाद।";
    }

    // Pricing intent
    if (
      text.includes("फीस") ||
      text.includes("price") ||
      text.includes("कितना")
    ) {
      return "हमारे monthly और yearly plans available हैं। पहले मैं आपको free demo दिखा देती हूँ।";
    }

    // Default
    return "जी बिल्कुल, मैं आपकी मदद करती हूँ। क्या मैं आपके लिए एक free demo book कर दूँ?";
  } catch (error) {
    console.error("❌ AI reply engine error:", error);
    return "माफ कीजिए, तकनीकी समस्या आ गई है।";
  }
}

/* =========================================
   REALTIME VOICE CONTROLLER
========================================= */
exports.handleRealtimeVoice = async (
  req,
  res
) => {
  try {
    console.log(
      "🎤 Realtime voice request:",
      req.body
    );

    const { transcript, phone } = req.body;

    const reply = await aiReplyEngine(
      transcript,
      phone
    );

    console.log("🤖 AI Reply:", reply);

    return res.status(200).json({
      success: true,
      reply
    });
  } catch (error) {
    console.error(
      "❌ Realtime voice controller error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
