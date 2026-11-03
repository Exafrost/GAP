# 🎲 Ludo-Elo

Classements Elo multijoueurs pour jeux de société — React + Vite + Supabase.

## 1. Supabase
1. Créer un projet sur supabase.com
2. SQL Editor → coller et exécuter `supabase/schema.sql` (PIN par défaut : **1234**, à changer, voir le fichier)
3. Settings → API : copier l'URL du projet et la clé `anon`

## 2. En local
```bash
npm install
cp .env.example .env   # renseigner les 2 variables
npm run dev
```

## 3. Hébergement GitHub Pages
1. Pousser le dépôt sur GitHub (branche `main`)
2. Settings → Pages → Source : **GitHub Actions**
3. Settings → Secrets and variables → Actions : ajouter `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`

## Structure
- `src/elo.js` : calcul Elo multijoueur + choix du coefficient K
- `src/App.jsx` : écrans (classements, nouvelle partie, historique, gestion) et modale PIN
- `supabase/schema.sql` : tables, sécurité (RLS) et fonctions d'écriture protégées par PIN

## Idées pour la suite
Suppression/annulation d'une partie, courbe d'évolution Elo, statistiques par joueur, modification des coefficients K.
