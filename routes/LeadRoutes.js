const express = require("express");
const router = express.Router();

const leadController =
  require("../controllers/leadController");

router.post(
  "/create",
  (req, res) =>
    leadController.createLead(
      req,
      res
    )
);

module.exports = router;