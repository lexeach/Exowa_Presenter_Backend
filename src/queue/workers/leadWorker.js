const { Worker, Queue } = require("bullmq");
const Redis = require("ioredis");
const makeAICall = require("../../services/voice/callService");
const Lead = require("../../models/Lead"); // Mongoose model import zaroori hai

const connection = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

// Retry jobs add karne ke liye queue instance ki zaroorat hogi
const leadQueue = new Queue("leadQueue", { connection });

const leadWorker = new Worker(
  "leadQueue",
  async (job) => {
    const leadData = job.data;

    console.log("🚀 Processing lead:", leadData.phone);

    try {
      // 1. AI Call trigger karein aur status lein
      const response = await makeAICall({
        phone: leadData.phone,
        name: leadData.name,
      });

      const callStatus = response.status; // Maan lete hain API status return kar rahi hai

      // 2. Retry Logic
      if (callStatus === "NO_RESPONSE" || callStatus === "CALL_DROPPED") {
        const retryCount = leadData.retryCount || 0;

        if (retryCount < 3) {
          const retryDelay =
            retryCount === 0
              ? 15 * 60 * 1000 // 15 mins
              : retryCount === 1
              ? 2 * 60 * 60 * 1000 // 2 hours
              : 24 * 60 * 60 * 1000; // 24 hours

          // Queue mein wapas add karein delay ke saath
          await leadQueue.add(
            "retryLeadCall",
            {
              ...leadData,
              retryCount: retryCount + 1,
            },
            { delay: retryDelay }
          );

          // DB update karein
          await Lead.findByIdAndUpdate(leadData._id, {
            retryCount: retryCount + 1,
            status: "RETRY_SCHEDULED",
            nextRetryAt: new Date(Date.now() + retryDelay),
          });

          console.log(`⏳ Retry scheduled for ${leadData.phone} in ${retryDelay / 60000} mins`);
        } else {
          // Max retries reached
          await Lead.findByIdAndUpdate(leadData._id, {
            status: "FOLLOW_UP_PENDING",
          });
          console.log(`⚠️ Max retries reached for ${leadData.phone}`);
        }
      }

      return { success: true, status: callStatus };
    } catch (error) {
      console.error("Error in leadWorker:", error);
      throw error; // BullMQ isse 'failed' event mein handle karega
    }
  },
  { connection }
);

// Events
leadWorker.on("completed", (job) => {
  console.log(`✅ Job completed: ${job.id}`);
});

leadWorker.on("failed", (job, error) => {
  console.error(`❌ Job failed: ${job.id}`, error);
});

module.exports = leadWorker;
