const callingAgent = require("../agents/callingAgent");
const leadService = require("../services/leadService");

class LeadWorkflow {

async run() {

console.log("Lead Workflow started");

const leads = await leadService.getPendingLeads();

if (!leads || leads.length === 0) {
console.log("No leads found");
return;
}

for (const lead of leads) {

try {

await callingAgent.run();

} catch (error) {

console.error(
`Lead workflow failed for ${lead.referralPhone}`,
error
);

}

}

}

}

module.exports = new LeadWorkflow();