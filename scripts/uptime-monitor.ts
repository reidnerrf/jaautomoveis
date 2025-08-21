import fs from "fs/promises";
import path from "path";
import nodemailer from "nodemailer";

const MONITOR_URL = process.env.MONITOR_URL || "http://localhost:5000/health";
const TIMEOUT_MS = Number(process.env.MONITOR_TIMEOUT_MS || 5000);
const STATE_FILE = process.env.MONITOR_STATE_FILE || "/tmp/uptime-monitor-state.json";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "";

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    // @ts-ignore Node18 global fetch
    const res: Response = await fetch(url, { signal: controller.signal } as any);
    return res;
  } finally {
    clearTimeout(timer);
  }
}

async function readState(): Promise<"up" | "down" | null> {
  try {
    const data = await fs.readFile(STATE_FILE, "utf-8");
    const parsed = JSON.parse(data);
    if (parsed && (parsed.status === "up" || parsed.status === "down")) return parsed.status;
    return null;
  } catch {
    return null;
  }
}

async function writeState(status: "up" | "down") {
  try {
    await fs.mkdir(path.dirname(STATE_FILE), { recursive: true });
  } catch {}
  await fs.writeFile(STATE_FILE, JSON.stringify({ status, ts: Date.now() }));
}

function buildTransport() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = (process.env.SMTP_SECURE || "true") === "true";
  const user = process.env.EMAIL_USERNAME || "";
  const pass = process.env.EMAIL_PASSWORD || "";
  if (!user || !pass) {
    throw new Error("EMAIL_USERNAME and EMAIL_PASSWORD must be set for uptime monitor");
  }
  return nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
}

async function sendEmail(subject: string, html: string) {
  if (!ADMIN_EMAIL) {
    throw new Error("ADMIN_EMAIL is required to send uptime notifications");
  }
  const transporter = buildTransport();
  const from = process.env.EMAIL_FROM || process.env.EMAIL_USERNAME || ADMIN_EMAIL;
  await transporter.sendMail({ from, to: ADMIN_EMAIL, subject, html });
}

async function main() {
  const prev = await readState();
  let isUp = false;
  try {
    const res = await fetchWithTimeout(MONITOR_URL, TIMEOUT_MS);
    isUp = res.ok;
  } catch {
    isUp = false;
  }

  const curr: "up" | "down" = isUp ? "up" : "down";

  if (prev !== curr) {
    // State changed -> notify
    if (curr === "down") {
      await sendEmail(
        "[ALERTA] Site indisponível",
        `<p>O monitor detectou indisponibilidade do site em <strong>${MONITOR_URL}</strong>.</p>
         <p>Horário: ${new Date().toLocaleString()}</p>`
      );
    } else {
      await sendEmail(
        "[RECUPERAÇÃO] Site voltou ao ar",
        `<p>O site voltou a responder em <strong>${MONITOR_URL}</strong>.</p>
         <p>Horário: ${new Date().toLocaleString()}</p>`
      );
    }
  }

  await writeState(curr);
}

main().catch((err) => {
  console.error("Uptime monitor error:", err);
  process.exit(1);
});

