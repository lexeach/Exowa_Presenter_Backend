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
   smart parser function
========================================= */

/* =========================================
   2. PROCESS USER SPEECH
========================================= */
exports.processSlot = async (req, res) => {
  try {
    console.log("🎤 process-slot hit", req.body);
     

    const audioUrl = req.body.RecordUrl || req.body.RecordFile;

    if (!audioUrl) {
      throw new Error("Audio URL missing from Vobiz callback");
    }

    console.log("🎧 Audio URL:", audioUrl);

    console.log("🔑 VOBIZ AUTH PRESENT:", {
      authId: !!process.env.VOBIZ_AUTH_ID,
      authToken: !!process.env.VOBIZ_AUTH_TOKEN
    });

    console.log("🔑 SARVAM KEY PRESENT:", !!process.env.SARVAM_API_KEY);

    /* =========================================
       STEP 1: DOWNLOAD AUDIO FROM VOBIZ
    ========================================= */
    const audioResponse = await axios.get(audioUrl, {
      responseType: "arraybuffer",
      headers: {
        "X-Auth-ID": process.env.VOBIZ_AUTH_ID,
        "X-Auth-Token": process.env.VOBIZ_AUTH_TOKEN
      }
    });

    console.log("✅ Audio downloaded from Vobiz");
    console.log("📦 Audio size:", audioResponse.data.length);

    /* =========================================
       STEP 2: CREATE MULTIPART FORM DATA
    ========================================= */
    const form = new FormData();

    form.append("file", Buffer.from(audioResponse.data), {
      filename: "recording.mp3",
      contentType: "audio/mpeg"
    });

    form.append("language_code", "hi-IN");

    /* =========================================
       STEP 3: SEND TO SARVAM STT
    ========================================= */
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

    console.log("🧠 STT Raw Response:", sttResponse.data);

    const transcript =
      sttResponse.data?.transcript ||
      sttResponse.data?.text ||
      "";

    console.log("📝 Transcript:", transcript);

    /* =========================================
       STEP 4: SIMPLE AI REPLY ENGINE
    ========================================= */
 const parsedSlot = parseHindiDateTime(transcript);
console.log("📅 Parsed Slot:", parsedSlot);

let replyText =
  "धन्यवाद। हमने आपका demo request नोट कर लिया है।";

if (!transcript) {
  replyText =
    "माफ कीजिए, आपकी बात समझ नहीं पाई। कृपया दोबारा बताइए।";
} else if (parsedSlot) {
  replyText =
    `ठीक है। आपका demo ${parsedSlot.formatted} के लिए बुक कर दिया गया है।`;
} 
 await Lead.updateOne(
  { phone: req.body.To?.replace(/^91/, "") },
  {
    transcript,
    demoDate: parsedSlot
      ? parsedSlot.date.toLocaleDateString("en-IN")
      : "",
    demoTime: parsedSlot
      ? parsedSlot.date.toLocaleTimeString("en-IN", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true
        })
      : "",
    updatedAt: new Date()
  }
);

console.log("✅ Lead updated with transcript and slot");    
     console.log("🤖 Final Reply:", replyText);

    /* =========================================
       STEP 5: RETURN XML RESPONSE
    ========================================= */
    res.set("Content-Type", "text/xml");

    return res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Speak language="hi-IN">
    ${replyText}
  </Speak>
</Response>`);
  } catch (error) {
    console.error(
      "❌ processSlot Error Status:",
      error.response?.status
    );

    console.error(
      "❌ processSlot Error Data:",
      error.response?.data?.toString()
    );

    console.error(
      "❌ processSlot Error Message:",
      error.message
    );

    res.set("Content-Type", "text/xml");

    return res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Speak language="hi-IN">
    माफ कीजिए, तकनीकी समस्या आ गई है।
  </Speak>
</Response>`);
  }
};
