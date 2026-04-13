const axios = require("axios");
const FormData = require("form-data");

/* =========================================
   1. FIRST CALL ANSWER XML
========================================= */
exports.answerCall = async (req, res) => {
  try {
    console.log("📞 Vobiz answer route hit", req.body);

    res.setHeader("Content-Type", "text/xml");

    const xmlResponse = `<?xml version="1.0" encoding="UTF-8"?>
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
</Response>`;

    return res.status(200).send(xmlResponse);

  } catch (error) {
    console.error("❌ answerCall Error:", error.message);

    res.setHeader("Content-Type", "text/xml");

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

    const audioUrl = req.body.RecordUrl || req.body.RecordFile;

    if (!audioUrl) {
      throw new Error("Audio URL missing from Vobiz callback");
    }

    const sarvamKey = process.env.SARVAM_API_KEY?.trim();

    console.log("🎧 Audio URL:", audioUrl);
    console.log("🔑 API KEY PRESENT:", !!sarvamKey);

    /* =========================================
       STEP 1: DOWNLOAD AUDIO FILE
    ========================================= */
    const audioResponse = await axios.get(audioUrl, {
      responseType: "arraybuffer"
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

    console.log("📤 Sending audio to Sarvam STT...");

    /* =========================================
       STEP 3: SEND TO SARVAM STT
    ========================================= */
    let sttResponse;

    try {
      // Primary auth method
      sttResponse = await axios.post(
        "https://api.sarvam.ai/speech-to-text",
        form,
        {
          headers: {
            ...form.getHeaders(),
            Authorization: `Bearer ${sarvamKey}`
          },
          timeout: 30000
        }
      );
    } catch (primaryError) {
      console.log("⚠️ Bearer auth failed, trying api-subscription-key");

      // Fallback auth method
      sttResponse = await axios.post(
        "https://api.sarvam.ai/speech-to-text",
        form,
        {
          headers: {
            ...form.getHeaders(),
            "api-subscription-key": sarvamKey
          },
          timeout: 30000
        }
      );
    }

    console.log("🧠 STT Raw Response:", sttResponse.data);

    const transcript =
      sttResponse.data?.transcript ||
      sttResponse.data?.text ||
      sttResponse.data?.result ||
      "";

    console.log("📝 Transcript:", transcript);

    /* =========================================
       STEP 4: SIMPLE AI REPLY ENGINE
    ========================================= */
    let replyText =
      "धन्यवाद। हमने आपका demo request नोट कर लिया है।";

    if (!transcript || transcript.trim() === "") {
      replyText =
        "माफ कीजिए, आपकी बात समझ नहीं पाई। कृपया दोबारा बताइए।";
    } else if (transcript.includes("कल")) {
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
    }

    /* =========================================
       STEP 5: RETURN XML RESPONSE
    ========================================= */
    res.setHeader("Content-Type", "text/xml");

    const responseXml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Speak language="hi-IN">
    ${replyText}
  </Speak>
</Response>`;

    return res.status(200).send(responseXml);

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

    res.setHeader("Content-Type", "text/xml");

    return res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Speak language="hi-IN">
    माफ कीजिए, तकनीकी समस्या आ गई है।
  </Speak>
</Response>`);
  }
};
