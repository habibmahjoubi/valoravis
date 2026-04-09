# Valoravis - User Stories

> **Projet** : Valoravis - Plateforme SaaS de collecte d'avis Google pour professionnels locaux
> **Version** : 1.0
> **Derniere mise a jour** : 2026-04-06
> **Niches cibles** : Dentistes, Osteopathes, Garages automobiles (extensible)

---

## Legende

| Priorite | Signification |
|----------|---------------|
| P0 | Indispensable pour le MVP |
| P1 | Important, a livrer rapidement apres le MVP |
| P2 | Souhaitable, peut attendre une v2 |
| P3 | Nice-to-have, backlog |

| Statut | Signification |
|--------|---------------|
| DONE | Implemente et fonctionnel |
| IN PROGRESS | En cours de developpement |
| TODO | A faire |
| PLANNED | Prevu pour une version future |

---

## 1. Authentification et compte

### US01 - Creer un compte `P0` `DONE`

**En tant que** professionnel local (dentiste, osteopathe, garagiste),
**je veux** creer un compte avec mon adresse email professionnelle,
**afin de** acceder a la plateforme et commencer a collecter des avis.

**Criteres d'acceptation :**
- [ ] L'utilisateur peut s'inscrire avec son email
- [ ] Un email de verification (magic link) est envoye via Resend
- [ ] L'utilisateur est redirige vers l'onboarding apres la premiere connexion
- [ ] Le compte est cree en base avec le plan FREE par defaut (50 envois/mois)
- [ ] L'utilisateur choisit sa niche (metier) des l'inscription

**Implementation actuelle :** Magic link via NextAuth + Resend (pas de mot de passe)

---

### US02 - Me connecter `P0` `DONE`

**En tant que** utilisateur inscrit,
**je veux** me connecter a mon espace via un lien magique envoye par email,
**afin de** gerer mes demandes d'avis en toute securite.

**Criteres d'acceptation :**
- [ ] L'utilisateur saisit son email sur `/login`
- [ ] Un magic link est envoye par email
- [ ] Le clic sur le lien authentifie l'utilisateur et le redirige vers `/dashboard`
- [ ] La session est persistee via un cookie securise
- [ ] Si l'email n'existe pas, un compte est cree automatiquement (comportement magic link)

**Notes techniques :** Authentification passwordless via `next-auth` v5 + provider Resend

---

### US03 - Reinitialiser mon acces `P1` `TODO`

**En tant que** utilisateur,
**je veux** pouvoir demander un nouveau lien de connexion si l'ancien a expire,
**afin de** recuperer l'acces a mon compte sans friction.

**Criteres d'acceptation :**
- [ ] L'utilisateur peut demander un nouveau magic link depuis la page de connexion
- [ ] L'ancien token est invalide des qu'un nouveau est genere
- [ ] Un message clair indique que le lien a ete renvoye
- [ ] Limitation de frequence : maximum 1 lien toutes les 60 secondes

**Notes :** Avec l'approche magic link, il n'y a pas de mot de passe a reinitialiser. Cette US couvre le renvoi de lien et la gestion des tokens expires.

---

### US04 - Me deconnecter `P0` `DONE`

**En tant que** utilisateur connecte,
**je veux** me deconnecter de mon espace,
**afin de** securiser mon acces, notamment sur un appareil partage.

**Criteres d'acceptation :**
- [ ] Un bouton "Deconnexion" est visible dans la sidebar du dashboard
- [ ] Le clic detruit la session cote serveur et supprime le cookie
- [ ] L'utilisateur est redirige vers la page d'accueil `/`
- [ ] Toute tentative d'acceder au dashboard redirige vers `/login`

---

## 2. Onboarding etablissement

### US05 - Creer mon etablissement `P0` `DONE`

**En tant que** professionnel,
**je veux** renseigner le nom de mon etablissement lors de ma premiere connexion,
**afin de** personnaliser les messages envoyes a mes clients/patients.

**Criteres d'acceptation :**
- [ ] Une modale d'onboarding s'affiche au premier acces au dashboard
- [ ] L'utilisateur peut saisir le nom de son etablissement
- [ ] Le nom est sauvegarde en base (champ `businessName` du modele `User`)
- [ ] Le nom apparait dans la sidebar et dans les messages envoyes
- [ ] L'onboarding est marque comme complete (`onboarded = true`)

---

### US06 - Choisir ma niche `P0` `DONE`

**En tant que** professionnel,
**je veux** selectionner mon metier parmi les niches disponibles,
**afin de** beneficier de templates, vocabulaire et configuration adaptes a mon activite.

**Criteres d'acceptation :**
- [ ] Les niches disponibles sont presentees sous forme de cartes visuelles (icone + label)
- [ ] Niches actuelles : Dentiste, Osteopathe, Garage automobile
- [ ] La selection est enregistree dans le champ `niche` du profil utilisateur
- [ ] La niche determine les templates par defaut, le vocabulaire de l'interface et les labels
- [ ] La niche peut etre pre-selectionnee via le parametre URL `?niche=DENTIST`

**Configuration des niches :** Definie dans `src/config/niches.ts`

---

### US07 - Configurer mon lien d'avis Google `P0` `DONE`

**En tant que** professionnel,
**je veux** ajouter mon lien Google Review lors de l'onboarding,
**afin de** rediriger mes clients satisfaits directement vers la bonne fiche Google.

**Criteres d'acceptation :**
- [ ] Un champ permet de coller l'URL de la fiche Google
- [ ] Validation du format de l'URL (doit etre un lien Google valide)
- [ ] Le lien est sauvegarde dans le champ `googleReviewUrl` du profil
- [ ] Ce lien est utilise dans le parcours client (page `/review/[token]`)
- [ ] Un lien d'aide explique comment trouver son URL Google Review

---

### US08 - Definir mes coordonnees d'envoi `P1` `TODO`

**En tant que** professionnel,
**je veux** configurer les informations d'envoi (nom affiché, email de reponse),
**afin de** envoyer des messages au nom de mon etablissement et inspirer confiance.

**Criteres d'acceptation :**
- [ ] L'utilisateur peut definir un nom d'expediteur
- [ ] L'utilisateur peut definir un email de reponse (reply-to)
- [ ] Ces informations sont utilisees dans les headers des emails envoyes
- [ ] Possibilite de modifier ces parametres dans la page Settings

**Note :** Necessite un domaine verifie sur Resend pour les emails personnalises (actuellement `onboarding@resend.dev` en sandbox).

---

## 3. Gestion des contacts

### US09 - Ajouter un contact manuellement `P0` `DONE`

**En tant que** utilisateur,
**je veux** ajouter un client/patient manuellement via un formulaire,
**afin de** pouvoir lui envoyer une demande d'avis.

**Criteres d'acceptation :**
- [ ] Un formulaire permet de saisir : nom (obligatoire), email, telephone, notes
- [ ] Au moins un moyen de contact (email ou telephone) doit etre renseigne
- [ ] Le contact est associe a l'utilisateur connecte
- [ ] Le formulaire se ferme et la liste se rafraichit apres l'ajout
- [ ] Validation des formats (email valide, telephone au format international)

---

### US10 - Importer des contacts par CSV `P1` `TODO`

**En tant que** utilisateur,
**je veux** importer une liste de contacts via un fichier CSV,
**afin de** gagner du temps lors de la mise en place initiale.

**Criteres d'acceptation :**
- [ ] Un bouton "Importer CSV" est disponible sur la page Clients
- [ ] Le fichier doit contenir au minimum : nom, email ou telephone
- [ ] Un apercu des donnees est affiche avant validation
- [ ] Les doublons (meme email ou telephone) sont detectes et signales
- [ ] Un rapport d'import est affiche (X importes, Y ignores, Z erreurs)
- [ ] Limite : 500 contacts par import pour le plan FREE, 5000 pour PRO

**Format CSV attendu :**
```
nom,email,telephone,notes
"Jean Dupont","jean@example.com","+33612345678","Patient regulier"
```

---

### US11 - Voir la liste de mes contacts `P0` `DONE`

**En tant que** utilisateur,
**je veux** consulter la liste de mes contacts avec leurs informations,
**afin de** retrouver facilement les personnes a solliciter.

**Criteres d'acceptation :**
- [ ] La liste affiche : nom, email, telephone, nombre de demandes, date d'ajout
- [ ] Les contacts sont tries par date d'ajout (plus recent en premier)
- [ ] Un message s'affiche si la liste est vide avec un call-to-action
- [ ] La liste est paginee si plus de 50 contacts

---

### US12 - Modifier un contact `P1` `TODO`

**En tant que** utilisateur,
**je veux** corriger les informations d'un contact existant,
**afin de** eviter les erreurs d'envoi (email incorrect, nom mal orthographie).

**Criteres d'acceptation :**
- [ ] Un bouton "Modifier" est disponible sur chaque ligne de contact
- [ ] Le formulaire est pre-rempli avec les donnees actuelles
- [ ] Les memes validations que l'ajout s'appliquent
- [ ] La modification est enregistree et la liste rafraichie

---

### US13 - Supprimer un contact `P0` `DONE`

**En tant que** utilisateur,
**je veux** supprimer un contact de ma liste,
**afin de** garder ma base propre et a jour.

**Criteres d'acceptation :**
- [ ] Un bouton de suppression est disponible sur chaque ligne de contact
- [ ] Une confirmation est demandee avant la suppression
- [ ] La suppression est en cascade : les demandes d'avis associees sont aussi supprimees
- [ ] La liste se rafraichit apres la suppression

---

## 4. Templates et personnalisation

### US14 - Utiliser un template de message par niche `P0` `DONE`

**En tant que** utilisateur,
**je veux** disposer d'un modele de message pre-redige et adapte a mon metier,
**afin de** lancer rapidement mes premieres demandes d'avis sans tout ecrire.

**Criteres d'acceptation :**
- [ ] Chaque niche dispose d'un template SMS et email par defaut
- [ ] Le template est automatiquement charge a la creation du compte
- [ ] Le template utilise le vocabulaire du metier (patient/client, cabinet/garage, etc.)
- [ ] Le template inclut des variables dynamiques (`{{prenom}}`, `{{etablissement}}`, etc.)

**Templates par niche :** Definis dans `src/config/niches.ts`

---

### US15 - Personnaliser mon message SMS `P1` `PLANNED`

**En tant que** utilisateur,
**je veux** modifier le contenu du SMS envoye a mes clients,
**afin de** l'adapter au ton et a l'image de mon etablissement.

**Criteres d'acceptation :**
- [ ] Un editeur de texte permet de modifier le template SMS
- [ ] Un compteur de caracteres affiche la longueur (limite SMS : 160 caracteres)
- [ ] Les variables disponibles sont listees et inserables en un clic
- [ ] Un bouton "Restaurer le defaut" permet de revenir au template niche
- [ ] La modification est sauvegardee par utilisateur (ne modifie pas le template global)

---

### US16 - Personnaliser mon email `P1` `PLANNED`

**En tant que** utilisateur,
**je veux** modifier le contenu de l'email envoye a mes clients,
**afin de** communiquer de facon plus personnalisee et professionnelle.

**Criteres d'acceptation :**
- [ ] Un editeur permet de modifier le sujet et le corps de l'email
- [ ] Apercu en temps reel du rendu final
- [ ] Les variables dynamiques sont supportees
- [ ] Un bouton "Restaurer le defaut" est disponible
- [ ] Support du formatage basique (gras, liens)

---

### US17 - Utiliser des variables dynamiques `P0` `DONE`

**En tant que** utilisateur,
**je veux** que les messages insèrent automatiquement le prenom du client, le nom de l'etablissement, etc.,
**afin de** rendre chaque message personnel et engageant.

**Criteres d'acceptation :**
- [ ] Variables disponibles : `{{prenom}}`, `{{nom}}`, `{{etablissement}}`, `{{lien_avis}}`
- [ ] Les variables sont remplacees au moment de l'envoi
- [ ] Si une variable est vide (ex: prenom manquant), un fallback generique est utilise
- [ ] Les variables sont documentees dans l'interface d'edition des templates

---

## 5. Envoi des demandes d'avis

### US18 - Envoyer une demande d'avis manuellement `P0` `DONE`

**En tant que** utilisateur,
**je veux** envoyer une demande d'avis a un contact specifique en un clic,
**afin de** solliciter rapidement un retour apres une prestation.

**Criteres d'acceptation :**
- [ ] Un bouton "Envoyer" est disponible sur chaque ligne de contact
- [ ] Le message est envoye via le canal choisi (email par defaut)
- [ ] Un token unique est genere pour le lien de tracking
- [ ] Le statut de la demande est initialise a "SENT"
- [ ] Le quota d'envoi est decremente
- [ ] Un message de confirmation s'affiche apres l'envoi
- [ ] L'envoi est refuse si le quota mensuel est atteint

---

### US19 - Programmer un envoi automatique `P2` `PLANNED`

**En tant que** utilisateur,
**je veux** definir un delai automatique (ex: 2h apres la prestation) pour l'envoi de la demande,
**afin de** envoyer la demande au moment optimal sans intervention manuelle.

**Criteres d'acceptation :**
- [ ] L'utilisateur peut definir un delai d'envoi par defaut (1h, 2h, 24h, 48h)
- [ ] Le delai est configurable dans les parametres
- [ ] Un cron job traite les envois en attente (`/api/cron/send-reviews`)
- [ ] L'utilisateur peut annuler un envoi programme avant qu'il ne parte
- [ ] L'heure d'envoi estimee est affichee

---

### US20 - Choisir le canal d'envoi `P0` `DONE`

**En tant que** utilisateur,
**je veux** choisir entre SMS et email pour chaque envoi,
**afin de** m'adapter aux preferences et coordonnees de mes clients.

**Criteres d'acceptation :**
- [ ] Le bouton d'envoi propose les canaux disponibles selon les coordonnees du contact
- [ ] Si seul l'email est renseigne, seul le canal email est propose
- [ ] Si seul le telephone est renseigne, seul le canal SMS est propose
- [ ] Si les deux sont renseignes, l'utilisateur choisit le canal
- [ ] Le canal utilise est enregistre sur la demande d'avis

---

### US21 - Previsualiser le message avant envoi `P1` `PLANNED`

**En tant que** utilisateur,
**je veux** voir un apercu du message final (avec les variables remplacees) avant de l'envoyer,
**afin de** verifier le contenu et eviter les erreurs.

**Criteres d'acceptation :**
- [ ] Un apercu s'affiche dans une modale avant confirmation d'envoi
- [ ] Les variables sont remplacees par les vraies valeurs du contact
- [ ] L'apercu differencie le rendu email et SMS
- [ ] L'utilisateur peut annuler ou confirmer l'envoi

---

### US22 - Empecher les doublons d'envoi `P1` `TODO`

**En tant que** utilisateur,
**je veux** que le systeme m'empeche d'envoyer deux demandes au meme contact dans un delai trop court,
**afin de** ne pas harceler mes clients et preserver mon image professionnelle.

**Criteres d'acceptation :**
- [ ] Delai minimum entre deux envois au meme contact : 7 jours (configurable)
- [ ] Un avertissement s'affiche si l'utilisateur tente un envoi trop rapproche
- [ ] L'utilisateur peut forcer l'envoi apres avertissement (avec confirmation explicite)
- [ ] Le delai est base sur la date du dernier envoi au contact, quel que soit le canal

---

## 6. Historique et suivi

### US23 - Consulter l'historique des envois `P0` `DONE`

**En tant que** utilisateur,
**je veux** voir la liste de tous les messages envoyes avec leur statut,
**afin de** suivre mon activite et savoir ou j'en suis.

**Criteres d'acceptation :**
- [ ] L'historique est visible dans le dashboard (section "Activite recente")
- [ ] Chaque entree affiche : nom du contact, canal, date, statut
- [ ] Les statuts possibles : En attente, Envoye, Clique, Avis laisse, Feedback, Echoue
- [ ] L'historique est trie par date (plus recent en premier)

---

### US24 - Voir le statut d'un envoi `P0` `DONE`

**En tant que** utilisateur,
**je veux** connaitre le statut de chaque demande d'avis (envoye, clique, avis laisse),
**afin de** mesurer l'efficacite de mes envois contact par contact.

**Criteres d'acceptation :**
- [ ] Un badge colore indique le statut de chaque envoi
- [ ] Statuts et couleurs : Pending (jaune), Sent (bleu), Clicked (vert), Reviewed (vert fonce), Feedback (gris), Failed (rouge)
- [ ] Le statut est mis a jour automatiquement via le tracking du lien
- [ ] Le passage de SENT a CLICKED se fait quand le client ouvre la page `/review/[token]`

---

### US25 - Filtrer les envois `P2` `PLANNED`

**En tant que** utilisateur,
**je veux** filtrer mes envois par date, statut ou canal,
**afin de** analyser mes resultats plus finement.

**Criteres d'acceptation :**
- [ ] Filtres disponibles : periode (7j, 30j, 90j, personnalise), statut, canal (SMS/email)
- [ ] Les filtres sont combinables
- [ ] Le nombre de resultats filtrés est affiche
- [ ] Les filtres sont persistés dans l'URL (partageables)
- [ ] Un bouton "Reinitialiser" efface tous les filtres

---

## 7. Dashboard et statistiques

### US26 - Voir le nombre de demandes envoyees `P0` `DONE`

**En tant que** utilisateur,
**je veux** voir combien de demandes d'avis ont ete envoyees (et mon quota restant),
**afin de** mesurer mon usage et savoir quand upgrader.

**Criteres d'acceptation :**
- [ ] Le compteur `quotaUsed / monthlyQuota` est affiche dans la sidebar
- [ ] Une carte "Envois" est visible dans le dashboard avec le ratio
- [ ] Le compteur se reinitialise chaque mois
- [ ] Un avertissement s'affiche quand le quota atteint 80%

---

### US27 - Voir le nombre de clics `P0` `DONE`

**En tant que** utilisateur,
**je veux** voir combien de contacts ont clique sur le lien d'avis,
**afin de** evaluer l'engagement genere par mes messages.

**Criteres d'acceptation :**
- [ ] Le nombre de clics est affiche dans le dashboard
- [ ] Un clic est comptabilise quand le client accede a la page `/review/[token]`
- [ ] Chaque token ne comptabilise qu'un seul clic (pas de doublons)

---

### US28 - Voir le taux de clic `P0` `DONE`

**En tant que** utilisateur,
**je veux** voir le taux de clic global (clics / envois),
**afin de** juger la performance de mes messages et les optimiser.

**Criteres d'acceptation :**
- [ ] Le taux de clic est calcule : `(clics / envois) * 100`
- [ ] Il est affiche en pourcentage dans une carte du dashboard
- [ ] Si aucun envoi, afficher 0% (pas de division par zero)

---

### US29 - Voir mes performances sur une periode `P2` `PLANNED`

**En tant que** utilisateur,
**je veux** selectionner une periode (7j, 30j, 90j) pour voir l'evolution de mes statistiques,
**afin de** suivre mes progres dans le temps.

**Criteres d'acceptation :**
- [ ] Un selecteur de periode est disponible en haut du dashboard
- [ ] Les stats (envois, clics, taux, avis) se recalculent selon la periode
- [ ] Un graphique d'evolution est affiche (line chart ou bar chart)
- [ ] La periode par defaut est "30 derniers jours"

---

## 8. Parametrage metier / niche

### US30 - Charger automatiquement une configuration selon la niche `P0` `DONE`

**En tant que** utilisateur,
**je veux** que l'application adapte automatiquement les textes, templates et labels a mon metier,
**afin de** avoir une experience pertinente des la premiere utilisation.

**Criteres d'acceptation :**
- [ ] La selection de niche a l'inscription charge la configuration correspondante
- [ ] Configuration par niche : icone, label, templates SMS/email, vocabulaire, lien type
- [ ] Les niches sont definies dans un fichier de configuration centralisé (`src/config/niches.ts`)
- [ ] Ajouter une nouvelle niche ne necessite aucune modification du code metier

---

### US31 - Utiliser le vocabulaire metier adapte `P1` `TODO`

**En tant que** utilisateur,
**je veux** voir des termes adaptes a ma profession dans toute l'interface,
**afin de** me sentir dans un outil concu pour mon activite.

**Criteres d'acceptation :**
- [ ] Dentiste : "patient", "cabinet", "consultation"
- [ ] Osteopathe : "patient", "cabinet", "seance"
- [ ] Garage : "client", "garage", "intervention"
- [ ] Les labels sont utilises dans le dashboard, les formulaires et les messages
- [ ] Le vocabulaire est defini dans la configuration de chaque niche

---

### US32 - Modifier les reglages par defaut de ma niche `P2` `PLANNED`

**En tant que** utilisateur,
**je veux** ajuster les templates et delais proposes par defaut pour ma niche,
**afin de** personnaliser l'outil a mes besoins specifiques.

**Criteres d'acceptation :**
- [ ] Les reglages sont modifiables dans la page Parametres
- [ ] Modifiable : template SMS, template email, delai d'envoi, lien Google
- [ ] Un bouton "Restaurer les defauts" recharge la configuration niche d'origine
- [ ] Les modifications sont sauvegardees par utilisateur

---

## 9. Abonnement et paiement

### US33 - Choisir une offre `P0` `DONE`

**En tant que** utilisateur,
**je veux** choisir un plan tarifaire adapte a mon volume d'envois,
**afin de** acceder aux fonctionnalites correspondant a mes besoins.

**Criteres d'acceptation :**
- [ ] Trois plans disponibles : FREE (50 envois/mois), PRO, BUSINESS
- [ ] Comparatif clair des fonctionnalites par plan
- [ ] Le plan actuel est mis en evidence
- [ ] Un bouton "Upgrader" est disponible sur la page Abonnement

**Plans :**
| Plan | Quota | Prix |
|------|-------|------|
| FREE | 50 envois/mois | Gratuit |
| PRO | A definir | A definir |
| BUSINESS | A definir | A definir |

---

### US34 - Payer mon abonnement `P0` `IN PROGRESS`

**En tant que** utilisateur,
**je veux** souscrire et payer en ligne de maniere securisee,
**afin de** activer mon plan PRO ou BUSINESS immediatement.

**Criteres d'acceptation :**
- [ ] Integration Stripe Checkout pour le paiement
- [ ] Redirection vers Stripe avec le bon `priceId`
- [ ] Webhook Stripe met a jour le plan et le quota en base
- [ ] L'utilisateur est redirige vers le dashboard apres paiement
- [ ] Gestion des erreurs de paiement (carte refusee, etc.)

**Implementation :** Stripe Checkout + Webhooks (`/api/webhooks/stripe/`)

---

### US35 - Consulter ma facturation `P2` `PLANNED`

**En tant que** utilisateur,
**je veux** voir mes paiements passes et telecharger mes factures,
**afin de** suivre mon abonnement et justifier mes depenses.

**Criteres d'acceptation :**
- [ ] Liste des paiements avec date, montant, statut
- [ ] Lien de telechargement de la facture PDF (via Stripe)
- [ ] Affichage du prochain renouvellement
- [ ] Accessible depuis la page Abonnement

---

### US36 - Resilier mon abonnement `P1` `PLANNED`

**En tant que** utilisateur,
**je veux** pouvoir annuler mon abonnement a tout moment,
**afin de** garder le controle sur mon engagement financier.

**Criteres d'acceptation :**
- [ ] Un bouton "Annuler mon abonnement" est disponible sur la page Abonnement
- [ ] Confirmation requise avant annulation
- [ ] L'abonnement reste actif jusqu'a la fin de la periode payee
- [ ] Le plan revient a FREE a l'expiration
- [ ] Le quota est reduit a 50 envois/mois au renouvellement
- [ ] Un email de confirmation d'annulation est envoye

---

## 10. Administration interne

### US37 - Gerer les niches disponibles `P2` `PLANNED`

**En tant que** administrateur,
**je veux** creer ou modifier les configurations par niche (templates, vocabulaire, icones),
**afin de** faire evoluer le produit et ajouter de nouveaux metiers sans recoder.

**Criteres d'acceptation :**
- [ ] Interface d'administration des niches (ou fichier de configuration)
- [ ] Chaque niche definit : id, label, icone, templates SMS/email, vocabulaire
- [ ] Ajouter une niche la rend disponible a l'inscription
- [ ] Modifier une niche met a jour les defauts pour les nouveaux inscrits (pas les existants)

---

### US38 - Gerer les templates par defaut `P2` `PLANNED`

**En tant que** administrateur,
**je veux** definir et modifier les templates SMS/email par metier,
**afin de** optimiser les taux de conversion et proposer les meilleurs messages.

**Criteres d'acceptation :**
- [ ] Chaque niche a un template SMS et email par defaut
- [ ] Les templates supportent les variables dynamiques
- [ ] Les modifications s'appliquent aux nouveaux comptes uniquement
- [ ] Historique des versions de templates

---

### US39 - Suivre les etablissements inscrits `P2` `PLANNED`

**En tant que** administrateur,
**je veux** voir la liste des comptes clients avec leurs metriques,
**afin de** piloter l'activite commerciale et identifier les comptes cles.

**Criteres d'acceptation :**
- [ ] Liste des comptes avec : nom, email, niche, plan, date d'inscription, envois du mois
- [ ] Filtres par niche, plan, activite
- [ ] Export CSV de la liste
- [ ] Metriques globales : nombre total de comptes, repartition par plan, repartition par niche

---

### US40 - Desactiver un compte `P3` `PLANNED`

**En tant que** administrateur,
**je veux** suspendre un compte utilisateur si necessaire,
**afin de** gerer les abus, les impayés ou les demandes de suppression.

**Criteres d'acceptation :**
- [ ] Un bouton "Suspendre" est disponible sur chaque compte
- [ ] Un compte suspendu ne peut plus se connecter
- [ ] Les envois programmes sont annules
- [ ] Un email de notification est envoye a l'utilisateur
- [ ] Le compte peut etre reactive par l'administrateur
- [ ] Raison de la suspension enregistree (abus, impaye, demande RGPD, etc.)

---

## 11. Parcours client (page d'avis)

### US41 - Acceder a la page de satisfaction `P0` `DONE`

**En tant que** client/patient,
**je veux** acceder a une page simple via le lien recu,
**afin de** donner mon avis facilement.

**Criteres d'acceptation :**
- [ ] La page est accessible via `/review/[token]`
- [ ] Le token identifie la demande d'avis et le contact
- [ ] Le statut passe de SENT a CLICKED a l'ouverture
- [ ] La page affiche le nom de l'etablissement et une question de satisfaction
- [ ] Un token invalide ou expire affiche un message d'erreur explicite

---

### US42 - Etre redirige selon ma satisfaction `P0` `DONE`

**En tant que** client/patient satisfait,
**je veux** etre redirige vers la page Google Review de l'etablissement,
**afin de** laisser facilement un avis positif.

**En tant que** client/patient insatisfait,
**je veux** pouvoir laisser un feedback prive,
**afin de** exprimer mon mecontentement sans impacter la reputation publique.

**Criteres d'acceptation :**
- [ ] Si satisfaction positive (4-5 etoiles) : redirection vers le lien Google Review
- [ ] Si satisfaction negative (1-3 etoiles) : affichage d'un formulaire de feedback prive
- [ ] Le feedback prive est enregistre en base (statut FEEDBACK)
- [ ] Le statut passe a REVIEWED si l'utilisateur est redirige vers Google
- [ ] Le parcours est fluide et mobile-friendly

---

## Resume par priorite

| Priorite | Total | Done | In Progress | Todo | Planned |
|----------|-------|------|-------------|------|---------|
| P0 | 20 | 17 | 1 | 2 | 0 |
| P1 | 10 | 0 | 0 | 4 | 6 |
| P2 | 8 | 0 | 0 | 0 | 8 |
| P3 | 1 | 0 | 0 | 0 | 1 |
| **Total** | **42** | **17** | **1** | **6** | **15** |
