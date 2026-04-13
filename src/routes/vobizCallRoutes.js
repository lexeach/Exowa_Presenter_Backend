const express = require("express");
const router = express.Router();

const voiceController = require("../controllers/voiceController");

router.post("/answer", voiceController.answerCall);
router.post("/process-slot", voiceController.processSlot);

module.exports = router;