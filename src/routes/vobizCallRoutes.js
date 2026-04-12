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
    sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6,
    "रविवार": 0, "सोमवार": 1, "मंगलवार": 2, "बुधवार": 3, "गुरुवार": 4, "शुक्रवार": 5, "शनिवार": 6
  };

  let demoDate = new Date();
  let demoTime = "6:00 PM";

  if (text.includes("2") || text.includes("दो") || text.includes("dopahar") || text.includes("दोपहर")) {
    demoTime = "2:00 PM";
  } else if (text.includes("6") || text.includes("छह") || text.includes("shaam") || text.includes("शाम")) {
    demoTime = "6:00 PM";
  } else if (text.includes("11") || text.includes("ग्यारह") || text.includes("सुबह")) {
    demoTime = "11:00 AM";
  }

  if (text.includes("kal") || text.includes("tomorrow") || text.includes("कल")) {
    demoDate.setDate(demoDate.getDate() + 1);
  }

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

  const dateMatch = text.match(/(\d{1,2})\s*(tarikh|date|तारीख)/);
  if (dateMatch) {
    const dayNumber = parseInt(dateMatch[1]);
    if (dayNumber >= 1 && dayNumber <= 31) demoDate.setDate(dayNumber);
  }

  return { demoDate, demoTime };
}

/* -----------------------------------
   ANSWER WEBHOOK
------------------------------------ */
router.post("/answer", (req, res) => {
  try {
    console.log("📞 Vobiz answer webhook:", req.body);

    if (req.body.Event === "Hangup") {
      res.set("Content-Type", "text/xml");
      return res.status(200).send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
    }

    const processUrl = `${process.env.BACKEND_BASE_URL}/api/vobiz/process-slot`;

    // ⚡ FIX: Standardized to 'Gather' which is the common Vobiz/Plivo standard.
    // Ensure XML starts exactly at the beginning of the string (no spaces).
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Gather action="${processUrl}" method="POST" inputType="speech" language="hi-IN" timeout="8">
        <Speak language="hi-IN">
            नमस्ते। मैं Exowa से बोल रही हूँ। कृपया डेमो का समय बताइए। उदाहरण के लिए, कल शाम छह बजे।
        </Speak>
    </Gather>
    <Speak language="hi-IN">हमें आपका जवाब नहीं मिला। धन्यवाद।</Speak>
</Response>`.trim();

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

    // Vobiz can send speech in different fields depending on config
    const speechText = req.body.Speech || req.body.speech || req.body.Input || "";
    console.log("🎤 Parent said:", speechText);

    if (!speechText.trim()) {
      res.set("Content-Type", "text/xml");
      return res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Speak language="hi-IN">कृपया समय स्पष्ट रूप से बताएं। जैसे कल शाम छह बजे।</Speak>
</Response>`);
    }

    const { demoDate, demoTime } = parseDateAndTime(speechText);
    const phone = normalizePhone(req.body.To || "");

    const updatedLead = await Lead.findOneAndUpdate(
      { phone },
      { status: "DEMO_BOOKED", demoDate, demoTime },
      { new: true }
    );

    if (!updatedLead) {
      console.log("❌ Lead not found for phone:", phone);
      res.set("Content-Type", "text/xml");
      return res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Speak language="hi-IN">आपका नंबर रिकॉर्ड में नहीं मिला। धन्यवाद।</Speak>
</Response>`);
    }

    console.log("✅ Demo booked:", updatedLead.phone);
    const formattedDate = formatDateHindi(demoDate);

    const finalXml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Speak language="hi-IN">
        धन्यवाद। आपका डेमो ${formattedDate} को ${demoTime} पर कन्फर्म हो गया है।
    </Speak>
</Response>`.trim();

    res.set("Content-Type", "text/xml");
    return res.status(200).send(finalXml);

  } catch (error) {
    console.error("❌ process-slot error:", error);
    res.set("Content-Type", "text/xml");
    return res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Speak language="hi-IN">क्षमा करें। कुछ तकनीकी समस्या हुई है।</Speak>
</Response>`);
  }
});

module.exports = router;
