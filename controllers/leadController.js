const addLeadJob = require("./queue/jobs/leadJob.js");
class LeadController {
  async createLead(req, res) {
    try {
      const existingLead =
        await Lead.findOne({
          phone: req.body.phone
        });

      if (existingLead) {
        return res.status(400).json({
          success: false,
          message:
            "Lead already exists"
        });
      }

      const lead =
        await Lead.create(req.body);

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
        success: false,
        message:
          "Internal server error"
      });
    }
  }

  async getAllLeads(
    req,
    res
  ) {
    try {
      const leads =
        await Lead.find().sort({
          createdAt: -1
        });

      return res.json({
        success: true,
        data: leads
      });
    } catch (error) {
      return res.status(500).json({
        success: false
      });
    }
  }
}

module.exports =
  new LeadController();
