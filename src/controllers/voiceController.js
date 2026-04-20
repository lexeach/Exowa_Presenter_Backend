const { getLLMReply } = require("../services/llmService");

/* ===============================
   XML SAFE
=============================== */
function xmlSafe(text = "") {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/* ===============================
   ANSWER + AI LOOP (MAIN ENGINE)
=============================== */
exports.answerCall = async (req, res) => {
  try {
    console.log("📩 ANSWER HIT:", req.body);

    const userSpeech = (req.body.Speech || "").trim();

    let aiReply = "";

    try {
      if (userSpeech) {
        aiReply = await getLLMReply(userSpeech);
      } else {
        aiReply = await getLLMReply(
          "Introduce yourself as Exowa AI sales executive in Hindi and ask for demo"
        );
      }
    } catch (err) {
      console.error("❌ LLM error:", err.message);
      aiReply =
        "नमस्ते, मैं Exowa से बोल रही हूँ। क्या आप demo देखना चाहेंगे?";
    }

    const safeReply = xmlSafe(aiReply);

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>

  <GetInput 
    action="https://exowa-presenter-backend.onrender.com/api/voice/answer"
    method="POST"
    inputType="speech"
    speechTimeout="auto"
    timeout="10">

    <Speak language="hi-IN" voice="WOMAN">
      ${safeReply}
    </Speak>

  </GetInput>

</Response>`;

    res.set("Content-Type", "application/xml");
    return res.send(xml);

  } catch (error) {
    console.error("❌ Voice Error:", error);

    return res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Speak language="hi-IN">
    तकनीकी समस्या आ गई है, कृपया बाद में प्रयास करें।
  </Speak>
</Response>`);
  }
};
