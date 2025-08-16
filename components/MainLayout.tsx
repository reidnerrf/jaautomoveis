
import React from 'react';
import Header from './Header.tsx';
import Footer from './Footer.tsx';
import FloatingButtons from './FloatingButtons.tsx';
import Breadcrumb from './Breadcrumb.tsx';
import { Outlet, useLocation } from 'react-router-dom';

const MainLayout: React.FC = () => {
  const location = useLocation();
  
  // Páginas que não devem mostrar breadcrumb
  const hideBreadcrumbPages = ['/', '/admin'];
  const shouldShowBreadcrumb = !hideBreadcrumbPages.includes(location.pathname);

  return (
    <div className="bg-comp-light-gray min-h-screen flex flex-col">
      <Header />
      
      {shouldShowBreadcrumb && <Breadcrumb />}
      
      <main className="flex-grow">
        <Outlet />
      </main>
      
      <FloatingButtons />
      <Footer />
    </div>
  );
};

export default MainLayout;