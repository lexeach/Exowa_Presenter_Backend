const { Worker } = require("bullmq");
const callEngine = require("../../voice/callEngine");

const connection = {
  host: "127.0.0.1",
  port: 6379
};

const worker = new Worker(
  "leadQueue",
  async (job) => {
    try {
      const lead = job.data;

      console.log("🚀 Processing lead:", lead.phone || lead.referralPhone);

      const phone =
        lead.phone ||
        lead.referralPhone;

      if (!phone) {
        throw new Error("Phone missing in job data");
      }

      const response =
        await callEngine.initiateCall({
          phone,
          leadId: lead._id,
          name: lead.name
        });

      console.log("📞 Call result:", response);

    } catch (error) {
      console.error("❌ Worker Error:", error);
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
