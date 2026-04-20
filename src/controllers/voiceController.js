exports.answerCall = async (req, res) => {
  try {
    console.log("📞 ANSWER HIT:", req.body);

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>

  <GetInput 
    action="https://exowa-presenter-backend.onrender.com/api/voice/realtime"
    method="POST"
    inputType="speech"
    speechTimeout="auto"
    timeout="10">

    <Speak language="hi-IN" voice="WOMAN">
      नमस्ते। मैं Exowa से बोल रही हूँ।
      क्या आप अपने बच्चे के लिए demo देखना चाहेंगे?
    </Speak>

  </GetInput>

</Response>`;

    res.set("Content-Type", "application/xml");
    return res.send(xml);

  } catch (error) {
    console.error("❌ answerCall error:", error);

    return res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Speak>सिस्टम में समस्या है</Speak>
</Response>`);
  }
};
