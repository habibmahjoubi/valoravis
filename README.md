# Valoravis

Plateforme SaaS de collecte d'avis Google pour professionnels locaux (dentistes, osteopathes, garages).

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | Next.js 16, React 19, Tailwind CSS |
| Backend | Next.js Server Actions, API Routes |
| Base de donnees | PostgreSQL (Supabase) |
| ORM | Prisma 7 |
| Auth | NextAuth v5 (magic link via Resend) |
| Email | Resend |
| Paiement | Stripe (Checkout + Webhooks) |
| Deploiement | Vercel |

## Structure du projet

```
valoravis/
├── docs/                          # Documentation
│   ├── USER-STORIES.md            # User stories detaillees
│   ├── architecture/              # Documentation technique
│   │   └── OVERVIEW.md            # Architecture globale
│   └── api/                       # Documentation API
│       └── ENDPOINTS.md           # Endpoints API
│
├── prisma/
│   └── schema.prisma              # Schema de base de donnees
│
├── src/
│   ├── actions/                   # Server Actions (logique metier)
│   │   ├── dashboard.ts           # Actions dashboard (clients, envois, templates)
│   │   ├── admin.ts               # Actions admin (suspension)
│   │   └── review.ts              # Actions page d'avis publique
│   │
│   ├── app/                       # Routes Next.js (App Router)
│   │   ├── (auth)/                # Pages authentification
│   │   │   ├── login/             # Connexion (magic link)
│   │   │   └── register/          # Inscription
│   │   ├── (dashboard)/           # Espace utilisateur
│   │   │   ├── layout.tsx         # Layout sidebar
│   │   │   └── dashboard/
│   │   │       ├── page.tsx       # Tableau de bord
│   │   │       ├── clients/       # Gestion des contacts
│   │   │       ├── campaigns/     # Historique des envois
│   │   │       ├── settings/      # Parametres + templates
│   │   │       └── billing/       # Abonnement + facturation
│   │   ├── (admin)/               # Panel administration
│   │   │   └── admin/
│   │   │       ├── page.tsx       # Dashboard admin
│   │   │       └── users/         # Gestion utilisateurs
│   │   ├── (public)/              # Pages publiques
│   │   │   └── review/[token]/    # Page d'avis client
│   │   ├── api/                   # API Routes
│   │   │   ├── auth/              # NextAuth endpoints
│   │   │   ├── billing/cancel/    # Annulation abonnement
│   │   │   ├── cron/send-reviews/ # Cron envoi automatique
│   │   │   └── webhooks/stripe/   # Webhooks Stripe
│   │   ├── suspended/             # Page compte suspendu
│   │   ├── layout.tsx             # Layout racine
│   │   └── page.tsx               # Landing page
│   │
│   ├── components/                # Composants React
│   │   ├── dashboard/             # Composants espace utilisateur
│   │   ├── admin/                 # Composants admin
│   │   └── review/                # Composants page d'avis
│   │
│   ├── config/                    # Configuration
│   │   └── niches.ts              # Config par metier (templates, vocabulaire)
│   │
│   ├── lib/                       # Librairies et utilitaires
│   │   ├── auth.ts                # Configuration NextAuth
│   │   ├── prisma.ts              # Client Prisma
│   │   ├── resend.ts              # Client email Resend
│   │   ├── stripe.ts              # Client Stripe + plans
│   │   └── utils.ts               # Utilitaires (formatDate, absoluteUrl)
│   │
│   ├── services/                  # Services metier
│   │   └── review-request.service.ts  # Creation et envoi des demandes
│   │
│   ├── types/                     # Types TypeScript
│   │   └── index.ts               # Types partages (NicheConfig, etc.)
│   │
│   └── generated/                 # Code genere (Prisma Client)
│
├── .env                           # Variables d'environnement
├── vercel.json                    # Config Vercel (cron)
└── package.json
```

## Demarrage rapide

```bash
# 1. Installer les dependances
npm install

# 2. Configurer les variables d'environnement
cp .env.example .env
# Remplir DATABASE_URL, AUTH_SECRET, RESEND_API_KEY, etc.

# 3. Synchroniser la base de donnees
npx prisma db push

# 4. Generer le client Prisma
npx prisma generate

# 5. Lancer le serveur de developpement
npm run dev
```

L'application est accessible sur [http://localhost:3000](http://localhost:3000).

## Variables d'environnement

| Variable | Description | Obligatoire |
|----------|-------------|-------------|
| `DATABASE_URL` | URL PostgreSQL (Supabase) | Oui |
| `AUTH_SECRET` | Secret NextAuth (generer avec `openssl rand -base64 32`) | Oui |
| `AUTH_URL` | URL de l'app (`http://localhost:3000` en dev) | Oui |
| `RESEND_API_KEY` | Cle API Resend pour les emails | Oui |
| `EMAIL_FROM` | Adresse expediteur | Oui |
| `STRIPE_SECRET_KEY` | Cle secrete Stripe | Oui |
| `STRIPE_PUBLISHABLE_KEY` | Cle publique Stripe | Oui |
| `STRIPE_WEBHOOK_SECRET` | Secret webhook Stripe | Oui |
| `STRIPE_PRICE_PRO` | ID prix Stripe plan Pro | Oui |
| `STRIPE_PRICE_BUSINESS` | ID prix Stripe plan Business | Oui |
| `CRON_SECRET` | Secret pour l'endpoint cron | Oui |
| `NEXT_PUBLIC_APP_URL` | URL publique de l'app | Oui |

## Scripts

```bash
npm run dev      # Serveur de developpement
npm run build    # Build de production
npm run start    # Serveur de production
npm run lint     # Linting ESLint
```

## Deploiement

Le projet est configure pour Vercel avec un cron job pour l'envoi automatique des demandes d'avis (voir `vercel.json`).
