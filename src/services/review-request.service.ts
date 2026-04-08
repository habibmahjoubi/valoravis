import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/resend";
import { sendSms } from "@/lib/sms";
import { NICHE_CONFIGS } from "@/config/niches";
import { absoluteUrl } from "@/lib/utils";
import type { Channel, Niche } from "@/generated/prisma/enums";

function resolveTemplate(
  template: string,
  vars: Record<string, string>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] || "");
}

export async function createReviewRequest({
  userId,
  clientId,
  channel,
  delayHours,
}: {
  userId: string;
  clientId: string;
  channel: Channel;
  delayHours?: number;
}) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
  });

  if (user.quotaUsed >= user.monthlyQuota) {
    throw new Error("Quota mensuel atteint. Passez au plan supérieur.");
  }

  // US22 - Anti-doublons : check for recent request to same client
  const recentRequest = await prisma.reviewRequest.findFirst({
    where: {
      clientId,
      userId,
      createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      status: { not: "FAILED" },
    },
  });
  if (recentRequest) {
    throw new Error(
      "Une demande a déjà été envoyée à ce client il y a moins de 7 jours."
    );
  }

  const nicheConfig = NICHE_CONFIGS[user.niche];
  const delay = delayHours !== undefined ? delayHours : nicheConfig.defaultDelay;

  const scheduledAt = new Date(Date.now() + delay * 60 * 60 * 1000);

  // Transaction atomique : créer la demande + incrémenter le quota
  const [request] = await prisma.$transaction([
    prisma.reviewRequest.create({
      data: {
        userId,
        clientId,
        channel,
        scheduledAt,
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { quotaUsed: { increment: 1 } },
    }),
  ]);

  // Envoi immediat si delai = 0
  if (delay === 0) {
    const client = await prisma.client.findUniqueOrThrow({
      where: { id: clientId, userId },
    });

    const customTemplate = await prisma.template.findFirst({
      where: { userId, niche: user.niche, channel },
      orderBy: { isDefault: "desc" },
    });
    const template = customTemplate
      ? { subject: customTemplate.subject || undefined, body: customTemplate.body }
      : nicheConfig.templates[channel];

    const vars = {
      clientName: client.name,
      businessName: user.businessName || "notre établissement",
      link: absoluteUrl(`/review/${request.token}`),
    };

    try {
      if (channel === "EMAIL" && client.email) {
        await sendEmail({
          to: client.email,
          subject: resolveTemplate(template.subject || nicheConfig.templates[channel].subject || "Votre avis compte", vars),
          html: resolveTemplate(template.body, vars),
        });
      } else if (channel === "SMS" && client.phone) {
        await sendSms({
          to: client.phone,
          body: resolveTemplate(template.body, vars),
        });
      }

      await prisma.reviewRequest.update({
        where: { id: request.id },
        data: { status: "SENT", sentAt: new Date() },
      });
    } catch (error) {
      console.error(`Failed to send request ${request.id}:`, error);
      await prisma.reviewRequest.update({
        where: { id: request.id },
        data: { status: "FAILED" },
      });
    }
  }

  return request;
}

export async function processPendingRequests() {
  const pending = await prisma.reviewRequest.findMany({
    where: {
      status: "PENDING",
      scheduledAt: { lte: new Date() },
    },
    include: {
      user: true,
      client: true,
    },
    take: 50,
  });

  const results = { sent: 0, failed: 0 };

  for (const request of pending) {
    try {
      const { user, client } = request;
      const nicheConfig = NICHE_CONFIGS[user.niche];

      // US15-16 - Check for custom template first (prefer default)
      const customTemplate = await prisma.template.findFirst({
        where: { userId: user.id, niche: user.niche, channel: request.channel },
        orderBy: { isDefault: "desc" },
      });
      const template = customTemplate
        ? {
            subject: customTemplate.subject || undefined,
            body: customTemplate.body,
          }
        : nicheConfig.templates[request.channel];

      const vars = {
        clientName: client.name,
        businessName: user.businessName || "notre établissement",
        link: absoluteUrl(`/review/${request.token}`),
      };

      if (request.channel === "EMAIL" && client.email) {
        await sendEmail({
          to: client.email,
          subject: resolveTemplate(template.subject || nicheConfig.templates[request.channel].subject || "Votre avis compte", vars),
          html: resolveTemplate(template.body, vars),
        });
      } else if (request.channel === "SMS" && client.phone) {
        // SMS sending would go here (Twilio integration)
        await sendSms({
          to: client.phone,
          body: resolveTemplate(template.body, vars),
        });
      }

      await prisma.reviewRequest.update({
        where: { id: request.id },
        data: { status: "SENT", sentAt: new Date() },
      });
      results.sent++;
    } catch (error) {
      console.error(`Failed to send request ${request.id}:`, error);
      await prisma.reviewRequest.update({
        where: { id: request.id },
        data: { status: "FAILED" },
      });
      results.failed++;
    }
  }

  return results;
}
