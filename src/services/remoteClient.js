import WebSocket from 'ws';

export function createRemoteClient({ url, token, userAgent, onMessage, onOpen, onClose, onError }) {
  let socket = null;
  let reconnectAttempts = 0;
  let pingInterval = null;
  let heartbeatInterval = null;
  let alive = false;
  let stopped = false;

  function clearTimers() {
    clearInterval(pingInterval);
    clearInterval(heartbeatInterval);
  }

  function connect() {
    socket = new WebSocket(url, {
      headers: { Authorization: `Bearer ${token}`, 'User-Agent': userAgent },
      perMessageDeflate: true
    });

    socket.on('open', () => {
      reconnectAttempts = 0;
      alive = true;
      clearTimers();
      pingInterval = setInterval(() => { if (socket && socket.readyState === WebSocket.OPEN) { try { socket.ping(); } catch {} } }, 15000);
      heartbeatInterval = setInterval(() => { if (!alive) { try { socket.terminate(); } catch {} } alive = false; }, 30000);
      if (onOpen) try { onOpen(); } catch {}
    });

    socket.on('pong', () => { alive = true; });

    socket.on('message', (data) => { if (onMessage) try { onMessage(data); } catch {} });

    const scheduleReconnect = () => {
      clearTimers();
      if (stopped) return;
      const delay = Math.min(30000, 1000 * Math.pow(2, reconnectAttempts++));
      setTimeout(connect, delay);
    };

    socket.on('close', () => { if (onClose) try { onClose(); } catch {} scheduleReconnect(); });
    socket.on('error', (err) => { if (onError) try { onError(err); } catch {} scheduleReconnect(); });
  }

  function send(data) {
    if (socket && socket.readyState === WebSocket.OPEN) {
      try { socket.send(data); } catch {}
    }
  }

  function stop() {
    stopped = true;
    clearTimers();
    try { if (socket) socket.terminate(); } catch {}
  }

  connect();

  return { send, stop };
}

