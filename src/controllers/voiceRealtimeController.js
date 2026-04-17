const Lead = require("../models/Lead");
const xmlResponse = require("../utils/xmlResponse");
const { getLLMReply } = require("../services/llmService");

exports.realtimeVoiceReply = async (req, res) => {
//exports.realtimeVoice = async (req, res) => {
  try {
    console.log("📩 REALTIME HIT:", req.body);

    const userSpeech = req.body.Speech || "hello";

    let aiReply = "जी, कृपया थोड़ा विस्तार से बताइए।";

    try {
      const llmReply = await getLLMReply(userSpeech);

      if (llmReply && llmReply.trim()) {
        aiReply = llmReply;
      }

    } catch (err) {
      console.error("❌ LLM failed, using fallback");
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <GetInput 
    action="https://exowa-presenter-backend.onrender.com/api/voice/realtime" 
    method="POST" 
    inputType="speech"
    speechTimeout="auto"
    timeout="10">

    <Speak language="hi-IN" voice="WOMAN">
      ${aiReply}
    </Speak>

  </GetInput>
</Response>`;

    res.set("Content-Type", "application/xml");
    return res.send(xml);

  } catch (error) {
    console.error("❌ realtime error:", error);

    return res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Speak>कृपया फिर से बोलिए</Speak>
</Response>`);
  }
};
