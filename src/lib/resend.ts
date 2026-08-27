import { Resend } from "resend";

// Construction paresseuse : ne pas exiger la clé au moment du build.
let _resend: Resend | null = null;
export function getResend(): Resend {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY manquant");
    }
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

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

  const { error } = await getResend().emails.send({
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
