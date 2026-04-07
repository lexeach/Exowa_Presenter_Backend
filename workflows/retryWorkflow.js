const aiCallService = require("../services/aiCallService");
const leadService = require("../services/leadService");

class RetryWorkflow {

async run() {

console.log("Retry Workflow started");

const leads = await leadService.getPendingLeads();

for (const lead of leads) {

if (
lead.status === "CALL_ATTEMPTED" &&
lead.attemptCount < 3
) {

try {

await aiCallService.retryMissedCall(lead);

} catch (error) {

console.error(
`Retry failed for ${lead.referralPhone}`,
error
);

}

}

}

}

}

module.exports = new RetryWorkflow();