import express from "express";

const router = express.Router();

type LeadPayload = {
  name?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  message?: string;
  vehicleId?: string;
  vehicleName?: string;
  source?: string;
};

async function postToSlack(payload: LeadPayload) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL || "";
  if (!webhookUrl) return;
  const textLines = [
    `Novo lead (${payload.source || "site"})`,
    payload.name ? `Nome: ${payload.name}` : undefined,
    payload.email ? `Email: ${payload.email}` : undefined,
    payload.phone ? `Telefone: ${payload.phone}` : undefined,
    payload.whatsapp ? `WhatsApp: ${payload.whatsapp}` : undefined,
    payload.vehicleName ? `Veículo: ${payload.vehicleName} (${payload.vehicleId || ""})` : undefined,
    payload.message ? `Mensagem: ${payload.message}` : undefined,
  ].filter(Boolean);
  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: textLines.join("\n") }),
    });
  } catch {}
}

async function sendEmail(payload: LeadPayload) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, LEAD_EMAIL_TO } = process.env as any;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !LEAD_EMAIL_TO) return;
  try {
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
    const subject = `Lead: ${payload.name || "Site"}${payload.vehicleName ? ` - ${payload.vehicleName}` : ""}`;
    const lines = [
      `Fonte: ${payload.source || "site"}`,
      payload.name ? `Nome: ${payload.name}` : undefined,
      payload.email ? `Email: ${payload.email}` : undefined,
      payload.phone ? `Telefone: ${payload.phone}` : undefined,
      payload.whatsapp ? `WhatsApp: ${payload.whatsapp}` : undefined,
      payload.vehicleName ? `Veículo: ${payload.vehicleName} (${payload.vehicleId || ""})` : undefined,
      payload.message ? `Mensagem: ${payload.message}` : undefined,
    ].filter(Boolean);
    await transporter.sendMail({
      from: `Leads <${SMTP_USER}>`,
      to: LEAD_EMAIL_TO,
      subject,
      text: lines.join("\n"),
    });
  } catch {}
}

router.post("/", async (req, res) => {
  try {
    const payload: LeadPayload = req.body || {};
    // basic sanitation
    const clean: LeadPayload = {
      name: String(payload.name || "").slice(0, 120),
      email: String(payload.email || "").slice(0, 160),
      phone: String(payload.phone || "").slice(0, 60),
      whatsapp: String(payload.whatsapp || "").slice(0, 60),
      message: String(payload.message || "").slice(0, 1000),
      vehicleId: String(payload.vehicleId || "").slice(0, 64),
      vehicleName: String(payload.vehicleName || "").slice(0, 160),
      source: String(payload.source || "site").slice(0, 80),
    };

    await Promise.all([postToSlack(clean), sendEmail(clean)]);
    res.json({ ok: true });
  } catch (e) {
    res.status(200).json({ ok: true }); // never block the UI
  }
});

export default router;

import express from "express";
import nodemailer from "nodemailer";


const router = express.Router();

// Lê variáveis de ambiente
const smtpHost = process.env.SMTP_HOST || "smtp.hostinger.com";
const smtpPort = Number(process.env.SMTP_PORT || 465);
const smtpSecure =
  process.env.SMTP_SECURE
    ? process.env.SMTP_SECURE === "true"
    : smtpPort === 465; // Porta 465 usa SSL, 587 usa STARTTLS

const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

// Configura transporte do Nodemailer
const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpSecure,
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});


// Rota de envio de contato
router.post("/", async (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !phone || !message) {
    return res
      .status(400)
      .json({ success: false, message: "Todos os campos são obrigatórios." });
  }

  try {
    const mailOptions = {
      from: `"Site JA Automóveis" <${smtpUser}>`, // melhor formatar com nome
      to: process.env.CONTACT_RECEIVER_EMAIL || "contato@jaautomoveisresende.com.br",
      replyTo: email, // permite responder direto para quem enviou
      subject: "Nova mensagem de contato",
      html: `
        <h2>Nova mensagem de contato</h2>
        <p><strong>Nome:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Telefone:</strong> ${phone}</p>
        <p><strong>Mensagem:</strong><br/>${message}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: "Mensagem enviada com sucesso." });
  } catch (error: any) {
    console.error("❌ Erro ao enviar email de contato:", {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
    });

    const isDevelopment = process.env.NODE_ENV !== "production";
    const errorMessage = isDevelopment
      ? `Erro ao enviar email: ${error.message}`
      : "Erro ao enviar a mensagem.";

    res.status(500).json({ success: false, message: errorMessage });
  }
});

export default router;
