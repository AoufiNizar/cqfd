# FINA - Suivi de Devoirs

FINA est une application de suivi de devoirs conçue pour remplacer le carnet papier des enseignants, sécurisée et synchronisée dans le Cloud.

## ☁️ GUIDE SUPABASE (Base de données) - OBLIGATOIRE

Pour que la connexion et la sauvegarde fonctionnent, vous devez créer un "Projet" gratuit sur Supabase.

### 1. Créer le projet
1.  Allez sur [supabase.com](https://supabase.com/) et créez un compte.
2.  Cliquez sur **"New Project"**.
3.  Donnez un nom (ex: `FinaDB`) et un mot de passe de base de données.
4.  Attendez que le projet soit prêt (environ 1 minute).

### 2. Créer la table de stockage
Une fois le projet prêt, cliquez sur **"SQL Editor"** (icône de terminal sur la gauche) et collez le code suivant, puis cliquez sur **Run** :

```sql
-- Création de la table qui stockera tout votre JSON
create table user_data (
  user_id uuid references auth.users not null primary key,
  content jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Sécurité : Seul l'utilisateur propriétaire peut voir/modifier ses données
alter table user_data enable row level security;

create policy "User can see own data" on user_data for select using (auth.uid() = user_id);
create policy "User can insert own data" on user_data for insert with check (auth.uid() = user_id);
create policy "User can update own data" on user_data for update using (auth.uid() = user_id);
```

### 3. Récupérer les Clés (API Keys)
1.  Dans votre projet Supabase, allez dans **Settings** (roue dentée en bas à gauche) > **API**.
2.  Vous verrez `Project URL` (URL) et `Project API keys` (anon public).
3.  Créez un fichier nommé `.env` à la racine de votre dossier projet (à côté de `package.json`) et collez-y ces valeurs :

```env
VITE_SUPABASE_URL=https://votre-id-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-publique-anon
API_KEY=votre_cle_gemini_ai
```

*(Remplacez les valeurs par celles affichées sur votre tableau de bord Supabase)*

## 🧠 INTELLIGENCE ARTIFICIELLE (Optionnel)

La clé `API_KEY` sert à générer des bilans automatiques via Google Gemini.
*   **Est-elle obligatoire ?** Non. L'application fonctionne très bien sans.
*   **Comment l'avoir ?** Obtenez-la gratuitement ici : [Google AI Studio](https://aistudio.google.com/app/apikey).

## 🚀 Installation & Lancement

### Sur votre ordinateur
1.  Installez les dépendances :
    ```bash
    npm install
    ```
2.  Lancez l'application :
    ```bash
    npm run dev
    ```

### Sur Netlify (Mise en ligne)
1.  Connectez votre dépôt Git à Netlify ou glissez le dossier `dist` (après `npm run build`).
2.  Dans les **Site Settings** de Netlify, allez dans **Environment variables**.
3.  Ajoutez les mêmes variables que dans votre fichier `.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `API_KEY`).

---
**Note :** L'authentification est maintenant gérée par Supabase. Vous pouvez créer votre compte directement depuis l'écran d'accueil de l'application en cliquant sur "S'inscrire".