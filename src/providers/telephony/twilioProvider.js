module.exports = {
  async call({
    phone,
    message
  }) {
    console.log(
      "☎️ Twilio calling:",
      phone
    );

    return {
      success: true,
      provider:
        "twilio"
    };
  }
};