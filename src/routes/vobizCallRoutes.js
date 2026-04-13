const express = require("express");
const router = express.Router();
const Lead = require("../models/Lead");

function xmlResponse(innerXml = "") {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
${innerXml}
</Response>`;
}

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

function parseDateAndTime(text = "") {
  const speech = text.toLowerCase().trim();

  let demoDate = new Date();
  let demoTime = "6:00 PM";

  if (
    speech.includes("2") ||
    speech.includes("दो") ||
    speech.includes("दोपहर")
  ) {
    demoTime = "2:00 PM";
  } else if (
    speech.includes("6") ||
    speech.includes("शाम")
  ) {
    demoTime = "6:00 PM";
  }

  if (
    speech.includes("कल") ||
    speech.includes("kal")
  ) {
    demoDate.setDate(demoDate.getDate() + 1);
  }

  return { demoDate, demoTime };
}

/* ANSWER URL */
router.get("/answer", (req, res) => {
  const processUrl =
    `${process.env.BACKEND_BASE_URL}/api/vobiz/process-slot`;

  res.set("Content-Type", "text/xml");

  return res.status(200).send(
    xmlResponse(`
      <Gather action="${processUrl}" method="POST" inputType="speech" timeout="8">
        <Speak language="hi-IN">
          नमस्ते। मैं Exowa से बोल रही हूँ।
          कृपया demo का समय बताइए।
        </Speak>
      </Gather>
    `)
  );
});

router.post("/answer", (req, res) => {
  const processUrl =
    `${process.env.BACKEND_BASE_URL}/api/vobiz/process-slot`;

  res.set("Content-Type", "text/xml");

  return res.status(200).send(
    xmlResponse(`
      <Gather action="${processUrl}" method="POST" inputType="speech" timeout="8">
        <Speak language="hi-IN">
          नमस्ते। मैं Exowa से बोल रही हूँ।
          कृपया demo का समय बताइए।
        </Speak>
      </Gather>
    `)
  );
});

/* PROCESS SLOT */
router.post("/process-slot", async (req, res) => {
  try {
    const speechText =
      req.body.Speech ||
      req.body.speech ||
      "";

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

    res.set("Content-Type", "text/xml");

    if (!updatedLead) {
      return res.status(200).send(
        xmlResponse(`
          <Speak>नंबर रिकॉर्ड में नहीं मिला।</Speak>
        `)
      );
    }

    const formattedDate =
      formatDateHindi(demoDate);

    return res.status(200).send(
      xmlResponse(`
        <Speak language="hi-IN">
          धन्यवाद।
          आपका demo ${formattedDate} को ${demoTime} पर confirm हो गया है।
        </Speak>
      `)
    );

  } catch (error) {
    console.error(error);

    res.set("Content-Type", "text/xml");

    return res.status(200).send(
      xmlResponse(`
        <Speak>तकनीकी समस्या हुई है।</Speak>
      `)
    );
  }
});

module.exports = router;
