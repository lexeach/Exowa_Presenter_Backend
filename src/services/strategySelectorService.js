const behaviorService =
  require("./behaviorOptimizationService");

class StrategySelectorService {
  async chooseStrategy(
    category
  ) {
    const best =
      await behaviorService.getBestStrategy(
        category
      );

    if (best) {
      return best.strategyId;
    }

    const defaults = [
      "benefit_first",
      "need_analysis_first",
      "soft_close",
      "direct_close"
    ];

    return defaults[
      Math.floor(
        Math.random() *
          defaults.length
      )
    ];
  }
}

module.exports =
  new StrategySelectorService();