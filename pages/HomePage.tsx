
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useVehicleData } from '../hooks/useVehicleData.tsx';
import VehicleCarousel from '../components/VehicleCarousel.tsx';
import { FaCar, FaMoneyBillWave, FaHandshake, FaTags } from 'react-icons/fa';

const HomePage: React.FC = () => {
    const { vehicles } = useVehicleData();

    const services = [
      { icon: <FaCar size={40} className="text-main-red" />, title: 'Venda', description: 'Os melhores veículos novos e seminovos do mercado.' },
      { icon: <FaHandshake size={40} className="text-main-red" />, title: 'Compra', description: 'Compramos seu carro com avaliação justa e rápida.' },
      { icon: <FaTags size={40} className="text-main-red" />, title: 'Troca', description: 'Use seu carro atual como entrada para um novo.' },
      { icon: <FaMoneyBillWave size={40} className="text-main-red" />, title: 'Financiamento', description: 'As melhores taxas para você realizar seu sonho.' },
    ];
    
    const testimonials = [
        { name: 'João D.', text: 'Atendimento excelente! Encontrei o carro perfeito para minha família. Recomendo muito a JA Automóveis.', avatar: 'https://picsum.photos/seed/avatar1/100/100' },
        { name: 'Maria S.', text: 'O processo de financiamento foi muito simples e transparente. Estou muito satisfeita com a minha compra.', avatar: 'https://picsum.photos/seed/avatar2/100/100' },
        { name: 'Carlos P.', text: 'Vendi meu carro para eles e o valor foi ótimo. Equipe de confiança e profissional.', avatar: 'https://picsum.photos/seed/avatar3/100/100' },
    ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative h-[75vh] text-white flex items-center justify-center overflow-hidden">
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
                  <p className="text-gray-600 mb-4">Fundada em 2005, a JA Automóveis construiu uma reputação sólida baseada na confiança e qualidade. Nossa missão é oferecer aos nossos clientes uma experiência de compra excepcional para seu carro novo ou seminovo, com transparência e atendimento personalizado.</p>
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
       <section className="py-16 bg-comp-light-gray">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">O que Nossos Clientes Dizem</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div 
                key={testimonial.name} 
                className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center text-center"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
              >
                  <img src={testimonial.avatar} alt={testimonial.name} className="w-20 h-20 rounded-full mb-4 border-4 border-main-red"/>
                  <p className="text-gray-600 italic mb-4">"{testimonial.text}"</p>
                  <h4 className="font-bold text-gray-800">{testimonial.name}</h4>
              </motion.div>
            ))}
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
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3688.381313621415!2d-44.45339242566738!3d-22.41443832049811!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9d0b005e8a75a7%3A0x64426549a1d4b684!2sAv.%20Bras%C3%ADlia%2C%2035%20-%20Vila%20Julieta%2C%20Resende%20-%20RJ%2C%2027521-060!5e0!3m2!1sen!2sbr!4v1721329388338!5m2!1sen!2sbr"
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