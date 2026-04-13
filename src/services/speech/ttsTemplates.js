const prompts = {
  welcome: `
    <Speak language="hi-IN">
      नमस्ते।
      मैं Exowa से बोल रही हूँ।

      कृपया demo class का समय बताइए।
      उदाहरण: कल शाम 6 बजे।
    </Speak>
  `,

  confirm: (slot) => `
    <Speak language="hi-IN">
      धन्यवाद।
      आपका demo ${slot} के लिए book कर दिया गया है।
    </Speak>
  `,

  retry: `
    <Speak language="hi-IN">
      कृपया समय दोबारा बताइए।
      उदाहरण: कल शाम 6 बजे।
    </Speak>
  `
};

module.exports = prompts;