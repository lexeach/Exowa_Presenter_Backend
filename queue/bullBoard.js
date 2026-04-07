const {
  createBullBoard
} = require("@bull-board/api");

const {
  BullMQAdapter
} = require("@bull-board/api/bullMQAdapter");

const {
  ExpressAdapter
} = require("@bull-board/express");

const {
  leadQueue,
  callQueue,
  reminderQueue,
  referralQueue
} = require("./queueManager");

function setupBullBoard(
  app
) {
  const serverAdapter =
    new ExpressAdapter();

  serverAdapter.setBasePath(
    "/admin/queues"
  );

  createBullBoard({
    queues: [
      new BullMQAdapter(
        leadQueue
      ),
      new BullMQAdapter(
        callQueue
      ),
      new BullMQAdapter(
        reminderQueue
      ),
      new BullMQAdapter(
        referralQueue
      )
    ],
    serverAdapter
  });

  app.use(
    "/admin/queues",
    serverAdapter.getRouter()
  );

  console.log(
    "✅ Bull Board running at /admin/queues"
  );
}

module.exports =
  setupBullBoard;