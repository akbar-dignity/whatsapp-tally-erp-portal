import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { handleIncomingMessage, sendMessage } from "./whatsapp.js";
import { getOutstanding, verifyLedger } from "./tally.js";

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = "Dignity@4321";   // WhatsApp webhook verify
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

// ✅ Webhook verification
app.get("/", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

// ✅ Handle WhatsApp messages
app.post("/", async (req, res) => {
  try {
    const body = req.body;
    if (body.object) {
      const entry = body.entry?.[0]?.changes?.[0]?.value;
      const message = entry?.messages?.[0];

      if (message) {
        await handleIncomingMessage(message, PHONE_NUMBER_ID, WHATSAPP_TOKEN);
      }
    }
    res.sendStatus(200);
  } catch (err) {
    console.error("❌ Error:", err.message);
    res.sendStatus(500);
  }
});

app.listen(PORT, () => console.log(`✅ ERP Portal running at http://localhost:${PORT}`));
