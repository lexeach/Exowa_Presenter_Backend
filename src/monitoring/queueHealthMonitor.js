const {
  leadQueue,
  callQueue,
  reminderQueue,
  referralQueue
} = require("../queue/queueManager");

const alertService =
  require("./alertService");

class QueueHealthMonitor {
  async checkQueue(
    queue,
    name
  ) {
    const failed =
      await queue.getFailedCount();

    const waiting =
      await queue.getWaitingCount();

    const active =
      await queue.getActiveCount();

    console.log(
      `📊 ${name} | waiting:${waiting} active:${active} failed:${failed}`
    );

    if (failed > 10) {
      await alertService.sendAlert(
        `${name} Failure Spike`,
        `Failed jobs: ${failed}`
      );
    }

    if (waiting > 100) {
      await alertService.sendAlert(
        `${name} Queue Backlog`,
        `Waiting jobs: ${waiting}`
      );
    }
  }

  async runHealthCheck() {
    await this.checkQueue(
      leadQueue,
      "leadQueue"
    );

    await this.checkQueue(
      callQueue,
      "callQueue"
    );

    await this.checkQueue(
      reminderQueue,
      "reminderQueue"
    );

    await this.checkQueue(
      referralQueue,
      "referralQueue"
    );
  }
}

module.exports =
  new QueueHealthMonitor();