const express = require("express");
const router = express.Router();

const {
  realtimeVoiceReply
} = require("../controllers/voiceRealtimeController");

console.log("DEBUG realtimeVoiceReply:", realtimeVoiceReply);

// ✅ EXISTING
router.post("/realtime", realtimeVoiceReply);

// 🔥 ADD THIS (VERY IMPORTANT)
router.post("/process-slot", async (req, res) => {
  try {
    console.log("🎤 process-slot hit", req.body);

    const responseXML = `
<Response>

  <Speak language="hi-IN" voice="WOMAN">
    धन्यवाद, आपकी आवाज़ मिल गई।
  </Speak>

  <GetInput
    action="https://exowa-presenter-backend.onrender.com/api/voice/process-slot"
    method="POST"
    inputType="speech"
    language="hi-IN"
    timeout="7"
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

// 🔥 OPTIONAL (GET fallback)
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
