import http from 'http';

export function createHttpServer() {
  return http.createServer((req, res) => {
    if (req.url === '/') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, message: 'OK' }));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('PulseStudio WebSocket Bridge online.\n');
  });
}
