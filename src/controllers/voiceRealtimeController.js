const Lead = require("../models/Lead");
const { getAIReply } = require("../services/ai/voiceConversationService");

// ✅ ANSWER CALL
const answerCall = async (req, res) => {
  try {
    console.log("🔥 ANSWER HIT");
console.log("📩 BODY:", req.body);

    const baseUrl = process.env.BACKEND_BASE_URL || `https://${req.get('host')}`;
    const actionUrl = `${baseUrl}/api/voice/process-slot`;

    // Vobiz XML: Enabling Speech Recognition
    // 1. inputType="speech" enables ASR
    // 2. language="hi-IN" for Hindi recognition
    // 3. speechEndTimeout="auto" to detect when user stops talking
 const responseXML = `<?xml version="1.0" encoding="UTF-8"?>
<Response>

    <Speak>
        नमस्ते, मैं Exowa AI assistant बोल रही हूँ।
        क्या आप मुझे सुन पा रहे हैं?
    </Speak>

    <Gather
        inputType="speech"
        action="${actionUrl}"
        method="POST"
        timeout="10">
    </Gather>

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
   console.log("🎤 process-slot hit");
console.log("📩 BODY:", req.body);

    // Vobiz sends transcribed speech in the 'Speech' parameter
   // Accept all possible speech field names sent by Vobiz

const userSpeech =
  req.body.Speech ||
  req.body.speech ||
  req.body.text ||
  req.body.transcript ||
  "";

console.log("🧠 User said:", userSpeech);
console.log("📩 Full request body:", req.body);

    // Get dynamic reply from AI service
    const aiResponseText = await getAIReply(userSpeech);
    
    const baseUrl = process.env.BACKEND_BASE_URL || `https://${req.get('host')}`;
    const actionUrl = `${baseUrl}/api/voice/process-slot`;

  const responseXML = `<?xml version="1.0" encoding="UTF-8"?>
<Response>

    <Speak>
        नमस्ते, मैं Exowa AI assistant बोल रही हूँ।
        क्या आप मुझे सुन पा रहे हैं?
    </Speak>

    <Gather
        inputType="speech"
        action="${actionUrl}"
        method="POST"
        timeout="10">
    </Gather>

    <Speak>
        मुझे आपकी आवाज़ नहीं मिली।
    </Speak>

    <Redirect method="POST">
        ${actionUrl}
    </Redirect>

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
