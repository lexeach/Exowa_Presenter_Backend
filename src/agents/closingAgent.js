const paymentService = require("../services/paymentService");
const leadService = require("../services/leadService");

class ClosingAgent {

async closeSale(lead) {

console.log(
`Closing sale for ${lead.referralName}`
);

const payment =
await paymentService.createPaymentLink(lead);

await leadService.updateLeadStatus(
lead._id,
"CLOSING_IN_PROGRESS"
);

return {
success: true,
message: "Payment link sent",
paymentLink: payment.paymentLink
};

}

async verifyClosure(lead, paymentId) {

const payment =
await paymentService.verifyPayment(paymentId);

if (payment.paymentStatus === "SUCCESS") {

await leadService.updateLeadStatus(
lead._id,
"SALE_CLOSED"
);

return {
success: true,
message: "Sale closed successfully"
};

}

return {
success: false,
message: "Payment pending"
};

}

}

module.exports = new ClosingAgent();