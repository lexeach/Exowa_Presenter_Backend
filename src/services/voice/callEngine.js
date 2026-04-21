const config = require("./callConfig");

/* TELEPHONY PROVIDERS */
const twilioProvider = require("../../providers/telephony/twilioProvider");
const vobiz = require("../../providers/telephony/vobizProvider");

class CallEngine {
  getTelephony() {
    switch (config.telephonyProvider) {
      case "vobiz":
        return vobiz;

      case "twilio":
        return twilioProvider;

      default:
        return vobiz;
    }
  }

  async initiateCall(lead) {
    try {
      console.log("☎️ CallEngine received:", lead);

      const phone =
        lead.referralPhone ||
        lead.phone;

      if (!phone) {
        throw new Error("Phone number missing");
      }

      const response =
        await this.getTelephony().call({
          phone,
          leadId: lead._id,
          name: lead.name,
          referredBy: lead.referredBy,
          sessionType: "realtime"
        });

      console.log("📞 Telephony response:", response);

      return response;

    } catch (error) {
      console.error("❌ CallEngine error:", error.message);
      throw error;
    }
  }
}

module.exports = new CallEngine();
