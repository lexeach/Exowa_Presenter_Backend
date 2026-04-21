const { Worker } = require("bullmq");
const callEngine = require("../../voice/callEngine");

const connection = {
  connection: {
    url: process.env.REDIS_URL
  }
};

const worker = new Worker(
  "leadQueue",
  async (job) => {
    const lead = job.data;

    console.log("🚀 Processing lead:", lead);

    await callEngine.initiateCall({
      phone: lead.phone,
      name: lead.name,
      leadId: lead._id
    });
  },
  connection
);

worker.on("completed", (job) => {
  console.log("✅ Job completed:", job.id);
});

worker.on("failed", (job, err) => {
  console.error("❌ Job failed:", err.message);
});
