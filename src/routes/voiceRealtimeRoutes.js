const express = require("express");
const router = express.Router();

const {
  realtimeVoiceReply
} = require("../controllers/voiceRealtimeController");

// POST /api/voice/realtime
router.post(
  "/realtime",
  realtimeVoiceReply
);

console.log("✅ voiceRealtimeRoutes loaded");

module.exports = router;
