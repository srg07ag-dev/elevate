# ELEVATE — MVP

## Lancer en local

```bash
npm install
npm run dev
```

## Déployer sur Vercel

1. Pousse ce dossier tel quel sur un dépôt GitHub.
2. Sur Vercel : "Add New Project" → importe le dépôt.
3. Framework preset : **Vite** (Vercel le détecte automatiquement grâce à `vite.config.js` et `package.json`).
   - Build Command : `vite build` (ou laisse la valeur par défaut)
   - Output Directory : `dist`
4. Déployer.

## ⚠️ Limitation importante : stockage local uniquement

Ce projet remplace `window.storage` (API propre à Claude.ai) par un shim basé
sur `localStorage` (`src/storageShim.js`). Cela veut dire :

- Les données restent **dans le navigateur de chaque personne**.
- Deux personnes sur deux appareils différents **ne verront pas les mêmes
  profils**, ne pourront pas matcher entre elles, ni s'envoyer de vrais
  messages.
- C'est utile pour une démo solo ou pour tester l'interface, mais **pas**
  pour un vrai lancement multi-utilisateurs.

### Pour un vrai backend partagé

Remplace le contenu de `src/storageShim.js` par des appels à un vrai service
(Supabase, Firebase, ou une API que tu héberges), en gardant la même
signature (`get`, `set`, `delete`, `list`) pour ne pas avoir à toucher à
`src/App.jsx`. Supabase est probablement le plus rapide à mettre en place
pour ce cas d'usage (auth, table `profiles`, table `messages`, Realtime pour
le chat).
