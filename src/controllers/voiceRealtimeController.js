const Lead = require("../models/Lead");

exports.realtimeVoiceReply = async (req, res) => {
  try {
    console.log("📩 REALTIME WEBHOOK:", req.body);

    const event = req.body.Event || "";
    const callStatus = req.body.CallStatus || "";

    const phone = req.body.To?.slice(-10);
    const callId =
      req.body.CallUUID ||
      req.body.RequestUUID;

    /* ===============================
       🛑 STOP AFTER CALL END
    =============================== */
    if (
      event === "Hangup" ||
      callStatus === "completed"
    ) {
      console.log("📴 Call ended");
      return res.status(200).send("OK");
    }

    /* ===============================
       SAVE CALL STATUS (OPTIONAL CRM)
    =============================== */
    if (phone) {
      const lead = await Lead.findOne({ phone });

      if (lead) {
        lead.lastEvent = event;
        lead.callStatus = callStatus;
        lead.lastCallUUID = callId;
        lead.updatedAt = new Date();

        await lead.save();

        console.log("✅ Realtime status updated");
      }
    }

    /* ===============================
       🚫 NO AI HERE
    =============================== */
    return res.status(200).send("OK");

  } catch (error) {
    console.error("❌ realtime error:", error.message);
    return res.status(200).send("OK");
  }
};
