module.exports = {
  async call({
    phone,
    message
  }) {
    console.log(
      "☎️ Exotel calling:",
      phone
    );

    return {
      success: true,
      provider:
        "exotel"
    };
  }
};