function detectIntent(text) {
  const transcript = text.toLowerCase();

  if (
    transcript.includes("कल") ||
    transcript.includes("आज") ||
    transcript.includes("शाम") ||
    transcript.includes("सुबह") ||
    transcript.includes("बजे")
  ) {
    return {
      intent: "BOOK_SLOT",
      slotText: text
    };
  }

  if (
    transcript.includes("बाद में") ||
    transcript.includes("फिर")
  ) {
    return {
      intent: "CALL_BACK"
    };
  }

  return {
    intent: "UNKNOWN"
  };
}

module.exports = { detectIntent };