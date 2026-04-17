// src/controllers/voiceController.js

const { getLLMReply } = require("../services/llmService");
const xmlResponse = require("../utils/xmlResponse");

/**
 * Voice Answer XML
 */
exports.answerCall = async (req, res) => {
  try {
    const aiReply = await getLLMReply(
      "Introduce yourself as Exowa AI sales executive in Hindi"
    );

    // ✅ DIRECT text pass करो (no <Speak>)
    const xml = xmlResponse(aiReply);

    console.log("📤 XML =>", xml);

    res.set("Content-Type", "application/xml");
    return res.status(200).send(xml);

  } catch (error) {
    console.error("❌ Voice Error:", error);

    const xml = xmlResponse(
      "नमस्ते, तकनीकी समस्या के कारण कॉल आगे नहीं बढ़ पाई।"
    );

    res.set("Content-Type", "application/xml");
    return res.status(200).send(xml);
  }
};
/**
 * Realtime Voice Events
 */
exports.realtimeVoice = async (req, res) => {
  try {
    console.log("📩 /api/voice/realtime hit", req.body);

    const event = req.body.Event;
    const status = req.body.CallStatus;
    const phone = req.body.To || req.body.From;

    console.log("📞 Event:", event);
    console.log("📞 Status:", status);
    console.log("📞 Phone:", phone);

    return res.status(200).json({
      success: true,
      message: "Realtime call status updated",
    });
  } catch (error) {
    console.error("❌ realtimeVoice Error:", error);

    return res.status(500).json({
      success: false,
      message: "Realtime update failed",
    });
  }
};
