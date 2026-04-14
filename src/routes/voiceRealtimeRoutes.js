const express = require("express");
const router = express.Router();
const voiceController = require("../controllers/voiceController");

const voiceRealtimeController = require(
  "../controllers/voiceRealtimeController"
);

router.post(
  "/realtime",
  voiceRealtimeController.handleRealtimeVoice
);

module.exports = router;