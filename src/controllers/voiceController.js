const Lead = require("../models/Lead");
const parseHindiDateTime = require("../utils/timeParser");
const axios = require("axios");
const FormData = require("form-data");

/* =========================================
   1. FIRST CALL ANSWER XML
========================================= */
exports.answerCall = async (req, res) => {
  try {
    console.log("📞 Vobiz answer route hit", req.body);

    res.set("Content-Type", "text/xml");

    return res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Speak language="hi-IN">
    नमस्ते। मैं Exowa से बोल रही हूँ।
    कृपया demo का समय बताइए।
    उदाहरण: कल शाम 6 बजे।
  </Speak>

  <Record
    action="https://exowa-presenter-backend.onrender.com/api/vobiz/process-slot"
    method="POST"
    maxLength="12"
    playBeep="true"
    timeout="8"
  />
</Response>`);
  } catch (error) {
    console.error("❌ answerCall Error:", error.message);

    res.set("Content-Type", "text/xml");

    return res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Speak language="hi-IN">
    माफ कीजिए, अभी सिस्टम उपलब्ध नहीं है।
  </Speak>
</Response>`);
  }
};

/* =========================================
   2. PROCESS USER SPEECH
========================================= */
exports.processSlot = async (req, res) => {
  try {
    console.log("🎤 process-slot hit", req.body);

    const phone = req.body.To?.slice(-10);

    const callId =
      req.body.CallUUID ||
      req.body.RequestUUID;

    console.log("📞 Phone:", phone);
    console.log("📞 Call UUID:", callId);

    const audioUrl =
      req.body.RecordUrl || req.body.RecordFile;

    if (!audioUrl) {
      throw new Error("Audio URL missing");
    }

    const lead = await Lead.findOne({ phone });

    if (!lead) {
      throw new Error("Lead not found");
    }

    // ==========================
    // FIXED STAGE MEMORY
    // ==========================
    let stage =
      (lead.callSessions &&
        lead.callSessions[callId]) ||
      lead.conversationStage ||
      "intro";

    console.log("📍 Current stage:", stage);

    // ==========================
    // AUDIO FETCH
    // ==========================
    const audioResponse = await axios.get(audioUrl, {
      responseType: "arraybuffer",
      headers: {
        "X-Auth-ID": process.env.VOBIZ_AUTH_ID,
        "X-Auth-Token":
          process.env.VOBIZ_AUTH_TOKEN
      }
    });

    const form = new FormData();

    form.append(
      "file",
      Buffer.from(audioResponse.data),
      {
        filename: "recording.mp3",
        contentType: "audio/mpeg"
      }
    );

    form.append("language_code", "hi-IN");

    const sttResponse = await axios.post(
      "https://api.sarvam.ai/speech-to-text",
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${process.env.SARVAM_API_KEY}`
        }
      }
    );

    const transcript =
      sttResponse.data?.transcript || "";

    console.log("📝 Transcript:", transcript);

    let replyText = "";
    let nextStage = stage;

    const normalized =
      transcript.toLowerCase().trim();

    // ==========================
    // SMART STAGE FLOW
    // ==========================
    if (stage === "intro") {
      replyText =
        "बहुत बढ़िया। क्या आप demo देखना चाहेंगे?";

      nextStage = "interest";
    }

    else if (stage === "interest") {
      if (
        normalized.includes("हाँ") ||
        normalized.includes("हां") ||
        normalized.includes("जी") ||
        normalized.includes("बिल्कुल") ||
        normalized.includes("हाँ बिल्कुल") ||
        normalized.includes("demo") ||
        normalized.includes("डेमो")
      ) {
        replyText =
          "कृपया demo का समय बताइए, जैसे आज शाम 6 बजे।";

        nextStage = "demo_slot";
      } else {
        replyText =
          "ठीक है। आप चाहें तो बाद में demo schedule कर सकते हैं।";

        nextStage = "completed";
      }
    }

    else if (stage === "demo_slot") {
      const parsedSlot =
        parseHindiDateTime(transcript);

      console.log("📅 Parsed Slot:", parsedSlot);

      if (!parsedSlot) {
        replyText =
          "कृपया समय दोबारा बताइए, जैसे 21 तारीख दोपहर 3 बजे।";

        nextStage = "demo_slot";
      } else {
        lead.demoDate =
          parsedSlot.date;

        lead.demoTime =
          parsedSlot.formatted;

        replyText =
          `बहुत बढ़िया। आपका demo ${parsedSlot.formatted} के लिए successfully book कर दिया गया है। हमारी टीम उसी समय आपसे संपर्क करेगी।`;

        nextStage = "completed";
      }
    }

    else {
      replyText =
        "धन्यवाद। हमारी टीम आपसे संपर्क करेगी।";

      nextStage = "completed";
    }

    // ==========================
    // IMPORTANT MONGOOSE FIX
    // ==========================
    if (!lead.callSessions) {
      lead.callSessions = {};
    }

    lead.callSessions[callId] = nextStage;

    // VERY IMPORTANT
    lead.markModified("callSessions");

    lead.conversationStage = nextStage;
    lead.transcript = transcript;
    lead.updatedAt = new Date();

    await lead.save();

    console.log("✅ Lead updated");
    console.log("➡️ Next stage:", nextStage);
    console.log("🤖 Final Reply:", replyText);

    res.set("Content-Type", "text/xml");

    return res.status(200).send(`
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Speak language="hi-IN">
    ${replyText}
  </Speak>
  ${
    nextStage !== "completed"
      ? `
  <Record
    action="https://exowa-presenter-backend.onrender.com/api/vobiz/process-slot"
    method="POST"
    maxLength="12"
    playBeep="true"
    timeout="8"
  />`
      : ""
  }
</Response>`);
  } catch (error) {
    console.error(
      "❌ processSlot Error:",
      error.message
    );

    res.set("Content-Type", "text/xml");

    return res.status(200).send(`
<Response>
  <Speak language="hi-IN">
    माफ कीजिए, तकनीकी समस्या आ गई है।
  </Speak>
</Response>`);
  }
};
