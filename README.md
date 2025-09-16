# PulseStudio

Daemon Node.js open‑source pour piloter des serveurs de jeux \/\ apps hébergées. Conçu pour s’intégrer avec le panel Laravel `StackStudio` au sein de l’écosystème `HostStudio`.

## Objectifs

- Démarrer \/ arrêter \/ redémarrer des processus
- Console temps réel via WebSocket
- Gestion de fichiers (liste, upload, download, suppression)
- Consultation de logs
- Communication HTTP REST et WebSocket
- Fonctionne en local et via Docker

## Stack technique

- Node.js (JavaScript), Express (REST), `ws` (WebSocket)
- Authentification par jeton signé (JWT ou token longue durée) fourni par `StackStudio`
- Intégration possible Docker (via Docker Engine API ou CLI)
- Logs avec `winston`
- Linting `eslint` et formatage `prettier`

## Architecture (vue d’ensemble)

- `src/server`: serveurs HTTP et WS \+ routes REST
- `src/services`: logique métier (processus, fichiers, logs, docker, auth)
- `src/config`: config et logger
- `src/utils`: erreurs, validations, helpers shell
- `docs/`: `architecture.md`, `api.md`, `ws.md`
- `tests/`: unitaires et e2e

## Prérequis

- Node.js 20\+ et npm
- Docker optionnel (si vous testez l’intégration conteneurs)

## Installation

```bash
npm install
npm run dev   # lance le serveur en développement