const Lead = require("../models/Lead");
const xmlResponse = require("../utils/xmlResponse");
const { getLLMReply } = require("../services/llmService");

exports.realtimeVoiceReply = async (req, res) => {
  try {
    console.log("📩 /api/voice/realtime hit", req.body);

    const event = req.body.Event || "";
    const phone = req.body.To?.slice(-10);

    // ✅ lead update
    if (phone) {
      const lead = await Lead.findOne({ phone });

      if (lead) {
        lead.lastEvent = event;
        await lead.save();
      }
    }

    // 🔥 MAIN FIX: XML return करो
    const userSpeech = req.body.Speech || "hello";

    const aiReply = await getLLMReply(userSpeech);

    const xml = xmlResponse(aiReply);

    res.set("Content-Type", "application/xml");
    return res.send(xml);

  } catch (error) {
    console.error("❌ realtime error:", error);

    const xml = xmlResponse("कृपया फिर से बोलिए");

    res.set("Content-Type", "application/xml");
    return res.send(xml);
  }
};
