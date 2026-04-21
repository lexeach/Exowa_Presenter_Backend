const { Worker } = require("bullmq");
const { leadQueue } = require("../queueManager"); // 👈 SAME SOURCE
const callEngine = require('../../services/voice/callEngine');

const connection = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');
const worker = new Worker(
  "leadQueue", // ⚠️ EXACT SAME NAME
  async (job) => {
    try {
      const lead = job.data;

      console.log("🚀 Processing lead:", lead);

      const phone =
        lead.phone ||
        lead.referralPhone;

      if (!phone) {
        throw new Error("Phone missing");
      }

      const response =
        await callEngine.initiateCall({
          phone,
          leadId: lead._id,
          name: lead.name
        });

      console.log("📞 Call response:", response);

    } catch (error) {
      console.error("❌ Worker Error:", error.message);
      throw error;
    }
  },
  { connection }
);

worker.on("completed", (job) => {
  console.log(`✅ Job completed: ${job.id}`);
});

worker.on("failed", (job, err) => {
  console.error(`❌ Job failed: ${job.id}`, err.message);
});
