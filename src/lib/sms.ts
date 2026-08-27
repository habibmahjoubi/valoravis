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

export async function sendSms({
  to,
  body,
}: {
  to: string;
  body: string;
}) {
  // Format numéro français : 06... → +336...
  let formattedTo = to.trim();
  if (formattedTo.startsWith("0")) {
    formattedTo = "+33" + formattedTo.slice(1);
  }
  if (!formattedTo.startsWith("+")) {
    formattedTo = "+" + formattedTo;
  }

  const message = await getClient().messages.create({
    body,
    from: process.env.TWILIO_PHONE_NUMBER!,
    to: formattedTo,
  });

  if (message.errorCode) {
    throw new Error(`SMS failed: ${message.errorMessage}`);
  }

  return message.sid;
}
