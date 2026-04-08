module.exports = {
  async generateVoice(
    text
  ) {
    console.log(
      "🎤 ElevenLabs voice"
    );

    return {
      audioUrl:
        "11labs-audio.mp3"
    };
  }
};