# Poker Planning

Application de planning poker en temps réel avec intégration Jira, thèmes et fonctionnalités collaboratives.

## Stack

- **Next.js 16** + React 19 — App Router, Server Actions
- **Socket.IO 4** — temps réel via serveur HTTP custom
- **Zustand** — état client
- **Three.js / React Three Fiber** — pièce 3D interactive
- **Tailwind CSS 4** — UI + système de thèmes

## Fonctionnalités

- Création et rejoindre une room via code court
- Vote en temps réel, révélation synchronisée
- Échelles Fibonacci
- Gestion des tickets : import Jira ou création manuelle
- Intégration Jira : chargement de sprints, envoi des estimations
- Résultats : distribution, moyenne, médiane, consensus
- Tirage de pièce 3D partagé entre tous les participants
- 6 thèmes visuels
- Reconnexion automatique sans doublon de joueur

## Installation

```bash
npm install
```

## Développement

```bash
npm run dev
```

## Production

```bash
npm run build
npm start
```

## Variables d'environnement

Créer un fichier `.env.local` :

```env
# Jira (optionnel)
JIRA_DOMAIN=votre-domaine.atlassian.net
JIRA_EMAIL=votre@email.com
JIRA_API_TOKEN=votre_token_api
JIRA_PROJECT_KEY=PROJ
JIRA_STORY_POINTS_FIELD=customfield_10016  # champ par défaut
```

Le token API Jira se génère sur [id.atlassian.com/manage-profile/security/api-tokens](https://id.atlassian.com/manage-profile/security/api-tokens).

## Architecture

```
server.ts                  # Serveur HTTP custom (Next.js + Socket.IO)
src/
  app/                     # Routes Next.js (App Router)
  components/              # Composants React
  lib/
    room-manager.ts        # État des rooms en mémoire
    socket.ts              # Client Socket.IO
    actions/jira.ts        # Server Actions Jira
    jira.ts                # Couche API Jira pure
  store/useRoomStore.ts    # Store Zustand
  server/socket-server.ts  # Handlers Socket.IO côté serveur
```

Les rooms sont stockées en mémoire et nettoyées après 2h d'inactivité.
