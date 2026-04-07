const Lead =
  require("../models/Lead");

const addLeadJob =
  require("../queue/jobs/leadJob");

class LeadController {
  async createLead(req, res) {
    try {
      const lead =
        await Lead.create(
          req.body
        );

      await addLeadJob(
        lead
      );

      return res.status(201).json({
        success: true,
        data: lead
      });
    } catch (error) {
      console.error(
        "Lead create error:",
        error
      );

      return res.status(500).json({
        success: false
      });
    }
  }
}

module.exports =
  new LeadController();