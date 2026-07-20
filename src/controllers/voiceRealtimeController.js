
const { transcribe } = require("../services/speech/sttService");
const { getAIReply } = require("../services/ai/voiceConversationService");

async function processSlot(req, res) {

  console.log("🎤 process-slot");

  console.log("BODY KEYS:", Object.keys(req.body));

  const recordingUrl =
    req.body.RecordingUrl ||
    req.body.recording_url ||
    req.body.audio_url;

  let userSpeech =
    req.body.Speech ||
    req.body.speech ||
    req.body.transcript ||
    "";

  // If telephony provider sends recording instead of transcript
  if (!userSpeech && recordingUrl) {
    userSpeech = await transcribe(recordingUrl);
  }

  console.log("🧠 User speech:", userSpeech);

  const aiReply = await getAIReply(userSpeech);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Speak>${aiReply}</Speak>

  <Gather
      inputType="speech"
      method="POST"
      timeout="10"
      action="/api/voice/process-slot">
  </Gather>
</Response>`;

  res.set("Content-Type", "text/xml");
  res.send(xml);
}

module.exports = {
  processSlot
};
