Endpoint: /ws

## Messages client → serveur
- subscribe:console { processId }
- unsubscribe:console { processId }

## Événements serveur → client
- console:out { processId, chunk }
- process:status { processId, status }
- logs:chunk { processId, chunk }