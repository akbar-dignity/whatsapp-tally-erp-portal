import axios from "axios";
import { verifyLedger, getOutstanding } from "./tally.js";

export async function handleIncomingMessage(message, phoneId, token) {
  const from = message.from;
  const text = message.text?.body?.trim();

  if (!text) return;

  console.log(`📩 ${from}: ${text}`);

  // First step: Verify Ledger Name
  if (text.startsWith("verify")) {
    const ledgerName = text.split(" ")[1];
    const verified = await verifyLedger(ledgerName);
    if (verified) {
      await sendMessage(phoneId, token, from, `✅ Welcome *${ledgerName}*! You are now verified.`);
    } else {
      await sendMessage(phoneId, token, from, `❌ Ledger "${ledgerName}" not found.`);
    }
    return;
  }

  // Check outstanding
  if (text === "outstanding") {
    const balance = await getOutstanding(from);
    await sendMessage(phoneId, token, from, `📊 Your outstanding balance is: *${balance}*`);
    return;
  }

  // Default
  await sendMessage(phoneId, token, from, `🤖 Options:\n1️⃣ Send "verify <ledgername>"\n2️⃣ Send "outstanding"`);
}

export async function sendMessage(phoneId, token, to, text) {
  await axios.post(
    `https://graph.facebook.com/v20.0/${phoneId}/messages`,
    {
      messaging_product: "whatsapp",
      to,
      text: { body: text }
    },
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
}
