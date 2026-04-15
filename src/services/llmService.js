async function getLLMReply({ transcript, stage, lead }) {
  if (!transcript) {
    return `नमस्ते ${lead?.name || "जी"},
मैं Exowa से मीरा बोल रही हूँ।
क्या अभी 2 मिनट बात करने का सही समय है?`;
  }

  return `धन्यवाद।
क्या मैं आपके बच्चे की class जान सकती हूँ?`;
}

module.exports = {
  getLLMReply
};
