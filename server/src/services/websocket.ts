import { WebSocketServer, WebSocket } from 'ws';
import { Server as HttpServer } from 'http';
import { simulator } from './simulator.js';
import { LiveFeedEvent } from '../types/index.js';

class WebSocketHub {
  private wss: WebSocketServer | null = null;
  private clients: Set<WebSocket> = new Set();

  public init(server: HttpServer): void {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws: WebSocket) => {
      this.clients.add(ws);

      // Send immediate welcome and live status
      ws.send(JSON.stringify({
        type: 'SYSTEM_CONNECT',
        message: 'Connected to OmniSocial Real-Time Event Stream',
        timestamp: new Date().toISOString()
      }));

      ws.on('message', (message: string) => {
        try {
          const parsed = JSON.parse(message.toString());
          if (parsed.type === 'PING') {
            ws.send(JSON.stringify({ type: 'PONG', timestamp: new Date().toISOString() }));
          }
        } catch (e) {
          // ignore invalid messages
        }
      });

      ws.on('close', () => {
        this.clients.delete(ws);
      });

      ws.on('error', (err) => {
        console.error('WebSocket client error:', err);
        this.clients.delete(ws);
      });
    });

    // Wire up simulator events to broadcast to all connected WebSocket clients
    simulator.onEvent((event: LiveFeedEvent) => {
      this.broadcast({
        type: 'LIVE_EVENT',
        data: event
      });
    });

    simulator.start();
  }

  public broadcast(payload: any): void {
    const data = JSON.stringify(payload);
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }
}

export const wsHub = new WebSocketHub();
