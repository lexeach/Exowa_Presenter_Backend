const express = require("express");
const router = express.Router();
const Lead = require("../models/Lead");

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
   HELPER FUNCTIONS
------------------------------------ */
function normalizePhone(phone = "") {
  return phone.replace(/^(\+91|91)/, "").trim();
}

function formatDateHindi(date) {
  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long"
  });
}

function parseDateAndTime(speechText = "") {
  const text = speechText.toLowerCase().trim();

  let demoDate = new Date();
  let demoTime = "6:00 PM";

  if (
    text.includes("2") ||
    text.includes("दो") ||
    text.includes("दोपहर") ||
    text.includes("dopahar")
  ) {
    demoTime = "2:00 PM";
  } else if (
    text.includes("6") ||
    text.includes("छह") ||
    text.includes("शाम") ||
    text.includes("shaam")
  ) {
    demoTime = "6:00 PM";
  } else if (
    text.includes("11") ||
    text.includes("ग्यारह") ||
    text.includes("सुबह")
  ) {
    demoTime = "11:00 AM";
  }

  if (
    text.includes("कल") ||
    text.includes("kal") ||
    text.includes("tomorrow")
  ) {
    demoDate.setDate(demoDate.getDate() + 1);
  }

  return { demoDate, demoTime };
}

/* -----------------------------------
   ANSWER WEBHOOK
------------------------------------ */
const sendAnswerXml = (req, res) => {
  try {
    console.log("📞 Vobiz webhook hit:", req.method, req.originalUrl);

    const processUrl =
      `${process.env.BACKEND_BASE_URL}/api/vobiz/process-slot`;

    const xml = xmlResponse(`
      <Gather action="${processUrl}" method="POST" inputType="speech" timeout="8">
        <Speak language="hi-IN">
          नमस्ते। मैं Exowa से बोल रही हूँ। कृपया demo का समय बताइए।
        </Speak>
      </Gather>
    `);

    console.log("📤 XML sent:", xml);

    res.set("Content-Type", "text/xml");
    return res.status(200).send(xml);

  } catch (error) {
    console.error("❌ webhook error:", error);

    res.set("Content-Type", "text/xml");
    return res.status(200).send(
      xmlResponse(`<Speak>तकनीकी समस्या हुई है</Speak>`)
    );
  }
};

router.get("/answer", sendAnswerXml);
router.post("/answer", sendAnswerXml);

/* -----------------------------------
   PROCESS SLOT
------------------------------------ */
router.post("/process-slot", async (req, res) => {
  try {
    console.log("🎤 Slot webhook body:", req.body);

    const speechText =
      req.body.Speech ||
      req.body.speech ||
      req.body.input ||
      req.body.text ||
      req.body.Transcript ||
      "";

    console.log("🎤 Parent said:", speechText);

    if (!speechText.trim()) {
      res.set("Content-Type", "text/xml");
      return res.status(200).send(
        xmlResponse(`
          <Speak language="hi-IN">
            कृपया समय स्पष्ट रूप से बताएं।
          </Speak>
        `)
      );
    }

    const { demoDate, demoTime } =
      parseDateAndTime(speechText);

    const phone =
      normalizePhone(req.body.To || "");

    const updatedLead =
      await Lead.findOneAndUpdate(
        { phone },
        {
          status: "DEMO_BOOKED",
          demoDate,
          demoTime
        },
        { new: true }
      );

    if (!updatedLead) {
      return res.status(200).send(
        xmlResponse(`
          <Speak>आपका नंबर रिकॉर्ड में नहीं मिला।</Speak>
        `)
      );
    }

    const formattedDate =
      formatDateHindi(demoDate);

    return res.status(200).send(
      xmlResponse(`
        <Speak language="hi-IN">
          धन्यवाद। आपका demo ${formattedDate} को ${demoTime} पर confirm हो गया है।
        </Speak>
      `)
    );

  } catch (error) {
    console.error("❌ process-slot error:", error);

    return res.status(200).send(
      xmlResponse(`
        <Speak>तकनीकी समस्या हुई है।</Speak>
      `)
    );
  }
});

module.exports = router;
