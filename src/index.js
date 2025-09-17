import { createHttpServer } from './server/httpServer.js';
import { createWsServer } from './server/wsServer.js';
import { createRemoteClient } from './services/remoteClient.js';
import { criticalError, info, warning } from './services/logManager.js';
import { PORT, REMOTE_WS_URL, AUTH_TOKEN, USER_AGENT } from './config/env.js';

if (!REMOTE_WS_URL) criticalError('REMOTE_WS_URL must be set in environment variables.');
if (!AUTH_TOKEN) criticalError('AUTH_TOKEN must be set in environment variables.');

const server = createHttpServer();
let remote;
const { broadcast, stop: stopWs } = createWsServer(server, (data) => { if (remote) remote.send(data); });

remote = createRemoteClient({
  url: REMOTE_WS_URL,
  token: AUTH_TOKEN,
  userAgent: USER_AGENT,
  onMessage: (data) => broadcast(data),
  onOpen: () => info('Connected to remote WebSocket server.'),
  onClose: () => warning('Remote WebSocket disconnected.'),
  onError: (err) => warning(`Remote WebSocket error: ${err?.message || 'error'}`)
});

server.listen(PORT, () => { info(`Server is listening on port ${PORT}`); });

function shutdown() {
  info('Shutting down server...');
  try { remote.stop(); } catch {}
  try { stopWs(); } catch {}
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);