import { WebSocketServer } from 'ws';

export function createWsServer(server, sendToRemote) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    ws.isAlive = true;
    ws.on('pong', () => { ws.isAlive = true; });
    ws.on('message', (data) => { if (sendToRemote) sendToRemote(data); });
  });

  const heartbeat = setInterval(() => {
    for (const ws of wss.clients) {
      if (ws.isAlive === false) { try { ws.terminate(); } catch {} continue; }
      ws.isAlive = false;
      try { ws.ping(); } catch {}
    }
  }, 30000);

  function broadcast(data) {
    for (const client of wss.clients) {
      if (client.readyState === 1) { try { client.send(data); } catch {} }
    }
  }

  function stop() { clearInterval(heartbeat); try { wss.close(); } catch {} }

  return { wss, broadcast, stop };
}

