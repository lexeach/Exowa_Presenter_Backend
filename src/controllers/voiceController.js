exports.answerCall = async (req, res) => {
  console.log("📞 Vobiz answer route hit", req.body);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Speak language="hi-IN">
    नमस्ते।
    मैं Exowa से बोल रही हूँ।
    कृपया demo class का समय बताइए।
  </Speak>

  <Record
    action="${process.env.BACKEND_BASE_URL}/api/vobiz/process-slot"
    method="POST"
    maxLength="8"
    playBeep="true"
  />
</Response>`;

  res.set("Content-Type", "text/xml");
  return res.status(200).send(xml);
};
