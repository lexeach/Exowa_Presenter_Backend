const behaviorService =
  require("../services/behaviorOptimizationService");

class BehaviorController {
  async log(req, res) {
    const result =
      await behaviorService.logCallBehavior(
        req.body
      );

    return res.json({
      success: true,
      data: result
    });
  }

  async best(req, res) {
    const result =
      await behaviorService.getBestStrategy(
        req.params.category
      );

    return res.json({
      success: true,
      data: result
    });
  }
}

module.exports =
  new BehaviorController();