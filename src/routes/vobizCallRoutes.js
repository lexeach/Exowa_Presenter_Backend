// src/routes/voiceRoutes.js

const express = require("express");
const router = express.Router();

const {
  answerCall,
  realtimeVoice,
} = require("../controllers/voiceController");

router.post("/answer", answerCall);
router.post("/realtime", realtimeVoice);

module.exports = router;
