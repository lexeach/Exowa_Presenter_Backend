const express = require("express");
const router = express.Router();
const Lead = require("../models/Lead");

/* -----------------------------------
   XML HELPER
------------------------------------ */
/**
 * Generates a valid XML response for the telephony provider.
 * Ensures the response is wrapped in <Response> tags and includes the XML declaration.
 */
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

  const weekdays = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
    "रविवार": 0,
    "सोमवार": 1,
    "मंगलवार": 2,
    "बुधवार": 3,
    "गुरुवार": 4,
    "शुक्रवार": 5,
    "शनिवार": 6
  };

  let demoDate = new Date();
  let demoTime = "6:00 PM";

  /* -------- TIME -------- */
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

  /* -------- TOMORROW -------- */
  if (
    text.includes("कल") ||
    text.includes("kal") ||
    text.includes("tomorrow")
  ) {
    demoDate.setDate(demoDate.getDate() + 1);
  }

  /* -------- WEEKDAY -------- */
  for (const day in weekdays) {
    if (text.includes(day)) {
      const today = demoDate.getDay();
      const targetDay = weekdays[day];

      let diff = targetDay - today;
      if (diff <= 0) diff += 7;

      demoDate.setDate(demoDate.getDate() + diff);
      break;
    }
  }

  /* -------- DATE NUMBER -------- */
  const dateMatch = text.match(
    /(\d{1,2})\s*(tarikh|date|तारीख)/
  );

  if (dateMatch) {
    const dayNumber = parseInt(dateMatch[1]);

    if (dayNumber >= 1 && dayNumber <= 31) {
      demoDate.setDate(dayNumber);
    }
  }

  return { demoDate, demoTime };
}

/* -----------------------------------
   ANSWER WEBHOOK
------------------------------------ */
router.post("/answer", (req, res) => {
  try {
    console.log("📞 Vobiz answer webhook:", req.body);

    const processUrl =
      `${process.env.BACKEND_BASE_URL}/api/vobiz/process-slot`;

    const xml =
      '<?xml version="1.0" encoding="UTF-8"?>' +
      '<Response>' +
      '<Speak>नमस्ते। मैं Exowa से बोल रही हूँ। कृपया demo का समय बताइए।</Speak>' +
      `<GetInput action="${processUrl}" method="POST" inputType="speech"></GetInput>` +
      '</Response>';

    console.log("📤 FINAL XML:", xml);

    res.set("Content-Type", "application/xml");
    return res.status(200).send(xml);

  } catch (error) {
    console.error("❌ answer webhook error:", error);

    res.set("Content-Type", "application/xml");
    return res.status(200).send(
      '<?xml version="1.0" encoding="UTF-8"?><Response><Speak>तकनीकी समस्या हुई है</Speak></Response>'
    );
  }
});
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

    // FIX: Ensure no-input or empty speech returns valid XML
    if (!speechText.trim()) {
      res.set("Content-Type", "text/xml");
      return res.status(200).send(
        xmlResponse(`
    <Speak language="hi-IN">
      कृपया समय स्पष्ट रूप से बताएं। जैसे कल शाम 6 बजे।
    </Speak>`)
      );
    }

    const { demoDate, demoTime } = parseDateAndTime(speechText);
    const phone = normalizePhone(req.body.To || "");

    console.log("📱 Lead phone:", phone);

    const updatedLead = await Lead.findOneAndUpdate(
      { phone },
      {
        status: "DEMO_BOOKED",
        demoDate,
        demoTime
      },
      { new: true }
    );

    if (!updatedLead) {
      console.log("❌ Lead not found");

      res.set("Content-Type", "text/xml");
      return res.status(200).send(
        xmlResponse(`
    <Speak language="hi-IN">
      आपका नंबर रिकॉर्ड में नहीं मिला।
    </Speak>`)
      );
    }

    console.log("✅ Demo booked:", updatedLead.phone);

    const formattedDate = formatDateHindi(demoDate);

    /**
     * FIX: Wrapped the confirmation message inside <Speak> tags.
     * This ensures the telephony provider can parse and play the message.
     */
    const xml = xmlResponse(`
  <Speak language="hi-IN">
    धन्यवाद। आपका demo ${formattedDate} को ${demoTime} पर confirm हो गया है।
  </Speak>`);

    res.set("Content-Type", "text/xml");
    return res.status(200).send(xml);

  } catch (error) {
    console.error("❌ process-slot error:", error);

    res.set("Content-Type", "text/xml");
    return res.status(200).send(
      xmlResponse(`
    <Speak language="hi-IN">
      क्षमा करें। कुछ technical समस्या हुई है।
    </Speak>`)
    );
  }
});

module.exports = router;
