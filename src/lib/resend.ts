import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
  to,
  subject,
  html,
  fromName,
  replyTo,
}: {
  to: string;
  subject: string;
  html: string;
  fromName?: string;
  replyTo?: string;
}) {
  const defaultFrom = process.env.EMAIL_FROM!;
  // Sanitize fromName to prevent email header injection
  const safeName = fromName
    ? fromName.replace(/[\r\n<>]/g, "").slice(0, 100)
    : null;
  const from = safeName
    ? `${safeName} <${defaultFrom.match(/<(.+)>/)?.[1] || defaultFrom}>`
    : defaultFrom;

  const { error } = await resend.emails.send({
    from,
    to,
    subject,
    html,
    ...(replyTo ? { replyTo } : {}),
  });

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }
}
