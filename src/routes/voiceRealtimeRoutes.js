const express = require("express");
const router = express.Router();

const {
  realtimeVoiceReply,
  answerCall
} = require("../controllers/voiceRealtimeController");

// ================== ANSWER ==================
router.post("/answer", answerCall);

// ================== REALTIME ==================
router.post("/realtime", realtimeVoiceReply);

// ================== PROCESS SLOT ==================
router.post("/process-slot", async (req, res) => {
  try {
    console.log("🎤 process-slot hit", req.body);

    const userSpeech =
      req.body.Speech ||
      req.body.Digits ||
      "";

    console.log("🧠 User said:", userSpeech);

    const responseXML = `<?xml version="1.0" encoding="UTF-8"?>
<Response>

  <Speak language="hi-IN" voice="WOMAN">
    धन्यवाद, आपने कहा: ${userSpeech}
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
      क्या आप demo देखना चाहेंगे?
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

// ================== GET TEST ==================
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
