const { GoogleSpreadsheet } = require("google-spreadsheet");
const { JWT } = require("google-auth-library");

const serviceAccountAuth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const doc = new GoogleSpreadsheet(process.env.SHEET_ID, serviceAccountAuth);

async function loadSheet() {
  await doc.loadInfo();
  return doc.sheetsByTitle["Leads"];
}

async function getNewLeads() {
  const sheet = await loadSheet();
  const rows = await sheet.getRows();

  console.log("TOTAL ROWS:", rows.length);

  const leads = rows.filter(row => {
    const phone = row._rawData[0];
    const sent  = row._rawData[1];

    console.log("Row →", phone, "| sent:", sent);

    return phone && sent !== "yes";
  });

  console.log("FILTERED:", leads.length);

  return leads;
}

async function markSent(row) {
  try {
    row._rawData[1] = "yes";   // column B update
    await row.save();
    console.log("✅ Updated →", row._rawData[0]);
  } catch (err) {
    console.log("Sheet update error:", err.message);
  }
}

module.exports = { getNewLeads, markSent };