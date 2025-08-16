import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiChevronRight, FiHome } from 'react-icons/fi';
import { motion } from 'framer-motion';

interface BreadcrumbItem {
  name: string;
  path?: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  showHome?: boolean;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items = [], showHome = true }) => {
  const location = useLocation();
  
  // Mapear rotas para nomes amigáveis
  const routeNames: { [key: string]: string } = {
    '/': 'Início',
    '/inventory': 'Estoque',
    '/financing': 'Financiamento',
    '/consortium': 'Consórcio',
    '/about': 'Sobre Nós',
    '/contact': 'Contato',
    '/privacy-policy': 'Política de Privacidade',
    '/terms-of-service': 'Termos de Serviço',
  };

  // Gerar breadcrumbs automaticamente se não fornecidos
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];
    
    let currentPath = '';
    
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const name = routeNames[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1);
      
      breadcrumbs.push({
        name,
        path: index === pathSegments.length - 1 ? undefined : currentPath
      });
    });
    
    return breadcrumbs;
  };

  const breadcrumbItems = items.length > 0 ? items : generateBreadcrumbs();

  if (breadcrumbItems.length === 0) return null;

  return (
    <nav className="bg-gray-50 border-b border-gray-200 py-3" aria-label="Breadcrumb">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <ol className="flex items-center space-x-2 text-sm">
          {showHome && (
            <motion.li
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Link
                to="/"
                className="flex items-center text-gray-500 hover:text-main-red transition-colors duration-200"
                aria-label="Ir para página inicial"
              >
                <FiHome size={16} />
              </Link>
            </motion.li>
          )}
          
          {breadcrumbItems.map((item, index) => (
            <motion.li
              key={index}
              className="flex items-center"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
            >
              {index > 0 && (
                <FiChevronRight className="text-gray-400 mx-2" size={14} />
              )}
              
              {item.path ? (
                <Link
                  to={item.path}
                  className="text-gray-500 hover:text-main-red transition-colors duration-200 font-medium"
                >
                  {item.name}
                </Link>
              ) : (
                <span className="text-gray-900 font-semibold" aria-current="page">
                  {item.name}
                </span>
              )}
            </motion.li>
          ))}
        </ol>
      </div>
    </nav>
  );
};

export default Breadcrumb;