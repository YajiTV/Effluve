<div align="center">

# EFFLUVE

### Boutique e-commerce de mode éthique — Next.js 16 · TypeScript · Prisma · MySQL

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?style=for-the-badge&logo=stripe)](https://stripe.com/)

[Fonctionnalités](#fonctionnalités) • [Démarrage rapide](#démarrage-rapide) • [Architecture](#architecture) • [Stack technique](#stack-technique) • [Routes API](#routes-api)

</div>

---

## Aperçu

<div align="center">

<img src="public/images/bannerhero.png" alt="Aperçu Effluve" width="800"/>

</div>

---

## Fonctionnalités

<table>
<tr>
<td width="50%">

### Catalogue & Navigation
- **Pages Homme / Femme / Collection** — filtrage par catégorie
- **Nouvelles arrivées & Promotions** — sections dédiées
- **Barre de recherche** — recherche en temps réel par nom
- **Fiche produit** — images, tailles, stock, ajout panier/wishlist
- **Gestion des tailles** — XS à XL avec disponibilité en temps réel

</td>
<td width="50%">

### Panier & Commande
- **Panier persistant** — stocké en base par utilisateur
- **Checkout complet** — sélection d'adresse, résumé commande
- **Paiement Stripe réel** — cartes de test et production
- **Paiement simulé** — pour les démonstrations
- **Codes promo** — réduction en % ou montant fixe
- **Points fidélité** — cumulés à chaque commande

</td>
</tr>
<tr>
<td>

### Compte utilisateur
- **Authentification JWT** — cookie HTTP-only, session 7 jours
- **Inscription / Connexion** — validation côté serveur
- **Gestion des adresses** — livraison, facturation, champs entreprise/TVA
- **Historique des commandes** — avec statut et détail
- **Liste de souhaits** — ajout/suppression depuis n'importe quelle page
- **Demandes de retour** — formulaire + suivi

</td>
<td>

### Administration
- **Dashboard KPIs** — revenus, commandes, clients, stock faible
- **Graphiques** — revenus hebdomadaires et commandes récentes
- **Gestion produits** — CRUD complet avec alertes stock
- **Gestion commandes** — changement de statut, génération étiquette
- **Expédition Shippo** — étiquettes + numéro de tracking
- **Gestion retours** — validation ou refus depuis l'admin

</td>
</tr>
<tr>
<td>

### Communication
- **Factures Stripe** — générées automatiquement, page imprimable
- **Newsletter** — inscription, gestion de liste, envoi via Resend
- **Emails transactionnels** — confirmation commande, retour, etc.

</td>
<td>

### Pages & Contenu
- **Pages marque** — Notre histoire, Nos valeurs, Fabrication, Engagement, Carrières
- **Pages info** — Livraison, Retours, Guide des tailles, FAQ, Contact
- **Pages légales** — Mentions légales, Politique de confidentialité, CGV
- **SEO** — `robots.txt` et `sitemap.xml` configurés

</td>
</tr>
</table>

---

## Démarrage rapide

### Prérequis
- Node.js 20+
- Docker (pour la base de données MySQL)
- Un compte [Stripe](https://stripe.com/) (clés de test suffisent)

### Installation

```bash
# Cloner le dépôt
git clone https://github.com/YajiTV/effluve.git
cd effluve

# Installer les dépendances
npm install
```

### Base de données

```bash
# Démarrer le container MySQL
docker compose up -d db

# Créer les tables
npm run prisma:push

# Générer le client Prisma
npm run prisma:generate

# Insérer les produits de base
npx tsx prisma/seed.ts
```

### Variables d'environnement

Créer un fichier `.env` à la racine :

```env
DATABASE_URL="mysql://effluve:effluve@127.0.0.1:3306/effluve"
AUTH_SECRET="votre_secret_jwt"
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
```

### Lancer l'application

```bash
npm run dev
```

L'application démarre sur [**http://localhost:3000**](http://localhost:3000)

### Lancement habituel (après le premier setup)

```bash
docker start effluve_db
npm run dev
```

---

## Stack technique

<div align="center">

| Couche | Technologie |
|--------|-------------|
| **Framework** | Next.js 16 (App Router) |
| **Langage** | TypeScript 5 |
| **Style** | Tailwind CSS v4 |
| **Base de données** | MySQL 8 (InnoDB) |
| **ORM** | Prisma 6 |
| **Authentification** | JWT via `jose` — cookie HTTP-only |
| **Paiements** | Stripe (réel + simulé) + facturation |
| **Expédition** | Shippo (étiquettes + tracking) |
| **Emails** | Resend |
| **Conteneurisation** | Docker Compose |

</div>

---

## Architecture

```
effluve/
├── src/
│   ├── app/                        → Pages (App Router)
│   │   ├── (auth)/                 → Login, Register
│   │   ├── (shop)/                 → Homme, Femme, Collection, Panier, Checkout…
│   │   ├── (info)/                 → Livraison, FAQ, Contact, Guide des tailles…
│   │   ├── (brand)/                → Notre histoire, Valeurs, Fabrication…
│   │   ├── (legal)/                → CGV, Mentions légales, Politique de confidentialité
│   │   ├── account/                → Profil, Commandes, Wishlist, Adresses, Retours
│   │   ├── admin/                  → Dashboard, Retours admin
│   │   └── api/                    → Tous les endpoints REST
│   │       ├── auth/               → register, login, logout
│   │       ├── cart/               → CRUD panier
│   │       ├── checkout/           → Création commande
│   │       ├── payment/            → Stripe réel + simulé
│   │       ├── wishlist/           → CRUD wishlist
│   │       ├── returns/            → Demandes de retour
│   │       ├── address/            → CRUD adresses
│   │       ├── newsletter/         → Inscription + envoi
│   │       ├── promo/              → Validation codes promo
│   │       ├── shipping/           → Génération étiquettes Shippo
│   │       ├── me/                 → Profil utilisateur + compteurs
│   │       └── admin/              → Routes d'administration
│   ├── components/
│   │   ├── layout/                 → Header, Footer, Search
│   │   ├── product/                → ProductCard, ProductGrid, CategoryPage
│   │   ├── account/                → AddressManager, ReturnRequestForm
│   │   ├── cart/                   → CartClient
│   │   ├── checkout/               → CheckoutClient
│   │   └── ui/                     → CartToast, ToastProvider, LogoutButton
│   └── lib/
│       ├── auth.ts                 → JWT sign / verify / cookie
│       ├── prisma.ts               → Singleton Prisma
│       ├── cart.ts                 → CRUD panier
│       ├── orders.ts               → Création & récupération commandes
│       ├── products.ts             → Requêtes produits
│       ├── returns.ts              → Logique retours
│       ├── addresses.ts            → CRUD adresses
│       ├── stripe.ts               → Client Stripe
│       └── money.ts                → Formatage centimes → affichage
├── prisma/
│   ├── schema.prisma               → Schéma de la base de données
│   └── seed.ts                     → Données initiales (7 produits)
├── public/images/                  → Images produits et assets
├── docker-compose.yml              → Service MySQL pour la production
├── next.config.ts                  → Config Next.js (basePath /effluve en prod)
└── .env                            → Variables d'environnement (non commité)
```

---

## Routes API

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| `POST` | `/api/auth/register` | Non | Créer un compte |
| `POST` | `/api/auth/login` | Non | Connexion, pose le cookie JWT |
| `POST` | `/api/auth/logout` | Oui | Déconnexion |
| `GET` | `/api/me` | Oui | Profil utilisateur courant |
| `GET` | `/api/me/counts` | Oui | Compteurs panier + wishlist |
| `GET/POST/DELETE` | `/api/cart` | Oui | Gestion du panier |
| `POST` | `/api/checkout` | Oui | Créer une commande |
| `POST` | `/api/payment/stripe` | Oui | Paiement Stripe réel |
| `POST` | `/api/payment/simulate` | Oui | Paiement simulé |
| `GET/POST/DELETE` | `/api/wishlist` | Oui | Gestion de la wishlist |
| `GET/POST/DELETE` | `/api/address` | Oui | Gestion des adresses |
| `GET/POST` | `/api/returns` | Oui | Demandes de retour |
| `POST` | `/api/promo/validate` | Oui | Valider un code promo |
| `POST` | `/api/shipping/label` | Oui | Générer une étiquette Shippo |
| `POST` | `/api/newsletter` | Non | Inscription newsletter |
| `GET/POST` | `/api/admin/products` | Admin | Gestion produits |
| `GET/PATCH` | `/api/admin/orders` | Admin | Gestion commandes |
| `GET/PATCH` | `/api/admin/returns` | Admin | Gestion retours |
| `POST` | `/api/admin/newsletter/send` | Admin | Envoi newsletter |

---

## Schéma de base de données

```
User          — id, email, password, role (customer/admin), loyaltyPoints, createdAt
Product       — id, name, description, priceCents, imageUrl, category, stock, isActive
CartItem      — id, userId, productId, quantity
WishlistItem  — id, userId, productId
Address       — id, userId, firstName, lastName, address, city, country, company, vatNumber…
Order         — id, userId, addressId, totalCents, status, stripeInvoiceUrl, trackingNumber…
OrderItem     — id, orderId, productId, quantity, priceCents
ReturnRequest — id, orderId, reason, status, createdAt
PromoCode     — id, code, discountType, discountValue, usageLimit, usedCount, expiresAt
Newsletter    — id, email, subscribedAt
```

---

## SEO

Le SEO est géré nativement via les fichiers `src/app/robots.ts` et `src/app/sitemap.ts` de Next.js, qui génèrent automatiquement les routes `/robots.txt` et `/sitemap.xml`.

### robots.txt

Tous les robots sont autorisés sur les pages publiques. Les routes sans valeur SEO sont explicitement bloquées :

| Règle | Routes |
|-------|--------|
| **Bloquées** | `/admin/`, `/api/`, `/account/`, `/cart/`, `/checkout/`, `/panier`, `/connexion/`, `/inscription/` |
| **Autorisées** | Tout le reste (`/`) |

### sitemap.xml

Le sitemap est généré dynamiquement à chaque build. Il inclut les routes statiques et les fiches produits actives récupérées depuis la base de données.

| URL | Fréquence | Priorité |
|-----|-----------|----------|
| `/` | weekly | 1.0 |
| `/femme`, `/homme` | daily | 0.9 |
| `/collection`, `/nouveautes` | weekly | 0.8 |
| `/promotions` | daily | 0.7 |
| `/produits/:id` (dynamique) | weekly | 0.7 |
| `/notre-histoire`, `/nos-valeurs`, `/fabrication`… | monthly | 0.4 |
| `/cgv`, `/mentions-legales`, `/politique-de-confidentialite` | yearly | 0.2 |

---

## Sécurité

- Mots de passe hachés avec **bcryptjs** (jamais stockés en clair)
- Sessions **JWT** signées — stockées en cookie HTTP-only, TTL 7 jours
- Rôles utilisateurs — `customer` et `admin`, vérifiés sur chaque route admin
- Variables sensibles — clés Stripe et secrets uniquement en `.env`, jamais exposés au client
- Entrées validées côté serveur sur chaque endpoint

---

## Commandes utiles

```bash
npm run dev              # Démarrer le serveur de développement
npm run build            # Build de production
npm run lint             # Linter ESLint

npm run prisma:generate  # Régénérer le client Prisma
npm run prisma:push      # Pousser le schéma vers la DB
npm run prisma:studio    # Ouvrir Prisma Studio (GUI base de données)
npm run prisma:pull      # Introspection DB → schéma
```

---

<div align="center">

By Mathys P.K

</div>
