
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useVehicleData } from '../hooks/useVehicleData.tsx';
import VehicleCarousel from '../components/VehicleCarousel.tsx';
import GoogleReviewsCarousel from '../components/GoogleReviewsCarousel.tsx';
import GoogleReviewSummary from '../components/GoogleReviewSummary.tsx';
import { FaCar, FaMoneyBillWave, FaHandshake, FaTags } from 'react-icons/fa';
import { GoogleReview } from '../types.ts';

// Mock data for Google Reviews, updated with more realistic avatars.
const googleReviews: GoogleReview[] = [
    {
        id: 'gr1',
        reviewerName: 'Leonardo Brun',
        comment: 'Muito bom.',
        avatarUrl: 'https://lh3.googleusercontent.com/a-/ALV-UjVgFyCp7VifEFdD58IDmL6AEwGPhit7yro9so_tf10z9Z1Q_XnG=w45-h45-p-rp-mo-br100',
        rating: 5,
        timeAgo: '3 meses atrás',
    },
    {
        id: 'gr2',
        reviewerName: 'Lael Teixeira',
        comment: 'Vendedor Victor é um destaque a parte muito educado e fiel nas vendas sempre arruma um desconto para carro avista',
        avatarUrl: 'https://lh3.googleusercontent.com/a-/ALV-UjV1jmP4px3ZYNejnbp08ISsfFkdjLuMQLyKN7no7vGIW2JZy6s=w45-h45-p-rp-mo-ba4-br100',
        rating: 5,
        timeAgo: 'um ano atrás',
    },
    {
        id: 'gr3',
        reviewerName: 'Eliel Rocha',
        comment: 'Recomendo !!! Excelente atendimento',
        avatarUrl: 'https://lh3.googleusercontent.com/a-/ALV-UjUUMPXBjfFNzqCWPOFU9-UkvrnW5nVwsHHkWfDl-AMfBPTWAR374Q=w45-h45-p-rp-mo-ba3-br100',
        rating: 5,
        timeAgo: '3 anos atrás',
    },
    {
        id: 'gr4',
        reviewerName: 'Daniel Francisco',
        comment: 'Gostei bom atendimento',
        avatarUrl: 'https://lh3.googleusercontent.com/a/ACg8ocKrjVlDRdK82wzZOblEh0QlZC_LdIh450-0PTFhKt7yKH_pBw=w45-h45-p-rp-mo-br100',
        rating: 5,
        timeAgo: '4 anos atrás',
    },
    {
        id: 'gr5',
        reviewerName: 'Rosemere Marciano',
        comment: 'Loja muito boa com ótimos preços e qualidade no atendimento.. recomendo.',
        avatarUrl: 'https://lh3.googleusercontent.com/a-/ALV-UjXe5kWvbPzd50VSrtTQLES5iPnCT128S0kmYdb6ONgzcSCqrSyOyQ=w45-h45-p-rp-mo-br100',
        rating: 5,
        timeAgo: '5 anos atrás',
    },
];


const HomePage: React.FC = () => {
    const { vehicles } = useVehicleData();

    const services = [
      { icon: <FaCar size={40} className="text-main-red" />, title: 'Venda', description: 'Os melhores veículos novos e seminovos do mercado.' },
      { icon: <FaHandshake size={40} className="text-main-red" />, title: 'Compra', description: 'Compramos seu carro com avaliação justa e rápida.' },
      { icon: <FaTags size={40} className="text-main-red" />, title: 'Troca', description: 'Use seu carro atual como entrada para um novo.' },
      { icon: <FaMoneyBillWave size={40} className="text-main-red" />, title: 'Financiamento', description: 'As melhores taxas para você realizar seu sonho.' },
    ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative h-[70vh] text-white flex items-center justify-center overflow-hidden">
        <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute z-0 w-auto min-w-full min-h-full max-w-none"
            style={{ objectFit: 'cover'}}
          >
            <source src="/assets/homevideo.mp4" type="video/mp4" />
            Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-black/60"></div>
        <motion.div 
            className="relative z-10 text-center p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">O Carro dos Seus Sonhos Espera por Você</h1>
          <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto">Qualidade, confiança e os melhores negócios você encontra aqui na JA Automóveis.</p>
          <Link to="/inventory">
            <motion.button 
                className="mt-8 bg-main-red text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-red-700 transition-colors duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
              Ver Estoque
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* Featured Inventory */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Estoque em Destaque</h2>
          <p className="text-center text-gray-600 mb-10">Confira nossas novidades e ofertas especiais.</p>
          <VehicleCarousel vehicles={vehicles.slice(0, 5)} />
          <div className="text-center mt-12">
            <Link to="/inventory">
              <motion.button 
                  className="bg-secondary-blue text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-comp-dark-blue transition-colors duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
              >
                Veja nosso estoque completo
              </motion.button>
            </Link>
            <p className="mt-4 text-gray-600">
              Acesse também nossas lojas em{' '}
              <a 
                href="https://www.olx.com.br/perfil/jaautomoveis35-55485ae0" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-main-red font-semibold hover:underline"
              >
                OLX
              </a>{' '}
              e{' '}
              <a 
                href="https://www.icarros.com.br/ache/estoque.jsp?id=2183242" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-main-red font-semibold hover:underline"
              >
                iCarros
              </a>.
            </p>
          </div>
        </div>
      </section>

      {/* About Us Snippet */}
      <section className="py-16 bg-comp-light-gray">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.7 }}
              >
                  <img src="https://picsum.photos/seed/dealership/800/600" alt="JA Automóveis Dealership" className="rounded-lg shadow-xl" />
              </motion.div>
              <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.7 }}
              >
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">Sobre a <span className="text-main-red">JA Automóveis</span></h2>
                  <p className="text-gray-600 mb-4">A JA Automóveis é uma agência especializada na venda e troca de veículos novos, seminovos e usados, oferecendo variedade, qualidade e procedência garantida. Também trabalhamos com consórcios, proporcionando opções econômicas e planejadas para adquirir seu carro..</p>
                  <p className="text-gray-600 mb-6">Nossos valores são a integridade, o foco no cliente e a paixão por carros. Somos dedicados a ajudar você a encontrar o veículo perfeito que atenda às suas necessidades e desejos.</p>
                  <Link to="/about" className="text-main-red font-semibold hover:underline">Saiba mais sobre nossa história &rarr;</Link>
              </motion.div>
          </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Nossos Serviços</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {services.map((service, index) => (
                    <motion.div
                        key={service.title}
                        className="text-center p-6 bg-comp-light-gray rounded-lg shadow-md"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                        <div className="flex justify-center mb-4">{service.icon}</div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{service.title}</h3>
                        <p className="text-gray-600">{service.description}</p>
                    </motion.div>
                ))}
            </div>
        </div>
      </section>

      {/* Testimonials Section */}
       <section className="py-12 bg-comp-light-gray">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">O que Nossos Clientes Dizem</h2>
          <p className="text-center text-gray-600 mb-6">Avaliações reais de clientes satisfeitos no Google.</p>
          <div className="flex flex-col items-center gap-8">
            <GoogleReviewsCarousel reviews={googleReviews} />
            <GoogleReviewSummary 
              rating={4.6} 
              reviewCount={28} 
              reviewsPageUrl="https://www.google.com/maps/place/JA+Autom%C3%B3veis/@-22.471337,-44.4675369,17z/data=!4m8!3m7!1s0x9e7f64ea81fb05:0xda764a546db009b0!8m2!3d-22.471342!4d-44.464962!9m1!1b1!16s%2Fg%2F11h_4scynm?entry=ttu"
            />
          </div>
        </div>
      </section>
      
      {/* Location Section */}
      <section className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">Nossa Localização</h2>
              <p className="text-center text-gray-600 mb-10">Venha nos visitar e tomar um café!</p>
              <motion.div 
                  className="w-full h-96 rounded-lg overflow-hidden shadow-2xl"
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.7 }}
              >
                   <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3686.0969984913757!2d-44.46753692566539!3d-22.47133702206713!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9e7f64ea81fb05%3A0xda764a546db009b0!2sJA%20Autom%C3%B3veis!5e0!3m2!1sen!2sbr!4v1722368940567!5m2!1sen!2sbr"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen={false}
                      loading="lazy"
                      title="Google Maps Location"
                  ></iframe>
              </motion.div>
          </div>
      </section>

    </div>
  );
};

export default HomePage;
