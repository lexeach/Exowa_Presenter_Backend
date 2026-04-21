const callEngine = require('../../services/voice/callEngine');
module.exports = async (job) => {
  try {
    const lead = job.data;

    console.log("🚀 Processing lead:", lead.referralPhone);

    /* =============================
       ✅ FIX HERE
    ============================== */
    const phone =
      lead.phone ||
      lead.referralPhone;

    const response =
      await callEngine.initiateCall({
        phone,
        leadId: lead._id,
        name: lead.name
      });

    console.log("📞 AI call response:", response);

    if (!response.success) {
      console.log("⏳ Retry scheduled in 15 mins");
      throw new Error("Call failed");
    }

    console.log("📞 Call result:", response.status);

  } catch (error) {
    console.error("❌ Error in leadWorker:", error);
    throw error;
  }
};
