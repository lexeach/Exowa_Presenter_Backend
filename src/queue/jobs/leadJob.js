
const { Queue } = require("bullmq");
const Redis = require("ioredis");

const connection = new Redis(
  process.env.REDIS_URL,
  {
    maxRetriesPerRequest: null
  }
);

const leadQueue = new Queue(
  "leadQueue",
  {
    connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "fixed",
        delay: 300000
      },
      removeOnComplete: true,
      removeOnFail: false
    }
  }
);

/* -----------------------------------
   CALCULATE DELAY FOR CALL SCHEDULING
------------------------------------ */
function calculateDelay(
  preferredTime
) {
  if (!preferredTime) {
    return 30000; // default 30 sec
  }

  const now = new Date();

  const [hours, minutes] =
    preferredTime
      .split(":")
      .map(Number);

  const scheduled =
    new Date();

  scheduled.setHours(
    hours,
    minutes,
    0,
    0
  );

  /* IF TIME PASSED → NEXT DAY */
  if (scheduled <= now) {
    scheduled.setDate(
      scheduled.getDate() +
        1
    );
  }

  return (
    scheduled - now
  );
}

/* -----------------------------------
   ADD NEW LEAD CALL JOB
------------------------------------ */
async function addLeadJob(
  lead
) {
  try {
    const delay =
      calculateDelay(
        lead.preferredCallTime
      );

    const job =
      await leadQueue.add(
        "newLeadCall",
        {
          leadId:
            lead.leadId,
          phone:
            lead.phone,
          name:
            lead.name,
          callType:
            lead.callType ||
            "WELCOME_CALL",
          preferredCallTime:
            lead.preferredCallTime ||
            ""
        },
        { delay }
      );

    console.log(
      `📞 Call scheduled for ${lead.phone} after ${delay} ms`
    );

    return job;
  } catch (error) {
    console.error(
      "❌ Queue add error:",
      error
    );

    throw error;
  }
}

module.exports = {
  addLeadJob,
  leadQueue
};
