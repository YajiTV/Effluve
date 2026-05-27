# Prisma: Base de données

## Présentation

Prisma est l'ORM utilisé pour interagir avec la base MySQL. Le schéma est la source de vérité: la base est synchronisée via `prisma db push`.

## Variables d'environnement

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | URL de connexion MySQL : `mysql://user:password@host:port/database` |

## Commandes utiles

```bash
npm run prisma:generate    # Régénère le client Prisma (après modif schema)
npm run prisma:push        # Synchronise la base avec le schema (sans migration)
npm run prisma:pull        # Introspect la base → met à jour le schema
npm run prisma:studio      # Interface graphique pour explorer la base
```

> `prisma:push` est utilisé à la place des migrations classiques. Il synchronise directement sans historique de migration.

## Schéma: Modèles

### User
| Champ | Type | Description |
|-------|------|-------------|
| `id` | Int | Identifiant auto-incrémenté |
| `email` | String unique | Email de connexion |
| `fullName` | String | Prénom + Nom |
| `passwordHash` | String | Hash bcrypt (cost 12) |
| `role` | Enum | `customer`, `admin`, `superadmin` |
| `loyaltyPoints` | Int | Points de fidélité cumulés |
| `mustResetPassword` | Boolean | Force la réinitialisation au prochain login |
| `tokenVersion` | Int | Incrémenté pour invalider tous les JWT actifs |

### Address
| Champ | Type | Description |
|-------|------|-------------|
| `name` | String | Prénom + Nom du destinataire |
| `street` | String | Rue (line1 + line2 concaténés) |
| `city`, `zipcode`, `country` | String | Localisation |
| `company`, `vatNumber` | String? | Pour les adresses pro |
| `isDefault` | Boolean | Adresse par défaut (livraison + facturation) |

### Order
| Champ | Type | Description |
|-------|------|-------------|
| `orderNumber` | String unique | Format `CMD-{userId}-{timestamp36}` |
| `totalCents` | Int | Total TTC en centimes (articles - remises + livraison) |
| `shippingCostCents` | Int | Frais de port en centimes |
| `discountCents` | Int | Remise totale appliquée |
| `promoCode` | String? | Code promo utilisé |
| `paymentStatus` | Enum | Voir ci-dessous |
| `stripeInvoiceUrl` | String? | URL facture Stripe |
| `trackingNumber` | String? | Numéro de suivi Shippo |
| `labelUrl` | String? | URL étiquette PDF |
| `carrierName` | String? | Nom du transporteur |

**Statuts de commande (`paymentStatus`) :**
```
pending_payment → paid → preparing → shipped → delivered
                       ↘ cancelled
```

### Product
| Champ | Type | Description |
|-------|------|-------------|
| `priceCents` | Int | Prix en centimes |
| `category` | Enum | `homme`, `femme`, `accessoires` |
| `stock` | Int | Quantité disponible |
| `stockAlert` | Int | Seuil d'alerte stock (défaut: 5) |
| `sizes` | String? | Tailles disponibles (ex: `"XS,S,M,L,XL"`) |
| `isActive` | Boolean | Visible en boutique |
| `extraImages` | String? | URLs d'images supplémentaires (JSON) |

### PromoCode
| Champ | Type | Description |
|-------|------|-------------|
| `code` | String unique | Code en majuscules |
| `discountType` | String | `percentage` ou `fixed` |
| `discountValue` | Int | % ou centimes selon le type |
| `minOrderCents` | Int | Montant minimum de commande |
| `maxUses` | Int? | Nombre max d'utilisations (null = illimité) |
| `usedCount` | Int | Nombre de fois utilisé |
| `expiresAt` | DateTime? | Date d'expiration |

### OrderReturn
Demandes de retour clients.

| Champ | Type | Description |
|-------|------|-------------|
| `reason` | Enum | `too_small`, `too_large`, `damaged`, `not_as_described`, `wrong_item`, `changed_mind`, `other` |
| `status` | Enum | `requested` → `approved`/`rejected` → `received` → `refunded` |
| `refundCents` | Int? | Montant remboursé par l'admin |

## Singleton Prisma

Toujours importer `prisma` depuis `src/lib/prisma.ts`. Ne jamais instancier `PrismaClient` directement: en développement Next.js, cela crée des connexions multiples à cause du Hot Module Replacement.

```ts
import { prisma } from "@/lib/prisma";

const user = await prisma.user.findUnique({ where: { id: 1 } });
```

## Docker

La base MySQL tourne dans Docker :

```bash
docker compose up -d db      # Démarre uniquement MySQL
docker compose up -d         # Démarre MySQL + app Next.js
```

Après démarrage initial :
```bash
npm run prisma:push
npm run prisma:generate
```
