class PaymentService {

async createPaymentLink(lead) {

console.log(
`Creating payment link for ${lead.referralPhone}`
);

/* TODO:
Razorpay / Stripe integration
*/

return {
success: true,
paymentLink:
"https://payment.exowa.com/demo123"
};

}

async verifyPayment(paymentId) {

/* TODO:
gateway verification
*/

return {
success: true,
paymentStatus: "SUCCESS"
};

}

}

module.exports = new PaymentService();