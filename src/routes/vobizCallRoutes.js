
const express = require("express");
const router = express.Router();
const Lead = require("../models/Lead");

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

  /* -------- TIME LOGIC -------- */
  if (
    text.includes("2") ||
    text.includes("दो") ||
    text.includes("2 बजे") ||
    text.includes("dopahar") ||
    text.includes("दोपहर")
  ) {
    demoTime = "2:00 PM";
  } else if (
    text.includes("6") ||
    text.includes("छह") ||
    text.includes("shaam") ||
    text.includes("शाम")
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
    text.includes("kal") ||
    text.includes("tomorrow") ||
    text.includes("कल")
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

  return {
    demoDate,
    demoTime
  };
}

/* -----------------------------------
   ANSWER WEBHOOK
------------------------------------ */
router.post("/answer", (req, res) => {
  try {
    console.log("📞 Vobiz answer webhook:", req.body);

    // Handle Hangup event
    if (req.body.Event === "Hangup") {
      res.set("Content-Type", "text/xml");
      return res.status(200).send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
    }

    const processUrl = `${process.env.BACKEND_BASE_URL}/api/vobiz/process-slot`;

    /**
     * VOBIZ SPECIFIC FIXES:
     * 1. Use <Gather> instead of <GetInput> (Vobiz uses <Gather> for speech/DTMF).
     * 2. Use inputType="speech" (or "dtmf speech").
     * 3. Ensure <Speak> is nested inside <Gather> to prompt the user.
     * 4. Standardize Content-Type to text/xml.
     */
    const xml = 
      '<?xml version="1.0" encoding="UTF-8"?>' +
      '<Response>' +
      `<Gather inputType="speech" action="${processUrl}" method="POST" language="hi-IN" timeout="8">` +
      '<Speak language="hi-IN">नमस्ते। मैं Exowa से बोल रही हूँ। कृपया demo का समय बताइए। उदाहरण: कल शाम 6 बजे।</Speak>' +
      '</Gather>' +
      '<Speak language="hi-IN">हमें आपका जवाब नहीं मिला। धन्यवाद।</Speak>' +
      '</Response>';

    console.log("📤 Sending XML:", xml);

    res.set("Content-Type", "text/xml");
    return res.status(200).send(xml);

  } catch (error) {
    console.error("❌ answer webhook error:", error);
    res.set("Content-Type", "text/xml");
    return res.status(200).send('<?xml version="1.0" encoding="UTF-8"?><Response><Speak language="hi-IN">तकनीकी समस्या हुई है</Speak></Response>');
  }
});

/* -----------------------------------
   PROCESS SLOT
------------------------------------ */
router.post("/process-slot", async (req, res) => {
  try {
    console.log("🎤 Slot webhook body:", req.body);

    // Vobiz typically sends transcribed text in req.body.Speech
    const speechText =
      req.body.Speech ||
      req.body.speech ||
      req.body.input ||
      req.body.text ||
      "";

    console.log("🎤 Parent said:", speechText);

    if (!speechText.trim()) {
      res.set("Content-Type", "text/xml");
      return res.status(200).send(
        '<?xml version="1.0" encoding="UTF-8"?>' +
        '<Response>' +
        '  <Speak language="hi-IN">कृपया समय स्पष्ट रूप से बताएं। जैसे कल शाम 6 बजे।</Speak>' +
        '</Response>'
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
        '<?xml version="1.0" encoding="UTF-8"?>' +
        '<Response>' +
        '  <Speak language="hi-IN">आपका नंबर रिकॉर्ड में नहीं मिला।</Speak>' +
        '</Response>'
      );
    }

    console.log("✅ Demo booked:", updatedLead.phone);
    const formattedDate = formatDateHindi(demoDate);

    const xml = 
      '<?xml version="1.0" encoding="UTF-8"?>' +
      '<Response>' +
      '  <Speak language="hi-IN">धन्यवाद। आपका demo ' + formattedDate + ' को ' + demoTime + ' पर confirm हो गया है।</Speak>' +
      '</Response>';

    res.set("Content-Type", "text/xml");
    return res.status(200).send(xml);

  } catch (error) {
    console.error("❌ process-slot error:", error);
    res.set("Content-Type", "text/xml");
    return res.status(200).send(
      '<?xml version="1.0" encoding="UTF-8"?>' +
      '<Response>' +
      '  <Speak language="hi-IN">क्षमा करें। कुछ technical समस्या हुई है।</Speak>' +
      '</Response>'
    );
  }
});

module.exports = router;
