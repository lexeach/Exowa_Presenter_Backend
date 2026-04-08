const Lead = require("../models/Lead");
const addLeadJob = require("../queue/jobs/leadJob");

class LeadController {
  // 1. Create a Lead
  async createLead(req, res) {
    try {
      console.log("📥 Received lead:", req.body);

      const { name, phone, studentClass, referredBy, preferredCallTime } = req.body;

      // Basic validation check
      if (!name || !phone) {
        return res.status(400).json({
          success: false,
          message: "Name and Phone are required."
        });
      }

      const lead = await Lead.create({
        name,
        phone,
        studentClass,
        referredBy,
        preferredCallTime
        source: "referral_form",
        status: "NEW"
      });

      await addLeadJob({
        leadId: lead._id,
        phone: lead.phone,
        name: lead.name
      });

      return res.status(201).json({
        success: true,
        message: "Lead created successfully",
        data: lead
      });
    } catch (error) {
      console.error("❌ Lead create error:", error);

      // Handle duplicate phone number (MongoDB error code 11000)
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: "⚠️ This phone number is already registered as a lead."
        });
      }

      return res.status(500).json({
        success: false,
        message: "Something went wrong. Please try again."
      });
    }
  }

  // 2. Get All Leads
  async getAllLeads(req, res) {
    try {
      const leads = await Lead.find().sort({ createdAt: -1 });

      return res.json({
        success: true,
        count: leads.length,
        data: leads
      });
    } catch (error) {
      console.error("❌ Get leads error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch leads"
      });
    }
  }

  // 3. Update Lead Status
  async updateLeadStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Check if lead exists first or handle null result
      const lead = await Lead.findByIdAndUpdate(
        id,
        { status },
        { new: true, runValidators: true } // runValidators ensures status is a valid enum value
      );

      if (!lead) {
        return res.status(404).json({
          success: false,
          message: "Lead not found"
        });
      }

      return res.json({
        success: true,
        message: "Lead status updated",
        data: lead
      });
    } catch (error) {
      console.error("❌ Status update error:", error);

      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new LeadController();
