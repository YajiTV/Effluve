# API REST: Routes internes

Toutes les routes sont sous `/api/`. L'authentification utilise un cookie JWT httpOnly (`effluve_session`).

**Légende :** public | connecté | admin/superadmin


## Authentification

### `POST /api/auth/register` 
Créer un compte client.
```json
// Body
{ "email": "...", "password": "...", "full_name": "..." }
// Réponse
{ "ok": true, "user": { "id": 1, "email": "...", "role": "customer" } }
```

### `POST /api/auth/login` 
Connexion. Pose le cookie de session.
```json
// Body
{ "email": "...", "password": "..." }
// Réponse normale
{ "ok": true, "user": { ... } }
// Si réinitialisation obligatoire
{ "mustResetPassword": true }
```
Rate-limit : 10 tentatives / 15 min par IP.

### `POST /api/auth/logout` 
Supprime le cookie de session.

### `POST /api/auth/set-new-password` 
Réinitialise le mot de passe (via token de reset).
```json
{ "password": "newmdp" }
```


## Utilisateur connecté

### `GET /api/me` 
Retourne le profil de l'utilisateur connecté.

### `GET /api/me/counts` 
Retourne les compteurs de badge (panier, wishlist).
```json
{ "cartCount": 3, "wishlistCount": 5 }
```


## Panier

### `GET /api/cart` 
Retourne les articles du panier.

### `POST /api/cart/add` 
```json
{ "productId": 12, "quantity": 1, "size": "M" }
```

### `POST /api/cart/update` 
```json
{ "cartItemId": 4, "quantity": 2 }
```

### `DELETE /api/cart/remove` 
```json
{ "cartItemId": 4 }
```


## Wishlist

### `GET /api/wishlist` 
### `POST /api/wishlist/toggle` 
Ajoute ou retire un produit de la wishlist.
```json
{ "productId": 12 }
// Réponse
{ "added": true }
```

### `DELETE /api/wishlist/[id]` 
Retire un produit par son `productId`.


## Checkout & Commandes

### `POST /api/checkout/create-order` 
Crée une commande depuis le panier. Calcule les frais de port côté serveur via Shippo.
```json
// Body
{
  "shippingAddressId": 2,
  "billingAddressId": 2,
  "promoCode": "SUMMER10",     // optionnel
  "useLoyalty": true           // optionnel
}
// Réponse
{ "ok": true, "order": { "orderId": 42, "orderNumber": "CMD-5-X1Y2Z3", "totalCents": 9899, "shippingCostCents": 499 } }
```


## Paiement

### `POST /api/payment/stripe/session` 
Crée une session Checkout Stripe → retourne une URL de redirection.
```json
{ "orderId": 42 }
// → { "ok": true, "url": "https://checkout.stripe.com/..." }
```

### `POST /api/payment/stripe/confirm` 
Confirme le paiement après retour de Stripe.
```json
{ "orderId": 42, "sessionId": "cs_test_..." }
```

### `POST /api/payment/simulate` 
Simule un paiement réussi (dev uniquement).
```json
{ "orderId": 42 }
```

### `POST /api/payment/cancel` 
Annule une commande `pending_payment`.
```json
{ "orderId": 42 }
```


## Livraison

### `POST /api/shipping/estimate` 
Estime les frais de port pour une adresse.
```json
// Body
{ "addressId": 3, "itemCount": 2 }
// Réponse
{ "ok": true, "shippingCostCents": 499, "carrierName": "Colissimo" }
```

### `POST /api/shipping/label` 
Génère l'étiquette Shippo pour une commande payée.
```json
{ "orderId": 42 }
// → { "ok": true, "trackingNumber": "...", "labelUrl": "...", "carrierName": "UPS" }
```


## Adresses

### `GET /api/address` 
Liste les adresses de l'utilisateur.

### `POST /api/address` 
Crée une adresse.
```json
{
  "firstName": "Marie", "lastName": "Dupont",
  "line1": "12 rue de la Paix", "line2": null,
  "postalCode": "75001", "city": "Paris", "country": "France",
  "phone": "+33600000000",
  "isDefaultShipping": true, "isDefaultBilling": true
}
```


## Retours

### `POST /api/returns` 
Demande de retour client.
```json
{
  "orderId": 42,
  "orderItemId": 7,
  "reason": "too_small",
  "note": "Taille plus grande que prévu"
}
```


## Codes promo

### `POST /api/promo/validate` 
Valide un code promo sans l'appliquer.
```json
{ "code": "SUMMER10", "orderTotalCents": 8900 }
// Réponse si valide
{ "valid": true, "discountCents": 890, "code": "SUMMER10", "description": "10% de réduction" }
// Si invalide
{ "valid": false, "error": "Code expiré" }
```


## Newsletter

### `POST /api/newsletter` 
Inscription.
```json
{ "email": "contact@example.com" }
```

### `GET /api/newsletter/unsubscribe?token=...` 
Désabonnement par token


## Admin: Commandes

### `PATCH /api/admin/orders/[id]/status` 
Met à jour le statut d'une commande.
```json
{ "status": "shipped" }
```

## Admin: Produits

### `GET /api/admin/products` 
### `POST /api/admin/products` 
### `PATCH /api/admin/products/[id]` 
### `DELETE /api/admin/products/[id]` 

## Admin: Codes promo

### `GET /api/admin/promo` 
### `POST /api/admin/promo` 
```json
{
  "code": "SUMMER10",
  "discountType": "percentage",  // ou "fixed"
  "discountValue": 10,
  "minOrderCents": 5000,
  "maxUses": 100,
  "expiresAt": "2026-09-01T00:00:00Z"
}
```
### `PATCH /api/admin/promo/[id]` 
### `DELETE /api/admin/promo/[id]` 

## Admin: Newsletter

### `POST /api/admin/newsletter` 
Envoie une campagne à tous les abonnés.
```json
{ "subject": "Nouvelle collection", "html": "<p>...</p>" }
// → { "ok": true, "sent": 145, "failed": 0 }
```

### `POST /api/admin/newsletter/test` 
Envoie l'email de test à l'admin connecté.

### `GET /api/admin/newsletter/campaigns` 
Historique des campagnes envoyées.

### `GET /api/admin/newsletter/export` 
Export CSV des abonnés.

## Admin: Retours

### `GET /api/admin/returns` 
### `PATCH /api/admin/returns/[id]` 
```json
{ "status": "approved", "refundCents": 8900 }
```

## Admin: Exports

### `GET /api/admin/export/orders` 
Export CSV des commandes.

### `GET /api/admin/export/customers` 
Export CSV des clients.

## Admin: Rôles

### `PATCH /api/admin/roles` 
Modifie le rôle d'un utilisateur.
```json
{ "userId": 3, "role": "admin" }
```

## Admin: Reset mot de passe

### `POST /api/admin/users/[id]/reset-password` 
Force la réinitialisation du mot de passe au prochain login.
