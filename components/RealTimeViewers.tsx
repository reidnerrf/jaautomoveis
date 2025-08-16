
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUsers } from 'react-icons/fi';
import { io, Socket } from 'socket.io-client';

interface RealTimeViewersProps {
  page: string;
  vehicleId?: string;
}

const RealTimeViewers: React.FC<RealTimeViewersProps> = ({ page, vehicleId }) => {
  const [viewers, setViewers] = useState(0);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io(process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000');
    setSocket(newSocket);

    // Emit page view
    newSocket.emit('page-view', {
      page,
      vehicleId,
      userAgent: navigator.userAgent
    });

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

  const trackAction = (action: string, category: string, label?: string) => {
    if (socket) {
      socket.emit('user-action', {
        action,
        category,
        label,
        page
      });
    }
  };

  // Expose trackAction to parent components
  (window as any).trackRealTimeAction = trackAction;

  if (viewers <= 1) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed bottom-24 right-8 z-30 bg-red-500 text-white px-4 py-2 rounded-full shadow-lg"
    >
      <div className="flex items-center gap-2">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <FiUsers size={16} />
        </motion.div>
        <span className="text-sm font-medium">
          {viewers} pessoa{viewers > 1 ? 's' : ''} visualizando
        </span>
      </div>
    </motion.div>
  );
};

export default RealTimeViewers;
