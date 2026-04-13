const express = require("express");
const router = express.Router();

console.log("✅ vobizCallRoutes loaded");

/* ---------------------------
   XML HELPER
---------------------------- */
function xmlResponse(innerXml = "") {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
${innerXml}
</Response>`;
}

/* ---------------------------
   ANSWER WEBHOOK
---------------------------- */
const sendAnswerXml = (req, res) => {
  try {
    console.log("📞 Vobiz answer route hit", req.body);

    const processUrl =
      `${process.env.BACKEND_BASE_URL}/api/vobiz/process-slot`;

    const xml = xmlResponse(`
      <Gather action="${processUrl}" method="POST" inputType="speech" timeout="8">
        <Speak language="hi-IN">
          नमस्ते। मैं Exowa से बोल रही हूँ।
          कृपया demo का समय बताइए।
          उदाहरण: कल शाम 6 बजे।
        </Speak>
      </Gather>
    `);

    res.set("Content-Type", "text/xml");

    return res.status(200).send(xml);

  } catch (error) {
    console.error("❌ answer route error:", error);

    res.set("Content-Type", "text/xml");

    return res.status(200).send(
      xmlResponse(`
        <Speak>तकनीकी समस्या हुई है।</Speak>
      `)
    );
  }
};

/* IMPORTANT */
router.get("/answer", sendAnswerXml);
router.post("/answer", sendAnswerXml);

/* ---------------------------
   PROCESS SLOT
---------------------------- */
router.post("/process-slot", async (req, res) => {
  try {
    console.log("🎤 process-slot hit", req.body);

    res.set("Content-Type", "text/xml");

    return res.status(200).send(
      xmlResponse(`
        <Speak language="hi-IN">
          धन्यवाद। आपका demo book हो गया है।
        </Speak>
      `)
    );

  } catch (error) {
    console.error("❌ process slot error:", error);

    res.set("Content-Type", "text/xml");

    return res.status(200).send(
      xmlResponse(`
        <Speak>तकनीकी समस्या हुई है।</Speak>
      `)
    );
  }
});

module.exports = router;
