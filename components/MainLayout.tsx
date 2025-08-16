
import React from 'react';
import Header from './Header.tsx';
import Footer from './Footer.tsx';
import FloatingButtons from './FloatingButtons.tsx';
import { Outlet } from 'react-router-dom';

const MainLayout: React.FC = () => {
  return (
    <div className="bg-comp-light-gray min-h-screen flex flex-col">
      <a href="#conteudo" className="skip-link">Ir para o conteúdo principal</a>
      <Header />
      <main id="conteudo" role="main" className="flex-grow">
        <Outlet />
      </main>
      <FloatingButtons />
      <Footer />
      <style>{`
        .skip-link {
          position: absolute;
          left: -1000px;
          top: auto;
          width: 1px;
          height: 1px;
          overflow: hidden;
        }
        .skip-link:focus {
          left: 1rem;
          top: 1rem;
          width: auto;
          height: auto;
          padding: 0.5rem 0.75rem;
          background: #ffffff;
          color: #111827;
          border-radius: 0.5rem;
          box-shadow: 0 0 0 3px #D2282F33;
          z-index: 9999;
        }
      `}</style>
    </div>
  );
};

export default MainLayout;