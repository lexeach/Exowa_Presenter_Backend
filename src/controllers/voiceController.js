// src/controllers/voiceController.js

const { escapeXML } = require("../utils/xmlHelper");
const { getLLMReply } = require("../services/llmService");

/**
 * Voice Answer XML
 */
exports.answerCall = async (req, res) => {
  try {
    console.log("📞 Incoming call hit:", req.body);

    let aiReply =
      "नमस्ते, मैं Exowa AI sales assistant बोल रही हूँ। मैं आपकी कैसे मदद कर सकती हूँ?";

    try {
      // Optional AI response
      aiReply = await getLLMReply(
        "Introduce yourself as Exowa AI sales executive in Hindi"
      );
    } catch (err) {
      console.error("❌ LLM Error:", err.message);
    }

    // VERY IMPORTANT
    const safeReply = escapeXML(aiReply);

    const xmlResponse = `
<Response>
   <Speak language="hi-IN" voice="WOMAN">
      ${safeReply}
   </Speak>
</Response>`;

    console.log("📤 Sending XML:", xmlResponse);

    res.set("Content-Type", "text/xml");
    return res.status(200).send(xmlResponse);
  } catch (error) {
    console.error("❌ answerCall Error:", error);

    const fallbackXML = `
<Response>
   <Speak language="hi-IN" voice="WOMAN">
      नमस्ते, तकनीकी समस्या के कारण कॉल आगे नहीं बढ़ पाई।
   </Speak>
</Response>`;

    res.set("Content-Type", "text/xml");
    return res.status(200).send(fallbackXML);
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
