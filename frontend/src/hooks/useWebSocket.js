import { useState, useEffect, useRef, useCallback } from 'react';

export function useWebSocket(url, onMessage) {
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = useRef(1000);
  const onMessageRef = useRef(onMessage);

  // Keep callback ref up to date without re-running connect
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const connect = useCallback(() => {
    if (!url) return;

    try {
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        reconnectAttempts.current = 0;
        reconnectDelay.current = 1000;
      };

      ws.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('Received message:', message);
          // Call the callback directly — no state overwrite race condition
          if (onMessageRef.current) {
            onMessageRef.current(message);
          }
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };

      ws.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);

        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current += 1;
          const delay = reconnectDelay.current;
          console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current})`);
          setTimeout(() => connect(), delay);
          reconnectDelay.current = Math.min(reconnectDelay.current * 2, 10000);
        } else {
          console.error('Max reconnection attempts reached');
        }
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      setIsConnected(false);
    }
  }, [url]);

  const sendMessage = useCallback((message) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      try {
        ws.current.send(JSON.stringify(message));
        console.log('Sent message:', message);
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    } else {
      console.warn('WebSocket is not connected');
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [url, connect]);

  return { isConnected, sendMessage };
}
