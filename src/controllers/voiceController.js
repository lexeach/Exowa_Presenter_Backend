exports.answerCall = async (req, res) => {
  try {
    console.log("📩 ANSWER HIT:", req.body);

    const userSpeech =
      req.body.Speech ||
      req.body.speech ||
      req.body.transcript ||
      "";

    let aiReply;

    if (!userSpeech) {
      aiReply =
        "नमस्ते, मैं Exowa से बोल रही हूँ। क्या आप अपने बच्चे के लिए demo देखना चाहेंगे?";
    } else {
      aiReply = await retryLLM(userSpeech);
    }

    const safeReply = xmlSafe(aiReply);

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <GetInput 
    action="https://exowa-presenter-backend.onrender.com/api/voice/answer"
    method="POST"
    inputType="speech"
    speechTimeout="3"
    timeout="20">

    <Speak language="hi-IN" voice="WOMAN">
      ${safeReply}
    </Speak>

  </GetInput>
</Response>`;

    res.set("Content-Type", "application/xml");
    return res.send(xml);

  } catch (error) {
    console.error("❌ Voice Error:", error);

    return res.send(`
<Response>
  <Speak>तकनीकी समस्या आ गई है</Speak>
</Response>`);
  }
};
