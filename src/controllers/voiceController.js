// src/controllers/voiceController.js

const { getLLMReply } = require("../services/llmService");

/**
 * Voice Answer XML
 */
const xmlResponse = require("../utils/xmlResponse");

exports.answerCall = async (req, res) => {
  try {
    const aiReply = await getLLMReply(
      "Introduce yourself as Exowa AI sales executive in Hindi"
    );

    const xml = xmlResponse(`
<Speak language="hi-IN" voice="WOMAN">
${aiReply}
</Speak>
`);

    console.log("📤 XML =>", xml);

    res.set("Content-Type", "text/xml");
    return res.status(200).send(xml);

  } catch (error) {
    console.error("❌ Voice Error:", error);

    const fallbackXML = xmlResponse(`
<Speak language="hi-IN" voice="WOMAN">
नमस्ते, तकनीकी समस्या के कारण कॉल आगे नहीं बढ़ पाई।
</Speak>
`);

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
