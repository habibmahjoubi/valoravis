-- Enable RLS on ALL tables to block Supabase REST/Data API public access.
-- Prisma se connecte via le rôle postgres/service_role qui bypasse RLS ; aucune
-- policy n'est donc nécessaire — RLS activée sans policy = tout est refusé pour
-- les rôles anon/authenticated de l'API Data.
--
-- ⚠️ Ce fichier n'est PAS exécuté automatiquement (le projet utilise `prisma db
-- push`, pas `prisma migrate deploy`). À appliquer manuellement après chaque
-- ajout de table :
--     psql "$DIRECT_DATABASE_URL" -f prisma/migrations/enable_rls.sql

ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "VerificationToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Plan" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PasswordResetToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EmailVerificationToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Client" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ReviewRequest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Template" ENABLE ROW LEVEL SECURITY;

-- Tables établissements (ajoutées après la v1 — étaient exposées) :
ALTER TABLE "Establishment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EstablishmentMember" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EstablishmentInvitation" ENABLE ROW LEVEL SECURITY;

-- Idempotence des webhooks Stripe :
ALTER TABLE "StripeEvent" ENABLE ROW LEVEL SECURITY;
