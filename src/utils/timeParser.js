function parseSlot(text) {
  const date = new Date();

  if (text.includes("कल")) {
    date.setDate(date.getDate() + 1);
  }

  let hour = 18;

  if (text.includes("8")) hour = 20;
  if (text.includes("6")) hour = 18;
  if (text.includes("सुबह")) hour = 10;

  date.setHours(hour, 0, 0, 0);

  return date;
}

module.exports = { parseSlot };function xmlResponse(content) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
${content}
</Response>`;
}

module.exports = xmlResponse;