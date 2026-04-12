class IntentService {
  extractIntent(
    text
  ) {
    const lower =
      text.toLowerCase();

    if (
      lower.includes("kal") &&
      lower.includes("6")
    ) {
      return {
        intent:
          "BOOK_DEMO",
        date: "tomorrow",
        time: "18:00"
      };
    }

    if (
      lower.includes("nahi")
    ) {
      return {
        intent:
          "NOT_INTERESTED"
      };
    }

    return {
      intent:
        "FOLLOW_UP_REQUIRED"
    };
  }
}

module.exports =
  new IntentService();