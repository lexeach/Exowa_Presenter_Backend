// src/controllers/voiceController.js

const { getLLMReply } = require("../services/llmService");
const xmlResponse = require("../utils/xmlResponse");

/**
 * Answer Call (FIRST HIT)
 */
exports.answerCall = async (req, res) => {
  try {
    console.log("📩 ANSWER HIT:", req.body);

    // 🔥 अगर user ने कुछ बोला है
    const userSpeech = req.body.Speech;

    let aiReply;

    if (userSpeech) {
      aiReply = await getLLMReply(userSpeech);
    } else {
      aiReply = await getLLMReply(
        "Introduce yourself as Exowa AI sales executive in Hindi"
      );
    }

    const xml = `
<Response>

  <GetInput 
    action="https://exowa-presenter-backend.onrender.com/api/voice/answer"
    method="POST"
    inputType="speech"
    speechTimeout="auto"
    timeout="10">

    <Speak language="hi-IN" voice="WOMAN">
      ${aiReply}
    </Speak>

  </GetInput>

  <Speak language="hi-IN" voice="WOMAN">
    क्या आप मुझे सुन पा रहे हैं? कृपया कुछ बोलिए।
  </Speak>

</Response>`;

    res.set("Content-Type", "application/xml");
    return res.send(xml);

  } catch (error) {
    console.error("❌ Voice Error:", error);

    return res.send(`
<Response>
  <Speak language="hi-IN" voice="WOMAN">
    तकनीकी समस्या आ गई है।
  </Speak>
</Response>`);
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
