
import React from 'react';
import Header from './Header.tsx';
import Footer from './Footer.tsx';
import { Outlet } from 'react-router-dom';

const MainLayout: React.FC = () => {
  return (
    <div className="bg-comp-light-gray min-h-screen flex flex-col font-sans antialiased">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;