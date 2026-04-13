const express = require("express");
const router = express.Router();

router.post("/events", (req, res) => {
  console.log("📞 Vobiz event:", req.body);

  return res.status(200).json({
    success: true
  });
});

module.exports = router;
