const { createBullBoard } = require("@bull-board/api");
const { BullMQAdapter } = require("@bull-board/api/bullMQAdapter");
const { ExpressAdapter } = require("@bull-board/express");

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
  { connection }
);

function setupBullBoard(app) {
  const serverAdapter =
    new ExpressAdapter();

  serverAdapter.setBasePath(
    "/admin/queues"
  );

  createBullBoard({
    queues: [
      new BullMQAdapter(
        leadQueue
      )
    ],
    serverAdapter
  });

  app.use(
    "/admin/queues",
    serverAdapter.getRouter()
  );
}

module.exports =
  setupBullBoard;
