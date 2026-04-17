function escapeXML(text = "") {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function xmlResponse(text = "") {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>

  <GetInput 
    action="https://exowa-presenter-backend.onrender.com/api/voice/realtime"
    method="POST"
    inputType="speech"
    execution="async"
    bargein="true"
    speechTimeout="auto"
    timeout="15">

    <Speak language="hi-IN" voice="WOMAN">
      ${text}
    </Speak>

  </GetInput>

</Response>`;
}
module.exports = xmlResponse;
