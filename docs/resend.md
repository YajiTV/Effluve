# Resend: Emails transactionnels

## Présentation

Resend est le service d'envoi d'emails. Il est utilisé pour :
- L'**email de confirmation de commande** (envoyé après paiement)
- L'**envoi des campagnes newsletter** (depuis l'interface admin)
- Les **emails de test** newsletter depuis l'admin

## Variables d'environnement

| Variable | Description |
|----------|-------------|
| `RESEND_API_KEY` | Clé API Resend (commence par `re_`) |
| `RESEND_FROM` | Adresse d'expédition (ex: `contact@effluve.fr`) |

> Obtenir la clé API : [resend.com/api-keys](https://resend.com/api-keys)  
> Le domaine d'envoi doit être vérifié dans Resend (DNS).

## Comportement si non configuré

Si `RESEND_API_KEY` est absent, le client Resend retourne `null` et **aucun email n'est envoyé**: sans erreur. L'application fonctionne normalement.

## Emails envoyés

### Confirmation de commande
Envoyé automatiquement après confirmation du paiement Stripe (`/api/payment/stripe/confirm`).

**Contenu :**
- Récapitulatif des articles commandés avec quantités et prix
- Réduction appliquée (si présente)
- Total TTC
- Adresse de livraison
- Lien "Suivre ma commande" → `/compte/commandes`

**Fonction :** `sendOrderConfirmationEmail(params)` dans `src/lib/email.ts`

```ts
await sendOrderConfirmationEmail({
  to: "client@example.com",
  customerName: "Marie Dupont",
  orderNumber: "CMD-12-ABC123",
  orderDate: "7 mai 2026",
  items: [{ productName: "Robe Lin", quantity: 1, unitPriceCents: 8900, lineTotalCents: 8900 }],
  totalCents: 8900,
  discountCents: 0,
  shippingAddress: { name: "Marie Dupont", street: "12 rue...", city: "Paris", zipcode: "75001", country: "France" },
});
```

> L'email ne lève jamais d'exception: un échec d'envoi est loggé mais ne bloque pas la réponse de paiement.

### Newsletter (admin)

Route : `POST /api/admin/newsletter`

**Body :**
```json
{ "subject": "Nouvelle collection printemps", "html": "<p>...</p>" }
```

**Comportement :**
- Récupère tous les abonnés en base
- Génère ou récupère le token de désabonnement de chaque abonné
- Envoie l'email individuellement à chaque abonné avec un lien de désabonnement personnalisé
- Sauvegarde la campagne dans `newsletter_campaigns` avec le nombre d'envois
- Crée un log admin

**Réponse :**
```json
{ "ok": true, "sent": 145, "failed": 2, "failures": ["email@...: ..."] }
```

### Email de test newsletter

Route : `POST /api/admin/newsletter/test`  
Envoie l'email uniquement à l'admin connecté pour prévisualisation avant envoi.

## Désabonnement

Chaque email de newsletter contient un lien de désabonnement :
```
/api/newsletter/unsubscribe?token=<uuid>
```

Ce lien supprime l'abonné de la base sans nécessiter de connexion.

## Inscription newsletter

Route publique : `POST /api/newsletter`

**Body :**
```json
{ "email": "contact@example.com" }
```

Si l'email est déjà inscrit, retourne `{ "ok": true }` sans doublon.

## Fichiers sources

- `src/lib/email.ts`: template HTML + fonction `sendOrderConfirmationEmail`
- `src/lib/resend.ts`: singleton du client Resend
- `src/app/api/admin/newsletter/route.ts`: envoi de campagne
- `src/app/api/newsletter/route.ts`: inscription publique
- `src/app/api/newsletter/unsubscribe/route.ts`: désabonnement
