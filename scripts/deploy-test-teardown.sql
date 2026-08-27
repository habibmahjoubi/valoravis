-- Supprime le jeu de données de test (préfixe zzdeploytest).
BEGIN;
DELETE FROM "ReviewRequest"       WHERE id LIKE 'zzdeploytest%';
DELETE FROM "Client"              WHERE id LIKE 'zzdeploytest%';
DELETE FROM "EstablishmentMember" WHERE id LIKE 'zzdeploytest%';
DELETE FROM "EstablishmentInvitation" WHERE id LIKE 'zzdeploytest%';
DELETE FROM "Establishment"       WHERE id LIKE 'zzdeploytest%';
DELETE FROM "User"                WHERE id LIKE 'zzdeploytest%';
COMMIT;
SELECT
  (SELECT count(*) FROM "User" WHERE id LIKE 'zzdeploytest%') AS users_restants,
  (SELECT count(*) FROM "ReviewRequest" WHERE id LIKE 'zzdeploytest%') AS rr_restants;
