const express =
  require("express");
const router =
  express.Router();

const sttService =
  require("../services/voice/sttService");

const intentService =
  require("../services/ai/intentService");

const demoBookingService =
  require("../services/booking/demoBookingService");

router.post(
  "/answer",
  async (req, res) => {
    try {
      console.log(
        "📞 Vobiz webhook:",
        req.body
      );

      const {
        RecordingUrl,
        LeadId
      } = req.body;

      const transcript =
        await sttService.transcribe(
          RecordingUrl
        );

      console.log(
        "📝 Transcript:",
        transcript
      );

      const result =
        intentService.extractIntent(
          transcript
        );

      console.log(
        "🧠 Intent:",
        result
      );

      if (
        result.intent ===
        "BOOK_DEMO"
      ) {
        await demoBookingService.bookDemo(
          LeadId,
          result.date,
          result.time
        );

        return res.json({
          success: true,
          message:
            "Demo booked"
        });
      }

      return res.json({
        success: true,
        intent:
          result.intent
      });
    } catch (error) {
      console.error(
        "❌ Webhook error:",
        error
      );

      res.status(500).json({
        success: false
      });
    }
  }
);

module.exports =
  router;