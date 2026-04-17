const express = require("express");
const router = express.Router();

// ❗ IMPORTANT: सही controller import करो
const {
  realtimeVoice
} = require("../controllers/voiceController");

// ❌ ये हटाओ:
// const { realtimeVoiceReply } = require("../controllers/voiceRealtimeController");

// ✅ सही mapping
router.post("/realtime", realtimeVoice);

module.exports = router;
