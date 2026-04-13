function parseHindiDateTime(text) {
  if (!text) return null;

  const now = new Date();
  let targetDate = new Date(now);

  const hindiNumbers = {
    "एक": 1,
    "दो": 2,
    "तीन": 3,
    "चार": 4,
    "पांच": 5,
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

  let dateNumber = null;

  // numeric date
  const numericMatch = text.match(/(\d{1,2})\s*तारीख/);
  if (numericMatch) {
    dateNumber = parseInt(numericMatch[1]);
  }

  // hindi word date
  if (!dateNumber) {
    for (const [word, num] of Object.entries(hindiNumbers)) {
      if (text.includes(word + " तारीख")) {
        dateNumber = num;
        break;
      }
    }
  }

  if (dateNumber) {
    targetDate.setDate(dateNumber);
  }

  // time
  let hour = 18;
  let minute = 0;

  const timeMatch = text.match(/(\d{1,2})(?::(\d{1,2}))?\s*बजे/);

  if (timeMatch) {
    hour = parseInt(timeMatch[1]);
    minute = parseInt(timeMatch[2] || "0");
  }

  // hindi word time
  if (text.includes("एक बजे")) hour = 1;
  if (text.includes("दो बजे")) hour = 2;
  if (text.includes("तीन बजे")) hour = 3;
  if (text.includes("चार बजे")) hour = 4;
  if (text.includes("पांच बजे")) hour = 5;
  if (text.includes("छह बजे")) hour = 6;
  if (text.includes("सात बजे")) hour = 7;
  if (text.includes("आठ बजे")) hour = 8;
  if (text.includes("नौ बजे")) hour = 9;
  if (text.includes("दस बजे")) hour = 10;
  if (text.includes("ग्यारह बजे")) hour = 11;
  if (text.includes("बारह बजे")) hour = 12;

  // AM / PM logic
  if (
    text.includes("शाम") ||
    text.includes("रात")
  ) {
    if (hour < 12) hour += 12;
  }

  if (
    text.includes("दिन में") ||
    text.includes("दोपहर")
  ) {
    if (hour < 12) hour += 12;
  }

  targetDate.setHours(hour, minute, 0, 0);

  return {
    date: targetDate,
    formatted: targetDate.toLocaleString("en-IN")
  };
}

module.exports = parseHindiDateTime;
