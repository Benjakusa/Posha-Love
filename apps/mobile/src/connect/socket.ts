import { io, type Socket } from 'socket.io-client';
import { API_BASE } from '../api';

// Strip '/api/v1' since socket lives on same host, namespace '/connect'
const SOCKET_URL = API_BASE.replace(/\/api\/v1\/?$/, '');

export function createConnectSocket(token: string): Socket {
  return io(`${SOCKET_URL}/connect`, {
    transports: ['websocket'],
    auth: { token },
    autoConnect: true,
    reconnection: true,
  });
}
