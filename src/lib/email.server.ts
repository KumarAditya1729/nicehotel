import { WorkerMailer, type EmailOptions } from "worker-mailer";

const FROM_NAME = "Nice Hotel & Restaurant";

function getCreds() {
  const username = process.env.GMAIL_USER;
  const password = process.env.GMAIL_APP_PASSWORD;
  if (!username || !password) {
    throw new Error("Gmail credentials are not configured");
  }
  return { username, password };
}

export function adminEmail() {
  return process.env.ADMIN_EMAIL || process.env.GMAIL_USER || "";
}

type Message = Pick<EmailOptions, "to" | "subject" | "html" | "reply">;

export async function sendEmails(messages: Message[]) {
  const { username, password } = getCreds();
  const mailer = await WorkerMailer.connect({
    host: "smtp.gmail.com",
    port: 587,
    secure: true,
    startTls: true,
    credentials: { username, password },
    authType: "login",
  });
  try {
    for (const m of messages) {
      await mailer.send({
        from: { name: FROM_NAME, email: username },
        to: m.to,
        subject: m.subject,
        html: m.html,
        reply: m.reply,
      });
    }
  } finally {
    await mailer.close().catch(() => {});
  }
}
