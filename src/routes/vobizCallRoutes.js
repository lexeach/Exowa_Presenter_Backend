const express = require("express");
const router = express.Router();
const Lead = require("../models/Lead");

/* -----------------------------------
   HELPER FUNCTIONS
------------------------------------ */
function normalizePhone(phone = "") {
  return phone.replace(/^(\+91|91)/, "").trim();
}

function parseDateAndTime(speechText = "") {
  const text = speechText.toLowerCase();

  const weekdays = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,

    sundaye: 0,
    mondaye: 1,
    fridaye: 5,

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
    text.includes("dopahar 2")
  ) {
    demoTime = "2:00 PM";
  }

  if (
    text.includes("6") ||
    text.includes("छह") ||
    text.includes("shaam 6")
  ) {
    demoTime = "6:00 PM";
  }

  if (
    text.includes("11") ||
    text.includes("ग्यारह")
  ) {
    demoTime = "11:00 AM";
  }

  /* -------- TOMORROW -------- */
  if (
    text.includes("kal") ||
    text.includes("tomorrow") ||
    text.includes("कल")
  ) {
    demoDate.setDate(
      demoDate.getDate() + 1
    );
  }

  /* -------- WEEKDAY -------- */
  for (const day in weekdays) {
    if (text.includes(day)) {
      const today =
        demoDate.getDay();

      const targetDay =
        weekdays[day];

      let diff =
        targetDay - today;

      if (diff <= 0) {
        diff += 7;
      }

      demoDate.setDate(
        demoDate.getDate() + diff
      );
    }
  }

  /* -------- DATE NUMBER -------- */
  const dateMatch =
    text.match(/(\d{1,2})\s*(tarikh|date|तारीख)/);

  if (dateMatch) {
    const dayNumber =
      parseInt(dateMatch[1]);

    demoDate.setDate(dayNumber);
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
  console.log("📞 Vobiz answer webhook:", req.body);

  const processUrl =
    `${process.env.BACKEND_BASE_URL}/api/vobiz/process-slot`;

  const xml = `
<Response>
  <Speak language="hi-IN" voice="WOMAN">
    नमस्ते।
    मैं Exowa से बोल रही हूँ।
    क्या आप अपने बच्चे के लिए demo schedule करना चाहेंगे?
    कृपया समय बोलकर बताएं।
  </Speak>

  <Gather
    action="${processUrl}"
    method="POST"
    inputType="speech"
    timeout="8"
    language="hi-IN"
  >
    <Speak language="hi-IN">
      जैसे आप कह सकते हैं:
      कल शाम 6 बजे
      या
      कल सुबह 11 बजे
    </Speak>
  </Gather>

  <Speak language="hi-IN">
    हमें आपकी आवाज़ प्राप्त नहीं हुई।
    कृपया बाद में पुनः प्रयास करें।
  </Speak>
</Response>
`;

  res.set("Content-Type", "application/xml");
  return res.send(xml);
});

/* -----------------------------------
   PROCESS SLOT
------------------------------------ */
router.post(
  "/process-slot",
  async (req, res) => {
    try {
      console.log(
        "🎤 Slot webhook body:",
        req.body
      );

      const speechText =
        req.body.Speech ||
        req.body.speech ||
        "";

      console.log(
        "🎤 Parent said:",
        speechText
      );

      if (!speechText.trim()) {
        res.set(
          "Content-Type",
          "application/xml"
        );

        return res.send(`
<Response>
  <Speak language="hi-IN">
    कृपया समय स्पष्ट रूप से बताएं।
  </Speak>
</Response>
`);
      }

      const {
        demoDate,
        demoTime
      } = parseDateAndTime(
        speechText
      );

      const phone = normalizePhone(
        req.body.To || ""
      );

      console.log(
        "📱 Lead phone:",
        phone
      );

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

      console.log(
        "✅ Demo booked:",
        updatedLead?.phone
      );

      const xml = `
<Response>
  <Speak language="hi-IN">
    धन्यवाद।
    आपका demo ${demoDate.toDateString()} को ${demoTime} पर confirm हो गया है।
  </Speak>
</Response>
`;

      res.set(
        "Content-Type",
        "application/xml"
      );

      return res.send(xml);

    } catch (error) {
      console.error(
        "❌ process-slot error:",
        error
      );

      res.set(
        "Content-Type",
        "application/xml"
      );

      return res.send(`
<Response>
  <Speak language="hi-IN">
    क्षमा करें।
    कुछ technical समस्या हुई है।
  </Speak>
</Response>
`);
    }
  }
);
        res.set(
          "Content-Type",
          "application/xml"
        );

        return res.send(retryXml);
      }

      const phone = normalizePhone(
        req.body.To || ""
      );

      console.log(
        "📱 Lead phone:",
        phone
      );

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
      console.log(
        "✅ Demo booked:",
        updatedLead?.phone
      );

     const xml = `
<Response>
  <Speak language="hi-IN">
    धन्यवाद।
    आपका demo ${demoDate.toDateString()} को ${demoTime} पर confirm हो गया है।
  </Speak>
</Response>
`;

      res.set(
        "Content-Type",
        "application/xml"
      );

      return res.send(xml);

    } catch (error) {
      console.error(
        "❌ process-slot error:",
        error
      );

      res.set(
        "Content-Type",
        "application/xml"
      );

      return res.send(`
<Response>
  <Speak language="hi-IN">
    क्षमा करें।
    कुछ technical समस्या हुई है।
  </Speak>
</Response>
`);
    }
  }
);

module.exports = router;
