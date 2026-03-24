# Migration complete PHP + MySQL vers Prisma

Ce guide part de ta base existante `effluve` (dump MariaDB/MySQL) et remplace les requetes SQL manuelles par Prisma.

## 0) Architecture recommandee

En date du 4 mars 2026, Prisma supporte officiellement le client JavaScript/TypeScript.  
Pour un projet PHP pur, la voie la plus stable en production est:

1. Prisma ORM + Prisma Client cote Node.js (service fin).
2. Ton application PHP appelle ce service (HTTP interne securise par token).

Les fichiers de ce repo implementent deja cette approche:

- `prisma/schema.prisma`
- `integration/prisma-bridge/*` (service Node + Prisma)
- `integration/php/*` (client/service/controller PHP)

## 1) Prerequis

```bash
# Node.js + npm
node -v
npm -v

# Prisma CLI globale (demandee)
npm i -g prisma

# Optionnel: tentative client PHP non officiel (peut etre indisponible/non maintenu)
npm i -g prisma-client-php
```

## 2) Initialiser Prisma

Depuis la racine du projet:

```bash
npx prisma init --datasource-provider mysql
```

Dans ce repo, le schema est deja prepare dans `prisma/schema.prisma`.

## 3) Configurer l'environnement

Copie l'exemple:

```bash
cp .env.prisma.example .env
```

Exemple URL MySQL:

```env
DATABASE_URL="mysql://root:password@localhost:3306/effluve"
PRISMA_API_URL="http://127.0.0.1:4010"
PRISMA_API_TOKEN="change-me-in-production"
```

## 4) Introspecter la base existante

```bash
npx prisma db pull --schema prisma/schema.prisma
```

Cette commande lit les tables existantes et met a jour `schema.prisma`.

## 5) Generer le client Prisma

```bash
npx prisma generate --schema prisma/schema.prisma
```

## 6) Baseline migration sur base existante

Pour une base deja en production, ne pas lancer directement `migrate dev --name init`.  
Il faut d'abord creer une baseline:

```bash
mkdir -p prisma/migrations/20260304_init_baseline
npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schema.prisma \
  --script > prisma/migrations/20260304_init_baseline/migration.sql

npx prisma migrate resolve \
  --applied 20260304_init_baseline \
  --schema prisma/schema.prisma
```

Ensuite, pour les changements suivants:

```bash
npx prisma migrate dev --name add_new_change --schema prisma/schema.prisma
```

En prod:

```bash
npx prisma migrate deploy --schema prisma/schema.prisma
```

## 7) Remplacement SQL manuel -> Prisma

### SELECT

SQL:

```sql
SELECT id, email, full_name FROM users WHERE role = 'customer';
```

Prisma:

```ts
await prisma.user.findMany({
  where: { role: "customer" },
  select: { id: true, email: true, fullName: true }
});
```

### INSERT

SQL:

```sql
INSERT INTO users (email, full_name, password_hash, role) VALUES (?, ?, ?, ?);
```

Prisma:

```ts
await prisma.user.create({
  data: { email, fullName, passwordHash, role: "customer" }
});
```

### UPDATE

SQL:

```sql
UPDATE users SET full_name = ? WHERE id = ?;
```

Prisma:

```ts
await prisma.user.update({
  where: { id },
  data: { fullName }
});
```

### DELETE

SQL:

```sql
DELETE FROM users WHERE id = ?;
```

Prisma:

```ts
await prisma.user.delete({ where: { id } });
```

### JOIN (orders + items + addresses)

SQL manuel:

```sql
SELECT o.*, oi.*, a1.*, a2.*
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN addresses a1 ON a1.id = o.shipping_address_id
JOIN addresses a2 ON a2.id = o.billing_address_id
WHERE o.user_id = ?;
```

Prisma:

```ts
await prisma.order.findMany({
  where: { userId },
  include: {
    items: true,
    shippingAddress: true,
    billingAddress: true
  }
});
```

## 8) Service Node Prisma (bridge) + integration PHP

### Installer et lancer le bridge Prisma

```bash
cd integration/prisma-bridge
npm install
npm run prisma:generate
npm run dev
```

API disponible sur `http://127.0.0.1:4010`.

### Lancer ton app PHP exemple

```bash
cd integration/php
composer install
composer run serve
```

### Fichiers PHP generes

- `integration/php/PrismaService.php`: client HTTP vers Prisma bridge.
- `integration/php/UserController.php`: CRUD users + requete relations orders.
- `integration/php/routes.php`: routes API PHP sans framework.

## 9) Scripts build/deploy

### package.json (Node bridge)

Deja configure dans `integration/prisma-bridge/package.json`:

- `prisma:pull`
- `prisma:generate`
- `prisma:migrate`
- `prisma:studio`
- `build`, `start`, `dev`

### composer.json (PHP)

Deja configure dans `integration/php/composer.json`:

- `serve`
- `test:health`

## 10) Supprimer phpMyAdmin / PDO direct

1. Supprimer la doc interne qui exige phpMyAdmin (si presente).
2. Remplacer toutes les couches SQL custom.
3. Chercher les traces de SQL/PDO:

```bash
rg -n "pdo_mysql|mysqli|mysql_query|SELECT |INSERT INTO|UPDATE |DELETE FROM" .
```

4. Remplacer par appels au `PrismaService` (PHP) ou Prisma Client (Node bridge).

## 11) Tests et verification

```bash
# Visualiser les donnees (alternative phpMyAdmin)
npx prisma studio --schema prisma/schema.prisma

# Verifier le schema
npx prisma validate --schema prisma/schema.prisma

# Verifier le bridge
curl -H "Authorization: Bearer $PRISMA_API_TOKEN" http://127.0.0.1:4010/health
```

## 12) Notes production

- Toujours proteger le bridge par reseau interne + token.
- Ajouter logs, timeout, retry et rate limiting sur le bridge.
- Utiliser `prisma migrate deploy` en CI/CD (pas `migrate dev` en production).
- Garder `db pull` seulement pour introspection, pas dans le flux de deploiement quotidien.
