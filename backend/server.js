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

// Webhook verification
app.get("/", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

// WhatsApp webhook handler
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

// Admin GUI: conversation logs
let conversations = {};
app.get("/conversations", (req, res) => res.json(conversations));
app.post("/update-rules", (req, res) => {
  fs.writeFileSync(path.join(process.cwd(), "backend/rules.json"), JSON.stringify(req.body, null, 2));
  res.json({ success: true, message: "Rules updated successfully" });
});

app.listen(PORT, () => console.log(`✅ ERP Portal running at http://localhost:${PORT}`));
