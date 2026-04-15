const Lead = require("../models/Lead");

exports.realtimeVoiceReply = async (req, res) => {
  try {
    console.log("🎤 Realtime voice request:", req.body);

    const phone =
      req.body.To?.replace(/^91/, "") ||
      req.body.phone;

    let lead = null;

    if (phone) {
      lead = await Lead.findOne({
        phone
      });
    }

    const name = lead?.name || "जी";
    const referredBy =
      lead?.referredBy || "आपके परिचित";

    const reply = `नमस्ते ${name},
मैं Exowa से मीरा बोल रही हूँ।
आपका नंबर हमें ${referredBy} जी से मिला है।
उन्होंने सुझाव दिया कि मैं आपसे बात करके Exowa के बारे में बताऊँ।
क्या अभी 2 मिनट बात करने का सही समय है?`;

    console.log("🤖 Realtime voice reply:", reply);

    res.set("Content-Type", "text/xml");

    return res.status(200).send(`
<Response>
  <Speak language="hi-IN">
    ${reply}
  </Speak>
</Response>
`);
  } catch (error) {
    console.error("❌ realtime error:", error);

    res.set("Content-Type", "text/xml");

    return res.status(200).send(`
<Response>
  <Speak language="hi-IN">
    माफ कीजिए, तकनीकी समस्या आ गई है।
  </Speak>
</Response>
`);
  }
};
