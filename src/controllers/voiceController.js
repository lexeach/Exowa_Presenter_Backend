const xmlResponse = require("../utils/xmlResponse");
const prompts = require("../services/speech/ttsTemplates");
const { transcribe } = require("../services/speech/sttService");
const { detectIntent } = require("../services/ai/intentService");
const { saveDemoSlot } = require("../services/booking/slotService");

exports.answerCall = async (req, res) => {
  const xml = xmlResponse(`
    ${prompts.welcome}

    <Record
      action="${process.env.BACKEND_BASE_URL}/api/vobiz/process-slot"
      method="POST"
      maxLength="8"
      playBeep="true"
    />
  `);

  res.type("text/xml");
  res.send(xml);
};

exports.processSlot = async (req, res) => {
  try {
    const recordingUrl = req.body.RecordingUrl;
    const phone = req.body.To;

    const transcript = await transcribe(recordingUrl);

    console.log("📝 Transcript:", transcript);

    const result = detectIntent(transcript);

    if (result.intent === "BOOK_SLOT") {
      const slot = await saveDemoSlot(
        phone,
        result.slotText
      );

      const xml = xmlResponse(
        prompts.confirm(slot.toLocaleString())
      );

      return res.type("text/xml").send(xml);
    }

    return res.type("text/xml").send(
      xmlResponse(prompts.retry)
    );

  } catch (error) {
    console.error(error);

    return res.type("text/xml").send(
      xmlResponse(prompts.retry)
    );
  }
};