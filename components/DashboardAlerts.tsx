import React from "react";
import { motion } from "framer-motion";
import {
  FiAlertTriangle,
  FiInfo,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiUsers
} from "react-icons/fi";
import { FaCar } from "react-icons/fa";
interface Alert {
  id: string;
  type: "warning" | "info" | "success" | "error";
  title: string;
  message: string;
  icon: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface DashboardAlertsProps {
  vehicles: any[];
  sellers: any[];
}

const DashboardAlerts: React.FC<DashboardAlertsProps> = ({ vehicles, sellers }) => {
  const alerts: Alert[] = React.useMemo(() => {
    const alertsList: Alert[] = [];
    
    // Verificar veículos com preço muito alto
    const expensiveVehicles = vehicles.filter(v => v.price > 150000);
    if (expensiveVehicles.length > 0) {
      alertsList.push({
        id: "expensive-vehicles",
        type: "warning",
        title: "Veículos com Preço Alto",
        message: `${expensiveVehicles.length} veículos com preço acima de R$ 150.000`,
        icon: <FiDollarSign className="text-yellow-500" size={20} />,
      });
    }

    // Verificar veículos sem custo
    const vehiclesWithoutCost = vehicles.filter(v => !v.cost || v.cost === 0);
    if (vehiclesWithoutCost.length > 0) {
      alertsList.push({
        id: "no-cost",
        type: "info",
        title: "Veículos sem Custo",
        message: `${vehiclesWithoutCost.length} veículos não possuem custo definido`,
        icon: <FiInfo className="text-blue-500" size={20} />,
      });
    }

    // Verificar vendedores inativos
    const inactiveSellers = sellers.filter(s => !s.active);
    if (inactiveSellers.length > 0) {
      alertsList.push({
        id: "inactive-sellers",
        type: "warning",
        title: "Vendedores Inativos",
        message: `${inactiveSellers.length} vendedores estão inativos`,
        icon: <FiUsers className="text-orange-500" size={20} />,
      });
    }

    // Verificar estoque baixo
    const availableVehicles = vehicles.filter(v => v.status === "disponivel");
    if (availableVehicles.length < 5) {
      alertsList.push({
        id: "low-stock",
        type: "error",
        title: "Estoque Baixo",
        message: `Apenas ${availableVehicles.length} veículos disponíveis`,
        icon: <FaCar className="text-red-500" size={20} />,
      });
    }

    // Verificar veículos antigos no estoque
    const oldVehicles = vehicles.filter(v => {
      const addedDate = new Date(v.createdAt);
      const daysSinceAdded = (Date.now() - addedDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceAdded > 90 && v.status === "disponivel";
    });
    if (oldVehicles.length > 0) {
      alertsList.push({
        id: "old-vehicles",
        type: "warning",
        title: "Veículos Antigos no Estoque",
        message: `${oldVehicles.length} veículos há mais de 90 dias no estoque`,
        icon: <FiClock className="text-yellow-500" size={20} />,
      });
    }

    // Verificar margem de lucro baixa
    const lowMarginVehicles = vehicles.filter(v => {
      if (!v.cost || v.cost === 0) return false;
      const margin = ((v.price - v.cost) / v.cost) * 100;
      return margin < 10;
    });
    if (lowMarginVehicles.length > 0) {
      alertsList.push({
        id: "low-margin",
        type: "info",
        title: "Margem de Lucro Baixa",
        message: `${lowMarginVehicles.length} veículos com margem menor que 10%`,
        icon: <FiDollarSign className="text-blue-500" size={20} />,
      });
    }

    return alertsList;
  }, [vehicles, sellers]);

  const getAlertStyles = (type: Alert["type"]) => {
    switch (type) {
      case "warning":
        return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800";
      case "error":
        return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
      case "info":
        return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800";
      case "success":
        return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
      default:
        return "bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800";
    }
  };

  const getTextStyles = (type: Alert["type"]) => {
    switch (type) {
      case "warning":
        return "text-yellow-800 dark:text-yellow-200";
      case "error":
        return "text-red-800 dark:text-red-200";
      case "info":
        return "text-blue-800 dark:text-blue-200";
      case "success":
        return "text-green-800 dark:text-green-200";
      default:
        return "text-gray-800 dark:text-gray-200";
    }
  };

  if (alerts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center space-x-3">
          <FiCheckCircle className="text-green-500" size={24} />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Tudo em Ordem!
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Não há alertas ou notificações no momento.
            </p>
          </div>
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
      <div className="flex items-center space-x-3 mb-4">
        <FiAlertTriangle className="text-orange-500" size={24} />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Alertas e Notificações
        </h3>
        <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 px-2 py-1 rounded-full text-sm font-medium">
          {alerts.length}
        </span>
      </div>
      
      <div className="space-y-3">
        {alerts.map((alert, index) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-lg border ${getAlertStyles(alert.type)}`}
          >
            <div className="flex items-start space-x-3">
              {alert.icon}
              <div className="flex-1">
                <h4 className={`font-medium ${getTextStyles(alert.type)}`}>
                  {alert.title}
                </h4>
                <p className={`text-sm mt-1 ${getTextStyles(alert.type)}`}>
                  {alert.message}
                </p>
                {alert.action && (
                  <button
                    onClick={alert.action.onClick}
                    className="mt-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    {alert.action.label}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default DashboardAlerts;