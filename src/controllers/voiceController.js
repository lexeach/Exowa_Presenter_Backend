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
    maxLength="10"
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

    // ========================
    // CLEAN PHONE
    // ========================
    const phone = req.body.To?.slice(-10);

    console.log("📞 Searching lead for phone:", phone);

    const audioUrl =
      req.body.RecordUrl || req.body.RecordFile;

    if (!audioUrl) {
      throw new Error("Audio URL missing");
    }

    // ========================
    // FIXED LEAD LOOKUP
    // ========================
    const lead = await Lead.findOne({
      phone: phone
    });

    if (!lead) {
      console.error("❌ Lead not found for:", phone);

      res.set("Content-Type", "text/xml");

      return res.status(200).send(`
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Speak language="hi-IN">
    माफ कीजिए, आपकी जानकारी नहीं मिल पाई।
  </Speak>
</Response>`);
    }

    const stage =
      lead.conversationStage || "intro";

    console.log("📍 Current stage:", stage);

    // ========================
    // DOWNLOAD AUDIO
    // ========================
    const audioResponse = await axios.get(audioUrl, {
      responseType: "arraybuffer",
      headers: {
        "X-Auth-ID": process.env.VOBIZ_AUTH_ID,
        "X-Auth-Token":
          process.env.VOBIZ_AUTH_TOKEN
      }
    });

    console.log("✅ Audio downloaded");
    console.log(
      "📦 Audio size:",
      audioResponse.data.length
    );

    // ========================
    // STT
    // ========================
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

    console.log("🧠 STT Response:", sttResponse.data);

    const transcript =
      sttResponse.data?.transcript || "";

    console.log("📝 Transcript:", transcript);

    let replyText = "";
    let nextStage = stage;

    // ========================
    // STAGE FLOW
    // ========================
    if (stage === "intro") {
      replyText =
        "धन्यवाद जी। Exowa एक smart practice platform है जहाँ बच्चा daily टेस्ट practice कर सकता है। क्या आप demo देखना चाहेंगे?";

      nextStage = "interest";
    }

    else if (stage === "interest") {
      const normalized =
        transcript.toLowerCase();

      if (
        normalized.includes("हाँ") ||
        normalized.includes("हां") ||
        normalized.includes("haan") ||
        normalized.includes("ha") ||
        normalized.includes("demo")
      ) {
        replyText =
          "बहुत बढ़िया। कृपया demo का समय बताइए, जैसे आज शाम 6 बजे।";

        nextStage = "demo_slot";
      } else {
        replyText =
          "कोई बात नहीं। अगर आप चाहें तो बाद में demo schedule कर सकते हैं।";

        nextStage = "completed";
      }
    }

    else if (stage === "demo_slot") {
      const parsedSlot =
        parseHindiDateTime(transcript);

      console.log(
        "📅 Parsed Slot:",
        parsedSlot
      );

      if (!parsedSlot) {
        replyText =
          "कृपया समय बताइए, जैसे आज शाम 6 बजे या कल सुबह 11 बजे।";
      } else {
        replyText =
          `ठीक है। आपका demo ${parsedSlot.formatted} के लिए बुक कर दिया गया है।`;

        lead.demoDate =
          parsedSlot.date.toLocaleDateString(
            "en-IN"
          );

        lead.demoTime =
          parsedSlot.date.toLocaleTimeString(
            "en-IN",
            {
              hour: "numeric",
              minute: "2-digit",
              hour12: true
            }
          );

        nextStage = "completed";
      }
    }

    else {
      replyText =
        "धन्यवाद। हमारी team आपसे संपर्क करेगी।";

      nextStage = "completed";
    }

    // ========================
    // SAVE LEAD
    // ========================
    lead.transcript = transcript;
    lead.conversationStage = nextStage;
    lead.updatedAt = new Date();

    await lead.save();

    console.log("✅ Lead updated");
    console.log("🤖 Final Reply:", replyText);

    // ========================
    // XML RESPONSE
    // ========================
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
    maxLength="10"
    playBeep="true"
    timeout="8"
  />`
      : ""
  }
</Response>`);
  } catch (error) {
    console.error(
      "❌ processSlot Error:",
      error.response?.data || error.message
    );

    res.set("Content-Type", "text/xml");

    return res.status(200).send(`
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Speak language="hi-IN">
    माफ कीजिए, तकनीकी समस्या आ गई है।
  </Speak>
</Response>`);
  }
};
