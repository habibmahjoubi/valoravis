import twilio from "twilio";
import type { Twilio } from "twilio";

// Construction paresseuse : ne pas exiger les identifiants au moment du build.
let _client: Twilio | null = null;
function getClient(): Twilio {
  if (!_client) {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      throw new Error("Identifiants Twilio manquants");
    }
    _client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
  return _client;
}

/** 06 12 34 56 78 → +33612345678 (format E.164). */
export function formatFrPhone(phone: string): string {
  let p = phone.replace(/[\s.\-()]/g, "").trim();
  if (p.startsWith("00")) p = "+" + p.slice(2);
  if (p.startsWith("0")) p = "+33" + p.slice(1);
  if (!p.startsWith("+")) p = "+" + p;
  return p;
}

export async function sendSms({
  to,
  body,
  senderId,
}: {
  to: string;
  body: string;
  /**
   * Sender ID alphanumérique (nom du commerce, ≤11 car. alphanum.).
   * Utilisé uniquement vers la France (+33) — l'expéditeur alphanumérique n'est
   * pas supporté partout et le destinataire ne peut pas répondre.
   * Sinon, repli sur le numéro Twilio partagé.
   */
  senderId?: string | null;
}) {
  const formattedTo = formatFrPhone(to);
  const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

  // SMS_SENDER_ID (variable d'env) prend le pas sur le nom du commerce : un seul
  // Sender ID à enregistrer auprès de Twilio pour la France.
  const candidate = process.env.SMS_SENDER_ID?.trim() || senderId || "";
  const useSenderId =
    /^[A-Za-z0-9]{1,11}$/.test(candidate) &&
    /[A-Za-z]/.test(candidate) &&
    formattedTo.startsWith("+33");

  const from = useSenderId ? candidate : twilioNumber;
  if (!from) {
    throw new Error("Aucun expéditeur SMS configuré (TWILIO_PHONE_NUMBER manquant)");
  }

  const message = await getClient().messages.create({
    body,
    from,
    to: formattedTo,
  });

  if (message.errorCode) {
    throw new Error(`SMS failed: ${message.errorMessage}`);
  }

  return message.sid;
}
