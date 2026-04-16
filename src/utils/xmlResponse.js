// src/utils/xmlResponse.js

function escapeXML(text = "") {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function xmlResponse(text = "") {
  const safeText = escapeXML(text).trim();

  return (
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<Response>' +
    '<Speak language="hi-IN" voice="WOMAN">' +
    safeText +
    '</Speak>' +
    '</Response>'
  );
}

module.exports = xmlResponse;
