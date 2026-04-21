exports.answerCall = async (req, res) => {
  try {
    console.log("📩 /voice/answer hit", req.body);

    const responseXML = `
<Response>

  <GetInput
    action="https://exowa-presenter-backend.onrender.com/api/vobiz/process-slot"
    method="POST"
    inputType="speech"
    language="hi-IN"
    timeout="7"
    speechTimeout="auto"
  >
    <Speak language="hi-IN" voice="WOMAN">
      नमस्ते, मैं Exowa AI assistant बोल रही हूँ।
      क्या आप मुझे सुन पा रहे हैं? कृपया कुछ बोलिए।
    </Speak>
  </GetInput>

</Response>`;

    res.set("Content-Type", "text/xml");
    res.send(responseXML);

  } catch (error) {
    console.error("❌ answerCall error:", error);
    res.sendStatus(500);
  }
};
