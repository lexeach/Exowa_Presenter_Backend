// src/controllers/voiceController.js

const { getLLMReply } = require("../services/llmService");
const xmlResponse = require("../utils/xmlResponse");

/**
 * Answer Call (FIRST HIT)
 */
exports.answerCall = async (req, res) => {
  try {
    console.log("🔥 answerCall HIT");

    const aiReply = await getLLMReply(
      "Introduce yourself as Exowa AI sales executive in Hindi"
    );

    // ✅ ONLY TEXT PASS करो
    const xml = xmlResponse(aiReply);

    console.log("📤 FINAL XML =>", xml);

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
 * Realtime Voice (LOOP)
 */
exports.realtimeVoice = async (req, res) => {
  try {
    console.log("📩 REALTIME HIT:", req.body);

    const userSpeech = req.body.Speech || "hello";

    const aiReply = await getLLMReply(userSpeech);

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
