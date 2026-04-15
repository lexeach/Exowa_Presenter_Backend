const Lead = require("../models/Lead");

exports.realtimeVoiceReply = async (req, res) => {
  try {
    console.log("🎤 Realtime voice request:", req.body);

    const { phone, transcript } = req.body;

    let lead = null;

    if (phone) {
      lead = await Lead.findOne({
        $or: [
          { phone },
          { referralPhone: phone }
        ]
      });
    }

    const name = lead?.name || "जी";
    const referredBy = lead?.referredBy;

    let reply = "";

    // FIRST CALL INTRO
    if (!transcript || transcript.trim() === "") {
      if (referredBy) {
        reply = `नमस्ते ${name}, मैं Exowa से मीरा बोल रही हूँ।
आपका नंबर हमें ${referredBy} जी से मिला है।
उन्होंने सुझाव दिया कि मैं आपसे बात करके Exowa के बारे में बताऊँ।
क्या अभी 2 मिनट बात करने का सही समय है?`;
      } else {
        reply = `नमस्ते ${name}, मैं Exowa से मीरा बोल रही हूँ।
हम बच्चों की पढ़ाई और टेस्ट प्रैक्टिस के लिए एक personalized learning platform हैं।
क्या अभी 2 मिनट बात करने का सही समय है?`;
      }
    }

    // POSITIVE RESPONSE
    else if (
      transcript.includes("हाँ") ||
      transcript.includes("haan") ||
      transcript.includes("yes")
    ) {
      reply = `बहुत धन्यवाद।
Exowa में बच्चे अपनी class के अनुसार रोज practice कर सकते हैं,
custom question papers generate कर सकते हैं,
और instant feedback पा सकते हैं।
क्या मैं आपके बच्चे की class जान सकती हूँ?`;
    }

    // BUSY RESPONSE
    else if (
      transcript.includes("बाद में") ||
      transcript.includes("busy") ||
      transcript.includes("अभी नहीं")
    ) {
      reply = `कोई बात नहीं।
कृपया अपना सुविधाजनक समय बताइए,
हम उसी समय दोबारा कॉल करेंगे।`;
    }

    // DEFAULT FALLBACK
    else {
      reply = `धन्यवाद।
क्या मैं आपको Exowa के बारे में 1 मिनट में जानकारी दूँ?`;
    }

    console.log("🤖 Dynamic AI Reply:", reply);

    return res.status(200).json({
      success: true,
      reply
    });
  } catch (error) {
    console.error("❌ realtimeVoiceReply error:", error);

    return res.status(500).json({
      success: false,
      message: "Voice reply failed"
    });
  }
};
