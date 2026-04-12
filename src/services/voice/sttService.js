class STTService {
  async transcribe(
    audioUrl
  ) {
    console.log(
      "🎙 Transcribing:",
      audioUrl
    );

    /* TEMP MOCK */
    return "haan kal sham 6 baje";
  }
}

module.exports =
  new STTService();