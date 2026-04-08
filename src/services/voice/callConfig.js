module.exports = {
  telephonyProvider:
    process.env
      .TELEPHONY_PROVIDER ||
    "twilio",

  voiceProvider:
    process.env
      .VOICE_PROVIDER ||
    "sarvam"
};