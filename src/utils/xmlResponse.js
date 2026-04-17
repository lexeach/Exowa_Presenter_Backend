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

      // 🔥 MAIN FIX: keep call alive + listen user
      '<GetInput action="/api/voice/realtime" method="POST" inputType="speech" timeout="5">' +
        '<Speak language="hi-IN" voice="WOMAN">' +
          safeText +
        '</Speak>' +
      '</GetInput>' +

      // 🔁 fallback if user does not speak
      '<Speak language="hi-IN" voice="WOMAN">' +
        'हम आपकी प्रतिक्रिया प्राप्त नहीं कर सके। धन्यवाद।' +
      '</Speak>' +

    '</Response>'
  );
}

module.exports = xmlResponse;
