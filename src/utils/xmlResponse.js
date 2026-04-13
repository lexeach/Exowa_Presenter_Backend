function xmlResponse(content) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
${content}
</Response>`;
}

module.exports = xmlResponse;