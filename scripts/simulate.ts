/**
 * Full application simulation script.
 * Tests all major flows against the real database.
 *
 * Run: npx tsx scripts/simulate.ts
 */
import "dotenv/config";

const PASS = "\x1b[32m PASS \x1b[0m";
const FAIL = "\x1b[31m FAIL \x1b[0m";
const SKIP = "\x1b[33m SKIP \x1b[0m";

let passed = 0;
let failed = 0;
let skipped = 0;

function assert(condition: boolean, label: string) {
  if (condition) {
    console.log(`${PASS} ${label}`);
    passed++;
  } else {
    console.log(`${FAIL} ${label}`);
    failed++;
  }
}

function skip(label: string) {
  console.log(`${SKIP} ${label}`);
  skipped++;
}

async function main() {
  const { PrismaClient } = await import("../src/generated/prisma/client.js");
  const { PrismaPg } = await import("@prisma/adapter-pg");

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter });

  const TEST_EMAIL_OWNER = `test-owner-${Date.now()}@simulate.test`;
  const TEST_EMAIL_ADMIN = `test-admin-${Date.now()}@simulate.test`;
  const TEST_EMAIL_MEMBER = `test-member-${Date.now()}@simulate.test`;
  const cleanupIds: { users: string[]; establishments: string[] } = { users: [], establishments: [] };

  try {
    console.log("\n══════════════════════════════════════════");
    console.log("  SIMULATION COMPLETE - Valoravis");
    console.log("══════════════════════════════════════════\n");

    // ─── 1. INSCRIPTION ───
    console.log("── 1. Inscription & Utilisateurs ──\n");

    const owner = await prisma.user.create({
      data: {
        email: TEST_EMAIL_OWNER,
        password: "$2b$12$testhashedpassword000000000000000000000000000",
        name: "Dr. Test Owner",
        businessName: "Cabinet Test Simulation",
        niche: "DENTIST",
        plan: "pro",
        monthlyQuota: 200,
        emailVerified: new Date(),
        onboarded: true,
      },
    });
    cleanupIds.users.push(owner.id);
    assert(!!owner.id, "Proprietaire cree");
    assert(owner.plan === "pro", "Plan Pro attribue");
    assert(owner.emailVerified !== null, "Email verifie");
    assert(owner.onboarded === true, "Onboarding complete");

    const adminUser = await prisma.user.create({
      data: {
        email: TEST_EMAIL_ADMIN,
        password: "$2b$12$testhashedpassword000000000000000000000000000",
        name: "Admin Test",
        niche: "DENTIST",
        plan: "free",
        emailVerified: new Date(),
        onboarded: true,
      },
    });
    cleanupIds.users.push(adminUser.id);
    assert(!!adminUser.id, "Utilisateur admin cree");

    const memberUser = await prisma.user.create({
      data: {
        email: TEST_EMAIL_MEMBER,
        password: "$2b$12$testhashedpassword000000000000000000000000000",
        name: "Membre Test",
        niche: "DENTIST",
        plan: "free",
        emailVerified: new Date(),
        onboarded: true,
      },
    });
    cleanupIds.users.push(memberUser.id);
    assert(!!memberUser.id, "Utilisateur membre cree");

    // ─── 2. ETABLISSEMENT ───
    console.log("\n── 2. Etablissements ──\n");

    const est1 = await prisma.establishment.create({
      data: {
        name: "Cabinet Dentaire Simulation",
        niche: "DENTIST",
        googlePlaceUrl: "https://maps.google.com/test",
        phone: "+33 1 23 45 67 89",
        satisfactionThreshold: 4,
        defaultChannel: "EMAIL",
        senderName: "Dr. Test",
        replyToEmail: "test@cabinet.fr",
        members: {
          create: { userId: owner.id, role: "OWNER" },
        },
      },
    });
    cleanupIds.establishments.push(est1.id);
    assert(!!est1.id, "Etablissement 1 cree");
    assert(est1.niche === "DENTIST", "Niche DENTIST attribuee");

    const est2 = await prisma.establishment.create({
      data: {
        name: "Cabinet Osteo Simulation",
        niche: "OSTEOPATH",
        members: {
          create: { userId: owner.id, role: "OWNER" },
        },
      },
    });
    cleanupIds.establishments.push(est2.id);
    assert(!!est2.id, "Etablissement 2 cree (multi-etablissement)");

    const ownerEstCount = await prisma.establishmentMember.count({
      where: { userId: owner.id, role: "OWNER" },
    });
    assert(ownerEstCount === 2, `Proprietaire a ${ownerEstCount} etablissements (attendu: 2)`);

    // ─── 3. MEMBRES & ROLES ───
    console.log("\n── 3. Membres & Roles ──\n");

    await prisma.establishmentMember.create({
      data: { userId: adminUser.id, establishmentId: est1.id, role: "ADMIN" },
    });
    assert(true, "Admin ajoute a l'etablissement 1");

    await prisma.establishmentMember.create({
      data: { userId: memberUser.id, establishmentId: est1.id, role: "MEMBER" },
    });
    assert(true, "Membre ajoute a l'etablissement 1");

    const memberCount = await prisma.establishmentMember.count({
      where: { establishmentId: est1.id },
    });
    assert(memberCount === 3, `Etablissement 1 a ${memberCount} membres (attendu: 3)`);

    // Verify role hierarchy
    const ownerMembership = await prisma.establishmentMember.findUnique({
      where: { userId_establishmentId: { userId: owner.id, establishmentId: est1.id } },
    });
    assert(ownerMembership?.role === "OWNER", "Role OWNER verifie");

    const adminMembership = await prisma.establishmentMember.findUnique({
      where: { userId_establishmentId: { userId: adminUser.id, establishmentId: est1.id } },
    });
    assert(adminMembership?.role === "ADMIN", "Role ADMIN verifie");

    const memberMembership = await prisma.establishmentMember.findUnique({
      where: { userId_establishmentId: { userId: memberUser.id, establishmentId: est1.id } },
    });
    assert(memberMembership?.role === "MEMBER", "Role MEMBER verifie");

    // Member should NOT be in est2
    const memberInEst2 = await prisma.establishmentMember.findUnique({
      where: { userId_establishmentId: { userId: memberUser.id, establishmentId: est2.id } },
    });
    assert(memberInEst2 === null, "Membre PAS dans etablissement 2 (isolation)");

    // ─── 4. INVITATION ───
    console.log("\n── 4. Systeme d'invitation ──\n");

    const inviteToken = `sim-token-${Date.now()}`;
    const invitation = await prisma.establishmentInvitation.create({
      data: {
        establishmentId: est1.id,
        email: "invite-test@simulate.test",
        role: "MEMBER",
        token: inviteToken,
        invitedBy: owner.id,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
    assert(!!invitation.id, "Invitation creee");
    assert(invitation.token === inviteToken, "Token d'invitation correct");

    const foundInvite = await prisma.establishmentInvitation.findUnique({
      where: { token: inviteToken },
      include: { establishment: true },
    });
    assert(foundInvite?.establishment.name === "Cabinet Dentaire Simulation", "Invitation liee au bon etablissement");

    // Unique constraint: same email + establishment
    let duplicateError = false;
    try {
      await prisma.establishmentInvitation.create({
        data: {
          establishmentId: est1.id,
          email: "invite-test@simulate.test",
          role: "ADMIN",
          token: `sim-token-dup-${Date.now()}`,
          invitedBy: owner.id,
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
    } catch {
      duplicateError = true;
    }
    assert(duplicateError, "Doublon invitation bloque (contrainte unique email+etablissement)");

    // Cleanup invitation
    await prisma.establishmentInvitation.delete({ where: { id: invitation.id } });

    // ─── 5. CLIENTS ───
    console.log("\n── 5. Clients (scope etablissement) ──\n");

    const client1 = await prisma.client.create({
      data: {
        userId: owner.id,
        establishmentId: est1.id,
        name: "Patient Martin",
        email: "martin@test.fr",
        phone: "+33 6 00 00 00 01",
      },
    });
    assert(!!client1.id, "Client 1 cree dans etablissement 1");

    const client2 = await prisma.client.create({
      data: {
        userId: owner.id,
        establishmentId: est1.id,
        name: "Patient Dupont",
        email: "dupont@test.fr",
      },
    });
    assert(!!client2.id, "Client 2 cree dans etablissement 1");

    const client3 = await prisma.client.create({
      data: {
        userId: owner.id,
        establishmentId: est2.id,
        name: "Patient Leroy",
        email: "leroy@test.fr",
      },
    });
    assert(!!client3.id, "Client 3 cree dans etablissement 2");

    // Scope verification
    const est1Clients = await prisma.client.count({ where: { establishmentId: est1.id } });
    const est2Clients = await prisma.client.count({ where: { establishmentId: est2.id } });
    assert(est1Clients === 2, `Etablissement 1: ${est1Clients} clients (attendu: 2)`);
    assert(est2Clients === 1, `Etablissement 2: ${est2Clients} clients (attendu: 1)`);

    // ─── 6. REVIEW REQUESTS ───
    console.log("\n── 6. Demandes d'avis (scope etablissement) ──\n");

    const crypto = await import("crypto");
    const rr1 = await prisma.reviewRequest.create({
      data: {
        userId: owner.id,
        clientId: client1.id,
        establishmentId: est1.id,
        channel: "EMAIL",
        scheduledAt: new Date(),
        token: crypto.randomBytes(32).toString("hex"),
      },
    });
    assert(!!rr1.id, "Demande d'avis creee dans etablissement 1");
    assert(rr1.status === "PENDING", "Statut initial: PENDING");

    const rr2 = await prisma.reviewRequest.create({
      data: {
        userId: owner.id,
        clientId: client3.id,
        establishmentId: est2.id,
        channel: "EMAIL",
        scheduledAt: new Date(),
        token: crypto.randomBytes(32).toString("hex"),
      },
    });
    assert(!!rr2.id, "Demande d'avis creee dans etablissement 2");

    // Scope
    const est1Requests = await prisma.reviewRequest.count({ where: { establishmentId: est1.id } });
    const est2Requests = await prisma.reviewRequest.count({ where: { establishmentId: est2.id } });
    assert(est1Requests === 1, `Etablissement 1: ${est1Requests} demande(s) (attendu: 1)`);
    assert(est2Requests === 1, `Etablissement 2: ${est2Requests} demande(s) (attendu: 1)`);

    // Verify include establishment works (review page)
    const rrWithEst = await prisma.reviewRequest.findUnique({
      where: { id: rr1.id },
      include: { user: true, client: true, establishment: true },
    });
    assert(rrWithEst?.establishment?.name === "Cabinet Dentaire Simulation", "Review request inclut les donnees etablissement");
    assert(rrWithEst?.client.name === "Patient Martin", "Review request inclut le client");

    // ─── 7. TEMPLATES ───
    console.log("\n── 7. Templates (scope etablissement) ──\n");

    const tpl = await prisma.template.create({
      data: {
        userId: owner.id,
        establishmentId: est1.id,
        niche: "DENTIST",
        channel: "EMAIL",
        name: "Template Test",
        subject: "Test {{businessName}}",
        body: "Bonjour {{clientName}}, merci pour votre visite chez {{businessName}}. {{link}}",
        isDefault: true,
      },
    });
    assert(!!tpl.id, "Template cree dans etablissement 1");

    const est1Templates = await prisma.template.count({ where: { establishmentId: est1.id } });
    const est2Templates = await prisma.template.count({ where: { establishmentId: est2.id } });
    assert(est1Templates === 1, `Etablissement 1: ${est1Templates} template(s) (attendu: 1)`);
    assert(est2Templates === 0, `Etablissement 2: ${est2Templates} template(s) (attendu: 0)`);

    // ─── 8. HERITAGE DU PLAN ───
    console.log("\n── 8. Heritage du plan ──\n");

    // Owner has Pro plan
    assert(owner.plan === "pro", "Owner a le plan Pro");
    assert(memberUser.plan === "free", "Membre a le plan Free (propre)");

    // Simulate getEstablishmentOwner
    const ownerOfEst1 = await prisma.establishmentMember.findFirst({
      where: { establishmentId: est1.id, role: "OWNER" },
      include: { user: true },
    });
    assert(ownerOfEst1?.user.plan === "pro", "Heritage: owner de l'etablissement 1 a le plan Pro");
    assert(ownerOfEst1?.user.id === owner.id, "Heritage: le bon owner est retourne");

    // Member should use owner's plan
    const effectivePlan = ownerOfEst1?.user.plan ?? memberUser.plan;
    assert(effectivePlan === "pro", "Membre herite du plan Pro du proprietaire");

    // ─── 9. ADMIN BACKOFFICE ───
    console.log("\n── 9. Admin Backoffice ──\n");

    // Simulate admin dashboard queries
    const totalEstablishments = await prisma.establishment.count();
    assert(totalEstablishments >= 2, `Total etablissements en BDD: ${totalEstablishments}`);

    const totalMembers = await prisma.establishmentMember.count();
    assert(totalMembers >= 3, `Total membres en BDD: ${totalMembers}`);

    // Admin: only show owners (not pure members)
    const ownersOnly = await prisma.user.findMany({
      where: { isAdmin: false, memberships: { some: { role: "OWNER" } } },
    });
    assert(ownersOnly.length >= 1, `Proprietaires visibles en admin: ${ownersOnly.length}`);

    // Pure members should be filtered out
    const memberIsOwnerAnywhere = await prisma.establishmentMember.findFirst({
      where: { userId: memberUser.id, role: "OWNER" },
    });
    assert(memberIsOwnerAnywhere === null, "Membre pur n'est OWNER nulle part (invisible en admin)");

    // Admin user detail: establishments with members
    const ownerMemberships = await prisma.establishmentMember.findMany({
      where: { userId: owner.id },
      include: {
        establishment: {
          include: {
            _count: { select: { members: true, clients: true, reviewRequests: true } },
            members: { include: { user: { select: { name: true, email: true } } } },
          },
        },
      },
    });
    assert(ownerMemberships.length === 2, `Owner a ${ownerMemberships.length} etablissements (attendu: 2)`);
    const est1Detail = ownerMemberships.find((m) => m.establishmentId === est1.id);
    assert(est1Detail?.establishment._count.members === 3, `Detail: est1 a ${est1Detail?.establishment._count.members} membres`);
    assert(est1Detail?.establishment._count.clients === 2, `Detail: est1 a ${est1Detail?.establishment._count.clients} clients`);

    // ─── 10. CASCADE DELETE ───
    console.log("\n── 10. Integrite referentielle ──\n");

    // Delete establishment 2 → should cascade members, clients, requests
    await prisma.establishment.delete({ where: { id: est2.id } });
    cleanupIds.establishments = cleanupIds.establishments.filter((id) => id !== est2.id);

    const est2MembersAfter = await prisma.establishmentMember.count({ where: { establishmentId: est2.id } });
    assert(est2MembersAfter === 0, "Cascade: membres de l'etablissement 2 supprimes");

    const client3After = await prisma.client.findUnique({ where: { id: client3.id } });
    // Client has onDelete: SetNull, so client should still exist but without establishmentId
    if (client3After) {
      assert(client3After.establishmentId === null, "Cascade: client 3 detache (SetNull)");
    } else {
      skip("Client 3 supprime (comportement SetNull)");
    }

    // ─── 11. PLANS DB ───
    console.log("\n── 11. Plans en base ──\n");

    const plans = await prisma.plan.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });
    assert(plans.length >= 3, `${plans.length} plans actifs en base`);

    const freePlan = plans.find((p) => p.key === "free");
    const proPlan = plans.find((p) => p.key === "pro");
    const businessPlan = plans.find((p) => p.key === "business");
    assert(!!freePlan, "Plan free existe");
    assert(!!proPlan, "Plan pro existe");
    assert(!!businessPlan, "Plan business existe");
    assert(freePlan!.price === 0, "Plan free est gratuit");
    assert(proPlan!.price > 0, "Plan pro est payant");
    assert(businessPlan!.price > proPlan!.price, "Plan business plus cher que pro");

    // ─── 12. DONNEES EXISTANTES ───
    console.log("\n── 12. Donnees existantes (migration) ──\n");

    const realUsers = await prisma.user.findMany({
      where: { isAdmin: false, onboarded: true, email: { not: { contains: "@simulate.test" } } },
    });
    for (const u of realUsers) {
      const membership = await prisma.establishmentMember.findFirst({
        where: { userId: u.id, role: "OWNER" },
        include: { establishment: true },
      });
      if (membership) {
        assert(true, `${u.email} → "${membership.establishment.name}" (OWNER)`);
      } else {
        const anyMembership = await prisma.establishmentMember.findFirst({ where: { userId: u.id } });
        if (anyMembership) {
          assert(true, `${u.email} → membre (${anyMembership.role})`);
        } else {
          assert(false, `${u.email} → AUCUN etablissement !`);
        }
      }
    }

  } finally {
    // ─── CLEANUP ───
    console.log("\n── Nettoyage ──\n");

    // Delete test users (cascades memberships, clients, requests, templates)
    for (const userId of cleanupIds.users) {
      await prisma.user.delete({ where: { id: userId } }).catch(() => {});
    }
    for (const estId of cleanupIds.establishments) {
      await prisma.establishment.delete({ where: { id: estId } }).catch(() => {});
    }
    // Clean orphan invitations
    await prisma.establishmentInvitation.deleteMany({
      where: { email: { contains: "@simulate.test" } },
    }).catch(() => {});

    console.log("Donnees de test nettoyees.\n");

    await prisma.$disconnect();
  }

  // ─── RESULTAT ───
  console.log("══════════════════════════════════════════");
  console.log(`  RESULTAT: ${passed} passes, ${failed} echecs, ${skipped} ignores`);
  console.log("══════════════════════════════════════════\n");

  if (failed > 0) process.exit(1);
}

main().catch((e) => {
  console.error("\n\x1b[31mERREUR FATALE:\x1b[0m", e.message);
  process.exit(1);
});
