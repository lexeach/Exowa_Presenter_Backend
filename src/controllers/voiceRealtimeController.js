const Lead = require("../models/Lead");

exports.realtimeVoiceReply = async (req, res) => {
  try {
    console.log("📩 /api/voice/realtime hit", req.body);

    const event = req.body.Event || "";
    const callStatus = req.body.CallStatus || "";
    const phone = req.body.To?.slice(-10);
    const callId =
      req.body.CallUUID ||
      req.body.RequestUUID;

    console.log("📞 Event:", event);
    console.log("📞 Status:", callStatus);
    console.log("📞 Phone:", phone);

    const lead = await Lead.findOne({
      phone
    });

    if (lead) {
      lead.lastEvent = event;
      lead.callStatus = callStatus;
      lead.lastCallUUID = callId;
      lead.updatedAt = new Date();

      await lead.save();

      console.log(
        "✅ Realtime call status updated"
      );
    } else {
      console.log(
        "⚠️ Lead not found for realtime webhook"
      );
    }

    return res.status(200).send("OK");
  } catch (error) {
    console.error(
      "❌ realtimeVoiceReply Error:",
      error.message
    );

    return res.status(200).send("OK");
  }
};
