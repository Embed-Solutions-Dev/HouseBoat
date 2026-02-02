import type { StateCreator } from 'zustand';
import type { ConnectionData, ConnectionStatus } from '@/types';

export interface ConnectionSlice {
  connection: ConnectionData;
  setConnectionStatus: (status: ConnectionStatus) => void;
  setConnectionError: (error: string | null) => void;
  updateLastUpdate: () => void;
}

export const createConnectionSlice: StateCreator<ConnectionSlice> = (set) => ({
  connection: {
    status: 'disconnected',
    lastUpdate: null,
    error: null,
  },
  setConnectionStatus: (status) =>
    set((state) => ({
      connection: { ...state.connection, status, error: status === 'connected' ? null : state.connection.error },
    })),
  setConnectionError: (error) =>
    set((state) => ({
      connection: { ...state.connection, error, status: 'error' },
    })),
  updateLastUpdate: () =>
    set((state) => ({
      connection: { ...state.connection, lastUpdate: Date.now() },
    })),
});
