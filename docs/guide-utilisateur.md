# Valoravis - Guide utilisateur

## Sommaire

1. [Premiers pas](#1-premiers-pas)
2. [Tableau de bord](#2-tableau-de-bord)
3. [Gestion des clients](#3-gestion-des-clients)
4. [Envoyer une demande d'avis](#4-envoyer-une-demande-davis)
5. [Suivi des campagnes](#5-suivi-des-campagnes)
6. [Parametres](#6-parametres)
7. [Templates personnalises](#7-templates-personnalises)
8. [Abonnement et facturation](#8-abonnement-et-facturation)
9. [Comment ca marche cote client](#9-comment-ca-marche-cote-client)
10. [FAQ](#10-faq)

---

## 1. Premiers pas

### Creer un compte

1. Rendez-vous sur la page d'inscription
2. Selectionnez votre metier (dentiste, osteopathe, garage ou autre)
3. Renseignez votre email professionnel et un mot de passe
   - Minimum 8 caracteres, 1 majuscule, 1 chiffre
4. Choisissez votre plan (Gratuit, Pro ou Business)
5. Un email de verification vous est envoye — cliquez sur le lien pour activer votre compte

### Onboarding

A la premiere connexion, un assistant vous guide :

1. **Nom de l'etablissement** — le nom affiche dans les messages envoyes a vos clients
2. **Metier** — permet d'adapter le vocabulaire et les delais d'envoi
3. **Lien Google Maps** — collez l'URL de votre fiche Google pour que les clients satisfaits y laissent leur avis
4. **Telephone** — utilise si vous activez les SMS (plan Pro+)

> **Astuce** : Vous pouvez modifier toutes ces informations plus tard dans les parametres.

---

## 2. Tableau de bord

Le tableau de bord affiche un resume de votre activite :

- **Quota utilise** : nombre d'envois ce mois / quota total
- **Statut des demandes** : en attente, envoyees, cliquees, avis obtenus
- Acces rapide aux clients et aux parametres

---

## 3. Gestion des clients

### Ajouter un client manuellement

Depuis la page **Clients**, cliquez sur le formulaire d'ajout et renseignez :

- **Nom** (obligatoire)
- **Email** — necessaire pour l'envoi par email
- **Telephone** — necessaire pour l'envoi par SMS
- **Notes** (optionnel) — pour vous, non visible par le client

### Importer des clients en masse (CSV)

> Disponible a partir du plan **Pro**.

1. Cliquez sur **Importer**
2. Glissez-deposez un fichier CSV ou Excel (.xlsx)
3. Les colonnes sont detectees automatiquement : nom, email, telephone, notes
4. Verifiez l'apercu et corrigez les eventuelles erreurs
5. Confirmez l'import

**Limites d'import** :
| Plan | Lignes max par fichier |
|------|----------------------|
| Pro | 100 |
| Business | 5 000 |

### Modifier ou supprimer un client

Depuis la liste des clients, utilisez les boutons d'action a droite de chaque ligne pour modifier les informations ou supprimer un client.

---

## 4. Envoyer une demande d'avis

### Envoi individuel

1. Depuis la page **Clients**, repérez le client souhaite
2. Cliquez sur **Email** ou **SMS** (si disponible dans votre plan)
3. La demande est envoyee avec le delai configure dans vos parametres

### Delai d'envoi

Le delai represente le temps entre le moment ou vous cliquez et l'envoi effectif du message. Par defaut, il est adapte a votre metier :

| Metier | Delai recommande |
|--------|-----------------|
| Dentiste | 2 heures |
| Osteopathe | 3 heures |
| Garage | 24 heures |
| Autre | 4 heures |

Vous pouvez le personnaliser dans **Parametres > Preferences d'envoi** (0 a 720 heures).

### Protections anti-spam

- Un meme client ne peut pas recevoir plus d'une demande sur une periode de 7 jours
- Votre quota mensuel est verifie avant chaque envoi

---

## 5. Suivi des campagnes

La page **Campagnes** vous permet de suivre toutes vos demandes d'avis :

### Statuts

| Statut | Signification |
|--------|--------------|
| En attente | Programmee, pas encore envoyee |
| Envoyee | Le message a ete envoye |
| Cliquee | Le client a ouvert le lien |
| Avis obtenu | Le client a note >= seuil et a ete redirige vers Google |
| Feedback | Le client a note < seuil et a laisse un retour prive |
| Echouee | L'envoi a echoue (email invalide, etc.) |

### Filtres disponibles

- **Canal** : Email ou SMS
- **Statut** : tous les statuts ci-dessus
- **Periode** : 7, 30 ou 90 derniers jours

---

## 6. Parametres

### Etablissement

- Nom de l'etablissement
- Metier (adapte les templates et le vocabulaire)
- URL Google Maps (lien vers votre fiche d'avis)
- Telephone

### Preferences d'envoi

**Mode Email** :
- Nom de l'expediteur — affiche dans la boite de reception du client
- Adresse de reponse — si le client repond a l'email

**Mode SMS** :
- Numero de telephone de l'etablissement

**Commun** :
- Delai avant envoi (en heures)

### Seuil de satisfaction

Le seuil determine a partir de quelle note un client est redirige vers Google :

- **4 etoiles** (par defaut) : seuls les 4 et 5 etoiles vont sur Google
- **3 etoiles** : les 3, 4 et 5 etoiles vont sur Google
- Les notes en dessous du seuil affichent un formulaire de feedback prive

---

## 7. Templates personnalises

> Disponible a partir du plan **Pro**.

### Variables disponibles

| Variable | Remplacee par |
|----------|--------------|
| `{{clientName}}` | Le prenom/nom du client |
| `{{businessName}}` | Le nom de votre etablissement |
| `{{link}}` | Le lien de notation unique |

### Templates email

- **Objet** : le sujet de l'email
- **Corps** : contenu HTML de l'email
- Presets disponibles : Formel, Amical, Relance

### Templates SMS

- **Corps** : texte brut (160 caracteres recommandes)
- Indicateur de longueur en temps reel
- Presets disponibles : Formel, Amical, Relance

### Gestion

- Creez plusieurs templates par canal
- Definissez un template par defaut (utilise pour les envois automatiques)
- Testez vos templates en vous envoyant un message de test

---

## 8. Abonnement et facturation

### Plans disponibles

| | Gratuit | Pro | Business |
|--|---------|-----|----------|
| Envois/mois | 50 | 200 | 500 |
| Email | Oui | Oui | Oui |
| SMS | Non | Oui | Oui |
| Templates personnalises | Non | Oui | Oui |
| Import CSV | Non | 100 lignes | 5 000 lignes |
| Support prioritaire | Non | Non | Oui |

### Essai gratuit

Les plans payants proposent un essai gratuit (duree variable selon le plan). Aucune carte bancaire n'est requise pour demarrer.

### Annulation

Vous pouvez annuler votre abonnement a tout moment depuis **Facturation > Annuler**. L'annulation prend effet a la fin de la periode en cours.

### Factures

Vos 10 dernieres factures sont disponibles en telechargement PDF depuis la page **Facturation**.

---

## 9. Comment ca marche cote client

Voici ce que vit votre client apres l'envoi d'une demande :

1. **Il recoit un email ou SMS** avec un message personnalise et un lien
2. **Il clique sur le lien** et arrive sur une page de notation simple
3. **Il note son experience** de 1 a 5 etoiles
4. **Si la note est >= votre seuil** (ex: 4 ou 5 etoiles) :
   - Il est redirige vers votre fiche Google Maps pour publier son avis
5. **Si la note est < votre seuil** (ex: 1, 2 ou 3 etoiles) :
   - Un formulaire de feedback s'affiche
   - Son retour vous est envoye en prive
   - Rien n'est publie sur Google

> C'est le "filtre intelligent" de Valoravis : les avis positifs vont sur Google, les retours negatifs restent entre vous et votre client.

---

## 10. FAQ

### Est-ce conforme aux regles Google ?
Oui. Valoravis envoie un lien vers la page Google standard. Le client choisit librement de laisser un avis ou non.

### Mes clients recevront-ils du spam ?
Non. Un meme client ne peut recevoir qu'une seule demande tous les 7 jours. De plus, votre quota mensuel limite le nombre total d'envois.

### Puis-je utiliser Valoravis avec plusieurs etablissements ?
Selon votre plan, vous pouvez gerer un ou plusieurs etablissements depuis le meme compte.

### Que se passe-t-il si je depasse mon quota ?
Les envois sont bloques jusqu'au renouvellement mensuel. Passez au plan superieur pour augmenter votre quota.

### Comment recuperer mon mot de passe ?
Cliquez sur "Mot de passe oublie" sur la page de connexion. Un lien de reinitialisation vous sera envoye par email (valide 1 heure).

### Mes donnees sont-elles securisees ?
Oui. Les mots de passe sont chiffres (bcrypt), les connexions sont en HTTPS, et les donnees sont hebergees en Europe (Supabase, region EU).
