
require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");

const app = express();

app.use(helmet());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/applications", rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5
}), async (req, res) => {
  try {
    const { fullName, phone, income, loanAmount, repaymentPeriod, purpose, consent } = req.body;

    if (!fullName || !phone || !income || !loanAmount || !repaymentPeriod || consent !== true) {
      return res.status(400).json({ error: "Complete all required fields." });
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      return res.status(503).json({ error: "Telegram setup is incomplete." });
    }

    const message = [
      "NEW LOAN APPLICATION",
      `Name: ${String(fullName).slice(0, 80)}`,
      `Phone: ${String(phone).slice(0, 25)}`,
      `Monthly income: ${income} LSL`,
      `Requested amount: ${loanAmount} LSL`,
      `Repayment: ${repaymentPeriod}`,
      `Purpose: ${String(purpose || "Not provided").slice(0, 250)}`
    ].join("\n");

    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: message })
      }
    );

    const result = await response.json();

    if (!response.ok || !result.ok) {
      return res.status(502).json({ error: "Telegram delivery failed." });
    }

    res.json({ ok: true, message: "Application submitted successfully." });

  } catch (error) {
    res.status(500).json({ error: "Server error. Try again." });
  }
});

app.listen(3000, () => {
  console.log("Website running at http://localhost:3000");
});
