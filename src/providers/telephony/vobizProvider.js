const axios = require("axios");

module.exports = {
  async call(data) {
    try {
      console.log(
        "☎️ Starting realtime call:",
        data
      );

      const phone =
        data.phone ||
        data.referralPhone;

      if (!phone) {
        throw new Error(
          "Phone number missing"
        );
      }

      const response =
        await axios.post(
          `https://api.vobiz.ai/api/v1/Account/${process.env.VOBIZ_AUTH_ID}/Call/`,
          {
            from:
              process.env
                .VOBIZ_SOURCE_NUMBER,
            to: `+91${phone}`,
            answer_url: `${process.env.BACKEND_BASE_URL}/api/voice/realtime`,
            answer_method: "POST"
          },
          {
            headers: {
              "X-Auth-ID":
                process.env
                  .VOBIZ_AUTH_ID,
              "X-Auth-Token":
                process.env
                  .VOBIZ_AUTH_TOKEN,
              "Content-Type":
                "application/json"
            }
          }
        );

      console.log(
        "📞 Vobiz Call:",
        response.data
      );

      return {
        success: true,
        provider: "vobiz",
        status: "CONNECTED",
        callId:
          response.data
            ?.request_uuid ||
          Date.now()
      };
    } catch (error) {
      console.error(
        "❌ Vobiz call failed:",
        error.response?.data ||
          error.message
      );

      return {
        success: false,
        provider: "vobiz",
        status: "NO_RESPONSE"
      };
    }
  }
};
