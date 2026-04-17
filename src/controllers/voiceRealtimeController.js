const Lead = require("../models/Lead");
const xmlResponse = require("../utils/xmlResponse");
const { getLLMReply } = require("../services/llmService");

exports.realtimeVoiceReply = async (req, res) => {
  try {
    console.log("📩 REALTIME HIT:", req.body);

    const userSpeech = req.body.Speech || "hello";

    let aiReply;

    try {
      aiReply = await getLLMReply(userSpeech);
    } catch (err) {
      console.log("⚠️ OpenAI failed realtime");
      aiReply = "जी, कृपया दोबारा बताइए।";
    }

    const xml = xmlResponse(aiReply);

    console.log("📤 REALTIME XML =>", xml);

    res.set("Content-Type", "application/xml");
    return res.send(xml);

  } catch (error) {
    console.error("❌ realtime error:", error);

    const xml = xmlResponse("कृपया फिर से बोलिए।");

    res.set("Content-Type", "application/xml");
    return res.send(xml);
  }
};
