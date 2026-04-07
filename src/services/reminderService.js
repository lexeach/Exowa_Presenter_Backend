class ReminderService {

async sendReminder(lead) {

console.log(
`Reminder sent to ${lead.referralPhone}`
);

/* TODO:
WhatsApp / SMS / Voice reminder
*/

return {
success: true,
message: "Reminder sent"
};

}

async sendOneHourReminder(lead) {

console.log(
`1 hour reminder for ${lead.referralPhone}`
);

return await this.sendReminder(lead);

}

async sendTenMinReminder(lead) {

console.log(
`10 min reminder for ${lead.referralPhone}`
);

return await this.sendReminder(lead);

}

}

module.exports = new ReminderService();