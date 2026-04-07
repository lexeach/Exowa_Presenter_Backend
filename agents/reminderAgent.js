const reminderService = require("../services/reminderService");

class ReminderAgent {

async sendOneHourReminder(lead) {

console.log(
`Sending 1 hour reminder to ${lead.referralName}`
);

return await reminderService.sendOneHourReminder(lead);

}

async sendTenMinReminder(lead) {

console.log(
`Sending 10 min reminder to ${lead.referralName}`
);

return await reminderService.sendTenMinReminder(lead);

}

async run(appointments = []) {

for (const lead of appointments) {

await this.sendOneHourReminder(lead);

}

}

}

module.exports = new ReminderAgent();