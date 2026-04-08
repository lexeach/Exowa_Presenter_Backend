const {
  Worker,
  Queue
} = require("bullmq");

const Redis = require("ioredis");
const makeAICall = require("../../services/voice/callEngine");
const Lead = require("../../models/Lead");

const connection = new Redis(
  process.env.REDIS_URL,
  {
    maxRetriesPerRequest: null
  }
);

/* -----------------------------------
   RETRY QUEUE
------------------------------------ */
const leadQueue =
  new Queue(
    "leadQueue",
    { connection }
  );

/* -----------------------------------
   LEAD WORKER
------------------------------------ */
const leadWorker =
  new Worker(
    "leadQueue",
    async (job) => {
      const leadData =
        job.data;

      console.log(
        "🚀 Processing lead:",
        leadData.phone
      );

      try {
        /* UPDATE CALL INITIATED */
        await Lead.findByIdAndUpdate(
          leadData.leadId ||
            leadData._id,
          {
            callStatus:
              "INITIATED"
          }
        );

        /* -----------------------------------
           ACTUAL AI CALL
        ------------------------------------ */
       const response =
  await callEngine.initiateCall({
    _id:
      leadData.leadId ||
      leadData._id,
    referralPhone:
      leadData.phone,
    name:
      leadData.name,
    attemptCount:
      leadData.retryCount ||
      0
  });

const callStatus =
  response.success
    ? "CONNECTED"
    : "NO_RESPONSE";
        
        console.log(
          "📞 Call result:",
          callStatus
        );

        /* -----------------------------------
           NO RESPONSE / DROPPED
        ------------------------------------ */
        if (
          callStatus ===
            "NO_RESPONSE" ||
          callStatus ===
            "CALL_DROPPED"
        ) {
          const retryCount =
            leadData.retryCount ||
            0;

          if (
            retryCount < 3
          ) {
            const retryDelay =
              retryCount ===
              0
                ? 15 *
                  60 *
                  1000
                : retryCount ===
                  1
                ? 2 *
                  60 *
                  60 *
                  1000
                : 24 *
                  60 *
                  60 *
                  1000;

            await leadQueue.add(
              "retryLeadCall",
              {
                ...leadData,
                retryCount:
                  retryCount +
                  1
              },
              {
                delay:
                  retryDelay
              }
            );

            await Lead.findByIdAndUpdate(
              leadData
                .leadId ||
                leadData._id,
              {
                retryCount:
                  retryCount +
                  1,
                callStatus:
                  callStatus,
                status:
                  "RETRY_SCHEDULED",
                nextRetryAt:
                  new Date(
                    Date.now() +
                      retryDelay
                  )
              }
            );

            console.log(
              `⏳ Retry scheduled in ${
                retryDelay /
                60000
              } mins`
            );

            return {
              success: true,
              status:
                "RETRY_SCHEDULED"
            };
          }

          /* MAX RETRIES */
          await Lead.findByIdAndUpdate(
            leadData
              .leadId ||
              leadData._id,
            {
              callStatus:
                callStatus,
              status:
                "FOLLOW_UP_PENDING"
            }
          );

          console.log(
            `⚠️ Max retries reached for ${leadData.phone}`
          );

          return {
            success: true,
            status:
              "FOLLOW_UP_PENDING"
          };
        }

        /* -----------------------------------
           CONNECTED
        ------------------------------------ */
        await Lead.findByIdAndUpdate(
          leadData.leadId ||
            leadData._id,
          {
            callStatus:
              "CONNECTED",
            status:
              "CALL_CONNECTED"
          }
        );

        console.log(
          "✅ Call connected"
        );

        /* NEXT:
           AI asks for demo slot
        */

        return {
          success: true,
          status:
            "CALL_CONNECTED"
        };
      } catch (error) {
        console.error(
          "❌ Error in leadWorker:",
          error
        );

        throw error;
      }
    },
    { connection }
  );

/* -----------------------------------
   EVENTS
------------------------------------ */
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
      `❌ Job failed: ${job?.id}`,
      error
    );
  }
);

module.exports =
  leadWorker;
