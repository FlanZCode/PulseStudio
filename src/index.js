import dotenv from 'dotenv';
dotenv.config();
import http from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import { criticalError, warning, info } from './utils/error.js';

const PORT = process.env.PORT || 24847;
const REMOTE_WS_URL = process.env.REMOTE_WS_URL;
const AUTH_TOKEN = process.env.AUTH_TOKEN;

if (!REMOTE_WS_URL) {
    criticalError('REMOTE_WS_URL must be set in environment variables.');
}

if (!AUTH_TOKEN) {
    criticalError('AUTH_TOKEN must be set in environment variables.');
}

const server = http.createServer((req, res) => {
    if (req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, message: 'OK' }));
    } else {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('PulseStudio WebSocket Bridge online.\n');
    }
});

const wss = new WebSocketServer({ server });

let remote = null;
let reconnectAttempts = 0;
let remotePingInterval = null;
let remoteHeartbeatInterval = null;
let remoteAlive = false;

function connectToRemote() {
    remote = new WebSocket(REMOTE_WS_URL, {
        headers: {
            Authorization: `Bearer ${AUTH_TOKEN}`, 'User-Agent': 'PulseStudio-WS-Bridge/1.0'
        },
        perMessageDeflate: true
    });

    remote.on('open', () => {
        info('Connected to remote WebSocket server.');
        reconnectAttempts = 0;
        remoteAlive = true;

        clearInterval(remotePingInterval);
        remotePingInterval = setInterval(() => {
            if (remote.readyState === WebSocket.OPEN) {
                try { remote.ping(); } catch {}
            }
        }, 15000);

        clearInterval(remoteHeartbeatInterval);
        remoteHeartbeatInterval = setInterval(() => {
            if (!remoteAlive) {
                warning('No heartbeat from remote, terminating connection.');
                try { remote.terminate(); } catch {}
            }
            remoteAlive = false;
        }, 30000);
    });

    remote.on('pong', () => {
        remoteAlive = true;
    });

    remote.on('message', (data) => {
        for (const client of wss.clients) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        }
    });

    const scheduleReconnect = (why) => {
        const delay = Math.min(30000, 1000 * Math.pow(2, reconnectAttempts++));
        clearInterval(remotePingInterval);
        clearInterval(remoteHeartbeatInterval);
        warning(`Remote WebSocket disconnected: ${why}. Reconnecting in ${delay}ms...`);
        setTimeout(connectToRemote, delay);
    };

    remote.on('close', (code, reason) => scheduleReconnect(`close ${code} - ${reason}`));
    remote.on('error', (err) => scheduleReconnect(`${err.message}`));
}

connectToRemote();

wss.on('connection', (ws) => {
    ws.isAlive = true;

    ws.on('message', (data) => {
        if (remote && remote.readyState === WebSocket.OPEN) {
            remote.send(data);
        }
    });

    ws.on('pong', () => { ws.isAlive = true; });
});

const localHeartbeat = setInterval(() => {
    for (const ws of wss.clients) {
        if (!ws.isAlive) {
            try { ws.terminate(); } catch {}
            continue;
        }
        ws.isAlive = false;
        try { ws.ping(); } catch {}
    }
}, 30000);

server.listen(PORT, () => {
    info(`Server is listening on port ${PORT}`);
});

function shutdown() {
    info('Shutting down server...');
    clearInterval(localHeartbeat);
    clearInterval(remotePingInterval);
    clearInterval(remoteHeartbeatInterval);
    try { remote && remote.terminate(); } catch {}
    server.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);