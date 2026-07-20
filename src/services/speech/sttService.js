
const axios = require("axios");

async function transcribe(recordingUrl) {
  try {
    if (!recordingUrl) {
      console.log("⚠️ Missing recording URL");
      return "";
    }

    const response = await axios.post(
      process.env.SARVAM_STT_URL,
      {
        file_url: recordingUrl,
        language_code: "hi-IN",
        model: "saarika:v2"
      },
      {
        headers: {
          "api-subscription-key": process.env.SARVAM_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    return (
      response.data?.transcript ||
      response.data?.text ||
      ""
    );
  } catch (error) {
    console.error(
      "❌ Sarvam STT Error:",
      error.response?.data || error.message
    );

    return "";
  }
}

module.exports = {
  transcribe
};
