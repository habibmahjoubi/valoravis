# Architecture AvisBoost

## Vue d'ensemble

```
┌─────────────────────────────────────────────────────────┐
│                        FRONTEND                         │
│  Next.js App Router (React Server Components + Client)  │
├────────────┬────────────┬───────────┬───────────────────┤
│   (auth)   │ (dashboard)│  (admin)  │     (public)      │
│  Login     │  Dashboard │  Stats    │  Review Page      │
│  Register  │  Clients   │  Users    │  /review/[token]  │
│            │  Campaigns │           │                   │
│            │  Settings  │           │                   │
│            │  Billing   │           │                   │
└─────┬──────┴─────┬──────┴─────┬─────┴──────┬────────────┘
      │            │            │            │
┌─────┴────────────┴────────────┴────────────┴────────────┐
│                    SERVER ACTIONS                        │
│  src/actions/dashboard.ts  (CRUD clients, envois, etc.) │
│  src/actions/admin.ts      (suspension comptes)         │
│  src/actions/review.ts     (soumission avis)            │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────┐
│                    API ROUTES                            │
│  /api/auth/[...nextauth]   → NextAuth (magic link)      │
│  /api/billing/cancel       → Annulation Stripe           │
│  /api/cron/send-reviews    → Cron envoi automatique      │
│  /api/webhooks/stripe      → Webhooks paiement           │
│  /api/webhooks/stripe/checkout → Creation session Stripe │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────┐
│                    SERVICES                              │
│  review-request.service.ts                               │
│  → createReviewRequest (anti-doublons, quota)            │
│  → processPendingRequests (envoi email/SMS)               │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────┐
│                  LIBRAIRIES (src/lib/)                   │
│  auth.ts   → NextAuth config + PrismaAdapter             │
│  prisma.ts → Client Prisma singleton                     │
│  resend.ts → Client email                                │
│  stripe.ts → Client Stripe + plans                       │
│  utils.ts  → Helpers (formatDate, absoluteUrl, cn)       │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────┐
│                     BASE DE DONNEES                     │
│  PostgreSQL (Supabase) via Prisma ORM                   │
│                                                         │
│  User ──┬── Client ──── ReviewRequest                   │
│         ├── Template                                    │
│         ├── Account (OAuth)                             │
│         └── Session                                     │
│  VerificationToken (magic links)                        │
└─────────────────────────────────────────────────────────┘
```

## Modele de donnees

### User
Professionnel inscrit sur la plateforme.
- Identifie par email (magic link, pas de mot de passe)
- Associe a une niche (DENTIST, OSTEOPATH, GARAGE)
- Plan d'abonnement (free, pro, business)
- Quota d'envois mensuel

### Client
Contact d'un professionnel (patient, client).
- Nom, email, telephone, notes
- Appartient a un User

### ReviewRequest
Demande d'avis envoyee a un client.
- Canal : EMAIL ou SMS
- Statut : PENDING → SENT → CLICKED → REVIEWED/FEEDBACK
- Token unique pour le lien de tracking
- Note (1-5 etoiles) et feedback prive optionnel

### Template
Template personnalise par l'utilisateur (remplace le defaut niche).
- Unique par (userId, niche, channel)
- Sujet (email) + corps du message

## Flux principaux

### Inscription et onboarding
```
Register → Magic Link → Login → Onboarding Modal → Dashboard
                                (nom, niche, lien Google, tel)
```

### Envoi d'une demande d'avis
```
1. User clique "Envoyer" sur un contact
2. createReviewRequest() verifie quota + anti-doublons
3. ReviewRequest cree en PENDING avec scheduledAt
4. Cron job (/api/cron/send-reviews) traite les PENDING
5. Email envoye via Resend (ou SMS log)
6. Statut passe a SENT
```

### Parcours client (page d'avis)
```
1. Client recoit email/SMS avec lien /review/[token]
2. Ouverture → statut CLICKED
3. Note >= 4 → redirection Google Review (REVIEWED)
4. Note < 4  → formulaire feedback prive (FEEDBACK)
```

### Paiement
```
1. User clique "Upgrader" → Stripe Checkout
2. Paiement OK → webhook checkout.session.completed
3. Plan + quota mis a jour en base
4. Renouvellement → webhook invoice.paid → reset quotaUsed
5. Annulation → cancel_at_period_end → webhook subscription.deleted
```

## Configuration par niche

Chaque niche (src/config/niches.ts) definit :
- **label** : Nom affiche ("Cabinet dentaire")
- **icon** : Emoji
- **defaultDelay** : Delai avant envoi auto (heures)
- **vocabulary** : Termes metier (patient/client, cabinet/garage, etc.)
- **templates** : Messages SMS et EMAIL par defaut avec variables

Variables disponibles : `{{clientName}}`, `{{businessName}}`, `{{link}}`

## Securite

- Authentification passwordless (magic link)
- Sessions via cookies securises (NextAuth)
- Verification userId sur toutes les operations
- Admin : champ isAdmin verifie dans le layout admin
- Suspension : champ isSuspended verifie dans le layout dashboard
- Webhooks Stripe : verification de signature
- Cron : authentification par Bearer token
