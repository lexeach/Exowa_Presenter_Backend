const Lead = require("../../models/Lead");

class DemoBookingService {
  async bookDemo(
    leadId,
    date,
    time
  ) {
    return await Lead.findByIdAndUpdate(
      leadId,
      {
        status:
          "DEMO_BOOKED",
        demoDate:
          date,
        demoTime:
          time
      },
      { new: true }
    );
  }
}

module.exports =
  new DemoBookingService();