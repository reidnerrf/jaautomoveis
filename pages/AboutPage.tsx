import React from "react";
import { motion } from "framer-motion";
import {
  FiAward,
  FiEye,
  FiHeart,
  FiUsers,
  FiShield,
  FiTrendingUp,
  FiClock,
  FiMapPin,
} from "react-icons/fi";
import { FaCar, FaHandshake, FaStar } from "react-icons/fa";
import SEOHead from "../components/SEOHead.tsx";
import { generatePageSEO } from "../utils/seo";

const AboutPage: React.FC = () => {
  const values = [
    {
      icon: <FiHeart size={32} className="text-main-red" />,
      title: "Paixão por Automóveis",
      description:
        "Vivemos e respiramos o mundo dos carros, sempre buscando entregar a melhor experiência aos nossos clientes.",
    },
    {
      icon: <FiAward size={32} className="text-main-red" />,
      title: "Qualidade & Transparência",
      description:
        "Cada veículo é selecionado criteriosamente, garantindo procedência, segurança e honestidade em cada negociação.",
    },
    {
      icon: <FiEye size={32} className="text-main-red" />,
      title: "Foco no Cliente",
      description:
        "Nosso maior objetivo é ver nossos clientes satisfeitos e confiantes com sua escolha.",
    },
  ];

  const stats = [
    {
      icon: <FaCar size={24} />,
      number: "500+",
      label: "Veículos Vendidos",
      color: "text-blue-600",
    },
    {
      icon: <FiUsers size={24} />,
      number: "300+",
      label: "Clientes Satisfeitos",
      color: "text-green-600",
    },
    {
      icon: <FiClock size={24} />,
      number: "5+",
      label: "Anos de Experiência",
      color: "text-purple-600",
    },
    {
      icon: <FaStar size={24} />,
      number: "4.9",
      label: "Avaliação Média",
      color: "text-yellow-600",
    },
  ];

  const services = [
    {
      icon: <FaCar size={24} className="text-blue-600" />,
      title: "Venda de Veículos",
      description: "Novos, seminovos e usados com procedência garantida",
    },
    {
      icon: <FaHandshake size={24} className="text-green-600" />,
      title: "Consignação",
      description: "Venda seu veículo com segurança e transparência",
    },
    {
      icon: <FiTrendingUp size={24} className="text-purple-600" />,
      title: "Financiamento",
      description: "Parcelamos seu sonho em condições especiais",
    },
    {
      icon: <FiShield size={24} className="text-red-600" />,
      title: "Garantia",
      description: "Todos os veículos passam por rigorosa inspeção",
    },
  ];

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <SEOHead
        title={generatePageSEO("about").title}
        description={generatePageSEO("about").description}
        keywords={generatePageSEO("about").keywords}
      >
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Início",
                item: typeof window !== "undefined" ? `${window.location.origin}/` : "/",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Sobre Nós",
                item: typeof window !== "undefined" ? `${window.location.origin}/about` : "/about",
              },
            ],
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "Os veículos têm garantia?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Sim. Todos os veículos passam por inspeção e são entregues com garantia de procedência.",
                },
              },
              {
                "@type": "Question",
                name: "Vocês fazem avaliação do meu carro na troca?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Sim. Avaliamos seu veículo com transparência e usamos como entrada na negociação.",
                },
              },
              {
                "@type": "Question",
                name: "Trabalham com financiamento?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Sim. Temos parceria com bancos e apresentamos as melhores condições conforme seu perfil.",
                },
              },
            ],
          })}
        </script>
      </SEOHead>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Cabeçalho */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white">
            Sobre a <span className="text-main-red">JA Automóveis</span>
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Tradição, confiança e qualidade no mercado automotivo de Resende e região.
          </p>
        </motion.div>

        {/* História */}
        <div className="mt-16 grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <img
              src="/assets/sobrenos.jpg"
              alt="Equipe JA Automóveis"
              className="rounded-2xl shadow-xl border border-gray-200"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
              Nossa História
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
              Localizada em Resende - RJ, a <strong>JA Automóveis</strong> atua há anos oferecendo
              veículos novos, seminovos e usados com qualidade e procedência garantida. Nosso
              compromisso vai além da venda: buscamos construir relacionamentos duradouros baseados
              na confiança e na transparência.
            </p>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Ao longo do tempo, conquistamos espaço no mercado regional por meio de um atendimento
              humanizado, preços justos e um estoque diversificado que atende a todos os perfis e
              necessidades. Cada cliente que passa pela JA Automóveis se torna parte da nossa
              história.
            </p>
          </motion.div>
        </div>

        {/* Missão e Visão */}
        <div className="mt-20 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-10">
          <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-4">
            Missão & Visão
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Nossa missão é oferecer veículos de qualidade com atendimento diferenciado, tornando a
            experiência de compra simples, segura e prazerosa. Visamos ser referência no setor
            automotivo de Resende e região, reconhecidos pela credibilidade e excelência em cada
            negociação.
          </p>
        </div>

        {/* Estatísticas */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-12">
            Números que Comprovam Nossa Excelência
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:scale-105"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className={`flex justify-center mb-3 ${stat.color}`}>{stat.icon}</div>
                <div className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
                  {stat.number}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Serviços */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-12">
            Nossos Serviços
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:scale-105"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="flex justify-center mb-4">{service.icon}</div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                  {service.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Valores */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-12">
            Nossos Valores
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title || index}
                className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 hover:shadow-2xl transition-shadow duration-300"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
              >
                <div className="flex justify-center mb-4">{value.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA WhatsApp */}
        <div className="mt-16 text-center">
          <a
            href="https://wa.me/5524999037716?text=Olá,%20gostaria%20de%20saber%20mais%20sobre%20a%20JA%20Automóveis"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-colors"
          >
            <span role="img" aria-label="whatsapp">💬</span> Falar com um especialista
          </a>
        </div>

        {/* Localização */}
        <div className="mt-20 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-10">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <FiMapPin size={32} className="text-main-red" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
              Nossa Localização
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Estamos localizados em Av. Brasília, n°35 - Vila Julieta, Resende - RJ, prontos para
              te atender com excelência.
            </p>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-gray-700 dark:text-gray-300 font-medium">
                <FiMapPin className="inline mr-2" />
                Av. Brasília, n°35 - Vila Julieta, Resende - RJ
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Venha nos conhecer pessoalmente!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
