
import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaWhatsapp } from 'react-icons/fa';

const Footer: React.FC = () => {
  const quickLinks = [
    { name: 'Estoque', path: '/inventory' },
    { name: 'Financiamento', path: '/financing' },
    { name: 'Sobre Nós', path: '/about' },
    { name: 'Contato', path: '/contact' },
  ];

  const socialLinks = [
    { icon: <FaFacebook size={24} />, href: 'https://facebook.com' },
    { icon: <FaInstagram size={24} />, href: 'https://www.instagram.com/_jaautomoveis/' },
    { icon: <FaWhatsapp size={24} />, href: 'https://wa.me/5524999037716' },
  ];

  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="block mb-4">
              <img src="/assets/logo.png" alt="JA Automóveis Logo" className="h-10 w-auto" />
            </Link>
            <p className="text-gray-400">Seu próximo carro está aqui. Qualidade e confiança você encontra aqui.</p>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-4">Links Rápidos</h4>
            <ul className="space-y-2">
              {quickLinks.map(link => (
                <li key={link.name}>
                  <Link to={link.path} className="text-gray-400 hover:text-white transition-colors">{link.name}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-4">Contato</h4>
            <p className="text-gray-400">Av. Brasília, n°35 - Vila Julieta, Resende - RJ, 27521-060</p>
            <p className="text-gray-400">contato@jaautomoveis.com</p>
            <p className="text-gray-400">(24) 99903-7716</p>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-4">Siga-nos</h4>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a key={index} href={social.href} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} JA Automóveis. Todos os direitos reservados.</p>
          <p className="text-sm">
            <Link to="/admin/login" className="hover:text-white transition-colors">Admin</Link> |{' '}
            <Link to="/privacy-policy" className="hover:text-white transition-colors">Política de Privacidade</Link> |{' '}
            <Link to="/terms-of-service" className="hover:text-white transition-colors">Termos de Serviço</Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
