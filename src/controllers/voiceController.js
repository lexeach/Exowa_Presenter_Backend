// src/controllers/voiceController.js

const { getLLMReply } = require("../services/llmService");
const xmlResponse = require("../utils/xmlResponse");

/**
 * Answer Call (FIRST HIT)
 */
exports.answerCall = async (req, res) => {
  console.log("🔥 answerCall HIT");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <GetInput 
    action="https://exowa-presenter-backend.onrender.com/api/voice/realtime" 
    method="POST" 
    inputType="speech"
    timeout="10">

    <Speak language="hi-IN" voice="WOMAN">
      नमस्ते, क्या आप मुझे सुन पा रहे हैं?
    </Speak>

  </GetInput>
</Response>`;

  res.set("Content-Type", "application/xml");
  return res.send(xml);
};/**
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
