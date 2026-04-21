const { Queue } = require("bullmq");

const connection = {
  connection: {
    url: process.env.REDIS_URL
  }
};

const leadQueue = new Queue("leadQueue", connection);

module.exports = { leadQueue };
