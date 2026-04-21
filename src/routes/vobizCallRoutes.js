const express = require("express");
const router = express.Router();

router.post("/process-slot", async (req, res) => {
  try {
    console.log("🎤 process-slot hit", req.body);

    const responseXML = `
<Response>
  <Speak language="hi-IN" voice="WOMAN">
    धन्यवाद, मैं आपकी बात समझ रही हूँ।
  </Speak>

  <GetInput
    action="https://exowa-presenter-backend.onrender.com/api/vobiz/process-slot"
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

  } catch (err) {
    console.error("❌ process-slot error:", err);
    res.sendStatus(500);
  }
});

module.exports = router;
