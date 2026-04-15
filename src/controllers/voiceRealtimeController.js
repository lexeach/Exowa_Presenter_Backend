const Lead = require("../models/Lead");
const { getAIReply } = require("../services/aiReplyService");

exports.realtimeVoiceReply = async (req, res) => {
  try {
    const phone = req.body.To?.slice(-10);

    const lead = await Lead.findOne({
      referralPhone: phone
    });

    const transcript = req.body.transcript || "";

    const reply = await getAIReply({
      transcript,
      lead,
      stage: "intro"
    });

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
    return res.send(xml);
  } catch (error) {
    console.error(error);
    return res.status(500).send("error");
  }
};
