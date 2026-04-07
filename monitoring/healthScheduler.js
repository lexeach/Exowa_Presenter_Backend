const cron = require("node-cron");

const queueMonitor =
  require("./queueHealthMonitor");

function startHealthScheduler() {
  cron.schedule(
    "*/5 * * * *",
    async () => {
      console.log(
        "🩺 Running health check..."
      );

      await queueMonitor.runHealthCheck();
    }
  );

  console.log(
    "✅ Health scheduler started"
  );
}

module.exports =
  startHealthScheduler;