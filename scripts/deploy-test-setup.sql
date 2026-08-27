-- Jeu de données de test isolé pour valider le déploiement (préfixe zzdeploytest).
-- À supprimer ensuite avec deploy-test-teardown.sql
BEGIN;

INSERT INTO "User"(id, email, "updatedAt", name, "businessName", "emailVerified", plan)
VALUES ('zzdeploytest-user', 'zzdeploytest@example.invalid', now(), 'ZZ Deploy Test', 'ZZ Deploy Biz', now(), 'free');

INSERT INTO "Establishment"(id, name, "updatedAt", "googlePlaceUrl", "satisfactionThreshold")
VALUES ('zzdeploytest-est', 'ZZ Deploy Establishment', now(),
        'https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4', 4);

INSERT INTO "EstablishmentMember"(id, "userId", "establishmentId", role)
VALUES ('zzdeploytest-mem', 'zzdeploytest-user', 'zzdeploytest-est', 'OWNER');

INSERT INTO "Client"(id, "userId", "establishmentId", name, email)
VALUES ('zzdeploytest-client', 'zzdeploytest-user', 'zzdeploytest-est', 'ZZ Deploy Client', 'zzdeployclient@example.invalid');

INSERT INTO "ReviewRequest"(id, "userId", "clientId", "establishmentId", channel, status, token, "scheduledAt")
VALUES ('zzdeploytest-rr', 'zzdeploytest-user', 'zzdeploytest-client', 'zzdeploytest-est',
        'EMAIL', 'SENT', 'zzdeploytoken-8f3a91b2c7', now());

COMMIT;

SELECT 'Ouvre sur le PREVIEW : /review/zzdeploytoken-8f3a91b2c7' AS instruction;
