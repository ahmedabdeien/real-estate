import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';

let socketInstance = null;

export const useSocket = () => {
  const { token } = useSelector(s => s.auth);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token) return;
    if (!socketInstance) {
      const url = import.meta.env.VITE_API_URL || '/';
      socketInstance = io(url, { auth: { token }, transports: ['websocket', 'polling'] });
    }
    socketRef.current = socketInstance;
    return () => {};
  }, [token]);

  return socketRef.current;
};

export const getSocket = () => socketInstance;
export const initSocket = (token) => {
  if (!socketInstance && token) {
    const url = import.meta.env.VITE_API_URL || '/';
    socketInstance = io(url, { auth: { token }, transports: ['websocket', 'polling'] });
  }
  return socketInstance;
};
export const destroySocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};
