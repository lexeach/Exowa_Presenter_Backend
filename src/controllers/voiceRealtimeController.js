const Lead = require("../models/Lead");

async function realtimeVoiceReply(req, res) {
  try {
    console.log(
      "🎤 Realtime voice request:",
      req.body
    );

    const { phone, transcript } =
      req.body;

    let lead = null;

    if (phone) {
      lead = await Lead.findOne({
        $or: [
          { phone },
          { referralPhone: phone }
        ]
      });
    }

    const name =
      lead?.name || "जी";

    const referredBy =
      lead?.referredBy;

    let reply = "";

    // FIRST INTRO
    if (
      !transcript ||
      transcript.trim() === ""
    ) {
      if (referredBy) {
        reply = `नमस्ते ${name},
मैं Exowa से मीरा बोल रही हूँ।
आपका नंबर हमें ${referredBy} जी से मिला है।
क्या अभी 2 मिनट बात करने का सही समय है?`;
      } else {
        reply = `नमस्ते ${name},
मैं Exowa से मीरा बोल रही हूँ।
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
क्या मैं आपके बच्चे की class जान सकती हूँ?`;
    }

    // BUSY RESPONSE
    else if (
      transcript.includes("बाद में") ||
      transcript.includes("busy")
    ) {
      reply = `कोई बात नहीं।
कृपया अपना सुविधाजनक समय बताइए।`;
    }

    // DEFAULT
    else {
      reply = `धन्यवाद।
क्या मैं आपको Exowa के बारे में जानकारी दूँ?`;
    }

    console.log(
      "🤖 Realtime voice reply:",
      reply
    );

    return res.status(200).json({
      success: true,
      reply
    });
  } catch (error) {
    console.error(
      "❌ realtimeVoiceReply error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Voice reply failed"
    });
  }
}

module.exports = {
  realtimeVoiceReply
};
