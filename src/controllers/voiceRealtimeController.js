const Lead = require("../models/Lead");
const { getLLMReply } = require("../services/llmService");

// XML safe
function xmlSafe(text = "") {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

exports.realtimeVoiceReply = async (req, res) => {
  try {
    console.log("📩 REALTIME HIT:", req.body);

    const callStatus = req.body.CallStatus || "";
    const speech = (req.body.Speech || "").trim();

    // 🛑 Call end → no AI
    if (callStatus === "completed") {
      console.log("📴 Call ended - skipping AI");

      return res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
</Response>`);
    }

    // ❌ Empty speech
    if (!speech) {
      console.log("⚠️ No speech detected");

      return res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>

  <GetInput 
    action="https://exowa-presenter-backend.onrender.com/api/voice/realtime"
    method="POST"
    inputType="speech"
    speechTimeout="auto"
    timeout="10">

    <Speak language="hi-IN">
      कृपया कुछ बोलिए।
    </Speak>

  </GetInput>

</Response>`);
    }

    // 🤖 AI reply
    let aiReply = "जी, कृपया थोड़ा विस्तार से बताइए।";

    try {
      const llmReply = await getLLMReply(speech);

      if (llmReply && llmReply.trim()) {
        aiReply = llmReply;
      }
    } catch (err) {
      console.error("❌ LLM error:", err.message);
    }

    const safeReply = xmlSafe(aiReply);

    // 🔁 LOOP CONTINUE
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>

  <GetInput 
    action="https://exowa-presenter-backend.onrender.com/api/voice/realtime"
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
    console.error("❌ realtime error:", error);

    return res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Speak>कृपया फिर से बोलिए</Speak>
</Response>`);
  }
};
