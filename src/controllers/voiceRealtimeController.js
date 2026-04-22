const Lead = require("../models/Lead");

// ✅ ANSWER CALL
const answerCall = async (req, res) => {
  try {
    console.log("🔥 ANSWER HIT");

    const responseXML = `<?xml version="1.0" encoding="UTF-8"?>
<Response>

  <Speak language="hi-IN" voice="WOMAN">
    नमस्ते, मैं Exowa AI assistant बोल रही हूँ।
  </Speak>

  <GetInput
    action="https://exowa-presenter-backend.onrender.com/api/voice/process-slot"
    method="POST"
    inputType="speech"
    language="hi-IN"
    timeout="7"
    speechTimeout="auto"
  >
    <Speak language="hi-IN" voice="WOMAN">
      क्या आप मुझे सुन पा रहे हैं?
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

// ✅ REALTIME
const realtimeVoiceReply = async (req, res) => {
  try {
    console.log("📩 REALTIME WEBHOOK:", req.body);

    const event = req.body.Event || "";
    const callStatus = req.body.CallStatus || "";

    const phone = req.body.To?.slice(-10);

    if (event === "Hangup" || callStatus === "completed") {
      console.log("📴 Call ended");
      return res.status(200).send("OK");
    }

    const lead = await Lead.findOne({ phone });

    if (lead) {
      lead.lastEvent = event;
      lead.callStatus = callStatus;
      lead.updatedAt = new Date();
      await lead.save();
    }

    return res.status(200).send("OK");

  } catch (error) {
    console.error("❌ realtime error:", error.message);
    return res.status(200).send("OK");
  }
};

module.exports = {
  answerCall,
  realtimeVoiceReply
};
