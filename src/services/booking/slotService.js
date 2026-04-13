const Lead = require("../../models/Lead");
const { parseSlot } = require("../../utils/timeParser");

async function saveDemoSlot(phone, text) {
  const slot = parseSlot(text);

  await Lead.findOneAndUpdate(
    { phone },
    {
      status: "DEMO_BOOKED",
      demoSlot: slot,
      transcript: text
    }
  );

  return slot;
}

module.exports = { saveDemoSlot };