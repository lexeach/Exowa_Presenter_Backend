exports.answerCall = async (req, res) => {
  try {
    console.log("📩 ANSWER HIT:", req.body);

    const userSpeech = req.body.Speech;

    let aiReply;

    if (userSpeech) {
      aiReply = await getLLMReply(userSpeech);
    } else {
      aiReply = "नमस्ते, मैं Exowa AI sales assistant बोल रही हूँ। क्या आप मुझे सुन पा रहे हैं?";
    }

    const xml = `
<Response>

  <GetInput 
    action="https://exowa-presenter-backend.onrender.com/api/voice/answer"
    method="POST"
    inputType="speech"
    speechTimeout="auto"
    timeout="7">

    <Speak language="hi-IN" voice="WOMAN">
      ${aiReply}
    </Speak>

  </GetInput>

  <Speak language="hi-IN" voice="WOMAN">
    कृपया कुछ बोलिए।
  </Speak>

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
