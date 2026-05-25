# Stripe: Paiement en ligne

## Présentation

Stripe gère les paiements par carte bancaire. L'intégration utilise les **Checkout Sessions** (page de paiement hébergée par Stripe) et la **création automatique de facture**.

## Variables d'environnement

| Variable | Description |
|----------|-------------|
| `STRIPE_SECRET_KEY` | Clé secrète (commence par `sk_test_` en test, `sk_live_` en prod) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Clé publique (commence par `pk_test_` / `pk_live_`): non utilisée côté serveur pour l'instant |

> Obtenir les clés : [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys)

## Flux de paiement

```
Client → POST /api/checkout/create-order  → Commande créée (status: pending_payment)
       → POST /api/payment/stripe/session → Stripe Checkout Session créée
       → Redirection vers stripe.com      → Client paie
       → Stripe → GET /checkout/success?session_id=... → Confirmation côté client
       → POST /api/payment/stripe/confirm → Commande marquée "paid"
```

## Routes API

### `POST /api/payment/stripe/session`
Crée une session Checkout Stripe pour une commande existante.

**Body :**
```json
{ "orderId": 42 }
```

**Réponse :**
```json
{ "ok": true, "url": "https://checkout.stripe.com/...", "sessionId": "cs_test_..." }
```

**Comportement :**
- Vérifie que la commande appartient à l'utilisateur connecté et est en `pending_payment`
- Construit les `line_items` depuis les articles de la commande + frais de livraison si > 0
- Active la création automatique de facture PDF
- Redirige vers `/checkout/success` en cas de succès, `/checkout` en cas d'annulation

### `POST /api/payment/stripe/confirm`
Webhook / callback appelé après retour de Stripe pour confirmer le paiement.

**Body :**
```json
{ "orderId": 42, "sessionId": "cs_test_..." }
```

**Comportement :**
- Vérifie le statut de la session Stripe (`payment_status: "paid"`)
- Met à jour la commande en `paid`
- Récupère l'URL de la facture Stripe et la sauvegarde en base
- Envoie l'email de confirmation de commande via Resend

### `POST /api/payment/simulate`
Simule un paiement réussi sans appeler Stripe (utile en développement).

**Body :**
```json
{ "orderId": 42 }
```

### `POST /api/payment/cancel`
Annule une commande en `pending_payment`.

**Body :**
```json
{ "orderId": 42 }
```

## Mode test

En mode test (`sk_test_...`), utiliser les cartes de test Stripe :

| Carte | Résultat |
|-------|----------|
| `4242 4242 4242 4242` | Succès |
| `4000 0000 0000 0002` | Refusée |
| `4000 0025 0000 3155` | Authentification 3D Secure requise |

Date d'expiration : n'importe quelle date future. CVV : n'importe quoi.

## Factures

Stripe génère automatiquement une facture PDF pour chaque paiement réussi. L'URL est stockée dans `orders.stripe_invoice_url` et accessible depuis le compte client.

Si l'adresse de facturation contient une entreprise ou un numéro de TVA, ils apparaissent dans les champs personnalisés de la facture.

## Fichier source

`src/lib/stripe.ts`: singleton du client Stripe, export `isStripeConfigured` pour vérifier si les clés sont présentes avant d'appeler l'API.
