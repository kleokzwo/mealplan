import { transporter } from "../utils/smtpTransport.js";

export async function sendMail({ to, subject, html }) {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html,
    });

    console.log("MAIL SENT:", info.messageId);
    return info;
  } catch (err) {
    console.error("MAIL ERROR:", err);
    throw err;
  }
}