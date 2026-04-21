const { Queue } = require("bullmq");

const connection = {
  host: "127.0.0.1",
  port: 6379
};

/* ===============================
   SINGLE SOURCE OF TRUTH
================================ */
const leadQueue = new Queue("leadQueue", {
  connection
});

module.exports = {
  leadQueue
};
