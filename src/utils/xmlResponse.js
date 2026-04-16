// src/utils/xmlResponse.js

function escapeXML(text = "") {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function xmlResponse(content = "") {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
${escapeXML(content)}
</Response>`;
}

module.exports = xmlResponse;
