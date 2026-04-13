const express = require("express");
const router = express.Router();
const Lead = require("../models/Lead");

/* ANSWER WEBHOOK */
router.post(
  "/answer",
  (req, res) => {
    const xml = `
<Response>
  <Speak language="hi-IN" voice="WOMAN">
    नमस्ते।
    मैं Exowa से बोल रही हूँ।
    क्या आप अपने बच्चे के लिए demo schedule करना चाहेंगे?
  </Speak>

  <Gather
    action="${process.env.BACKEND_BASE_URL}/api/vobiz/process-slot"
    method="POST"
    inputType="speech"
  >
    <Speak language="hi-IN">
      कृपया समय बोलकर बताएं।
    </Speak>
  </Gather>
</Response>
`;

    res.set(
      "Content-Type",
      "text/xml"
    );

    res.send(xml);
  }
);

/* PROCESS SLOT */
router.post(
  "/process-slot",
  async (req, res) => {
    try {
      const speechText =
        req.body.Speech ||
        "";

      console.log(
        "🎤 Parent said:",
        speechText
      );

      let demoTime =
        "6:00 PM";

      if (
        speechText.includes(
          "11"
        )
      ) {
        demoTime =
          "11:00 AM";
      }

      await Lead.findOneAndUpdate(
        {
          phone:
            req.body.To?.replace(
              "+91",
              ""
            )
        },
        {
          status:
            "DEMO_BOOKED",
          demoDate:
            new Date(),
          demoTime
        }
      );

      const xml = `
<Response>
  <Speak language="hi-IN">
    धन्यवाद।
    आपका demo ${demoTime} पर confirm हो गया है।
  </Speak>
</Response>
`;

      res.set(
        "Content-Type",
        "text/xml"
      );

      res.send(xml);
    } catch (error) {
      console.error(
        error
      );

      res.sendStatus(500);
    }
  }
);

module.exports = router;
