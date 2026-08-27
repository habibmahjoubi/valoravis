-- Migration additive pour les correctifs sécurité/fonctionnels.
-- 100% non destructif : aucune colonne/table supprimée, aucune ligne modifiée.
-- À appliquer sur la prod APRÈS un backup :
--     pg_dump "$DIRECT_DATABASE_URL" > backup_avant_migration.sql
--     psql "$DIRECT_DATABASE_URL" -f prisma/migrations/manual_20260828_security_fixes.sql

BEGIN;

-- S3 : stocker l'ID d'abonnement Stripe (pour pouvoir résilier réellement)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "stripeSubscriptionId" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "User_stripeSubscriptionId_key"
  ON "User" ("stripeSubscriptionId");

-- F6 : claim atomique du cron (anti double envoi)
ALTER TABLE "ReviewRequest" ADD COLUMN IF NOT EXISTS "claimId" TEXT;
ALTER TABLE "ReviewRequest" ADD COLUMN IF NOT EXISTS "claimedAt" TIMESTAMP(3);
CREATE INDEX IF NOT EXISTS "ReviewRequest_claimId_idx" ON "ReviewRequest" ("claimId");

-- S9 : idempotence des webhooks Stripe
CREATE TABLE IF NOT EXISTS "StripeEvent" (
  "id"         TEXT NOT NULL,
  "type"       TEXT NOT NULL,
  "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StripeEvent_pkey" PRIMARY KEY ("id")
);

-- S7 : RLS sur les tables ajoutées après la v1 (bloque l'API Data publique de Supabase)
ALTER TABLE "Establishment"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EstablishmentMember"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EstablishmentInvitation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StripeEvent"             ENABLE ROW LEVEL SECURITY;

COMMIT;
