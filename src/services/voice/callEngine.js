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
  /* -------------------------
     TELEPHONY SWITCH
  ------------------------- */
  getTelephony() {
    switch (
      config.telephonyProvider
    ) {
      case "vobiz":
        return vobiz;

      case "exotel":
        return exotel;

      case "twilio":
        return twilio;

      default:
        return vobiz;
    }
  }

  /* -------------------------
     VOICE SWITCH
  ------------------------- */
  getVoice() {
    switch (
      config.voiceProvider
    ) {
      case "elevenLabs":
        return elevenLabs;

      case "sarvam":
      default:
        return sarvam;
    }
  }

  /* -------------------------
     MAIN CALL METHOD
  ------------------------- */
  async initiateCall(
    lead
  ) {
    try {
      console.log(
        "☎️ Initiating call:",
        lead.phone
      );

      const voice =
        await this
          .getVoice()
          .generateVoice(
            `Namaste ${lead.name}, main Exowa se bol raha hoon.`
          );

      const response =
        await this
          .getTelephony()
          .call({
            phone:
              lead.phone,
            name:
              lead.name,
            message:
              voice.audioUrl
          });

      console.log(
        "📞 Call response:",
        response
      );

      return response;
    } catch (error) {
      console.error(
        "❌ CallEngine error:",
        error
      );

      throw error;
    }
  }
}

module.exports =
  new CallEngine();
