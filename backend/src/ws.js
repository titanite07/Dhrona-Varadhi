// backend/src/ws.js
const WebSocket = require('ws');

let wss;
const wsClients = new Set();

function setupWebSocket(server) {
  wss = new WebSocket.Server({ server, path: '/ws' });
  wss.on('connection', (ws) => {
    wsClients.add(ws);
    ws.on('close', () => wsClients.delete(ws));
  });
}

function broadcastOpportunity(opp) {
  const msg = JSON.stringify({ type: 'opportunity', data: opp });
  wsClients.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) ws.send(msg);
  });
}

module.exports = { setupWebSocket, broadcastOpportunity };