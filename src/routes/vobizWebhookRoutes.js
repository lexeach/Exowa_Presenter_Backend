const express = require("express");
const router = express.Router();

const sttService =
  require("../services/voice/sttService");

const intentService =
  require("../services/ai/intentService");

const demoBookingService =
  require("../services/booking/demoBookingService");

/* -----------------------------------
   XML HELPER
------------------------------------ */
function xmlResponse(innerXml = "") {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
${innerXml}
</Response>`;
}

/* -----------------------------------
   ANSWER WEBHOOK
------------------------------------ */
const sendAnswerXml = async (req, res) => {
  try {
    console.log(
      "📞 Vobiz webhook:",
      req.method,
      req.originalUrl,
      req.body
    );

    // Ignore hangup callback
    if (req.body?.Event === "Hangup") {
      res.set("Content-Type", "text/xml");
      return res
        .status(200)
        .send(xmlResponse());
    }

    // First call prompt
    if (
      req.body?.Event === "StartApp" ||
      !req.body?.Speech
    ) {
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
    }

    const transcript =
      req.body.Speech ||
      req.body.speech ||
      "";

    console.log(
      "📝 Transcript:",
      transcript
    );

    const result =
      intentService.extractIntent(
        transcript
      );

    console.log(
      "🧠 Intent:",
      result
    );

    if (
      result.intent ===
      "BOOK_DEMO"
    ) {
      await demoBookingService.bookDemo(
        req.body.LeadId || null,
        result.date,
        result.time
      );

      const xml = xmlResponse(`
        <Speak language="hi-IN">
          धन्यवाद।
          आपका demo कल शाम 6 बजे confirm हो गया है।
        </Speak>
      `);

      res.set("Content-Type", "text/xml");
      return res.status(200).send(xml);
    }

    const xml = xmlResponse(`
      <Speak language="hi-IN">
        धन्यवाद। आपकी request प्राप्त हो गई है।
      </Speak>
    `);

    res.set("Content-Type", "text/xml");
    return res.status(200).send(xml);

  } catch (error) {
    console.error(
      "❌ Webhook error:",
      error
    );

    res.set("Content-Type", "text/xml");

    return res.status(200).send(
      xmlResponse(`
        <Speak language="hi-IN">
          तकनीकी समस्या हुई है।
        </Speak>
      `)
    );
  }
};

router.get("/answer", sendAnswerXml);
router.post("/answer", sendAnswerXml);

/* -----------------------------------
   PROCESS SLOT
------------------------------------ */
router.post(
  "/process-slot",
  async (req, res) => {
    try {
      const transcript =
        req.body.Speech ||
        req.body.speech ||
        "";

      console.log(
        "🎤 Speech:",
        transcript
      );

      const result =
        intentService.extractIntent(
          transcript
        );

      if (
        result.intent ===
        "BOOK_DEMO"
      ) {
        await demoBookingService.bookDemo(
          req.body.LeadId || null,
          result.date,
          result.time
        );

        res.set("Content-Type", "text/xml");

        return res.status(200).send(
          xmlResponse(`
            <Speak language="hi-IN">
              धन्यवाद।
              आपका demo book हो गया है।
            </Speak>
          `)
        );
      }

      res.set("Content-Type", "text/xml");

      return res.status(200).send(
        xmlResponse(`
          <Speak language="hi-IN">
            कृपया समय दोबारा बताइए।
          </Speak>
        `)
      );

    } catch (error) {
      console.error(
        "❌ process-slot error:",
        error
      );

      res.set("Content-Type", "text/xml");

      return res.status(200).send(
        xmlResponse(`
          <Speak language="hi-IN">
            तकनीकी समस्या हुई है।
          </Speak>
        `)
      );
    }
  }
);

module.exports = router;
