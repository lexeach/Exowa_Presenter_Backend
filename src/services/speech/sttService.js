const axios = require("axios");

async function transcribe(recordingUrl) {
  try {
    const response = await axios.post(
      process.env.SARVAM_STT_URL,
      {
        audio_url: recordingUrl,
        language: "hi-IN"
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.SARVAM_API_KEY}`
        }
      }
    );

    return response.data.transcript || "";
  } catch (error) {
    console.error("❌ STT Error:", error.message);
    return "";
  }
}

module.exports = { transcribe };