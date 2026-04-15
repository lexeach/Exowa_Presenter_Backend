const express = require("express");
const router = express.Router();

const axios = require("axios");
const Lead = require("../models/Lead");
const { getAIReply } = require("../services/ai/voiceConversationService");

/* -----------------------------------
   1. FIRST CALL ANSWER ROUTE
----------------------------------- */
router.post("/answer", async (req, res) => {
  try {
    console.log("📞 Vobiz answer route hit", req.body);

    const phone =
      req.body.To?.replace("91", "") || "";

    const lead = await Lead.findOne({
      $or: [
        { phone },
        { referralPhone: phone }
      ]
    });

    const name = lead?.name || "जी";
    const referredBy =
      lead?.referredBy || "आपके परिचित";

    const introText = `
      नमस्ते ${name},
      मैं Exowa से मीरा बोल रही हूँ।
      आपका नंबर हमें ${referredBy} जी से मिला है।
      क्या अभी 2 मिनट बात करने का सही समय है?
    `;

    const xml = `
<Response>
  <Speak language="hi-IN">
    ${introText}
  </Speak>

  <Record
    action="${process.env.BACKEND_BASE_URL}/api/vobiz/process-slot"
    method="POST"
    maxLength="8"
    playBeep="true"
  />
</Response>
    `;

    res.type("text/xml");
    return res.send(xml);
  } catch (error) {
    console.error("❌ answer route error:", error);

    return res.send(`
<Response>
   <Speak>क्षमा करें, कुछ तकनीकी समस्या हुई है।</Speak>
   <Hangup/>
</Response>
    `);
  }
});

/* -----------------------------------
   2. CONTINUOUS CONVERSATION LOOP
----------------------------------- */
router.post("/process-slot", async (req, res) => {
  try {
    console.log("🎤 process-slot hit", req.body);

    const audioUrl =
      req.body.RecordUrl ||
      req.body.RecordFile;

    console.log("🎧 Audio URL:", audioUrl);

    let transcript = "";

    if (audioUrl) {
      const audioResponse =
        await axios.get(audioUrl, {
          responseType: "arraybuffer",
          auth: {
            username:
              process.env.VOBIZ_AUTH_ID,
            password:
              process.env.VOBIZ_AUTH_TOKEN
          }
        });

      console.log(
        "✅ Audio downloaded from Vobiz"
      );

      // STT logic yahan call karo
      // Example:
      transcript =
        "हाँ अभी बात कर सकते हैं";

      console.log(
        "📝 Transcript:",
        transcript
      );
    }

    const aiReply =
      await getAIReply(transcript);

    console.log(
      "🤖 AI Reply:",
      aiReply
    );

    const shouldEnd =
      aiReply.includes("demo booked") ||
      aiReply.includes("धन्यवाद");

    const xml = shouldEnd
      ? `
<Response>
   <Speak language="hi-IN">
      ${aiReply}
   </Speak>
   <Hangup/>
</Response>
      `
      : `
<Response>
   <Speak language="hi-IN">
      ${aiReply}
   </Speak>

   <Record
      action="${process.env.BACKEND_BASE_URL}/api/vobiz/process-slot"
      method="POST"
      maxLength="8"
      playBeep="true"
   />
</Response>
      `;

    res.type("text/xml");
    return res.send(xml);
  } catch (error) {
    console.error(
      "❌ process-slot error:",
      error
    );

    return res.send(`
<Response>
   <Speak>
      तकनीकी समस्या हुई है।
   </Speak>
   <Hangup/>
</Response>
    `);
  }
});

module.exports = router;
