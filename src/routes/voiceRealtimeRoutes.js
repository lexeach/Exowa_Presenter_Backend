const express = require("express");
const router = express.Router();

const {
  realtimeVoiceReply,
  answerCall,
  processSlot
} = require("../controllers/voiceRealtimeController");

// ================== ANSWER ==================
router.post("/answer", answerCall);

// ================== REALTIME ==================
router.post("/realtime", realtimeVoiceReply);

// ================== PROCESS SLOT ==================
router.post("/process-slot", processSlot);

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
