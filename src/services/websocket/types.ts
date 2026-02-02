export type MessageType =
  | 'engines.update'
  | 'navigation.update'
  | 'systems.update'
  | 'cameras.update'
  | 'controls.sync'
  | 'controls.command';

export interface WSMessage<T = unknown> {
  type: MessageType;
  payload: T;
  timestamp: number;
}

export type ConnectionHandler = (status: 'connecting' | 'connected' | 'disconnected' | 'error') => void;
export type MessageHandler<T = unknown> = (data: T) => void;
