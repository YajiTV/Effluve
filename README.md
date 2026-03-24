# EFFLUVE

Boutique e-commerce Next.js 16 (App Router) connectée à MySQL (InnoDB) via Prisma ORM.

## Prérequis

- Node.js 20+
- MySQL
- Une base `effluve` avec tables applicatives (`users`, `products`, `cart_items`, `wishlist_items`, `addresses`, `orders`, `order_items`)

## Configuration

Renseigne `.env` :

```env
DATABASE_URL="mysql://effluve:effluve@127.0.0.1:3306/effluve"
AUTH_SECRET=change_me
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Lancer le projet

```bash
npm install
npm run prisma:generate
npm run dev
```

## Flux métier implémenté

- Recherche avec query en URL: `/search?q=...`
- Panier serveur (table `cart_items`)
- Validation de commande: `/checkout`
- Paiement simulé: endpoint `/api/payment/simulate`
- Historique commandes: `/account/orders` + détail `/account/orders/[id]`
- Gestion d'adresses: `/account/address`

## SQL

Le script de référence pour les tables de commande/adresse est disponible dans:

- `docs/mysql-effluve-schema.sql`
