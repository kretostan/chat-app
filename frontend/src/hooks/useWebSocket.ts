import { useCallback, useEffect, useRef, useState } from "react";

type EventHandler = (data: any) => void;

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const handlersRef = useRef<Map<string, Set<EventHandler>>>(new Map());
  const ackHandlersRef = useRef<Map<string, (data: any) => void>>(new Map()); // FIX: any fix
  const [isConnected, setIsConnected] = useState(false);
  const ackIdCounterRef = useRef(0);

  useEffect(() => {
    let reconnectTimer: ReturnType<typeof setTimeout>;
    let delay = 1000;

    function connect() {
      const ws = new WebSocket("/ws");
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        delay = 1000;
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.event === "ack") {
            const handler = ackHandlersRef.current.get(msg.data.ackId);
            handler?.(msg.data);
            ackHandlersRef.current.delete(msg.data.ackId);
            return;
          }
          const handlers = handlersRef.current.get(msg.event);
          if (handlers) {
            for (const h of handlers) h(msg.data);
          }
        } catch {
          /* ignore malformed */
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        ackHandlersRef.current.clear();
        delay *= 2;
        reconnectTimer = setTimeout(connect, Math.min(delay, 30000));
      };

      ws.onerror = (error) => console.error("WS error: ", error);
    }

    connect();
    return () => {
      clearTimeout(reconnectTimer);
      wsRef.current?.close();
    };
  }, []);

  const on = useCallback((event: string, handler: EventHandler) => {
    if (!handlersRef.current.has(event)) {
      handlersRef.current.set(event, new Set());
    }
    handlersRef.current.get(event)?.add(handler);
    return () => {
      handlersRef.current.get(event)?.delete(handler);
    };
  }, []);

  const send = useCallback((event: string, data: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        reject(new Error("Not connected"));
        return;
      }
      const ackId = `ack_${++ackIdCounterRef.current}`;
      ackHandlersRef.current.set(ackId, (ackData: any) => {
        if (ackData.status === "ok") resolve(ackData.data);
        else reject(new Error(ackData.message));
      });
      ws.send(JSON.stringify({ event, data, ackId }));

      // timeout
      setTimeout(() => {
        ackHandlersRef.current.delete(ackId);
        reject(new Error("Timeout"));
      }, 5000);
    });
  }, []);

  return { isConnected, send, on };
}
