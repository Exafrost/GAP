# GAP

Classements Elo multijoueurs pour jeux de société : React + Vite + Supabase.

## 1. Supabase
1. Créer un projet sur supabase.com
2. SQL Editor : exécuter `supabase/schema.sql`
   - Base déjà créée avec la version précédente ? Exécuter uniquement `supabase/migration_v2.sql`
3. Settings > API : copier l'URL du projet et la clé `anon`

## 2. En local
```bash
npm install
cp .env.example .env   # renseigner les 2 variables
npm run dev
```

## 3. Images des jeux
Déposer les images dans `public/games/`. Pour chaque jeu, le site utilise :
1. le fichier indiqué dans la colonne `image` du jeu (ex. `catan.jpg`),
2. sinon `<nom-du-jeu>.jpg` (minuscules, sans accents, espaces remplacés par `-` : « 7 Wonders » donne `7-wonders.jpg`),
3. sinon un visuel coloré avec les initiales du jeu.

## 4. Hébergement GitHub Pages
1. Pousser le dépôt sur GitHub (branche `main`)
2. Settings > Pages > Source : **GitHub Actions**
3. Settings > Secrets and variables > Actions : ajouter `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`

## Structure
```
src/
  App.jsx, main.jsx        routes (HashRouter) et point d'entrée
  elo.js                   calcul Elo multijoueur + choix du coefficient K
  supabase.js              client Supabase
  context/AppContext.jsx   chargement des données, partage aux pages, fenêtre PIN
  lib/                     fonctions utilitaires (format.js, games.js)
  components/              éléments partagés (Layout, PinModal, GameCover…)
  pages/
    home/                  accueil : cartes des jeux
    game/                  détail d'un jeu : image, classement, historique, suppression
    match/                 nouvelle partie
    admin/                 gestion des joueurs et des jeux
supabase/                  schema.sql, migration_v2.sql
```
