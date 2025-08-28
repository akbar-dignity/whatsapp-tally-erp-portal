import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { handleIncomingMessage } from "./whatsapp.js";
import fs from "fs";
import path from "path";

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "Dignity@4321";
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

// -------------------
// Webhook verification (Meta WhatsApp)
// -------------------
app.get("/", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  // ✅ Only respond if mode=subscribe & token matches
  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verified successfully");
    return res.status(200).send(challenge); // send hub.challenge as plain text
  }

  console.warn("❌ Webhook verification failed");
  return res.sendStatus(403);
});

// -------------------
// WhatsApp webhook handler (incoming messages)
// -------------------
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

    return res.sendStatus(200); // Always respond 200 to WhatsApp
  } catch (err) {
    console.error("❌ Error processing WhatsApp message:", err.message);
    return res.sendStatus(500);
  }
});

// -------------------
// Admin GUI endpoints
// -------------------
let conversations = {};

app.get("/conversations", (req, res) => res.json(conversations));

app.post("/update-rules", (req, res) => {
  try {
    fs.writeFileSync(
      path.join(process.cwd(), "backend/rules.json"),
      JSON.stringify(req.body, null, 2)
    );
    return res.json({ success: true, message: "Rules updated successfully" });
  } catch (err) {
    console.error("❌ Error updating rules:", err.message);
    return res.status(500).json({ success: false, message: "Error updating rules" });
  }
});

// -------------------
// Start server
// -------------------
app.listen(PORT, () => {
  console.log(`✅ ERP Portal running at http://localhost:${PORT}`);
  console.log(`Webhook verify token: ${VERIFY_TOKEN}`);
});
