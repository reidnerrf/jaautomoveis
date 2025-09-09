import React from "react";
import { motion } from "framer-motion";
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiCheck,
  FiUser,
  FiDollarSign,
  FiClock,
} from "react-icons/fi";
import { FaCar } from "react-icons/fa";

interface Activity {
  id: string;
  type: "create" | "update" | "delete" | "sell" | "user";
  entity: "vehicle" | "seller" | "user";
  title: string;
  description: string;
  timestamp: string;
  icon: React.ReactNode;
  color: string;
}

interface RecentActivityProps {
  vehicles: any[];
  sellers: any[];
  compact?: boolean;
  onOpenAll?: () => void;
}

const RecentActivity: React.FC<RecentActivityProps> = ({ vehicles, sellers, compact = false, onOpenAll }) => {
  const activities: Activity[] = React.useMemo(() => {
    const activitiesList: Activity[] = [];
    
    // Atividades de veículos
    const safeVehicles = Array.isArray(vehicles) ? vehicles : [];
    safeVehicles.forEach(vehicle => {
      if (vehicle.createdAt) {
        activitiesList.push({
          id: `vehicle-created-${vehicle._id}`,
          type: "create",
          entity: "vehicle",
          title: "Veículo Adicionado",
          description: `${vehicle.name} - ${vehicle.make} ${vehicle.model}`,
          timestamp: vehicle.createdAt,
          icon: <FiPlus className="text-green-500" size={16} />,
          color: "green",
        });
      }
      
      if (vehicle.updatedAt && vehicle.updatedAt !== vehicle.createdAt) {
        activitiesList.push({
          id: `vehicle-updated-${vehicle._id}`,
          type: "update",
          entity: "vehicle",
          title: "Veículo Atualizado",
          description: `${vehicle.name} - ${vehicle.make} ${vehicle.model}`,
          timestamp: vehicle.updatedAt,
          icon: <FiEdit className="text-blue-500" size={16} />,
          color: "blue",
        });
      }
      
      if (vehicle.status === "vendido" && vehicle.soldAt) {
        activitiesList.push({
          id: `vehicle-sold-${vehicle._id}`,
          type: "sell",
          entity: "vehicle",
          title: "Veículo Vendido",
          description: `${vehicle.name} - R$ ${(vehicle.soldPrice || vehicle.price).toLocaleString("pt-BR")}`,
          timestamp: vehicle.soldAt,
          icon: <FiCheck className="text-emerald-500" size={16} />,
          color: "emerald",
        });
      }
    });

    // Atividades de vendedores
    const safeSellers = Array.isArray(sellers) ? sellers : [];
    safeSellers.forEach(seller => {
      if (seller.createdAt) {
        activitiesList.push({
          id: `seller-created-${seller._id}`,
          type: "create",
          entity: "seller",
          title: "Vendedor Adicionado",
          description: `${seller.name} - ${seller.email}`,
          timestamp: seller.createdAt,
          icon: <FiUser className="text-purple-500" size={16} />,
          color: "purple",
        });
      }
      
      if (seller.updatedAt && seller.updatedAt !== seller.createdAt) {
        activitiesList.push({
          id: `seller-updated-${seller._id}`,
          type: "update",
          entity: "seller",
          title: "Vendedor Atualizado",
          description: `${seller.name} - ${seller.email}`,
          timestamp: seller.updatedAt,
          icon: <FiEdit className="text-blue-500" size={16} />,
          color: "blue",
        });
      }
    });

    // Ordenar por timestamp (mais recente primeiro)
    return activitiesList
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10); // Mostrar apenas as 10 mais recentes
  }, [vehicles, sellers]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return "Agora mesmo";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h atrás`;
    } else if (diffInHours < 168) { // 7 dias
      return `${Math.floor(diffInHours / 24)}d atrás`;
    } else {
      return date.toLocaleDateString("pt-BR");
    }
  };

  const getActivityIcon = (entity: Activity["entity"]) => {
    switch (entity) {
      case "vehicle":
        return <FaCar className="text-gray-500" size={14} />;
      case "seller":
        return <FiUser className="text-gray-500" size={14} />;
      case "user":
        return <FiUser className="text-gray-500" size={14} />;
      default:
        return <FiClock className="text-gray-500" size={14} />;
    }
  };

  if (activities.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Atividades Recentes
        </h3>
        <div className="text-center py-8">
          <FiClock className="text-gray-400 mx-auto mb-3" size={48} />
          <p className="text-gray-500 dark:text-gray-400">
            Nenhuma atividade recente encontrada.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Atividades Recentes
      </h3>
      
      <div className="space-y-4">
        {(compact ? activities.slice(0, 1) : activities).map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div className="flex-shrink-0 mt-1">
              {activity.icon}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  {activity.title}
                </h4>
                {getActivityIcon(activity.entity)}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {activity.description}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {formatTimestamp(activity.timestamp)}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
      
      {(!compact && activities.length >= 10) && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium">
            Ver todas as atividades
          </button>
        </div>
      )}

      {compact && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button onClick={onOpenAll} className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium">
            Ver todas as atividades
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default RecentActivity;