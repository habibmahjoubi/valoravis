# Valoravis - Documentation technique

## Sommaire

1. [Architecture](#1-architecture)
2. [Stack technique](#2-stack-technique)
3. [Installation](#3-installation)
4. [Variables d'environnement](#4-variables-denvironnement)
5. [Base de donnees](#5-base-de-donnees)
6. [Authentification](#6-authentification)
7. [Routes API](#7-routes-api)
8. [Server Actions](#8-server-actions)
9. [Services](#9-services)
10. [Configuration metiers](#10-configuration-metiers)
11. [Plans et features](#11-plans-et-features)
12. [Securite](#12-securite)
13. [Deploiement](#13-deploiement)
14. [Cron jobs](#14-cron-jobs)

---

## 1. Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Pages authentification (login, register, verify-email...)
│   ├── (dashboard)/        # Pages protegees (dashboard, clients, settings, billing)
│   ├── (public)/           # Pages publiques (review/[token])
│   ├── api/                # Routes API (auth, cron, webhooks)
│   └── page.tsx            # Landing page
├── actions/                # Server Actions (auth.ts, dashboard.ts, review.ts)
├── components/             # Composants React
│   ├── dashboard/          # Composants du dashboard
│   ├── landing/            # Composants de la page vitrine
│   ├── review/             # Composants du parcours client (notation)
│   └── ui/                 # Composants UI reutilisables
├── config/                 # Configuration (niches, plans)
├── generated/prisma/       # Client Prisma genere
├── lib/                    # Bibliotheques utilitaires
│   ├── auth.ts             # Configuration NextAuth
│   ├── prisma.ts           # Client Prisma singleton
│   ├── resend.ts           # Service email (Resend)
│   ├── sms.ts              # Service SMS (Twilio)
│   ├── stripe.ts           # Integration Stripe
│   ├── rate-limit.ts       # Rate limiter in-memory
│   └── utils.ts            # Fonctions utilitaires
├── services/               # Logique metier
│   └── review-request.service.ts
└── types/                  # Types TypeScript
```

### Flux de donnees

```
Client (navigateur)
  → Server Components (rendu serveur)
  → Server Actions (mutations)
  → Services (logique metier)
  → Prisma (base de donnees)
  → Services externes (Resend, Twilio, Stripe)
```

---

## 2. Stack technique

| Categorie | Technologie | Version |
|-----------|-------------|---------|
| Framework | Next.js (Turbopack) | 16.2.2 |
| Runtime | React | 19.2.4 |
| Langage | TypeScript | 5 |
| CSS | TailwindCSS | 4 |
| ORM | Prisma | 7.6.0 |
| BDD | PostgreSQL (Supabase) | 15+ |
| Auth | NextAuth.js | 5.0.0-beta.30 |
| Email | Resend | 6.10.0 |
| SMS | Twilio | 5.13.1 |
| Paiement | Stripe | 22.0.0 |
| Icones | Lucide React | 1.7.0 |
| Securite | bcryptjs | 3.0.3 |

---

## 3. Installation

### Prerequis

- Node.js 20+
- npm
- PostgreSQL (ou compte Supabase)

### Setup

```bash
# Cloner le repo
git clone https://github.com/habibmahjoubi/valoravis.git
cd valoravis

# Installer les dependances
npm install

# Copier les variables d'environnement
cp .env.example .env
# Editer .env avec vos valeurs

# Generer le client Prisma
npx prisma generate

# Synchroniser le schema avec la BDD
npx prisma db push

# Lancer en dev
npm run dev
```

L'application est accessible sur `http://localhost:3000`.

### Build production

```bash
npm run build
npm start
```

---

## 4. Variables d'environnement

### Base de donnees

| Variable | Description | Exemple |
|----------|-------------|---------|
| `DATABASE_URL` | URL PostgreSQL (via PgBouncer pour les requetes) | `postgresql://user:pass@host:6543/db?pgbouncer=true` |
| `DIRECT_DATABASE_URL` | URL directe (pour les migrations Prisma) | `postgresql://user:pass@host:5432/db` |

### Authentification

| Variable | Description | Exemple |
|----------|-------------|---------|
| `AUTH_SECRET` | Secret pour signer les tokens JWT | `openssl rand -base64 32` |
| `AUTH_URL` | URL de base de l'application | `https://valoravis.example.com` |
| `AUTH_TRUST_HOST` | Requis derriere un proxy (Vercel) | `true` |

### Services externes

| Variable | Description |
|----------|-------------|
| `RESEND_API_KEY` | Cle API Resend |
| `EMAIL_FROM` | Adresse d'envoi (ex: `Valoravis <noreply@domain.com>`) |
| `TWILIO_ACCOUNT_SID` | SID du compte Twilio |
| `TWILIO_AUTH_TOKEN` | Token Twilio |
| `TWILIO_PHONE_NUMBER` | Numero d'envoi SMS |
| `STRIPE_SECRET_KEY` | Cle secrete Stripe |
| `STRIPE_PUBLISHABLE_KEY` | Cle publique Stripe |
| `STRIPE_WEBHOOK_SECRET` | Secret de verification webhook |
| `STRIPE_PRICE_PRO` | Price ID Stripe du plan Pro |
| `STRIPE_PRICE_BUSINESS` | Price ID Stripe du plan Business |

### Application

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_APP_URL` | URL publique de l'app |
| `CRON_SECRET` | Token bearer pour l'endpoint cron |

---

## 5. Base de donnees

### Schema principal

#### User
Compte utilisateur du SaaS.

```
id               String    @id @default(cuid())
email            String    @unique
emailVerified    DateTime?
password         String?   # Hash bcrypt
name             String?
businessName     String?
niche            Niche     @default(DENTIST)  # DENTIST | OSTEOPATH | GARAGE | OTHER
customNiche      String?
googlePlaceUrl   String?
phone            String?
stripeCustomerId String?   @unique
plan             String    @default("free")
monthlyQuota     Int       @default(50)
quotaUsed        Int       @default(0)
onboarded        Boolean   @default(false)
satisfactionThreshold Int  @default(4)  # 1-5
defaultChannel   Channel   @default(EMAIL)
defaultDelay     Int?      # Heures, null = defaut du metier
senderName       String?
replyToEmail     String?
trialEndsAt      DateTime?
cancelRequestedAt DateTime?
cancelEffectiveAt DateTime?
```

#### Client
Contact/client d'un utilisateur.

```
id        String   @id @default(cuid())
userId    String   # FK → User
name      String
email     String?
phone     String?
notes     String?
```

#### ReviewRequest
Demande d'avis individuelle.

```
id          String   @id @default(cuid())
userId      String   # FK → User
clientId    String   # FK → Client
channel     Channel  # EMAIL | SMS
status      Status   # PENDING | SENT | CLICKED | REVIEWED | FEEDBACK | FAILED
token       String   @unique  # Identifiant unique dans le lien
scheduledAt DateTime?
sentAt      DateTime?
clickedAt   DateTime?
rating      Int?     # 1-5
feedback    String?
```

#### Template
Templates de messages personnalises.

```
id        String  @id @default(cuid())
userId    String  # FK → User
name      String
niche     Niche
channel   Channel
subject   String? # Email uniquement
body      String
isDefault Boolean @default(false)
```

#### Plan
Configuration des plans tarifaires.

```
id            String  @id @default(cuid())
key           String  @unique  # "free", "pro", "business"
name          String
price         Int     # Centimes
quota         Int     # 0 = illimite
maxUsers      Int     @default(1)
trialDays     Int     @default(0)
stripePriceId String?
isActive      Boolean @default(true)
sortOrder     Int     @default(0)
```

---

## 6. Authentification

### Configuration NextAuth v5

- **Strategie** : JWT (7 jours d'expiration)
- **Provider** : Credentials (email + mot de passe)
- **Adaptateur** : PrismaAdapter

### Flux de connexion

1. L'utilisateur soumet email + mot de passe
2. Rate limiting verifie (5 tentatives / 15 min)
3. Recherche utilisateur en BDD
4. Comparaison bcrypt (timing-safe avec dummy hash)
5. Verification `emailVerified` non null
6. Token JWT genere avec `user.id`

### Protection des routes

Les pages sous `(dashboard)/` verifient la session via `auth()` et redirigent vers `/login` si absente.

---

## 7. Routes API

### `GET|POST /api/cron/send-reviews`

Traite les demandes d'avis en attente.

- **Methodes** : GET (Vercel Cron) et POST (appels externes)
- **Auth** : Bearer token (`CRON_SECRET`), comparaison timing-safe
- **Reponse** : `{ ok: boolean, sent: number, failed: number, timestamp: string }`
- **Logique** : Trouve les `ReviewRequest` avec `status=PENDING` et `scheduledAt <= now`, envoie par lot de 50

### `POST /api/webhooks/stripe`

Recoit les evenements Stripe.

- **Auth** : Signature webhook Stripe
- **Evenements geres** :
  - `checkout.session.completed` — Active le plan et le quota
  - `invoice.paid` — Reinitialise le quota mensuel
  - `customer.subscription.deleted` — Retour au plan gratuit

### `POST /api/billing/cancel`

Demande d'annulation d'abonnement.

- **Auth** : Session NextAuth
- **Reponse** : `{ success: boolean }`
- **Effet** : Enregistre `cancelRequestedAt`, notifie les admins par email

### `POST /api/auth/[...nextauth]`

Routes NextAuth standard (signin, signout, session, csrf, providers).

---

## 8. Server Actions

### `src/actions/dashboard.ts`

| Action | Description | Validation |
|--------|-------------|------------|
| `completeOnboarding(formData)` | Finalise l'inscription | businessName requis |
| `addClient(formData)` | Ajoute un client | nom requis, email ou phone |
| `updateClient(formData)` | Modifie un client | verification proprietaire |
| `deleteClient(formData)` | Supprime un client | verification proprietaire |
| `importClients(csvString)` | Import CSV en masse | validation ligne par ligne, anti-injection CSV |
| `sendReviewRequest(formData)` | Cree une demande d'avis | quota atomique, IDOR, anti-doublon 7j |
| `updateSendingSettings(formData)` | Preferences d'envoi | canal, delai, phone |
| `updateSettings(formData)` | Profil etablissement | longueurs max |
| `updateThreshold(formData)` | Seuil de satisfaction | 1-5 |
| `saveTemplate(formData)` | Cree/modifie un template | plan Pro+ |
| `deleteTemplate(formData)` | Supprime un template | verification proprietaire |
| `startTrial(formData)` | Demarre un essai gratuit | pas de trial actif |

### `src/actions/auth.ts`

| Action | Description | Rate limit |
|--------|-------------|------------|
| `registerUser(formData)` | Inscription | 5/15min email, 3/5min IP |
| `verifyEmail(token)` | Verification email | Token 24h |
| `resendVerificationEmail(email)` | Renvoyer verification | 3/15min |
| `requestPasswordReset(formData)` | Mot de passe oublie | 3/h |
| `resetPassword(formData)` | Nouveau mot de passe | Token 1h |

### `src/actions/review.ts`

| Action | Description |
|--------|-------------|
| `submitRating(token, rating, feedback?)` | Soumission de la note client |

---

## 9. Services

### `review-request.service.ts`

#### `createReviewRequest(userId, clientId, channel, delayHours)`

1. Transaction interactive atomique (anti race condition sur le quota)
2. Verifie la propriete du client (anti IDOR)
3. Verifie le quota mensuel
4. Anti-doublon : pas de demande au meme client dans les 7 derniers jours
5. Cree le `ReviewRequest` + incremente `quotaUsed` dans la meme transaction
6. Si `delayHours === 0` : envoi immediat (template resanitise avant envoi)
7. Sinon : `scheduledAt = now + delayHours`
8. Resolution du template : custom (si defaut) > template par defaut du metier
9. Interpolation des variables : `{{clientName}}`, `{{businessName}}`, `{{link}}`

#### `processPendingRequests()`

1. Trouve les `ReviewRequest` ou `status=PENDING` et `scheduledAt <= now`
2. Limite : 50 par execution
3. Pour chaque : resanitise le template HTML, envoie email/SMS, met a jour `status=SENT` et `sentAt`
4. En cas d'echec : `status=FAILED`
5. Retourne `{ sent, failed }`

---

## 10. Configuration metiers

Fichier : `src/config/niches.ts`

Chaque metier definit :

```typescript
{
  label: string,           // "Cabinet dentaire"
  defaultDelay: number,    // Heures avant envoi
  vocabulary: {
    client: string,        // "patient" | "client"
    clients: string,       // "patients" | "clients"
    establishment: string, // "cabinet" | "garage" | "etablissement"
    visit: string,         // "consultation" | "seance" | "intervention"
  },
  templates: {
    EMAIL: { subject, body },
    SMS: { body },
  },
  presets: {
    EMAIL: [Formel, Amical, Relance],
    SMS: [Formel, Amical, Relance],
  }
}
```

| Metier | Delai | Client | Etablissement |
|--------|-------|--------|---------------|
| DENTIST | 2h | patient | cabinet |
| OSTEOPATH | 3h | patient | cabinet |
| GARAGE | 24h | client | garage |
| OTHER | 4h | client | etablissement |

---

## 11. Plans et features

Fichier : `src/config/plan-features.ts`

### Matrice des features

| Feature | free | pro | business |
|---------|------|-----|----------|
| `sms` | Non | Oui | Oui |
| `custom_templates` | Non | Oui | Oui |
| `csv_import` | Non | Oui | Oui |
| `detailed_stats` | Non | Oui | Oui |
| `advanced_stats` | Non | Non | Oui |
| `priority_support` | Non | Non | Oui |

### Limites d'import CSV

| Plan | Max lignes |
|------|-----------|
| free | 0 |
| pro | 100 |
| business | 5000 |

### Verification

```typescript
import { hasFeature } from "@/config/plan-features";

if (hasFeature(user.plan, "sms")) {
  // L'utilisateur a acces aux SMS
}
```

---

## 12. Securite

### Mots de passe

- Hash bcrypt avec 12 salt rounds
- Comparaison timing-safe (dummy hash pour eviter l'enumeration d'emails)
- Regles : 8+ caracteres, 1 majuscule, 1 chiffre

### Headers de securite (next.config.ts)

- `X-Powered-By` desactive (`poweredByHeader: false`)
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin` (global), `no-referrer` (pages `/review/*`)
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- `Content-Security-Policy` restrictive avec `frame-src` Stripe
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

### Protection des donnees

- Tokens de verification hashes (SHA-256) en BDD
- Verification email obligatoire avant connexion
- Token de review a usage unique
- Feedback client prive (non publie)
- Templates HTML resanitises a chaque envoi (defense in depth)
- Protection anti-injection CSV (formules Excel bloquees)
- Sanitisation des headers email (fromName)

### Protection anti-bot

- Honeypot invisible sur les formulaires login et register
- Verification de timing (rejet si soumission < 1-2 secondes)
- `robots.txt` bloquant `/api/`, `/dashboard/`, `/review/`, pages auth

### Rate limiting public

| Endpoint | Limite |
|----------|--------|
| Login | 5 / 15 min par email |
| Inscription | 5 / 15 min par email, 3 / 5 min par IP |
| Reset mot de passe | 3 / heure par email |
| Renvoi verification | 3 / 15 min par email, 5 / 15 min par IP |
| Soumission avis | 10 / heure par IP |

---

## 13. Deploiement

### Vercel (recommande)

1. Connectez le repo GitHub a Vercel
2. Configurez les variables d'environnement (voir section 4)
3. Le build command par defaut fonctionne : `prisma generate && next build`
4. Deploiement automatique a chaque push sur `main`

### Variables Vercel requises

Toutes les variables de la section 4, plus :
- `AUTH_TRUST_HOST=true` (obligatoire derriere le proxy Vercel)

### Base de donnees

- Supabase (PostgreSQL) recommande
- Utiliser le port 6543 (PgBouncer) pour `DATABASE_URL`
- Utiliser le port 5432 (direct) pour `DIRECT_DATABASE_URL`

### Synchronisation du schema

```bash
# Depuis la machine locale avec DIRECT_DATABASE_URL
npx prisma db push
```

---

## 14. Cron jobs

### Envoi des demandes programmees

L'endpoint `GET|POST /api/cron/send-reviews` doit etre appele regulierement pour traiter les demandes en attente.

#### Configuration Vercel Cron

Ajoutez dans `vercel.json` :

```json
{
  "crons": [
    {
      "path": "/api/cron/send-reviews",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

#### Authentification

L'endpoint verifie le header `Authorization: Bearer <CRON_SECRET>`. Vercel injecte automatiquement ce header pour les crons configures.

#### Monitoring

Chaque execution retourne :

```json
{
  "ok": true,
  "sent": 12,
  "failed": 0,
  "timestamp": "2026-04-12T..."
}
```
