const axios = require("axios");

async function initiateCall({ phone, name }) {
  try {
    const url = "https://api.vobiz.ai/v1/Account/MA_56FCN1OB/Call/";

    const payload = {
      to: phone,
      answer_url: "https://exowa-presenter-backend.onrender.com/api/voice/answer",
      hangup_url: "https://exowa-presenter-backend.onrender.com/api/voice/realtime"
    };

    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Basic ${process.env.VOBIZ_AUTH}`,
        "Content-Type": "application/json"
      }
    });

    console.log("📞 Vobiz Call:", response.data);

    return {
      success: true,
      status: "CONNECTED",
      callId: response.data.request_uuid
    };

  } catch (error) {
    console.error("❌ CallEngine Error:", error.response?.data || error.message);

    return {
      success: false,
      status: "FAILED"
    };
  }
}

module.exports = { initiateCall };
