import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaWhatsapp, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Footer: React.FC = () => {
  const quickLinks = [
    { name: 'Estoque', path: '/inventory' },
    { name: 'Financiamento', path: '/financing' },
    { name: 'Consórcio', path: '/consortium' },
    { name: 'Sobre Nós', path: '/about' },
    { name: 'Contato', path: '/contact' },
  ];

  const socialLinks = [
    { 
      icon: <FaFacebook size={24} />, 
      href: 'https://facebook.com', 
      gradient: 'from-blue-600 to-blue-700',
      label: 'Facebook'
    },
    { 
      icon: <FaInstagram size={24} />, 
      href: 'https://www.instagram.com/_jaautomoveis/', 
      gradient: 'from-pink-500 via-purple-500 to-orange-500',
      label: 'Instagram'
    },
    { 
      icon: <FaWhatsapp size={24} />, 
      href: 'https://wa.me/5524999037716', 
      gradient: 'from-green-600 to-green-700',
      label: 'WhatsApp'
    },
  ];

  const contactInfo = [
    {
      icon: <FaMapMarkerAlt size={20} />,
      text: 'Av. Brasília, n°35 - Vila Julieta, Resende - RJ',
      href: 'https://maps.google.com/?q=Av.+Brasília,+35+-+Vila+Julieta,+Resende+-+RJ'
    },
    {
      icon: <FaPhone size={20} />,
      text: '(24) 99903-7716',
      href: 'tel:+5524999037716'
    },
    {
      icon: <FaEnvelope size={20} />,
      text: 'contato@jaautomoveis.com',
      href: 'mailto:contato@jaautomoveis.com'
    }
  ];

  return (
    <footer className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white relative overflow-hidden">
      {/* Elementos decorativos */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto py-16 px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          
          {/* Logo + Descrição */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="lg:col-span-1"
          >
            <Link to="/" className="block mb-6 group">
              <motion.img 
                src="/assets/logo.png" 
                alt="JA Automóveis Logo" 
                className="h-16 w-auto transition-transform group-hover:scale-105" 
                whileHover={{ rotate: -2 }}
              />
            </Link>
            <p className="text-neutral-300 leading-relaxed text-lg">
              Seu próximo carro está aqui. Qualidade, confiança e transparência em cada negociação.
            </p>
            
            {/* Redes sociais */}
            <div className="mt-8">
              <h4 className="font-semibold text-lg mb-4 text-white">Siga-nos</h4>
              <div className="flex space-x-4">
                {socialLinks.map((social, i) => (
                  <motion.a 
                    key={i} 
                    href={social.href} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={`bg-gradient-to-br ${social.gradient} text-white p-3 rounded-xl shadow-medium hover:shadow-glow transition-all duration-300 hover-lift group`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    viewport={{ once: true }}
                    aria-label={social.label}
                  >
                    <div className="group-hover:animate-bounce-soft">
                      {social.icon}
                    </div>
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Links rápidos */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h4 className="font-bold text-xl mb-6 text-white">Links Rápidos</h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <motion.li 
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <Link 
                    to={link.path} 
                    className="text-neutral-300 hover:text-white transition-all duration-300 group flex items-center"
                  >
                    <span className="w-2 h-2 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    {link.name}
                    <span className="ml-2 transform translate-x-0 group-hover:translate-x-1 transition-transform duration-300">→</span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contato */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h4 className="font-bold text-xl mb-6 text-white">Contato</h4>
            <div className="space-y-4">
              {contactInfo.map((contact, index) => (
                <motion.a
                  key={index}
                  href={contact.href}
                  target={contact.href.startsWith('http') ? '_blank' : '_self'}
                  rel={contact.href.startsWith('http') ? 'noopener noreferrer' : ''}
                  className="flex items-start space-x-3 text-neutral-300 hover:text-white transition-colors duration-300 group"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white text-sm group-hover:scale-110 transition-transform duration-300">
                    {contact.icon}
                  </div>
                  <span className="text-sm leading-relaxed">{contact.text}</span>
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Horário de funcionamento */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h4 className="font-bold text-xl mb-6 text-white">Horário de Funcionamento</h4>
            <div className="space-y-3 text-neutral-300">
              <div className="flex justify-between items-center">
                <span>Segunda a Sexta</span>
                <span className="font-semibold text-white">08:00 - 18:00</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Sábado</span>
                <span className="font-semibold text-white">08:00 - 17:00</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Domingo</span>
                <span className="font-semibold text-white">Fechado</span>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 rounded-xl border border-primary-500/20">
              <p className="text-sm text-neutral-200">
                <strong className="text-white">Atendimento especial:</strong> WhatsApp disponível 24h para consultas.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Linha de direitos */}
        <motion.div 
          className="mt-16 pt-8 border-t border-neutral-700 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <p className="text-neutral-400 text-sm mb-4">
            &copy; {new Date().getFullYear()} JA Automóveis. Todos os direitos reservados.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link to="/admin/login" className="text-neutral-400 hover:text-white transition-colors duration-300">
              Área Administrativa
            </Link>
            <span className="text-neutral-600">•</span>
            <Link to="/privacy-policy" className="text-neutral-400 hover:text-white transition-colors duration-300">
              Política de Privacidade
            </Link>
            <span className="text-neutral-600">•</span>
            <Link to="/terms-of-service" className="text-neutral-400 hover:text-white transition-colors duration-300">
              Termos de Serviço
            </Link>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
