import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiUsers } from "react-icons/fi";
import { io } from "socket.io-client";

interface RealTimeViewersProps {
  page: string;
  vehicleId?: string;
  variant?: "fixed" | "inline";
}

const RealTimeViewers: React.FC<RealTimeViewersProps> = ({
  page,
  vehicleId,
  variant = "fixed",
}) => {
  const [viewers, setViewers] = useState(0);

  useEffect(() => {
    const newSocket = io("", {
      path: "/socket.io",
      transports: ["websocket"],
      withCredentials: true,
    });

    newSocket.on("page-viewers", (data) => {
      if (data.page === page) {
        setViewers(data.count);
      }
    });

    // Ao montar, emitir um page-view para entrar na sala correta
    newSocket.emit("page-view", { page });

    return () => {
      newSocket.close();
    };
  }, [page, vehicleId]);

  // Always show the component, even with 0 viewers
  const shouldShow = true;
  if (!shouldShow) return null;

  if (variant === "inline") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-red-500 text-white px-3 py-1 rounded-full shadow-lg text-xs"
      >
        <div className="flex items-center gap-1">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 1.6 }}
          >
            <FiUsers size={14} />
          </motion.div>
          <motion.span
            animate={{ opacity: [1, 0.6, 1] }}
            transition={{ repeat: Infinity, duration: 1.6 }}
          >
            {viewers === 0
              ? "Seja o primeiro a ver"
              : viewers === 1
                ? "1 pessoa visualizando"
                : `${viewers} pessoas visualizando agora`}
          </motion.span>
        </div>
      </motion.div>
    );
  }

  // Floating variant removed per request
  return null;
};

export default RealTimeViewers;
