const Lead = require("../models/Lead");

exports.realtimeReply = async (req, res) => {
  try {
    const { transcript, phone } = req.body;

    console.log("🎤 Incoming:", transcript);

    let reply = "जी बताइए।";

    const lead = await Lead.findOne({ phone });

    if (
      transcript.includes("हाँ") ||
      transcript.includes("जी")
    ) {
      reply =
        `बहुत बढ़िया। ${lead?.referredBy || "आपके परिचित"} जी ने बताया कि आप अपने बच्चे की पढ़ाई के लिए बेहतर practice solution देख रहे हैं।`;
    }

    if (
      transcript.includes("class") ||
      transcript.includes("कक्षा")
    ) {
      reply =
        "ठीक है। demo कब रखना चाहेंगे?";
    }

    if (
      transcript.includes("बीस तारीख") ||
      transcript.includes("20 तारीख")
    ) {
      reply =
        "ठीक है। आपका demo बीस तारीख दो बजे के लिए बुक कर दिया गया है।";
    }

    return res.json({
      success: true,
      reply
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      reply: "माफ कीजिए, तकनीकी समस्या आ गई है।"
    });
  }
};