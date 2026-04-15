const express = require("express");
const router = express.Router();
const axios = require("axios");

const Lead = require("../models/Lead");
const { speechToText } = require("../voice/sttService");
const { getAIReply } = require("../services/aiReplyService");

function sendXML(replyText) {
  return `
<Response>
    <Speak>${replyText}</Speak>
    <Record
        maxLength="10"
        action="/api/vobiz/process-slot"
        method="POST"
        playBeep="true"
    />
</Response>`;
}

function parseDateTime(text) {
  const normalized = text.toLowerCase();

  const hasToday =
    normalized.includes("आज") ||
    normalized.includes("abhi") ||
    normalized.includes("अभी");

  const hasTomorrow =
    normalized.includes("कल") ||
    normalized.includes("tomorrow");

  const sixPM =
    normalized.includes("6") ||
    normalized.includes("छह") ||
    normalized.includes("शाम");

  if (!hasToday && !hasTomorrow && !sixPM) {
    return null;
  }

  const date = new Date();

  if (hasTomorrow) {
    date.setDate(date.getDate() + 1);
  }

  if (sixPM) {
    date.setHours(18, 0, 0, 0);
  } else {
    date.setHours(17, 0, 0, 0);
  }

  return {
    date,
    formatted: date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
  };
}

router.post("/process-slot", async (req, res) => {
  try {
    console.log("🎤 process-slot hit", req.body);

    const callId =
      req.body.CallUUID ||
      req.body.RequestUUID ||
      req.body.ALegRequestUUID;

    const audioUrl =
      req.body.RecordUrl ||
      req.body.RecordFile;

    console.log("🎧 Audio URL:", audioUrl);

    let transcript = "";

    if (audioUrl) {
      const audioResponse = await axios.get(audioUrl, {
        responseType: "arraybuffer",
        auth: {
          username: process.env.VOBIZ_AUTH_ID,
          password: process.env.VOBIZ_AUTH_TOKEN,
        },
      });

      console.log("✅ Audio downloaded from Vobiz");

      transcript = await speechToText(
        Buffer.from(audioResponse.data)
      );

      console.log("📝 Transcript:", transcript);
    }

    const lead = await Lead.findOne({
      callId,
    });

    if (!lead) {
      return res
        .status(404)
        .send("Lead not found");
    }

    const stage =
      lead.conversationStage || "intro";

    console.log("📍 Current stage:", stage);

    let reply = "";

    // ======================
    // STAGE FLOW
    // ======================

    if (stage === "intro") {
      reply = await getAIReply({
        transcript,
        lead,
        stage,
      });

      lead.conversationStage = "pitch";
    }

    else if (stage === "pitch") {
      reply = await getAIReply({
        transcript,
        lead,
        stage,
      });

      lead.conversationStage = "interest";
    }

    else if (stage === "interest") {
      reply = await getAIReply({
        transcript,
        lead,
        stage,
      });

      if (
        transcript.includes("demo") ||
        transcript.includes("समय") ||
        transcript.includes("कर सकते")
      ) {
        lead.conversationStage = "demo_slot";
      }
    }

    else if (stage === "demo_slot") {
      const slot = parseDateTime(transcript);

      if (!slot) {
        reply =
          "कृपया demo का समय बताएं, जैसे आज शाम 6 बजे या कल सुबह 11 बजे।";
      } else {
        lead.demoSlot = slot.date;
        lead.conversationStage = "completed";

        reply = `ठीक है। आपका demo ${slot.formatted} के लिए बुक कर दिया गया है।`;
      }
    }

    else {
      reply = await getAIReply({
        transcript,
        lead,
        stage,
      });
    }

    lead.lastTranscript = transcript;
    lead.lastReply = reply;

    await lead.save();

    console.log("🤖 Final Reply:", reply);

    res.set("Content-Type", "text/xml");
    return res.send(sendXML(reply));
  } catch (error) {
    console.error(
      "❌ process-slot error:",
      error.message
    );

    res.set("Content-Type", "text/xml");

    return res.send(
      sendXML(
        "क्षमा करें, तकनीकी समस्या आ गई है।"
      )
    );
  }
});

module.exports = router;
