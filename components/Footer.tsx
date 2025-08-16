import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaWhatsapp, FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock } from 'react-icons/fa';

const Footer: React.FC = () => {
  const quickLinks = [
    { name: 'Estoque', path: '/inventory' },
    { name: 'Financiamento', path: '/financing' },
    { name: 'Consórcio', path: '/consortium' },
    { name: 'Sobre Nós', path: '/about' },
    { name: 'Contato', path: '/contact' },
  ];

  const services = [
    { name: 'Compra de Veículos', path: '/inventory' },
    { name: 'Venda de Veículos', path: '/inventory' },
    { name: 'Financiamento', path: '/financing' },
    { name: 'Consórcio', path: '/consortium' },
  ];

  const socialLinks = [
    { 
      icon: <FaFacebook size={22} />, 
      href: 'https://facebook.com', 
      color: 'hover:text-blue-500',
      label: 'Facebook'
    },
    { 
      icon: <FaInstagram size={22} />, 
      href: 'https://www.instagram.com/_jaautomoveis/', 
      color: 'hover:text-pink-500',
      label: 'Instagram'
    },
    { 
      icon: <FaWhatsapp size={22} />, 
      href: 'https://wa.me/5524999037716', 
      color: 'hover:text-green-500',
      label: 'WhatsApp'
    },
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="container mx-auto py-16 px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Logo + Descrição */}
          <div className="lg:col-span-1">
            <Link to="/" className="block mb-6">
              <img src="/assets/logo.png" alt="JA Automóveis Logo" className="h-16 w-auto" />
            </Link>
            <p className="text-gray-300 leading-relaxed mb-6">
              Seu próximo carro está aqui. Qualidade e confiança em cada negociação, 
              com mais de 10 anos de experiência no mercado automotivo.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, i) => (
                <a 
                  key={i} 
                  href={social.href} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={`text-gray-400 transition-all transform hover:scale-125 ${social.color} p-2 rounded-full bg-gray-800 hover:bg-gray-700`}
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links rápidos */}
          <div>
            <h4 className="font-bold text-xl mb-6 text-white">Navegação</h4>
            <ul className="space-y-3">
              {quickLinks.map(link => (
                <li key={link.name}>
                  <Link 
                    to={link.path} 
                    className="text-gray-300 relative group transition-colors duration-300 hover:text-white flex items-center"
                  >
                    <span className="w-0 h-0.5 bg-red-500 transition-all duration-300 group-hover:w-4 mr-2"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Serviços */}
          <div>
            <h4 className="font-bold text-xl mb-6 text-white">Serviços</h4>
            <ul className="space-y-3">
              {services.map(service => (
                <li key={service.name}>
                  <Link 
                    to={service.path} 
                    className="text-gray-300 relative group transition-colors duration-300 hover:text-white flex items-center"
                  >
                    <span className="w-0 h-0.5 bg-red-500 transition-all duration-300 group-hover:w-4 mr-2"></span>
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="font-bold text-xl mb-6 text-white">Contato</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <FaMapMarkerAlt className="text-red-500 mt-1 flex-shrink-0" size={18} />
                <div>
                  <p className="text-gray-300">Av. Brasília, n°35 - Vila Julieta</p>
                  <p className="text-gray-300">Resende - RJ, 27520-000</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <FaPhone className="text-red-500 flex-shrink-0" size={18} />
                <a href="tel:+5524999037716" className="text-gray-300 hover:text-white transition-colors">
                  (24) 99903-7716
                </a>
              </div>
              
              <div className="flex items-center space-x-3">
                <FaEnvelope className="text-red-500 flex-shrink-0" size={18} />
                <a href="mailto:contato@jaautomoveis.com" className="text-gray-300 hover:text-white transition-colors">
                  contato@jaautomoveis.com
                </a>
              </div>
              
              <div className="flex items-start space-x-3">
                <FaClock className="text-red-500 mt-1 flex-shrink-0" size={18} />
                <div>
                  <p className="text-gray-300">Segunda a Sexta: 8h às 18h</p>
                  <p className="text-gray-300">Sábado: 8h às 16h</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="text-center">
            <h5 className="text-lg font-semibold mb-3">Fique por dentro das novidades</h5>
            <p className="text-gray-400 mb-4">Receba ofertas exclusivas e novidades do estoque</p>
            <div className="flex max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Seu e-mail" 
                className="flex-1 px-4 py-3 rounded-l-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
              />
              <button className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-r-lg transition-colors">
                Inscrever
              </button>
            </div>
          </div>
        </div>

        {/* Linha de direitos */}
        <div className="mt-10 pt-6 border-t border-gray-700 text-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} JA Automóveis. Todos os direitos reservados.
          </p>
          <div className="mt-2 space-x-4 text-sm">
            <Link to="/privacy-policy" className="text-gray-400 hover:text-white transition-colors">
              Política de Privacidade
            </Link>
            <span className="text-gray-600">|</span>
            <Link to="/terms-of-service" className="text-gray-400 hover:text-white transition-colors">
              Termos de Serviço
            </Link>
            <span className="text-gray-600">|</span>
            <Link to="/admin/login" className="text-gray-400 hover:text-white transition-colors">
              Área Administrativa
            </Link>
          </div>
        </div>
      </div>

      {/* Efeito decorativo de luz */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-gradient-to-r from-red-500 via-transparent to-red-500 pointer-events-none"></div>
    </footer>
  );
};

export default Footer;
