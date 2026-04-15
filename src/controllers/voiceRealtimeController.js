const Lead = require("../models/Lead");

async function realtimeVoiceReply(req, res) {
  try {
    console.log(
      "🎤 Realtime voice request:",
      req.body
    );

    const phone =
      req.body.To?.replace("91", "") || "";

    let lead = null;

    if (phone) {
      lead = await Lead.findOne({
        $or: [
          { phone },
          { referralPhone: phone }
        ]
      });
    }

    const name = lead?.name || "जी";

    const reply = `नमस्ते ${name},
मैं Exowa से मीरा बोल रही हूँ।
क्या अभी 2 मिनट बात करने का सही समय है?`;

    console.log(
      "🤖 Realtime voice reply:",
      reply
    );

    const xml = `
<Response>
   <Speak language="hi-IN">
      ${reply}
   </Speak>

   <Record
      action="${process.env.BACKEND_BASE_URL}/api/vobiz/process-slot"
      method="POST"
      maxLength="8"
      playBeep="true"
   />
</Response>
    `;

    res.set("Content-Type", "text/xml");
    return res.status(200).send(xml);
  } catch (error) {
    console.error(
      "❌ realtimeVoiceReply error:",
      error
    );

    const errorXml = `
<Response>
   <Speak>
      तकनीकी समस्या हुई है।
   </Speak>
   <Hangup/>
</Response>
    `;

    res.set("Content-Type", "text/xml");
    return res.status(500).send(errorXml);
  }
}

module.exports = {
  realtimeVoiceReply
};
