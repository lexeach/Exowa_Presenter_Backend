const leadService = require("../services/leadService");
const aiCallService = require("../services/aiCallService");

class CallingAgent {

async run() {

console.log("Calling Agent started");

const leads = await leadService.getPendingLeads();

if (!leads || leads.length === 0) {
console.log("No pending leads");
return;
}

for (const lead of leads) {

try {

console.log(
`Calling ${lead.referralName} - ${lead.referralPhone}`
);

await aiCallService.initiateCall(lead);

await leadService.updateLeadStatus(
lead._id,
"CALL_ATTEMPTED"
);

} catch (error) {

console.error("Call failed:", error);

await aiCallService.retryMissedCall(lead);

}

}

}

}

module.exports = new CallingAgent();