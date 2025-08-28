import axios from "axios";
import fs from "fs";
import path from "path";

let conversations = {}; // in-memory logs
let sessions = {}; // user session state

const rulesPath = path.join(process.cwd(), "backend/rules.json");
function loadRules() { return JSON.parse(fs.readFileSync(rulesPath, "utf8")); }

export async function handleIncomingMessage(message, phoneId, token) {
  const from = message.from;
  const text = message.text?.body?.trim();
  if (!text) return;

  if (!conversations[from]) conversations[from] = [];
  conversations[from].push({ from: "user", text });

  if (!sessions[from]) sessions[from] = { state: "new" };

  const rules = loadRules();
  const welcome = rules["welcome"];
  const fallback = rules["fallback"];

  // First interaction
  if (sessions[from].state === "new") {
    sessions[from].state = "awaiting_ledger";
    return sendText(phoneId, token, from, "Welcome! Please enter your Ledger Name to verify your account.");
  }

  // Ledger verification simulation (replace with Tally lookup)
  if (sessions[from].state === "awaiting_ledger") {
    if (text.toLowerCase().includes("ledger")) {
      sessions[from].state = "verified";
      await sendText(phoneId, token, from, `✅ Ledger verified: ${text}`);
      return sendButtons(phoneId, token, from, welcome.text, welcome.buttons);
    } else {
      return sendText(phoneId, token, from, "❌ Ledger not found. Please type 'Ledger <YourName>'");
    }
  }

  // Verified user fallback
  await sendButtons(phoneId, token, from, fallback.text, fallback.buttons);
}

// send simple text
async function sendText(phoneId, token, to, text) {
  if (!conversations[to]) conversations[to] = [];
  conversations[to].push({ from: "bot", text });

  await axios.post(
    `https://graph.facebook.com/v20.0/${phoneId}/messages`,
    { messaging_product: "whatsapp", to, text: { body: text } },
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

// send buttons (max 3)
async function sendButtons(phoneId, token, to, text, buttons) {
  const btnArray = buttons.slice(0,3).map(b => ({ type: "reply", reply: { id: b.id, title: b.title } }));
  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: { type: "button", body: { text }, action: { buttons: btnArray } }
  };
  await axios.post(`https://graph.facebook.com/v20.0/${phoneId}/messages`, payload, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
  });
}
