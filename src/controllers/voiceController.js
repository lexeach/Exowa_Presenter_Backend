const axios = require("axios");
const FormData = require("form-data");

/* ----------------------------------------
   1. FIRST CALL ANSWER XML
----------------------------------------- */
exports.answerCall = async (req, res) => {
  try {
    console.log("📞 Vobiz answer route hit", req.body);

    res.set("Content-Type", "text/xml");

    return res.status(200).send(`
<?xml version="1.0" encoding="UTF-8"?>
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
  ></Record>
  </Response>
    `);

  } catch (error) {
    console.error("❌ answerCall Error:", error.message);

    res.set("Content-Type", "text/xml");

    return res.status(200).send(`
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Speak language="hi-IN">
    माफ कीजिए, अभी सिस्टम उपलब्ध नहीं है।
  </Speak>
</Response>
    `);
  }
};


/* ----------------------------------------
   2. PROCESS USER SPEECH
----------------------------------------- */
exports.processSlot = async (req, res) => {
  try {
    console.log("🎤 process-slot hit", req.body);

    const audioUrl =
      req.body.RecordUrl || req.body.RecordFile;

    console.log("🎧 Audio URL:", audioUrl);

    console.log(
      "🔑 API KEY PRESENT:",
      !!process.env.SARVAM_API_KEY
    );

    // STEP 1: Download audio file from Vobiz
    const audioResponse = await axios.get(audioUrl, {
      responseType: "arraybuffer"
    });

    console.log("✅ Audio downloaded");

    // STEP 2: Create multipart form-data
    const form = new FormData();

    form.append("file", Buffer.from(audioResponse.data), {
      filename: "recording.mp3",
      contentType: "audio/mpeg"
    });

    form.append("language_code", "hi-IN");

    // STEP 3: Send audio file to Sarvam STT
    const sttResponse = await axios.post(
      "https://api.sarvam.ai/speech-to-text",
      form,
      {
        headers: {
          ...form.getHeaders(),
          "api-subscription-key":
            process.env.SARVAM_API_KEY
        }
      }
    );

    console.log(
      "📝 STT Response:",
      sttResponse.data
    );

    const transcript =
      sttResponse.data?.transcript || "";

    console.log("🧠 Transcript:", transcript);

    /* ----------------------------------------
       3. SIMPLE AI RESPONSE ENGINE
    ----------------------------------------- */
    let replyText =
      "धन्यवाद। हमने आपका demo request नोट कर लिया है।";

    if (transcript.includes("कल")) {
      replyText =
        "ठीक है। आपका demo कल शाम 6 बजे के लिए बुक कर दिया गया है।";
    } else if (transcript.includes("आज")) {
      replyText =
        "ठीक है। आपका demo आज शाम 6 बजे के लिए बुक कर दिया गया है।";
    } else if (transcript.includes("सुबह")) {
      replyText =
        "ठीक है। आपका demo सुबह के समय बुक कर दिया गया है।";
    } else if (transcript.includes("शाम")) {
      replyText =
        "ठीक है। आपका demo शाम के समय बुक कर दिया गया है।";
    } else if (!transcript) {
      replyText =
        "माफ कीजिए, मैं आपकी बात समझ नहीं पाई। कृपया दोबारा बताइए।";
    }

    /* ----------------------------------------
       4. RETURN XML VOICE RESPONSE
    ----------------------------------------- */
    res.set("Content-Type", "text/xml");

    return res.status(200).send(`
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Speak language="hi-IN">
    ${replyText}
  </Speak>
</Response>
    `);

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
    माफ कीजिए, आपकी बात समझ नहीं पाई।
    कृपया दोबारा बताइए।
  </Speak>
</Response>
    `);
  }
};
