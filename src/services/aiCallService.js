const leadService = require("./leadService");

class AICallService {

async initiateCall(lead) {

console.log("Calling lead:", lead.referralPhone);

/* TODO:
Twilio / Exotel / Sarvam voice agent integration
*/

await leadService.incrementCallAttempt(lead._id);

return {
  success: false,
  status: "NO_RESPONSE",
  message: "Max retries reached"
};
}

async retryMissedCall(lead) {

console.log("Retrying call:", lead.referralPhone);

if (lead.attemptCount >= 3) {

await leadService.updateLeadStatus(
lead._id,
"FOLLOW_UP"
);

return {
success: false,
message: "Max retries reached"
};

}

return await this.initiateCall(lead);

}

}

module.exports = new AICallService();
