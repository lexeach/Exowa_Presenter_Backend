const config =
  require("./voiceConfig");

const sarvam =
  require("./providers/sarvamProvider");

const elevenLabs =
  require("./providers/elevenLabsProvider");

class VoiceEngine {
  getProvider() {
    if (
      config.provider ===
      "elevenlabs"
    ) {
      return elevenLabs;
    }

    return sarvam;
  }

  async speak(text) {
    return this.getProvider().speak(
      text
    );
  }

  async transcribe(audio) {
    return this.getProvider().transcribe(
      audio
    );
  }
}

module.exports =
  new VoiceEngine();