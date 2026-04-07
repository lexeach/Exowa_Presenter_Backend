class ElevenLabsProvider {
  async speak(text) {
    console.log(
      "🎤 ElevenLabs TTS:",
      text
    );

    // actual ElevenLabs API call
    return {
      audioUrl:
        "elevenlabs-audio-url"
    };
  }

  async transcribe(audio) {
    console.log(
      "🎧 ElevenLabs STT"
    );

    return {
      text: "recognized text"
    };
  }
}

module.exports =
  new ElevenLabsProvider();