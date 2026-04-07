const { Worker } = require("bullmq");
const Redis = require("ioredis");

const connection = new Redis(
  process.env.REDIS_URL,
  {
    maxRetriesPerRequest: null
  }
);

const leadWorker = new Worker(
  "leadQueue",
  async (job) => {
    const lead = job.data;

    console.log(
      "🚀 Processing lead:",
      lead.phone
    );

    /* FUTURE FLOW */
    /*
      1. trigger AI call
      2. book demo
      3. send reminder
      4. referral loop
    */

    return {
      success: true
    };
  },
  { connection }
);

leadWorker.on(
  "completed",
  (job) => {
    console.log(
      `✅ Job completed: ${job.id}`
    );
  }
);

leadWorker.on(
  "failed",
  (job, error) => {
    console.error(
      `❌ Job failed: ${job.id}`,
      error
    );
  }
);

module.exports =
  leadWorker;