const { getLLMReply } = require("../services/llmService");

/**
 * ANSWER CALL (FIRST HIT + LOOP)
 */
exports.answerCall = async (req, res) => {
  try {
    console.log("📩 ANSWER HIT:", req.body);

    const userSpeech = req.body.Speech;

    let aiReply;

    if (userSpeech) {
      aiReply = await getLLMReply(userSpeech);
    } else {
      aiReply =
        "नमस्ते, मैं Exowa से बोल रही हूँ। क्या आप अपने बच्चे के लिए पढ़ाई में सुधार चाहते हैं?";
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <GetInput 
    action="https://exowa-presenter-backend.onrender.com/api/voice/answer"
    method="POST"
    inputType="speech"
    speechTimeout="auto"
    timeout="15">

    <Speak language="hi-IN" voice="WOMAN">
      ${aiReply}
    </Speak>

  </GetInput>
</Response>`;

    res.set("Content-Type", "application/xml");
    return res.send(xml);

  } catch (error) {
    console.error("❌ Voice Error:", error);

    return res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Speak language="hi-IN">
    तकनीकी समस्या आ गई है।
  </Speak>
</Response>`);
  }
};
