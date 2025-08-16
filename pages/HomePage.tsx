import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useVehicleData } from "../hooks/useVehicleData.tsx";
import VehicleCarousel from "../components/VehicleCarousel.tsx";
import GoogleReviewsCarousel from "../components/GoogleReviewsCarousel.tsx";
import GoogleReviewSummary from "../components/GoogleReviewSummary.tsx";
import {
  FaCar,
  FaMoneyBillWave,
  FaHandshake,
  FaTags,
  FaWhatsapp,
  FaStar,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
} from "react-icons/fa";
import TopButton from "../components/TopButton.tsx";
import { GoogleReview } from "../types.ts";

// Mock Google Reviews
const googleReviews: GoogleReview[] = [
  {
    id: "gr1",
    reviewerName: "Leonardo Brun",
    comment: "Muito bom.",
    avatarUrl:
      "https://lh3.googleusercontent.com/a-/ALV-UjVgFyCp7VifEFdD58IDmL6AEwGPhit7yro9so_tf10z9Z1Q_XnG=w45-h45-p-rp-mo-br100",
    rating: 5,
    timeAgo: "3 meses atrás",
  },
  {
    id: "gr2",
    reviewerName: "Lael Teixeira",
    comment:
      "Vendedor Victor é um destaque a parte muito educado e fiel nas vendas sempre arruma um desconto para carro avista",
    avatarUrl:
      "https://lh3.googleusercontent.com/a-/ALV-UjV1jmP4px3ZYNejnbp08ISsfFkdjLuMQLyKN7no7vGIW2JZy6s=w45-h45-p-rp-mo-ba4-br100",
    rating: 5,
    timeAgo: "um ano atrás",
  },
  {
    id: "gr3",
    reviewerName: "Eliel Rocha",
    comment: "Recomendo !!! Excelente atendimento",
    avatarUrl:
      "https://lh3.googleusercontent.com/a-/ALV-UjUUMPXBjfFNzqCWPOFU9-UkvrnW5nVwsHHkWfDl-AMfBPTWAR374Q=w45-h45-p-rp-mo-ba3-br100",
    rating: 5,
    timeAgo: "3 anos atrás",
  },
  {
    id: "gr4",
    reviewerName: "Daniel Francisco",
    comment: "Gostei bom atendimento",
    avatarUrl:
      "https://lh3.googleusercontent.com/a/ACg8ocKrjVlDRdK82wzZOblEh0QlZC_LdIh450-0PTFhKt7yKH_pBw=w45-h45-p-rp-mo-br100",
    rating: 5,
    timeAgo: "4 anos atrás",
  },
  {
    id: "gr5",
    reviewerName: "Rosemere Marciano",
    comment:
      "Loja muito boa com ótimos preços e qualidade no atendimento.. recomendo.",
    avatarUrl:
      "https://lh3.googleusercontent.com/a-/ALV-UjXe5kWvbPzd50VSrtTQLES5iPnCT128S0kmYdb6ONgzcSCqrSyOyQ=w45-h45-p-rp-mo-br100",
    rating: 5,
    timeAgo: "5 anos atrás",
  },
];

const HomePage: React.FC = () => {
  const { vehicles } = useVehicleData();

  const services = [
    {
      icon: <FaCar size={32} />,
      title: "Venda",
      description: "Os melhores veículos novos e seminovos do mercado com garantia de procedência.",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: <FaHandshake size={32} />,
      title: "Compra",
      description: "Compramos seu carro com avaliação justa e rápida, pagamento à vista.",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: <FaTags size={32} />,
      title: "Troca",
      description: "Use seu carro atual como entrada para um novo com as melhores condições.",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: <FaMoneyBillWave size={32} />,
      title: "Financiamento",
      description: "As melhores taxas para você realizar seu sonho com facilidade.",
      gradient: "from-orange-500 to-red-500",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="w-full">
      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/assets/homevideo.mp4" type="video/mp4" />
        </video>
        
        {/* Overlay com gradiente moderno */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-primary-900/40"></div>
        
        {/* Elementos decorativos */}
        <div className="absolute inset-0 bg-gradient-radial from-primary-500/10 via-transparent to-transparent"></div>
        
        {/* Conteúdo principal */}
        <motion.div
          className="relative z-10 text-center px-4 max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="mb-8">
            <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-6 leading-tight">
              Seu Próximo Carro Está Aqui na{" "}
              <span className="gradient-text bg-gradient-to-r from-primary-400 via-primary-500 to-secondary-400">
                JA Automóveis
              </span>
            </h1>
          </motion.div>
          
          <motion.div variants={itemVariants} className="mb-12">
            <p className="text-xl md:text-2xl text-neutral-200 max-w-3xl mx-auto leading-relaxed font-light">
              Ofertas exclusivas, financiamento facilitado e garantia de procedência. 
              Encontre o carro dos seus sonhos com a confiança de quem entende do assunto.
            </p>
          </motion.div>
          
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <Link to="/inventory">
              <motion.button
                className="group px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 rounded-2xl text-white font-semibold shadow-large hover:shadow-glow transition-all duration-300 hover-lift"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="flex items-center gap-3">
                  <FaCar className="group-hover:animate-bounce-soft" />
                  Ver Estoque Completo
                </span>
              </motion.button>
            </Link>
            
            <a
              href="https://api.whatsapp.com/send?phone=5524999037716&text=Ol%C3%A1%2C%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es"
              target="_blank"
              rel="noopener noreferrer"
            >
              <motion.button
                className="group px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-2xl text-white font-semibold shadow-large hover:shadow-glow transition-all duration-300 hover-lift"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="flex items-center gap-3">
                  <FaWhatsapp className="group-hover:animate-bounce-soft" />
                  Fale no WhatsApp
                </span>
              </motion.button>
            </a>
          </motion.div>
        </motion.div>
        
        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-bounce"></div>
          </div>
        </motion.div>
      </section>

      {/* DESTAQUES SECTION */}
      <section className="py-24 bg-surface-primary">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold text-neutral-800 mb-4">
              Destaques da Semana
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 mx-auto rounded-full"></div>
            <p className="text-xl text-neutral-600 mt-6 max-w-2xl mx-auto">
              Veículos selecionados com as melhores condições e preços do mercado
            </p>
          </motion.div>
          
          {vehicles.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <VehicleCarousel vehicles={vehicles.slice(0, 5)} />
            </motion.div>
          ) : (
            <div className="text-center py-12">
              <div className="loading-shimmer w-64 h-8 mx-auto rounded-lg"></div>
            </div>
          )}
          
          <motion.div 
            className="text-center mt-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <Link to="/inventory">
              <motion.button
                className="px-8 py-4 bg-gradient-to-r from-secondary-600 to-secondary-700 hover:from-secondary-700 hover:to-secondary-800 rounded-2xl text-white font-semibold shadow-large hover:shadow-glow-blue transition-all duration-300 hover-lift"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Ver Estoque Completo
              </motion.button>
            </Link>
            
            <div className="mt-8 text-neutral-600">
              <p className="text-lg">
                Acesse também nossas lojas em{" "}
                <a
                  href="https://www.olx.com.br/perfil/jaautomoveis35-55485ae0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 font-semibold hover:underline transition-colors duration-200"
                >
                  OLX
                </a>{" "}
                e{" "}
                <a
                  href="https://www.icarros.com.br/ache/estoque.jsp?id=2183242"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 font-semibold hover:underline transition-colors duration-200"
                >
                  iCarros
                </a>
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SOBRE SECTION */}
      <section className="py-24 bg-gradient-to-br from-surface-secondary to-surface-tertiary">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="/assets/homepageabout.webp"
                  alt="JA Automóveis"
                  className="w-full h-[500px] object-cover hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              
              {/* Elementos decorativos */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full opacity-20 blur-xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-accent-500 to-primary-500 rounded-full opacity-20 blur-xl"></div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-4xl md:text-5xl font-display font-bold text-neutral-800 mb-6">
                  Sobre a{" "}
                  <span className="gradient-text bg-gradient-to-r from-primary-500 to-secondary-500">
                    JA Automóveis
                  </span>
                </h2>
                <div className="w-20 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"></div>
              </div>
              
              <div className="space-y-6 text-lg text-neutral-600 leading-relaxed">
                <p>
                  Somos uma agência de veículos que oferece uma ampla gama de
                  serviços automotivos. Com a venda e troca de veículos novos,
                  seminovos e usados, além da venda de consórcios, nós nos
                  destacamos por proporcionar aos clientes a comodidade de encontrar
                  tudo em um só lugar.
                </p>
                <p>
                  Com um atendimento de qualidade, transparência e veículos
                  devidamente inspecionados, a JA Automóveis busca oferecer a você
                  uma experiência satisfatória na busca pelo carro ideal.
                </p>
              </div>
              
              <Link
                to="/about"
                className="inline-flex items-center gap-3 text-primary-600 font-semibold hover:text-primary-700 transition-colors duration-200 group"
              >
                Saiba mais sobre nós
                <span className="group-hover:translate-x-2 transition-transform duration-200">→</span>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SERVIÇOS SECTION */}
      <section className="py-24 bg-surface-primary">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold text-neutral-800 mb-4">
              Nossos Serviços
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 mx-auto rounded-full"></div>
            <p className="text-xl text-neutral-600 mt-6 max-w-2xl mx-auto">
              Soluções completas para todas as suas necessidades automotivas
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                className="group relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="bg-white rounded-3xl p-8 shadow-soft hover:shadow-large transition-all duration-300 hover-lift border border-neutral-100">
                  <div className="flex justify-center mb-6">
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${service.gradient} text-white shadow-medium group-hover:shadow-glow transition-all duration-300`}>
                      {service.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-neutral-800 text-center">{service.title}</h3>
                  <p className="text-neutral-600 text-center leading-relaxed">{service.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS SECTION */}
      <section className="py-24 bg-gradient-to-br from-surface-secondary to-surface-tertiary">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold text-neutral-800 mb-4">
              O que dizem nossos clientes
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 mx-auto rounded-full"></div>
            <p className="text-xl text-neutral-600 mt-6">
              Avaliações reais do Google - Nossa maior satisfação é a sua
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <GoogleReviewsCarousel reviews={googleReviews} />
          </motion.div>
          
          <motion.div
            className="mt-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <GoogleReviewSummary
              rating={4.6}
              reviewCount={28}
              reviewsPageUrl="https://www.google.com/maps/place/JA+Autom%C3%B3veis"
            />
          </motion.div>
        </div>
      </section>

      {/* LOCALIZAÇÃO SECTION */}
      <section className="py-24 bg-surface-primary">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold text-neutral-800 mb-4">
              Venha nos visitar
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 mx-auto rounded-full"></div>
            <p className="text-xl text-neutral-600 mt-6">
              Estamos prontos para te receber e mostrar nossos veículos
            </p>
          </motion.div>
          
          <motion.div
            className="w-full h-96 rounded-3xl overflow-hidden shadow-2xl"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3686.0969984913757!2d-44.46753692566539!3d-22.47133702206713!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9e7f64ea81fb05%3A0xda764a546db009b0!2sJA%20Autom%C3%B3veis!5e0!3m2!1sen!2sbr!4v1722368940567!5m2!1sen!2sbr"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              title="Localização JA Automóveis"
              className="rounded-3xl"
            ></iframe>
          </motion.div>
        </div>
      </section>

      {/* CONTATO SECTION */}
      <section className="py-24 bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-700 text-white relative overflow-hidden">
        {/* Elementos decorativos */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Entre em Contato
            </h2>
            <p className="text-xl mb-12 max-w-2xl mx-auto opacity-90">
              Estamos aqui para ajudar você a encontrar o carro perfeito! 
              Entre em contato conosco e descubra as melhores ofertas.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <a
                href="https://api.whatsapp.com/send?phone=5524999037716"
                target="_blank"
                rel="noopener noreferrer"
                className="group px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-2xl font-semibold shadow-large hover:shadow-glow transition-all duration-300 hover-lift"
              >
                <span className="flex items-center gap-3">
                  <FaWhatsapp className="group-hover:animate-bounce-soft" />
                  WhatsApp
                </span>
              </a>
              
              <Link
                to="/contact"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 rounded-2xl font-semibold transition-all duration-300 hover-lift"
              >
                Formulário de Contato
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <TopButton />
    </div>
  );
};

export default HomePage;
