import React from "react";
import { Link } from "react-router-dom";
import { Disclosure } from "@headlessui/react";
import {
  FaFacebook,
  FaInstagram,
  FaWhatsapp,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone,
} from "react-icons/fa";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

const Footer: React.FC = () => {
  const quickLinks = [
    { name: "Estoque", path: "/inventory" },
    { name: "Financiamento", path: "/financing" },
    { name: "Sobre Nós", path: "/about" },
    { name: "Contato", path: "/contact" },
  ];

  const socialLinks = [
    {
      icon: <FaFacebook size={18} />,
      href: "https://facebook.com",
      color: "hover:bg-blue-500",
    },
    {
      icon: <FaInstagram size={18} />,
      href: "https://www.instagram.com/_jaautomoveis/",
      color: "hover:bg-pink-500",
    },
    {
      icon: <FaWhatsapp size={18} />,
      href: "https://wa.me/5524999037716",
      color: "hover:bg-green-500",
    },
  ];

  return (
    <footer className="relative bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white overflow-hidden">
      <div className="container mx-auto py-12 px-6 relative z-10">
        {/* Layout: mobile usa acordeão / desktop usa grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Logo + Descrição */}
          <div>
            <Link to="/" className="block mb-4 group">
              <img
                src="/assets/logo.png"
                alt="JA Automóveis Logo"
                className="h-12 w-auto transition-transform duration-300 group-hover:scale-105 group-hover:brightness-110"
              />
            </Link>
            <p className="text-gray-400 leading-relaxed text-sm">
              Seu próximo carro está aqui. Qualidade e confiança em cada
              negociação.
            </p>
          </div>

          {/* Links rápidos */}
          <div>
            {/* Mobile: acordeão */}
            <div className="md:hidden">
              <Disclosure>
                {({ open }) => (
                  <>
                    <Disclosure.Button className="flex justify-between items-center w-full text-left font-semibold text-lg py-2 border-b border-gray-800">
                      Links Rápidos
                      <ChevronDownIcon
                        className={`w-5 h-5 transition-transform ${
                          open ? "rotate-180" : ""
                        }`}
                      />
                    </Disclosure.Button>
                    <Disclosure.Panel className="mt-2 space-y-2">
                      {quickLinks.map((link) => (
                        <Link
                          key={link.name}
                          to={link.path}
                          className="block text-gray-400 hover:text-red-500 transition-colors"
                        >
                          {link.name}
                        </Link>
                      ))}
                    </Disclosure.Panel>
                  </>
                )}
              </Disclosure>
            </div>

            {/* Desktop: lista normal */}
            <div className="hidden md:block">
              <h4 className="font-semibold text-lg mb-4">Links Rápidos</h4>
              <ul className="space-y-2">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-gray-400 relative group inline-block transition-colors duration-300"
                    >
                      {link.name}
                      <span className="absolute left-0 -bottom-0.5 w-0 h-0.5 bg-red-500 transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contato */}
          <div>
            {/* Mobile */}
            <div className="md:hidden">
              <Disclosure>
                {({ open }) => (
                  <>
                    <Disclosure.Button className="flex justify-between items-center w-full text-left font-semibold text-lg py-2 border-b border-gray-800">
                      Contato
                      <ChevronDownIcon
                        className={`w-5 h-5 transition-transform ${
                          open ? "rotate-180" : ""
                        }`}
                      />
                    </Disclosure.Button>
                    <Disclosure.Panel className="mt-2 space-y-2 text-gray-400 text-sm">
                      <p className="flex items-center gap-2">
                        <FaMapMarkerAlt /> Av. Brasília, n°35 - Vila Julieta,
                        Resende - RJ
                      </p>
                      <p className="flex items-center gap-2">
                        <FaEnvelope /> contato@jaautomoveis.com
                      </p>
                      <p className="flex items-center gap-2">
                        <FaPhone /> (24) 99903-7716
                      </p>
                    </Disclosure.Panel>
                  </>
                )}
              </Disclosure>
            </div>

            {/* Desktop */}
            <div className="hidden md:block">
              <h4 className="font-semibold text-lg mb-4">Contato</h4>
              <div className="space-y-2 text-gray-400 text-sm">
                <p className="flex items-center gap-2">
                  <FaMapMarkerAlt /> Av. Brasília, n°35 - Vila Julieta, Resende
                  - RJ
                </p>
                <p className="flex items-center gap-2">
                  <FaEnvelope /> contato@jaautomoveis.com
                </p>
                <p className="flex items-center gap-2">
                  <FaPhone /> (24) 99903-7716
                </p>
              </div>
            </div>
          </div>

          {/* Redes sociais */}
          <div>
            {/* Mobile */}
            <div className="md:hidden">
              <Disclosure>
                {({ open }) => (
                  <>
                    <Disclosure.Button className="flex justify-between items-center w-full text-left font-semibold text-lg py-2 border-b border-gray-800">
                      Siga-nos
                      <ChevronDownIcon
                        className={`w-5 h-5 transition-transform ${
                          open ? "rotate-180" : ""
                        }`}
                      />
                    </Disclosure.Button>
                    <Disclosure.Panel className="mt-3">
                      <div className="flex space-x-3">
                        {socialLinks.map((social) => (
                          <a
                            key={social.href}
                            href={social.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 text-gray-300 transition-all duration-300 hover:scale-110 ${social.color}`}
                          >
                            {social.icon}
                          </a>
                        ))}
                      </div>
                    </Disclosure.Panel>
                  </>
                )}
              </Disclosure>
            </div>

            {/* Desktop */}
            <div className="hidden md:block">
              <h4 className="font-semibold text-lg mb-4">Siga-nos</h4>
              <div className="flex space-x-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.href}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 text-gray-300 transition-all duration-300 hover:scale-110 ${social.color}`}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Linha de direitos */}
        <div className="mt-10 pt-6 border-t border-gray-800 text-center text-gray-500 text-xs">
          <p>
            &copy; {new Date().getFullYear()} JA Automóveis. Todos os direitos
            reservados.
          </p>
          <div className="mt-2 flex justify-center gap-3 text-gray-500">
            <Link
              to="/admin/login"
              className="hover:text-white transition-colors"
            >
              Admin
            </Link>
            <span>•</span>
            <Link
              to="/privacy-policy"
              className="hover:text-white transition-colors"
            >
              Política de Privacidade
            </Link>
            <span>•</span>
            <Link
              to="/terms-of-service"
              className="hover:text-white transition-colors"
            >
              Termos de Serviço
            </Link>
          </div>
        </div>
      </div>

      {/* Efeito decorativo animado */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none bg-gradient-to-r from-red-600 via-transparent to-red-600 animate-[moveBg_15s_linear_infinite]"></div>
    </footer>
  );
};

export default Footer;
