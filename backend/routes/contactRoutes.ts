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
