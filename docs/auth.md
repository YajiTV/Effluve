# Authentification: JWT + Cookie

## Présentation

L'authentification est basée sur des **JWT signés** stockés dans un **cookie httpOnly**. Pas de localStorage, pas de Redux: le serveur lit le cookie à chaque requête.

## Variable d'environnement

| Variable | Description |
|----------|-------------|
| `AUTH_SECRET` | Secret de signature JWT (utiliser une valeur longue et aléatoire en prod) |

## Librairie

`jose`: implémentation JWT compatible Edge Runtime (pas de dépendances Node.js natives).

## Cookie de session

**Nom :** `effluve_session`  
**Durée :** 7 jours  
**Options :** `httpOnly`, `sameSite: lax`, `path: /`  
**En production :** `secure: true`

## Lire l'utilisateur connecté

Dans n'importe quel Server Component ou Route Handler :

```ts
import { getSessionUser } from "@/lib/auth";

const user = await getSessionUser();
if (!user) {
  // non connecté
}
// user.id, user.email, user.role, user.full_name
```

## Rôles

| Rôle | Accès |
|------|-------|
| `customer` | Boutique, compte, commandes, retours |
| `admin` | + Dashboard admin, gestion commandes, produits, newsletter, retours |
| `superadmin` | + Gestion des rôles utilisateurs |

## Réinitialisation de mot de passe forcée

Un admin peut forcer un client à réinitialiser son mot de passe via `POST /api/admin/users/[id]/reset-password`. Au prochain login :
- Le serveur ne pose pas de cookie de session
- Il pose un **cookie de reset** (`effluve_reset`) contenant un JWT court (15 min)
- La réponse retourne `{ mustResetPassword: true }`
- Le client redirige vers `/reinitialisation`
- Après changement de mot de passe, le cookie de reset est supprimé et un cookie de session est posé

## Invalidation de sessions

Chaque user a un champ `tokenVersion`. Incrémenter ce champ invalide immédiatement tous les JWT existants pour cet utilisateur (même non expirés). Utile après un changement de mot de passe.

## Fichier source

`src/lib/auth.ts`: `signSession`, `getSessionUser`, `sessionCookie`, `signResetToken`, `resetCookie`
