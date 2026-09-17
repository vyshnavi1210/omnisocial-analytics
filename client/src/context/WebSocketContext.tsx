import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { LiveFeedEvent } from '../types/index.js';

interface WebSocketContextType {
  isConnected: boolean;
  events: LiveFeedEvent[];
  latestEvent: LiveFeedEvent | null;
  clearEvents: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [events, setEvents] = useState<LiveFeedEvent[]>([]);
  const [latestEvent, setLatestEvent] = useState<LiveFeedEvent | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/ws`;

      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          setIsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === 'LIVE_EVENT') {
              const liveEvent = msg.data as LiveFeedEvent;
              setLatestEvent(liveEvent);
              setEvents((prev) => [liveEvent, ...prev.slice(0, 49)]);
            }
          } catch (e) {
            // ignore non-json
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          // Reconnect after 3 seconds
          reconnectTimeout = setTimeout(connect, 3000);
        };

        ws.onerror = () => {
          setIsConnected(false);
        };
      } catch (err) {
        setIsConnected(false);
        reconnectTimeout = setTimeout(connect, 3000);
      }
    };

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const clearEvents = () => {
    setEvents([]);
    setLatestEvent(null);
  };

  return (
    <WebSocketContext.Provider value={{ isConnected, events, latestEvent, clearEvents }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
