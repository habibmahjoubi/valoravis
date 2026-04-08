import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { NICHE_CONFIGS } from "@/config/niches";
import { AddClientForm } from "@/components/dashboard/add-client-form";
import { SendReviewButton } from "@/components/dashboard/send-review-button";
import { DeleteClientButton } from "@/components/dashboard/delete-client-button";
import { EditClientForm } from "@/components/dashboard/edit-client-form";
import { CsvImport } from "@/components/dashboard/csv-import";
import { PreviewButton } from "@/components/dashboard/preview-modal";

export default async function ClientsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
  });

  const clients = await prisma.client.findMany({
    where: { userId: session.user.id },
    include: {
      _count: { select: { reviewRequests: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const nicheConfig = NICHE_CONFIGS[user.niche];
  const vocab = nicheConfig.vocabulary;
  const clientLabel =
    vocab.clients.charAt(0).toUpperCase() + vocab.clients.slice(1);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">{clientLabel}</h1>
          <p className="text-sm text-muted-foreground">
            {clients.length} {clients.length !== 1 ? vocab.clients : vocab.client}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <AddClientForm />
        <CsvImport />
      </div>

      {/* Client list */}
      <div className="bg-card border border-border rounded-xl overflow-x-auto">
        {clients.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            Aucun {vocab.client}. Ajoutez votre premier {vocab.client} ci-dessus.
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                  Nom
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                  Contact
                </th>
                <th className="hidden sm:table-cell text-left text-xs font-medium text-muted-foreground px-4 py-3">
                  Demandes
                </th>
                <th className="hidden sm:table-cell text-left text-xs font-medium text-muted-foreground px-4 py-3">
                  Ajouté le
                </th>
                <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr
                  key={client.id}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium">{client.name}</p>
                    {client.notes && (
                      <p className="text-xs text-muted-foreground">
                        {client.notes}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {client.email && <p>{client.email}</p>}
                    {client.phone && <p>{client.phone}</p>}
                  </td>
                  <td className="hidden sm:table-cell px-4 py-3 text-sm">
                    {client._count.reviewRequests}
                  </td>
                  <td className="hidden sm:table-cell px-4 py-3 text-sm text-muted-foreground">
                    {formatDate(client.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center justify-end gap-1">
                      <PreviewButton
                        clientName={client.name}
                        businessName={user.businessName || "Établissement"}
                        channel="EMAIL"
                        templateBody={nicheConfig.templates.EMAIL.body}
                        templateSubject={nicheConfig.templates.EMAIL.subject}
                      />
                      <SendReviewButton
                        clientId={client.id}
                        hasEmail={!!client.email}
                        hasPhone={!!client.phone}
                      />
                      <EditClientForm
                        clientId={client.id}
                        name={client.name}
                        email={client.email}
                        phone={client.phone}
                        notes={client.notes}
                      />
                      <DeleteClientButton clientId={client.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
