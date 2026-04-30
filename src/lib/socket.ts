import { io, Socket } from 'socket.io-client';

// Initialize Socket.io outside of React lifecycle to maintain a single connection
export const socket: Socket = io();
