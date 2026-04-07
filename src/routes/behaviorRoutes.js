const express =
  require("express");

const router =
  express.Router();

const controller =
  require("../controllers/behaviorController");

router.post(
  "/log",
  (req, res) =>
    controller.log(req, res)
);

router.get(
  "/best/:category",
  (req, res) =>
    controller.best(req, res)
);

module.exports = router;