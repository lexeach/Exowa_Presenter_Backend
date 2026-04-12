const config =
  require("./callConfig");

const twilio = 
  require("../../providers/telephony/twilioProvider");

const exotel =
  require("../../providers/telephony/exotelProvider");

const sarvam =
  require("../../providers/voice/sarvamProvider");
const vobiz = require('../../routes/vobizCallRoutes');

return config.telephonyProvider ===
  "vobiz"
  ? vobiz
  : twilio;

const elevenLabs =
  require("../../providers/voice/elevenLabsProvider");

class CallEngine {
  getTelephony() {
    return config.telephonyProvider ===
      "exotel"
      ? exotel
      : twilio;
  }

  getVoice() {
    return config.voiceProvider ===
      "elevenLabs"
      ? elevenLabs
      : sarvam;
  }

  async initiateCall(
    phone
  ) {
    const voice =
      await this
        .getVoice()
        .generateVoice(
          "Namaste, main Exowa se bol raha hoon."
        );

    return await this
      .getTelephony()
      .call({
        phone,
        message:
          voice.audioUrl
      });
  }
}

module.exports =
  new CallEngine();
