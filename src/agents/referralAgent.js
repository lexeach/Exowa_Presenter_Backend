const referralLoopService =
require("../services/referralLoopService");

class ReferralAgent {

async collectReferral(closedLead, referralData) {

console.log(
`Collecting referral from ${closedLead.referralName}`
);

const newLead =
await referralLoopService.processReferral({
name: referralData.name,
phone: referralData.phone,
referrerName: closedLead.referralName,
referrerPhone: closedLead.referralPhone
});

return {
success: true,
message: "Referral added",
lead: newLead
};

}

async restartLoop(referralData) {

return await referralLoopService.restartLoop(
referralData
);

}

}

module.exports = new ReferralAgent();