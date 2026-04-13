function parseHindiDateTime(text) {
  if (!text) return null;

  const now = new Date();
  let targetDate = new Date(now);

  // normalize
  text = text.trim().replace(/[।,.]/g, "");

  const hindiNumberMap = {
    "एक": 1,
    "दो": 2,
    "तीन": 3,
    "चार": 4,
    "पांच": 5,
    "पाँच": 5,
    "छह": 6,
    "सात": 7,
    "आठ": 8,
    "नौ": 9,
    "दस": 10,
    "ग्यारह": 11,
    "बारह": 12,
    "तेरह": 13,
    "चौदह": 14,
    "पंद्रह": 15,
    "सोलह": 16,
    "सत्रह": 17,
    "अठारह": 18,
    "उन्नीस": 19,
    "बीस": 20,
    "इक्कीस": 21,
    "बाईस": 22,
    "तेईस": 23,
    "चौबीस": 24,
    "पच्चीस": 25,
    "छब्बीस": 26,
    "सत्ताईस": 27,
    "अट्ठाईस": 28,
    "उनतीस": 29,
    "तीस": 30,
    "इकतीस": 31
  };

  let day = null;
  let hour = null;
  let minute = 0;

  // -------- DATE PARSE --------
  const digitDateMatch = text.match(/(\d{1,2})\s*तारीख/);

  if (digitDateMatch) {
    day = parseInt(digitDateMatch[1]);
  } else {
    for (const [word, num] of Object.entries(hindiNumberMap)) {
      if (text.includes(`${word} तारीख`)) {
        day = num;
        break;
      }
    }
  }

  // -------- TIME PARSE DIGIT --------
  const digitTimeMatch = text.match(/(\d{1,2})(?::(\d{1,2}))?\s*बजे/);

  if (digitTimeMatch) {
    hour = parseInt(digitTimeMatch[1]);
    minute = parseInt(digitTimeMatch[2] || "0");
  }

  // -------- TIME PARSE WORD --------
  if (hour === null) {
    for (const [word, num] of Object.entries(hindiNumberMap)) {
      if (text.includes(`${word} बजे`)) {
        hour = num;
        break;
      }
    }
  }

  // अगर कुछ भी parse nahi hua
  if (day === null && hour === null) {
    return null;
  }

  // default values
  if (day !== null) {
    targetDate.setDate(day);
  }

  if (hour === null) {
    hour = 18; // default शाम 6
  }

  // -------- AM PM LOGIC --------
  if (
    text.includes("दिन में") ||
    text.includes("दोपहर") ||
    text.includes("शाम") ||
    text.includes("रात")
  ) {
    if (hour < 12) {
      hour += 12;
    }
  }

  if (text.includes("सुबह")) {
    if (hour === 12) {
      hour = 0;
    }
  }

  targetDate.setHours(hour, minute, 0, 0);

  return {
    date: targetDate,
    formatted: targetDate.toLocaleString("en-IN")
  };
}

module.exports = parseHindiDateTime;
