const express = require("express");
const router = express.Router();

const leadController = require(
  "../controllers/leadController"
);

/* CREATE NEW LEAD */
router.post(
  "/create",
  leadController.createLead
);

/* GET ALL LEADS */
router.get(
  "/all",
  leadController.getAllLeads
);

router.put(
  "/status/:id",
  leadController.updateLeadStatus
);

module.exports = router;
