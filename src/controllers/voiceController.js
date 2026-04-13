const axios = require("axios");

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
  />

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

    const audioUrl = req.body.RecordUrl || req.body.RecordFile;

    if (!audioUrl) {
      res.set("Content-Type", "text/xml");

      return res.status(200).send(`
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Speak language="hi-IN">
    माफ कीजिए, आपकी आवाज रिकॉर्ड नहीं हो पाई।
  </Speak>
</Response>
      `);
    }

    console.log("🎧 Audio URL:", audioUrl);

    /* ----------------------------------------
       3. SARVAM STT CALL
    ----------------------------------------- */
    const sttResponse = await axios.post(
      "https://api.sarvam.ai/speech-to-text",
      {
        audio_url: audioUrl,
        language_code: "hi-IN"
      },
      {
        headers: {
          "api-subscription-key": process.env.SARVAM_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("🧠 STT Raw Response:", sttResponse.data);

    const transcript =
      sttResponse.data?.transcript ||
      sttResponse.data?.text ||
      "";

    console.log("📝 Transcript:", transcript);

    /* ----------------------------------------
       4. SIMPLE AI RESPONSE ENGINE
    ----------------------------------------- */
    let replyText =
      "धन्यवाद। हमने आपका demo request नोट कर लिया है।";

    if (transcript.includes("कल")) {
      replyText =
        "ठीक है। आपका demo कल शाम 6 बजे के लिए बुक कर दिया गया है।";
    }

    if (transcript.includes("आज")) {
      replyText =
        "ठीक है। आपका demo आज शाम 6 बजे के लिए बुक कर दिया गया है।";
    }

    if (transcript.includes("सुबह")) {
      replyText =
        "ठीक है। आपका demo सुबह के समय बुक कर दिया गया है।";
    }

    if (transcript.includes("शाम")) {
      replyText =
        "ठीक है। आपका demo शाम के समय बुक कर दिया गया है।";
    }

    /* ----------------------------------------
       5. RETURN XML VOICE RESPONSE
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
