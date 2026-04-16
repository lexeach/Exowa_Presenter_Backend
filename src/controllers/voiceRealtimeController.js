const Lead = require("../models/Lead");
const { getAIReply } = require("../services/aiReplyService");

exports.realtimeVoiceReply = async (req, res) => {
  try {
    console.log("📩 /api/voice/realtime hit", req.body);

    const phone = req.body.To?.slice(-10);

    const lead = await Lead.findOne({
      referralPhone: phone
    });

    const event = req.body.Event || "";
    const callStatus = req.body.CallStatus || "";
    const transcript = (req.body.transcript || "").trim();

    // Ignore webhook events without speech input
    if (!transcript) {
      console.log("⚠️ Empty transcript - returning fallback XML");

      const xml = `
<Response>
   <Speak language="hi-IN">
      नमस्ते, कृपया अपनी बात बोलिए।
   </Speak>

   <Record
      action="${process.env.BACKEND_BASE_URL}/api/vobiz/process-slot"
      method="POST"
      maxLength="8"
      playBeep="true"
   />
</Response>
`;

      res.set("Content-Type", "text/xml");
      return res.send(xml);
    }

    const reply = await getAIReply({
      transcript,
      lead,
      stage: "intro"
    });

    const xml = `
<Response>
   <Speak language="hi-IN">
      ${reply}
   </Speak>

   <Record
      action="${process.env.BACKEND_BASE_URL}/api/vobiz/process-slot"
      method="POST"
      maxLength="8"
      playBeep="true"
   />
</Response>
`;

    res.set("Content-Type", "text/xml");
    return res.send(xml);

  } catch (error) {
    console.error("❌ realtimeVoiceReply Error:", error);
    return res.status(500).send("error");
  }
};
