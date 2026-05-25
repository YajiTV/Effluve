# Shippo: Livraison & étiquettes

## Présentation

Shippo est utilisé pour deux choses :
1. **Estimer les frais de port** au moment du checkout (en fonction de l'adresse de livraison)
2. **Générer les étiquettes d'expédition** PDF depuis l'interface admin après paiement

## Variables d'environnement

| Variable | Description |
|----------|-------------|
| `SHIPPO_API_KEY` | Clé API Shippo (commence par `shippo_test_` en test) |
| `SHIPPING_MOCK` | Mettre à `true` pour simuler sans appeler Shippo |
| `EFFLUVE_STREET` | Rue de l'adresse d'expédition Effluve |
| `EFFLUVE_CITY` | Ville de l'adresse d'expédition |
| `EFFLUVE_ZIP` | Code postal de l'adresse d'expédition |
| `EFFLUVE_PHONE` | Téléphone de l'adresse d'expédition |

> Obtenir la clé API : [goshippo.com/user/apikeys](https://goshippo.com/user/apikeys)

## Mode mock

Le mode mock est activé automatiquement si :
- `SHIPPO_API_KEY` commence par `shippo_test_`
- ou `SHIPPING_MOCK=true`

En mode mock :
- L'estimation retourne toujours **4,99 €** (carrier : "Colissimo (simulation)")
- La génération d'étiquette crée un faux numéro de tracking et une URL locale de test

## Calcul du poids

Le poids du colis est calculé forfaitairement : **500g par article** dans la commande.  
Les dimensions du colis sont fixes : **30cm × 20cm × 5cm**.

> Il n'y a pas de poids individuel par produit en base de données. Si tu veux affiner, il faudrait ajouter un champ `weightGrams` sur le modèle `Product`.

## Sélection du transporteur

Shippo retourne tous les tarifs disponibles selon les carriers configurés dans ton compte.  
L'algorithme de sélection :
1. **Carriers préférés en priorité** : DHL, FedEx, UPS, Colissimo, USPS, TNT, GLS, DPD
2. **Prix croissant** à égalité de priorité

Le moins cher parmi les carriers connus est retenu.

## Routes API

### `POST /api/shipping/estimate`
Estime les frais de port pour une adresse donnée. Appelée depuis le checkout à chaque changement d'adresse.

**Auth requise :** oui (client connecté)

**Body :**
```json
{ "addressId": 3, "itemCount": 2 }
```

**Réponse :**
```json
{ "ok": true, "shippingCostCents": 499, "carrierName": "Colissimo" }
```

### `POST /api/shipping/label`
Génère l'étiquette d'expédition pour une commande payée. Réservé aux admins.

**Auth requise :** oui (role `admin` ou `superadmin`)

**Body :**
```json
{ "orderId": 42 }
```

**Réponse :**
```json
{
  "ok": true,
  "trackingNumber": "1Z999AA10123456784",
  "labelUrl": "https://shippo-delivery.com/...",
  "carrierName": "UPS"
}
```

**Comportement :**
- Récupère la commande et l'adresse de livraison en base
- Crée un Shipment Shippo pour obtenir les tarifs
- Essaie les carriers dans l'ordre (préférés en premier) jusqu'à succès
- Sauvegarde `trackingNumber`, `labelUrl`, `carrierName` sur la commande
- Passe le `paymentStatus` à `preparing`

### `GET /api/shipping/test-label/[orderId]`
Génère une fausse étiquette PDF (utilisé en mode mock uniquement).

## Configurer les carriers dans Shippo

Pour que des tarifs soient retournés, tu dois avoir au moins un carrier actif dans ton compte Shippo :

1. Connexion sur [app.goshippo.com](https://app.goshippo.com)
2. Aller dans **Settings => Carriers**
3. Connecter un carrier (Colissimo, UPS, DHL…) ou utiliser les carriers test Shippo

En mode test, Shippo fournit des "test carriers" qui retournent des tarifs sans frais.

## Fichier source

`src/lib/shippo.ts`: contient `estimateShippingCost()` et `generateLabel()`.
