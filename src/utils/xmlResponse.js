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

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>

  <GetInput 
    action="https://exowa-presenter-backend.onrender.com/api/voice/realtime" 
    method="POST" 
    inputType="speech"
    speechTimeout="auto"
    timeout="10">

    <Speak language="hi-IN" voice="WOMAN">
      ${safeText}
    </Speak>

  </GetInput>

  <!-- अगर user कुछ नहीं बोले -->
  <Speak language="hi-IN" voice="WOMAN">
    क्या आप मुझे सुन पा रहे हैं? कृपया कुछ बोलिए।
  </Speak>

  <!-- फिर दुबारा सुनो -->
  <GetInput 
    action="https://exowa-presenter-backend.onrender.com/api/voice/realtime" 
    method="POST" 
    inputType="speech"
    timeout="8">
  </GetInput>

</Response>`;
}

module.exports = xmlResponse;
