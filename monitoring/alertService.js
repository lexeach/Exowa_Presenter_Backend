class AlertService {
  async sendAlert(
    title,
    message
  ) {
    console.log(
      "🚨 ALERT:",
      title
    );

    console.log(message);

    /*
    Future:
    send email
    send whatsapp
    send slack
    */
  }
}

module.exports =
  new AlertService();