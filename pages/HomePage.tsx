
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
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
  FaInstagram,
  FaPhone,
  FaMapMarkerAlt,
  FaClock,
  FaShieldAlt,
  FaUsers,
  FaAward,
  FaStar
} from "react-icons/fa";
import { GoogleReview } from "../types.ts";
import { useAnalytics } from "../utils/analytics.ts";
import { useTheme } from "../contexts/ThemeContext.tsx";

const HomePage: React.FC = () => {
  const { vehicles } = useVehicleData();
  const { trackAction } = useAnalytics('HomePage');
  const { isDarkMode } = useTheme();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, -100]);
  
  const [googleReviews, setGoogleReviews] = useState<GoogleReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch real Google reviews
    const fetchGoogleReviews = async () => {
      try {
        const placeId = 'ChIJBfuB6mR_ngARsAmwbVRKdto';
        // In production, you would fetch from Google Places API
        // For now, using the provided mock data with some enhancements
        const reviews: GoogleReview[] = [
          {
            id: "gr1",
            reviewerName: "Leonardo Brun",
            comment: "Muito bom atendimento e carros de qualidade. Recomendo!",
            avatarUrl: "https://lh3.googleusercontent.com/a-/ALV-UjVgFyCp7VifEFdD58IDmL6AEwGPhit7yro9so_tf10z9Z1Q_XnG=w45-h45-p-rp-mo-br100",
            rating: 5,
            timeAgo: "3 meses atrás",
          },
          {
            id: "gr2",
            reviewerName: "Lael Teixeira",
            comment: "Vendedor Victor é um destaque a parte muito educado e fiel nas vendas sempre arruma um desconto para carro à vista. Excelente experiência de compra!",
            avatarUrl: "https://lh3.googleusercontent.com/a-/ALV-UjV1jmP4px3ZYNejnbp08ISsfFkdjLuMQLyKN7no7vGIW2JZy6s=w45-h45-p-rp-mo-ba4-br100",
            rating: 5,
            timeAgo: "um ano atrás",
          },
          {
            id: "gr3",
            reviewerName: "Eliel Rocha",
            comment: "Recomendo !!! Excelente atendimento, preços justos e carros bem conservados.",
            avatarUrl: "https://lh3.googleusercontent.com/a-/ALV-UjUUMPXBjfFNzqCWPOFU9-UkvrnW5nVwsHHkWfDl-AMfBPTWAR374Q=w45-h45-p-rp-mo-ba3-br100",
            rating: 5,
            timeAgo: "3 anos atrás",
          },
          {
            id: "gr4",
            reviewerName: "Daniel Francisco",
            comment: "Gostei do bom atendimento e da transparência na negociação. Voltaria novamente.",
            avatarUrl: "https://lh3.googleusercontent.com/a/ACg8ocKrjVlDRdK82wzZOblEh0QlZC_LdIh450-0PTFhKt7yKH_pBw=w45-h45-p-rp-mo-br100",
            rating: 5,
            timeAgo: "4 anos atrás",
          },
          {
            id: "gr5",
            reviewerName: "Rosemere Marciano",
            comment: "Loja muito boa com ótimos preços e qualidade no atendimento. Equipe profissional e atenciosa. Recomendo.",
            avatarUrl: "https://lh3.googleusercontent.com/a-/ALV-UjXe5kWvbPzd50VSrtTQLES5iPnCT128S0kmYdb6ONgzcSCqrSyOyQ=w45-h45-p-rp-mo-br100",
            rating: 5,
            timeAgo: "5 anos atrás",
          },
        ];
        setGoogleReviews(reviews);
      } catch (error) {
        console.error('Error fetching Google reviews:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGoogleReviews();
  }, []);

  const services = [
    {
      icon: <FaCar size={32} />,
      title: "Venda",
      description: "Os melhores veículos novos e seminovos do mercado com garantia de procedência.",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      icon: <FaHandshake size={32} />,
      title: "Compra",
      description: "Compramos seu carro com avaliação justa, rápida e sem burocracia.",
      gradient: "from-green-500 to-green-600",
    },
    {
      icon: <FaTags size={32} />,
      title: "Troca",
      description: "Use seu carro atual como entrada para um modelo mais novo.",
      gradient: "from-purple-500 to-purple-600",
    },
    {
      icon: <FaMoneyBillWave size={32} />,
      title: "Financiamento",
      description: "As melhores taxas do mercado para você realizar seu sonho.",
      gradient: "from-orange-500 to-orange-600",
    },
  ];

  const stats = [
    { icon: <FaUsers size={24} />, number: "500+", label: "Clientes Satisfeitos" },
    { icon: <FaCar size={24} />, number: "1000+", label: "Veículos Vendidos" },
    { icon: <FaAward size={24} />, number: "15+", label: "Anos de Experiência" },
    { icon: <FaStar size={24} />, number: "4.8", label: "Avaliação Google" },
  ];

  const handleSocialClick = (platform: string) => {
    trackAction(`${platform}_click`, 'social_media');
  };

  return (
    <div className="w-full bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <motion.video
          style={{ y }}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="/assets/homevideo.mp4" type="video/mp4" />
        </motion.video>
        
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80 z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-red-900/30 to-transparent z-10"></div>

        <motion.div
          className="relative z-20 text-center px-6 max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mb-8"
          >
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tight">
              <span className="block text-white drop-shadow-2xl">Seu Próximo</span>
              <span className="block bg-gradient-to-r from-red-400 via-red-500 to-rose-500 bg-clip-text text-transparent">
                Carro Está Aqui
              </span>
            </h1>
            <p className="text-xl sm:text-2xl md:text-3xl text-gray-200/90 font-light max-w-4xl mx-auto leading-relaxed">
              Na <span className="font-bold text-red-400">JA Automóveis</span>, ofertas exclusivas, 
              financiamento facilitado e garantia total de procedência.
            </p>
          </motion.div>
          
          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Link to="/inventory">
              <motion.button
                className="group relative overflow-hidden px-10 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-lg rounded-full shadow-2xl border-2 border-red-500/30 transition-all duration-300"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="relative z-10 flex items-center gap-3">
                  <FaCar />
                  Ver Estoque Completo
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-rose-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </motion.button>
            </Link>
            
            <a
              href="https://api.whatsapp.com/send?phone=5524999037716&text=Ol%C3%A1%2C%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleSocialClick('whatsapp')}
            >
              <motion.button
                className="group relative overflow-hidden px-10 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold text-lg rounded-full shadow-2xl border-2 border-green-500/30 transition-all duration-300"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="relative z-10 flex items-center gap-3">
                  <FaWhatsapp />
                  Fale no WhatsApp
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </motion.button>
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center p-6 backdrop-blur-md bg-white/10 rounded-2xl border border-white/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1, duration: 0.6 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-red-400 flex justify-center mb-2">
                  {stat.icon}
                </div>
                <div className="text-3xl font-black text-white mb-1">{stat.number}</div>
                <div className="text-gray-300 text-sm font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2"></div>
          </div>
        </motion.div>
      </section>

      {/* DESTAQUES */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-black text-gray-900 dark:text-white mb-4">
              Destaques da <span className="text-red-500">Semana</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-rose-500 mx-auto rounded-full mb-6"></div>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Selecionamos os melhores veículos com condições especiais para você
            </p>
          </motion.div>
          
          {vehicles.length > 0 ? (
            <VehicleCarousel vehicles={vehicles.slice(0, 6)} />
          ) : (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
            </div>
          )}
          
          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Link to="/inventory">
              <motion.button
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-4 px-10 rounded-full shadow-xl text-lg transition-all duration-300"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                Ver Estoque Completo
              </motion.button>
            </Link>
            
            <div className="mt-6 text-gray-600 dark:text-gray-400">
              <p>
                Também disponível em{" "}
                <a
                  href="https://www.olx.com.br/perfil/jaautomoveis35-55485ae0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-500 font-semibold hover:text-red-600 transition-colors duration-200 underline"
                >
                  OLX
                </a>{" "}
                e{" "}
                <a
                  href="https://www.icarros.com.br/ache/estoque.jsp?id=2183242"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-500 font-semibold hover:text-red-600 transition-colors duration-200 underline"
                >
                  iCarros
                </a>
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SOBRE */}
      <section className="py-24 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="container mx-auto px-8 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                <img
                  src="/assets/homepageabout.webp"
                  alt="JA Automóveis"
                  className="w-full h-[500px] object-cover transform hover:scale-105 transition duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              <div className="absolute -bottom-6 -right-6 bg-red-500 text-white p-6 rounded-2xl shadow-xl">
                <div className="text-3xl font-bold">15+</div>
                <div className="text-sm font-medium">Anos de Confiança</div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-5xl font-black text-gray-900 dark:text-white mb-6">
                  Sobre a{" "}
                  <span className="bg-gradient-to-r from-red-500 to-rose-500 bg-clip-text text-transparent">
                    JA Automóveis
                  </span>
                </h2>
                <div className="w-20 h-1 bg-gradient-to-r from-red-500 to-rose-500 rounded-full mb-8"></div>
              </div>
              
              <div className="space-y-6 text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                <p>
                  Somos uma <strong className="text-gray-900 dark:text-white">agência de veículos premium</strong> que oferece 
                  uma experiência completa em serviços automotivos. Com mais de 15 anos no mercado, 
                  nos especializamos na venda e troca de veículos novos, seminovos e usados.
                </p>
                <p>
                  Nossa missão é proporcionar <strong className="text-gray-900 dark:text-white">transparência, qualidade e confiança</strong> 
                  em cada negociação. Todos os nossos veículos passam por rigorosa inspeção técnica 
                  e oferecemos garantia de procedência.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-6 my-8">
                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
                  <FaShieldAlt className="text-red-500 text-2xl mb-3" />
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">Garantia Total</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Todos os veículos com garantia e procedência verificada
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
                  <FaUsers className="text-red-500 text-2xl mb-3" />
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">Atendimento Premium</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Equipe especializada e atendimento personalizado
                  </p>
                </div>
              </div>
              
              <Link
                to="/about"
                className="inline-flex items-center gap-2 text-red-500 font-bold text-lg hover:text-red-600 transition-colors duration-200"
              >
                Conheça Nossa História
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  →
                </motion.span>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SERVIÇOS */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 transition-colors duration-300">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-black text-gray-900 dark:text-white mb-4">
              Nossos <span className="text-red-500">Serviços</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-rose-500 mx-auto rounded-full mb-6"></div>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Soluções completas para todas as suas necessidades automotivas
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                className="group relative"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
              >
                <div className="relative h-full p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                  
                  <div className="relative z-10">
                    <div className={`w-16 h-16 bg-gradient-to-br ${service.gradient} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      {service.icon}
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-red-500 transition-colors duration-300">
                      {service.title}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                  
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section className="py-24 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-black text-gray-900 dark:text-white mb-4">
              O que dizem nossos{" "}
              <span className="bg-gradient-to-r from-red-500 to-rose-500 bg-clip-text text-transparent">
                Clientes
              </span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-rose-500 mx-auto rounded-full mb-6"></div>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Avaliações reais diretamente do Google
            </p>
          </motion.div>
          
          {!isLoading && <GoogleReviewsCarousel reviews={googleReviews} />}
          
          <motion.div
            className="mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
          >
            <GoogleReviewSummary
              rating={4.8}
              reviewCount={28}
              reviewsPageUrl="https://www.google.com/maps/place/JA+Autom%C3%B3veis"
            />
          </motion.div>
        </div>
      </section>

      {/* LOCALIZAÇÃO */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-black text-gray-900 dark:text-white mb-4">
              Venha nos <span className="text-red-500">Visitar</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-rose-500 mx-auto rounded-full mb-6"></div>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Estamos prontos para receber você de braços abertos
            </p>
          </motion.div>
          
          <div className="grid lg:grid-cols-3 gap-12 max-w-7xl mx-auto">
            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="h-96 lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3686.0969984913757!2d-44.46753692566539!3d-22.47133702206713!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9e7f64ea81fb05%3A0xda764a546db009b0!2sJA%20Autom%C3%B3veis!5e0!3m2!1sen!2sbr!4v1722368940567!5m2!1sen!2sbr"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  title="Localização JA Automóveis"
                ></iframe>
              </div>
            </motion.div>
            
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-xl">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Informações de Contato</h3>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center text-white flex-shrink-0">
                      <FaMapMarkerAlt size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white mb-1">Endereço</h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        Rua Principal, 123<br />
                        Centro, Cidade - Estado
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center text-white flex-shrink-0">
                      <FaPhone size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white mb-1">Telefone</h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        (24) 99903-7716
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white flex-shrink-0">
                      <FaClock size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white mb-1">Horário</h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        Seg-Sex: 8h às 18h<br />
                        Sáb: 8h às 16h
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CONTATO */}
      <section className="py-24 bg-gradient-to-r from-red-600 via-red-500 to-rose-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-black mb-6">
              Pronto para encontrar seu carro ideal?
            </h2>
            <p className="text-2xl mb-12 text-red-100 max-w-3xl mx-auto">
              Entre em contato conosco e faça parte da família JA Automóveis!
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-8 max-w-2xl mx-auto">
              <a
                href="https://api.whatsapp.com/send?phone=5524999037716"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleSocialClick('whatsapp')}
              >
                <motion.button
                  className="group relative overflow-hidden bg-green-600 hover:bg-green-500 py-4 px-10 rounded-full font-bold text-lg shadow-2xl transition-all duration-300 w-full sm:w-auto"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    <FaWhatsapp size={24} />
                    WhatsApp
                  </span>
                  <div className="absolute inset-0 bg-green-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </motion.button>
              </a>
              
              <a
                href="https://www.instagram.com/_jaautomoveis/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleSocialClick('instagram')}
              >
                <motion.button
                  className="group relative overflow-hidden bg-pink-600 hover:bg-pink-500 py-4 px-10 rounded-full font-bold text-lg shadow-2xl transition-all duration-300 w-full sm:w-auto"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    <FaInstagram size={24} />
                    Instagram
                  </span>
                  <div className="absolute inset-0 bg-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </motion.button>
              </a>
            </div>
          </motion.div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full"></div>
          <div className="absolute top-32 right-20 w-16 h-16 bg-white rounded-full"></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white rounded-full"></div>
          <div className="absolute bottom-32 right-1/3 w-24 h-24 bg-white rounded-full"></div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
