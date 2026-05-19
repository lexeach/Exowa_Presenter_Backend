const Lead = require("../models/Lead");
const { getAIReply } = require("../services/ai/voiceConversationService");

// ✅ ANSWER CALL
const answerCall = async (req, res) => {
  try {
    console.log("🔥 ANSWER HIT");

    const baseUrl = process.env.BACKEND_BASE_URL || `https://${req.get('host')}`;
    const actionUrl = `${baseUrl}/api/voice/process-slot`;

    // Vobiz XML: Strict adherence to documentation example
    // 1. No extra attributes in <Gather> that aren't in the example if possible
    // 2. Standard indentation and newlines as shown in docs
    const responseXML = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Gather numDigits="1" timeout="10" action="${actionUrl}" method="POST">
        <Speak>नमस्ते, मैं Exowa AI assistant बोल रही हूँ। क्या आप मुझे सुन पा रहे हैं?</Speak>
    </Gather>
    <Speak>We didn't receive your input. Goodbye!</Speak>
    <Hangup/>
</Response>`;

    res.set("Content-Type", "text/xml");
    res.send(responseXML);

  } catch (error) {
    console.error("❌ answerCall error:", error);
    res.sendStatus(500);
  }
};

// ✅ PROCESS SLOT (AI Interaction)
const processSlot = async (req, res) => {
  try {
    console.log("🎤 process-slot hit", req.body);

    const userSpeech = req.body.Speech || req.body.Digits || "";
    console.log("🧠 User said:", userSpeech);

    // Get dynamic reply from AI service
    const aiResponseText = await getAIReply(userSpeech);
    
    const baseUrl = process.env.BACKEND_BASE_URL || `https://${req.get('host')}`;
    const actionUrl = `${baseUrl}/api/voice/process-slot`;

    const responseXML = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Gather numDigits="1" timeout="10" action="${actionUrl}" method="POST">
        <Speak>${aiResponseText}</Speak>
    </Gather>
    <Speak>We didn't receive your input. Goodbye!</Speak>
    <Hangup/>
</Response>`;

    res.set("Content-Type", "text/xml");
    res.send(responseXML);

  } catch (error) {
    console.error("❌ process-slot error:", error);
    res.sendStatus(500);
  }
};

// ✅ REALTIME (Status Callbacks)
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
  processSlot,
  realtimeVoiceReply
};
