const express = require("express");
const router = express.Router();

const voiceController = require("../controllers/voiceController");

// Browser test route
router.get("/answer", voiceController.answerCall);

// Actual Vobiz route
router.post("/answer", voiceController.answerCall);

router.post("/process-slot", voiceController.processSlot);

console.log("✅ vobizCallRoutes loaded");

module.exports = router;
