const CallBehaviorLog =
  require("../models/CallBehaviorLog");

const BehaviorStrategy =
  require("../models/BehaviorStrategy");

class BehaviorOptimizationService {
  async logCallBehavior(data) {
    const score =
      this.calculateBehaviorScore(data);

    const log =
      await CallBehaviorLog.create({
        ...data,
        score
      });

    await this.updateStrategyMetrics(
      data.strategyId,
      score,
      data.conversion
    );

    return log;
  }

  calculateBehaviorScore(data) {
    let score = 0;

    if (data.sentimentScore > 70)
      score += 20;

    if (data.conversion)
      score += 50;

    if (
      data.dropStage === "payment"
    )
      score += 15;

    if (
      data.objectionStrategy ===
      "benefit_first"
    )
      score += 10;

    return score;
  }

  async updateStrategyMetrics(
    strategyId,
    score,
    conversion
  ) {
    const strategy =
      await BehaviorStrategy.findOneAndUpdate(
        { strategyId },
        {
          $inc: {
            usageCount: 1,
            successCount: conversion
              ? 1
              : 0
          }
        },
        {
          upsert: true,
          new: true
        }
      );

    strategy.successRate =
      (strategy.successCount /
        strategy.usageCount) *
      100;

    strategy.averageScore =
      ((strategy.averageScore *
        (strategy.usageCount -
          1) +
        score) /
        strategy.usageCount);

    await strategy.save();

    return strategy;
  }

  async getBestStrategy(
    category
  ) {
    return await BehaviorStrategy.findOne(
      { category }
    ).sort({
      successRate: -1,
      averageScore: -1
    });
  }
}

module.exports =
  new BehaviorOptimizationService();