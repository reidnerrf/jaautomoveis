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
    { icon: <FaFacebook size={22} />, href: 'https://facebook.com', color: 'hover:text-blue-500' },
    { icon: <FaInstagram size={22} />, href: 'https://www.instagram.com/_jaautomoveis/', color: 'hover:text-pink-500' },
    { icon: <FaWhatsapp size={22} />, href: 'https://wa.me/5524999037716', color: 'hover:text-green-500' },
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white relative overflow-hidden">
      <div className="container mx-auto py-12 px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Logo + Descrição */}
          <div>
            <Link to="/" className="block mb-4">
              <img src="/assets/logo.png" alt="JA Automóveis Logo" className="h-12 w-auto" />
            </Link>
            <p className="text-gray-400 leading-relaxed">
              Seu próximo carro está aqui. Qualidade e confiança em cada negociação.
            </p>
          </div>

          {/* Links rápidos */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Links Rápidos</h4>
            <ul className="space-y-2">
              {quickLinks.map(link => (
                <li key={link.name}>
                  <Link 
                    to={link.path} 
                    className="text-gray-400 relative group transition-colors duration-300"
                  >
                    {link.name}
                    <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-red-500 transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Contato</h4>
            <p className="text-gray-400">Av. Brasília, n°35 - Vila Julieta, Resende - RJ</p>
            <p className="text-gray-400">contato@jaautomoveis.com</p>
            <p className="text-gray-400">(24) 99903-7716</p>
          </div>

          {/* Redes sociais */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Siga-nos</h4>
            <div className="flex space-x-4">
              {socialLinks.map((social, i) => (
                <a 
                  key={i} 
                  href={social.href} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={`text-gray-400 transition-transform transform hover:scale-125 ${social.color}`}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Linha de direitos */}
        <div className="mt-10 pt-6 border-t border-gray-700 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} JA Automóveis. Todos os direitos reservados.</p>
          <p className="mt-1 space-x-2">
            <Link to="/admin/login" className="hover:text-white transition-colors">Admin</Link> | 
            <Link to="/privacy-policy" className="hover:text-white transition-colors">Política de Privacidade</Link> | 
            <Link to="/terms-of-service" className="hover:text-white transition-colors">Termos de Serviço</Link>
          </p>
        </div>
      </div>

      {/* Efeito decorativo de luz */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-gradient-to-r from-red-500 via-transparent to-red-500 pointer-events-none"></div>
    </footer>
  );
};

export default Footer;
