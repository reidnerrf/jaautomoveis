
import React from 'react';
import Header from './Header.tsx';
import Footer from './Footer.tsx';
import { Outlet, useLocation } from 'react-router-dom';
import FloatingSocialButtons from './FloatingSocialButtons.tsx';
import { analytics } from '../utils/analytics.ts';

const MainLayout: React.FC = () => {
  const location = useLocation();

  React.useEffect(() => {
    analytics.trackPageView(location.pathname);
  }, [location.pathname]);

  return (
    <div className="bg-comp-light-gray dark:bg-gray-900 min-h-screen flex flex-col font-sans antialiased">
      <Header />
      <main className="flex-grow pt-20">
        <Outlet />
      </main>
      <Footer />
      <FloatingSocialButtons />
    </div>
  );
};

export default MainLayout;