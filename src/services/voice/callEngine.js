const config = require("./callConfig");

/* TELEPHONY PROVIDERS */
const twilioProvider = require("../../providers/telephony/twilioProvider');
const exotel = require(("../../providers/telephony/exotelProvider");
const vobiz = require(("../../providers/telephony/vobizProvider");

/* VOICE PROVIDERS */
const sarvam = require("./providers/voice/sarvamProvider");
const elevenLabs = require("./providers/voice/elevenLabsProvider");

class CallEngine {
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

  async initiateCall(
    lead
  ) {
    try {
      console.log(
        "☎️ CallEngine received:",
        lead
      );

      const phone =
        lead.referralPhone ||
        lead.phone;

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
            phone,
            message:
              voice.audioUrl,
            leadId:
              lead._id
          });

      console.log(
        "📞 Telephony response:",
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
