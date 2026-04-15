const Lead = require("../models/Lead");
const parseHindiDateTime = require("../utils/timeParser");
const axios = require("axios");
const FormData = require("form-data");

const {
  findIntent,
  saveIntent
} = require("../services/intentService");

const {
  getLLMReply
} = require("../services/llmService");

/* =========================================
   XML SAFE TEXT
========================================= */
function xmlSafe(text = "") {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/* =========================================
   SAFE LLM WRAPPER
========================================= */
async function safeLLMReply(text) {
  try {
    const reply = await getLLMReply(text);

    return (
      reply ||
      "जी, कृपया थोड़ा विस्तार से बताइए।"
    );
  } catch (error) {
    console.error(
      "❌ LLM Error:",
      error.message
    );

    return "जी, Exowa बच्चों के लिए daily practice और टेस्ट platform है। क्या आप demo देखना चाहेंगे?";
  }
}

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
    console.error(
      "❌ answerCall Error:",
      error.message
    );

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
      req.body.RecordUrl ||
      req.body.RecordFile;

    if (!audioUrl) {
      throw new Error("Audio URL missing");
    }

    const lead = await Lead.findOne({
      phone
    });

    if (!lead) {
      throw new Error("Lead not found");
    }

    let stage =
      lead.callSessions?.[callId] ||
      lead.conversationStage ||
      "intro";

    console.log("📍 Current stage:", stage);

    /* ==========================
       AUDIO FETCH
    ========================== */
    const audioResponse = await axios.get(
      audioUrl,
      {
        responseType: "arraybuffer",
        headers: {
          "X-Auth-ID":
            process.env.VOBIZ_AUTH_ID,
          "X-Auth-Token":
            process.env
              .VOBIZ_AUTH_TOKEN
        }
      }
    );

    console.log("✅ Audio downloaded");
    console.log(
      "📦 Audio size:",
      audioResponse.data.length
    );

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

    console.log(
      "🧠 STT Response:",
      sttResponse.data
    );

    const transcript =
      sttResponse.data?.transcript?.trim() ||
      "";

    console.log("📝 Transcript:", transcript);

    const normalized =
      transcript.toLowerCase().trim();

    let replyText = "";
    let nextStage = stage;

    /* ==========================
       EMPTY INPUT HANDLE
    ========================== */
    if (!transcript) {
      replyText =
        "माफ कीजिए, आपकी आवाज़ साफ़ सुनाई नहीं दी। कृपया दोबारा बताइए।";

      nextStage = stage;
    }

    /* ==========================
       INTRO
    ========================== */
    else if (stage === "intro") {
      replyText =
        "बहुत बढ़िया। क्या आप demo देखना चाहेंगे?";

      nextStage = "interest";
    }

    /* ==========================
       INTEREST
    ========================== */
    else if (stage === "interest") {
      const intentResult =
        await findIntent(transcript);

      console.log(
        "🧠 Intent Result:",
        intentResult
      );

      if (intentResult?.matched) {
        replyText =
          intentResult.response;

        if (
          intentResult.intent ===
          "demo_interest"
        ) {
          nextStage = "demo_slot";
        } else {
          nextStage = "completed";
        }
      }

      else if (
        normalized.includes("हाँ") ||
        normalized.includes("हां") ||
        normalized.includes("जी") ||
        normalized.includes("बिल्कुल") ||
        normalized.includes("demo") ||
        normalized.includes("डेमो")
      ) {
        replyText =
          "कृपया demo का समय बताइए, जैसे आज शाम 6 बजे।";

        nextStage = "demo_slot";

        await saveIntent({
          normalizedText:
            intentResult?.normalizedText ||
            normalized,
          intent: "demo_interest",
          response: replyText
        });
      }

      else {
        console.log(
          "🤖 Calling OpenAI"
        );

        replyText =
          await safeLLMReply(
            transcript
          );

        nextStage = "completed";

        await saveIntent({
          normalizedText:
            intentResult?.normalizedText ||
            normalized,
          intent: "auto_learned",
          response: replyText
        });
      }
    }

    /* ==========================
       DEMO SLOT
    ========================== */
    else if (stage === "demo_slot") {
      const parsedSlot =
        parseHindiDateTime(
          transcript
        );

      console.log(
        "📅 Parsed Slot:",
        parsedSlot
      );

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

        nextStage =
          "completed";
      }
    }

    /* ==========================
       FALLBACK
    ========================== */
    else {
      replyText =
        await safeLLMReply(
          transcript
        );

      nextStage =
        "completed";
    }

    /* ==========================
       SAVE MEMORY
    ========================== */
    if (!lead.callSessions) {
      lead.callSessions = {};
    }

    lead.callSessions[callId] =
      nextStage;

    lead.markModified(
      "callSessions"
    );

    lead.conversationStage =
      nextStage;

    lead.transcript =
      transcript;

    lead.lastCallUUID =
      callId;

    lead.updatedAt =
      new Date();

    await lead.save();

    console.log("✅ Lead updated");
    console.log(
      "➡️ Next stage:",
      nextStage
    );
    console.log(
      "🤖 Final Reply:",
      replyText
    );

    const safeReply =
      xmlSafe(replyText);

    res.set(
      "Content-Type",
      "text/xml"
    );

    return res.status(200).send(`
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Speak language="hi-IN">
    ${safeReply}
  </Speak>
  ${
    nextStage !==
    "completed"
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

    res.set(
      "Content-Type",
      "text/xml"
    );

    return res.status(200).send(`
<Response>
  <Speak language="hi-IN">
    माफ कीजिए, तकनीकी समस्या आ गई है।
  </Speak>
</Response>`);
  }
};
