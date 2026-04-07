const Lead = require(
  "../models/Lead"
);

class LeadController {
  async createLead(
    req,
    res
  ) {
    try {
      console.log(
        "📥 Received lead:",
        req.body
      );

      const {
        name,
        phone,
        studentClass,
        referredBy
      } = req.body;

      const lead =
        await Lead.create({
          name,
          phone,
          studentClass,
          referredBy,
          source:
            "referral_form",
          status: "NEW"
        });

      return res
        .status(201)
        .json({
          success: true,
          message:
            "Lead created successfully",
          data: lead
        });
    } catch (error) {
      console.error(
        "Lead create error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            error.message
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
  console.error("❌ Lead create error:", error);

  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message:
        "⚠️ This phone number is already registered as a lead."
    });
  }

  return res.status(500).json({
    success: false,
    message:
      "Something went wrong. Please try again."
  });
}

      return res
        .status(500)
        .json({
          success: false
        });
    }
  }
}

module.exports =
  new LeadController();
