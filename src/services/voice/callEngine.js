const axios = require("axios");

class CallEngine {
  constructor() {
    this.provider = "vobiz";
    this.baseURL = process.env.BACKEND_BASE_URL;
  }

  /* =========================================
     MAIN CALL FUNCTION
  ========================================= */
  async initiateCall({ phone, leadId, name }) {
    try {
      console.log("☎️ Starting realtime call:", {
        phone,
        leadId,
        name
      });

      const answerUrl = `${this.baseURL}/api/voice/answer`;
      const hangupUrl = `${this.baseURL}/api/voice/realtime`;

      console.log("📡 Using Answer URL:", answerUrl);
      console.log("📡 Using Hangup URL:", hangupUrl);

      const response = await axios.post(
        "https://api.vobiz.ai/call/",
        {
          from: process.env.VOBIZ_CALLER_ID,
          to: `91${phone}`,
          answer_url: answerUrl,
          hangup_url: hangupUrl
        },
        {
          headers: {
            "X-Auth-ID": process.env.VOBIZ_AUTH_ID,
            "X-Auth-Token": process.env.VOBIZ_AUTH_TOKEN,
            "Content-Type": "application/json"
          }
        }
      );

      console.log("📞 Vobiz Call:", response.data);

      return {
        success: true,
        provider: this.provider,
        status: "CONNECTED",
        callId: response.data.request_uuid
      };

    } catch (error) {
      console.error("❌ CallEngine Error:", error.response?.data || error.message);

      return {
        success: false,
        provider: this.provider,
        status: "FAILED"
      };
    }
  }
}

/* =========================================
   EXPORT INSTANCE (VERY IMPORTANT)
========================================= */
module.exports = new CallEngine();
