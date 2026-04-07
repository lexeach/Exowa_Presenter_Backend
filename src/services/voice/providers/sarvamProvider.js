class SarvamProvider {
  async speak(text) {
    console.log(
      "🎤 Sarvam TTS:",
      text
    );

    // actual Sarvam API call
    return {
      audioUrl:
        "sarvam-audio-url"
    };
  }

  async transcribe(audio) {
    console.log(
      "🎧 Sarvam STT"
    );

    return {
      text: "recognized text"
    };
  }
}

module.exports =
  new SarvamProvider();