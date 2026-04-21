// src/voice/callEngine.js

const axios = require("axios");

class CallEngine {
  constructor() {
    this.provider = "vobiz";
    this.baseURL = process.env.BACKEND_BASE_URL;
  }

  /**
   * 📞 Start Realtime AI Call
   */
  async startCall(lead) {
    try {
      console.log("☎️ Starting realtime call:", {
        phone: lead.referralPhone,
        leadId: lead._id,
        name: lead.name,
        sessionType: "realtime"
      });

      const answerUrl = `${this.baseURL}/api/voice/answer`;
      const hangupUrl = `${this.baseURL}/api/voice/realtime`;

      console.log("📡 Using Answer URL:", answerUrl);
      console.log("📡 Using Hangup URL:", hangupUrl);

      const payload = {
        from: process.env.VOBIZ_CALLER_ID,
        to: `91${lead.referralPhone}`,
        answer_url: answerUrl,
        hangup_url: hangupUrl,
        method: "POST"
      };

      const response = await axios.post(
        "https://api.vobiz.ai/call/",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.VOBIZ_API_KEY}`
          },
          timeout: 10000
        }
      );

      console.log("📞 Vobiz Call:", response.data);

      return {
        success: true,
        provider: "vobiz",
        status: "CONNECTED",
        callId:
          response.data?.request_uuid ||
          response.data?.api_id
      };

    } catch (error) {
      console.error(
        "❌ CallEngine Error:",
        error.response?.data || error.message
      );

      return {
        success: false,
        provider: "vobiz",
        status: "FAILED"
      };
    }
  }
}

module.exports = new CallEngine();
