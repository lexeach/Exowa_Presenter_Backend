const Lead = require("../models/Lead");

class LeadService {
  async incrementCallAttempt(leadId) {
    return await Lead.findByIdAndUpdate(
      leadId,
      {
        $inc: {
          retryCount: 1
        },
        callStatus: "INITIATED"
      },
      { new: true }
    );
  }

  async updateLeadStatus(
    leadId,
    status,
    extra = {}
  ) {
    return await Lead.findByIdAndUpdate(
      leadId,
      {
        status,
        ...extra
      },
      { new: true }
    );
  }

  async getLeadById(leadId) {
    return await Lead.findById(leadId);
  }
}

module.exports = new LeadService();
