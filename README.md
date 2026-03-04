# EFFLUVE

Boutique e-commerce Next.js 16 (App Router) connectée à MySQL (InnoDB) via `mysql2`.

## Prérequis

- Node.js 20+
- MySQL (phpMyAdmin recommandé pour l'administration)
- Une base `effluve` avec tables applicatives (`users`, `products`, `cart_items`, `wishlist_items`, `addresses`, `orders`, `order_items`)

## Configuration

Renseigne `.env` :

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=effluve
DB_PASSWORD=effluve
DB_NAME=effluve
AUTH_SECRET=change_me
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Lancer le projet

```bash
npm install
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
