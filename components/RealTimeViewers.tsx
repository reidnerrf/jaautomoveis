
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUsers } from 'react-icons/fi';
import { io, Socket } from 'socket.io-client';

interface RealTimeViewersProps {
  page: string;
  vehicleId?: string;
  variant?: 'fixed' | 'inline';
}

const RealTimeViewers: React.FC<RealTimeViewersProps> = ({ page, vehicleId, variant = 'fixed' }) => {
  const [viewers, setViewers] = useState(0);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const isProd = process.env.NODE_ENV === 'production';
    const baseUrl = isProd ? '' : 'http://localhost:5000';
    const newSocket = io(baseUrl, {
      path: '/socket.io',
      transports: ['websocket'],
      withCredentials: true,
    });
    setSocket(newSocket);

    // Do not emit page view here to avoid double counting.
    // MainLayout already emits page-view via analytics service.

    // Listen for viewer count updates
    newSocket.on('page-viewers', (data) => {
      if (data.page === page) {
        setViewers(data.count);
      }
    });

    return () => {
      newSocket.close();
    };
  }, [page, vehicleId]);

  // Show only when at least 1 user is online to avoid visual noise
  if (viewers < 1) return null;

  if (variant === 'inline') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="self-end bg-red-500 text-white px-3 py-1 rounded-full shadow-lg text-xs"
      >
        <div className="flex items-center gap-1">
          <FiUsers size={14} />
          <span>{viewers} visualizando agora</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed bottom-32 right-8 z-50 bg-red-500 text-white px-3 py-2 rounded-full shadow-lg"
    >
      <div className="flex items-center gap-1">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <FiUsers size={14} />
        </motion.div>
        <span className="text-xs font-medium">
          {viewers} visualizando agora
        </span>
      </div>
    </motion.div>
  );
};

export default RealTimeViewers;
