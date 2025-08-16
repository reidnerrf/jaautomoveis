
import React from 'react';
import Header from './Header.tsx';
import Footer from './Footer.tsx';
import FloatingButtons from './FloatingButtons.tsx';
import { Outlet } from 'react-router-dom';

const MainLayout: React.FC = () => {
  return (
    <div className="bg-surface-secondary min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <FloatingButtons />
      <Footer />
    </div>
  );
};

export default MainLayout;