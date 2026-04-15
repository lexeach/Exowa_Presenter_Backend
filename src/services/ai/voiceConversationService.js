async function getAIReply(transcript) {
  const text = transcript.toLowerCase();

  if (
    text.includes("हाँ") ||
    text.includes("yes")
  ) {
    return "बहुत बढ़िया। आपके बच्चे की class क्या है?";
  }

  if (
    text.includes("11") ||
    text.includes("ग्यारह")
  ) {
    return "बहुत अच्छा। क्या आप demo कल शाम 6 बजे लेना चाहेंगे?";
  }

  if (
    text.includes("ठीक") ||
    text.includes("हाँ")
  ) {
    return "धन्यवाद। आपका demo booked है।";
  }

  return "कृपया एक बार फिर बताइए।";
}

module.exports = {
  getAIReply
};
