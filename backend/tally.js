export async function verifyLedger(ledgerName) {
  // TODO: integrate with Tally database
  return ledgerName.toLowerCase().includes("ledger");
}

export async function getOutstanding(ledgerName) {
  // TODO: fetch from Tally database
  return "OMR 150.00";
}
