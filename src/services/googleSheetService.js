const { google } = require("googleapis");

class GoogleSheetService {

constructor() {

this.sheetId = process.env.GOOGLE_SHEET_ID;

}

async appendLead(lead) {

console.log("Appending lead to sheet", lead);

/* TODO:
Google Sheets API integration
*/

return {
success: true
};

}

async fetchLeads() {

/* TODO:
read google sheet rows
*/

return [];

}

}

module.exports = new GoogleSheetService();