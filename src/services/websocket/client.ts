import type { MessageType, MessageHandler, ConnectionHandler } from './types';

class YachtWebSocket {
  private ws: WebSocket | null = null;
  private url: string = '';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners = new Map<MessageType, Set<MessageHandler>>();
  private connectionHandlers = new Set<ConnectionHandler>();

  connect(url: string): void {
    this.url = url;
    this.reconnectAttempts = 0;
    this.createConnection();
  }

  private createConnection(): void {
    this.notifyConnectionStatus('connecting');

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.notifyConnectionStatus('connected');
      };

      this.ws.onclose = () => {
        this.notifyConnectionStatus('disconnected');
        this.attemptReconnect();
      };

      this.ws.onerror = () => {
        this.notifyConnectionStatus('error');
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.notifyListeners(message.type, message.payload);
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
        }
      };
    } catch (e) {
      this.notifyConnectionStatus('error');
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    setTimeout(() => {
      this.createConnection();
    }, delay);
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  subscribe<T>(type: MessageType, handler: MessageHandler<T>): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(handler as MessageHandler);

    return () => {
      this.listeners.get(type)?.delete(handler as MessageHandler);
    };
  }

  onConnectionChange(handler: ConnectionHandler): () => void {
    this.connectionHandlers.add(handler);
    return () => {
      this.connectionHandlers.delete(handler);
    };
  }

  send(type: MessageType, payload: unknown): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload, timestamp: Date.now() }));
    }
  }

  private notifyListeners(type: MessageType, data: unknown): void {
    this.listeners.get(type)?.forEach((handler) => handler(data));
  }

  private notifyConnectionStatus(status: 'connecting' | 'connected' | 'disconnected' | 'error'): void {
    this.connectionHandlers.forEach((handler) => handler(status));
  }
}

export const wsClient = new YachtWebSocket();
