const express = require("express");
const router = express.Router();

const voiceController = require("../controllers/voiceController");

router.get("/answer", voiceController.answerCall);
router.post("/answer", voiceController.answerCall);

// IMPORTANT FIX
router.get("/process-slot", voiceController.processSlot);
router.post("/process-slot", voiceController.processSlot);

console.log("✅ vobizCallRoutes loaded");

module.exports = router;
