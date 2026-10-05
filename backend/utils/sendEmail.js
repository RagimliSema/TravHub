import nodemailer from "nodemailer";

/*
  Email göndərmə (SMTP, nodemailer).
  Ayarlar backend/.env-dədir: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM.

  SMTP qurulmayıbsa məktub GÖNDƏRİLMİR:
  - development: məktub backend terminalına yazılır (yalnız serveri işlədən görür);
  - test: yaddaşdakı devOutbox-a yazılır (avtomatik testlər linki oradan götürür);
  - production: göndərmək mümkün deyil – canSendEmail() false qaytarır.
*/

// dəyərin əvvəlində/sonunda təsadüfən qalan boşluq (məs. "smtp-relay.brevo.com ") DNS xətası verir
const env = (name) => (process.env[name] ?? "").trim();

export const isEmailConfigured = () => !!(env("SMTP_HOST") && env("EMAIL_FROM"));

export const canSendEmail = () => isEmailConfigured() || process.env.NODE_ENV !== "production";

// göndərilməyən məktublar (development / test) – yalnız son 20-si saxlanılır
export const devOutbox = [];

let transporter;

const getTransporter = () => {
  const port = Number(env("SMTP_PORT")) || 587;
  transporter ??= nodemailer.createTransport({
    host: env("SMTP_HOST"),
    port,
    secure: port === 465, // 465 → SSL, 587 / 2525 → STARTTLS
    auth: env("SMTP_USER") ? { user: env("SMTP_USER"), pass: env("SMTP_PASS") } : undefined,
  });
  return transporter;
};

export async function sendEmail({ to, subject, text, html }) {
  if (isEmailConfigured()) {
    await getTransporter().sendMail({ from: env("EMAIL_FROM"), to, subject, text, html });
    return { delivered: true };
  }

  devOutbox.push({ to, subject, text });
  if (devOutbox.length > 20) devOutbox.shift();

  if (process.env.NODE_ENV === "development") {
    console.log(`\n[DEV EMAIL – NOT SENT, SMTP is not configured]\nTo: ${to}\nSubject: ${subject}\n\n${text}\n`);
  }
  return { delivered: false };
}
