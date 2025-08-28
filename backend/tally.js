import axios from "axios";

// Example: Verify Ledger
export async function verifyLedger(ledgerName) {
  try {
    // Call Tally API (replace port with your Tally XML port)
    const res = await axios.post("http://localhost:9000", `
      <ENVELOPE>
        <HEADER><TALLYREQUEST>Export Data</TALLYREQUEST></HEADER>
        <BODY>
          <EXPORTDATA>
            <REQUESTDESC>
              <STATICVARIABLES>
                <SVCURRENTCOMPANY>MyCompany</SVCURRENTCOMPANY>
              </STATICVARIABLES>
              <REPORTNAME>Ledger Vouchers</REPORTNAME>
            </REQUESTDESC>
          </EXPORTDATA>
        </BODY>
      </ENVELOPE>
    `, { headers: { "Content-Type": "text/xml" }});

    return res.data.includes(ledgerName);
  } catch (e) {
    console.error("❌ Tally Error:", e.message);
    return false;
  }
}

export async function getOutstanding(ledgerName) {
  try {
    // Dummy until connected to Tally
    return "OMR 150.00";
  } catch (e) {
    return "Error fetching outstanding";
  }
}
