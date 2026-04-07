const reminderAgent = require("../agents/reminderAgent");

class ReminderWorkflow {

async run(appointments = []) {

console.log("Reminder Workflow started");

for (const appointment of appointments) {

try {

await reminderAgent.sendOneHourReminder(
appointment
);

setTimeout(async () => {

await reminderAgent.sendTenMinReminder(
appointment
);

}, 50 * 60 * 1000); // 50 min later

} catch (error) {

console.error(
`Reminder failed for ${appointment.referralPhone}`,
error
);

}

}

}

}

module.exports = new ReminderWorkflow();