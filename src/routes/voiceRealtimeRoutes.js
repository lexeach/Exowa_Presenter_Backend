const express = require("express");
const router = express.Router();

const voiceRealtimeController = require(
  "../controllers/voiceRealtimeController"
);

// POST /api/voice/realtime
router.post(
  "/realtime",
  voiceRealtimeController.handleRealtimeVoice
);

console.log("✅ voiceRealtimeRoutes loaded");

module.exports = router;
