const express = require("express");
const router = express.Router();

const {
  realtimeVoiceReply
} = require("../controllers/voiceRealtimeController");

console.log("DEBUG realtimeVoiceReply:", realtimeVoiceReply);

// ✅ CALL EVENTS (hangup etc.)
router.post("/realtime", realtimeVoiceReply);

// ✅ MAIN AI CONVERSATION LOOP
router.post("/process-slot", async (req, res) => {
  try {
    console.log("🎤 process-slot hit", req.body);

    // 🧠 User speech text (Vobiz sends different keys sometimes)
    const userSpeech =
      req.body.SpeechResult ||
      req.body.speech ||
      req.body.text ||
      "";

    console.log("🧠 User said:", userSpeech);

    let reply = "माफ कीजिए, मैं समझ नहीं पाई।";

    if (userSpeech.includes("हाँ") || userSpeech.includes("haan")) {
      reply = "बहुत बढ़िया! मैं आपको demo के बारे में बताती हूँ।";
    } else if (userSpeech.includes("नहीं") || userSpeech.includes("nahi")) {
      reply = "कोई बात नहीं, अगर आप चाहें तो बाद में भी देख सकते हैं।";
    } else {
      reply = "क्या आप demo देखना चाहेंगे?";
    }

    const responseXML = `<?xml version="1.0" encoding="UTF-8"?>
<Response>

  <Speak language="hi-IN" voice="WOMAN">
    ${reply}
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
      कृपया जवाब दें।
    </Speak>
  </GetInput>

</Response>`;

    res.set("Content-Type", "text/xml");
    res.send(responseXML);

  } catch (error) {
    console.error("❌ process-slot error:", error);
    res.sendStatus(500);
  }
});

// ✅ OPTIONAL: browser test
router.get("/process-slot", (req, res) => {
  console.log("🌐 GET process-slot hit");

  res.set("Content-Type", "text/xml");
  res.send(`
<Response>
  <Speak language="hi-IN" voice="WOMAN">
    सिस्टम तैयार है। कृपया कुछ बोलिए।
  </Speak>
</Response>
  `);
});

console.log("✅ voiceRealtimeRoutes loaded");

module.exports = router;
