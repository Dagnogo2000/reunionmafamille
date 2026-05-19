# Guide de déploiement sur Vercel 🚀

Ce guide explique comment déployer l'application MaFamille sur Vercel en production.

## Prérequis
- Un compte GitHub
- Un compte Vercel (gratuit)

---

## Étape 1 : Préparer le code pour la production

Avant de pousser sur GitHub, basculer le schéma Prisma en mode PostgreSQL :

Dans le fichier `prisma/schema.prisma`, remplacer :
```prisma
datasource db {
  provider = "sqlite"
}
```
par :
```prisma
datasource db {
  provider = "postgresql"
}
```

---

## Étape 2 : Pousser le code sur GitHub

```bash
git init
git add .
git commit -m "feat: MaFamille - première version"
git remote add origin https://github.com/votre-username/famille-app.git
git push -u origin main
```

---

## Étape 3 : Importer sur Vercel

1. Allez sur https://vercel.com/new
2. Cliquez sur **"Import Git Repository"**
3. Sélectionnez votre dépôt `famille-app`
4. Vercel détectera Next.js automatiquement — ne changez rien
5. **NE PAS ENCORE DÉPLOYER** → continuez d'abord avec l'étape 4

---

## Étape 4 : Ajouter la Base de données PostgreSQL

Dans votre **projet Vercel** (après l'import) :

1. Allez dans l'onglet **Storage**
2. Cliquez **"Create Database"** → choisissez **Neon Postgres** (ou **Vercel Postgres**)
3. Nommez la base (ex: `famille-db`), sélectionnez une région proche de vous
4. Cliquez **"Connect"** → les variables d'environnement sont automatiquement ajoutées à votre projet

---

## Étape 5 : Ajouter le stockage de fichiers

Toujours dans l'onglet **Storage** :

1. Cliquez **"Create Database"** → choisissez **Vercel Blob**
2. Nommez le store (ex: `famille-files`)
3. Cliquez **"Connect"** → la variable `BLOB_READ_WRITE_TOKEN` est ajoutée automatiquement

---

## Étape 6 : Ajouter votre clé secrète JWT

Dans l'onglet **Settings → Environment Variables** :

| Variable | Valeur |
|----------|--------|
| `JWT_SECRET` | Une chaîne aléatoire longue (ex: `mafamille_super_secret_2026_xyz789`) |

---

## Étape 7 : Déployer !

Retournez sur la page principale et cliquez **"Deploy"**.

Vercel va automatiquement :
1. Installer les dépendances (`npm install` → `prisma generate`)
2. Synchroniser la base de données (`prisma db push`)
3. Compiler l'application (`next build`)
4. La mettre en ligne 🎉

---

## Étape 8 : Initialiser les données (seed)

Une fois déployé, pour créer le compte admin initial, allez dans l'onglet **Functions** de Vercel, ou utilisez la CLI Vercel :

```bash
npm install -g vercel
vercel env pull .env.production
node prisma/seed.mjs
```

**Identifiants admin par défaut :**
- Email : `admin@mafamille.com`
- Mot de passe : `admin123` ⚠️ À changer immédiatement après la première connexion !

---

## Retour en local (dev)

Pour revenir au développement local avec SQLite, remettez dans `prisma/schema.prisma` :
```prisma
datasource db {
  provider = "sqlite"
}
```
et assurez-vous que `DATABASE_URL="file:./dev.db"` est dans votre `.env`.
