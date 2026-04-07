const referralAgent = require("../agents/referralAgent");

class ReferralWorkflow {

async run(closedLead, referralList = []) {

console.log("Referral Workflow started");

for (const referral of referralList) {

try {

await referralAgent.collectReferral(
closedLead,
referral
);

} catch (error) {

console.error(
`Referral failed for ${referral.phone}`,
error
);

}

}

}

}

module.exports = new ReferralWorkflow();