## Composants
- HTTP \(Express\): routes REST
- WS \(`ws`\): diffusion console \& événements
- Services: process, fichiers, logs, docker, auth
- Intégration: StackStudio via tokens/JWT

## Flux
1. StackStudio appelle REST \(token Bearer\)
2. PulseStudio valide auth, exécute service
3. Émet événements WS pour la console et l’état

## Sécurité
- Auth obligatoire, rate limit \(à ajouter\)
- Permissions par ressource \(à définir\)