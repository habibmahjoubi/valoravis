# API Endpoints

## Authentification

### NextAuth
- `GET /api/auth/providers` — Liste des providers disponibles
- `GET /api/auth/csrf` — Token CSRF
- `POST /api/auth/signin/resend` — Envoi magic link
- `GET /api/auth/callback/resend` — Callback verification magic link
- `GET /api/auth/verify-request` — Redirect apres envoi magic link
- `POST /api/auth/signout` — Deconnexion

## Paiement (Stripe)

### Checkout
```
POST /api/webhooks/stripe/checkout
```
Cree une session Stripe Checkout pour upgrader le plan.

**Auth :** Session NextAuth requise

**Body :**
```json
{ "plan": "pro" | "business" }
```

**Reponse :**
```json
{ "url": "https://checkout.stripe.com/..." }
```

### Webhooks Stripe
```
POST /api/webhooks/stripe
```
Recoit les evenements Stripe (checkout.session.completed, invoice.paid, customer.subscription.deleted).

**Auth :** Signature Stripe (`stripe-signature` header)

**Evenements traites :**
- `checkout.session.completed` → Met a jour plan + quota
- `invoice.paid` → Reset quotaUsed mensuel
- `customer.subscription.deleted` → Retour au plan free

### Annulation
```
POST /api/billing/cancel
```
Annule l'abonnement en fin de periode (`cancel_at_period_end`).

**Auth :** Session NextAuth requise

**Reponse :**
```json
{ "ok": true }
```

## Cron

### Envoi automatique des demandes
```
GET /api/cron/send-reviews
```
Traite les ReviewRequest en statut PENDING dont le `scheduledAt` est passe.

**Auth :** Bearer token (`Authorization: Bearer <CRON_SECRET>`)

**Reponse :**
```json
{
  "ok": true,
  "sent": 3,
  "failed": 0,
  "timestamp": "2026-04-06T12:00:00.000Z"
}
```

**Config Vercel (vercel.json) :**
```json
{
  "crons": [{
    "path": "/api/cron/send-reviews",
    "schedule": "*/5 * * * *"
  }]
}
```

## Server Actions

Les mutations sont gerees via des Server Actions (pas des API REST).

### Dashboard (`src/actions/dashboard.ts`)

| Action | Description |
|--------|-------------|
| `completeOnboarding(formData)` | Finalise l'onboarding (nom, niche, lien Google, tel) |
| `addClient(formData)` | Ajoute un contact |
| `updateClient(formData)` | Modifie un contact |
| `deleteClient(clientId)` | Supprime un contact |
| `importClients(csvData)` | Import CSV de contacts |
| `sendReviewRequest(formData)` | Envoie une demande d'avis |
| `saveTemplate(formData)` | Sauvegarde un template personnalise |
| `resetTemplate(formData)` | Supprime le template personnalise (retour au defaut) |
| `updateSettings(formData)` | Met a jour les parametres |

### Admin (`src/actions/admin.ts`)

| Action | Description |
|--------|-------------|
| `toggleSuspendUser(userId)` | Suspend ou reactive un utilisateur |

### Review (`src/actions/review.ts`)

| Action | Description |
|--------|-------------|
| `submitRating(token, rating, feedback)` | Soumet une note et un feedback |
