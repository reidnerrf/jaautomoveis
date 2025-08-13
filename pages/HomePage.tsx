
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useVehicleData } from '../hooks/useVehicleData.tsx';
import VehicleCarousel from '../components/VehicleCarousel.tsx';
import { FaCar, FaMoneyBillWave, FaHandshake, FaTags } from 'react-icons/fa';

const HomePage: React.FC = () => {
    const { vehicles } = useVehicleData();

    const services = [
      { icon: <FaCar size={40} color="#E30613" />, title: 'Venda', description: 'Os melhores veículos novos e seminovos do mercado.' },
      { icon: <FaHandshake size={40} color="#E30613" />, title: 'Compra', description: 'Compramos seu carro com avaliação justa e rápida.' },
      { icon: <FaTags size={40} color="#E30613" />, title: 'Troca', description: 'Use seu carro atual como entrada para um novo.' },
      { icon: <FaMoneyBillWave size={40} color="#E30613" />, title: 'Financiamento', description: 'As melhores taxas para você realizar seu sonho.' },
    ];
    
    const testimonials = [
        { name: 'João D.', text: 'Atendimento excelente! Encontrei o carro perfeito para minha família. Recomendo muito a JA Automóveis.', avatar: 'https://picsum.photos/seed/avatar1/100/100' },
        { name: 'Maria S.', text: 'O processo de financiamento foi muito simples e transparente. Estou muito satisfeita com a minha compra.', avatar: 'https://picsum.photos/seed/avatar2/100/100' },
        { name: 'Carlos P.', text: 'Vendi meu carro para eles e o valor foi ótimo. Equipe de confiança e profissional.', avatar: 'https://picsum.photos/seed/avatar3/100/100' },
    ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative h-[70vh] bg-cover bg-center text-white flex items-center justify-center" style={{ backgroundImage: "url('https://cdn.prod.website-files.com/63bdbbd2c764e88f730a8673/65b159b6107d11732115486f_melhores%20carros%20para%20fam%C3%ADlia%20(2).webp')" }}>
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
          <VehicleCarousel vehicles={vehicles.slice(0, 8)} />
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

      {/* Testimonials */}
      <section className="py-16" style={{backgroundColor: '#2427C3'}}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-center text-white mb-12">O Que Nossos Clientes Dizem</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {testimonials.map((testimonial, index) => (
                       <motion.div 
                        key={index} 
                        className="bg-white p-6 rounded-lg shadow-lg"
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 0.5, delay: index * 0.15 }}
                       >
                           <p className="text-gray-600 italic mb-4">"{testimonial.text}"</p>
                           <div className="flex items-center">
                               <img src={testimonial.avatar} alt={testimonial.name} className="w-12 h-12 rounded-full mr-4" />
                               <div>
                                   <p className="font-bold text-gray-800">{testimonial.name}</p>
                               </div>
                           </div>
                       </motion.div>
                  ))}
              </div>
          </div>
      </section>
      
      {/* Contact and Location */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Entre em Contato</h2>
            <form className="space-y-4">
              <input type="text" placeholder="Seu Nome" className="w-full p-3 border border-gray-300 rounded-lg"/>
              <input type="email" placeholder="Seu Email" className="w-full p-3 border border-gray-300 rounded-lg"/>
              <textarea placeholder="Sua Mensagem" rows={4} className="w-full p-3 border border-gray-300 rounded-lg"></textarea>
              <button type="submit" className="w-full bg-main-red text-white font-bold py-3 px-6 rounded-lg hover:bg-red-700 transition-colors">Enviar Mensagem</button>
            </form>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Nossa Localização</h2>
            <div className="h-96 rounded-lg overflow-hidden shadow-xl">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.197576594255!2d-46.65653638487473!3d-23.56133936754323!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce59c8da0aa315%3A0x266854b778b32b2f!2sAv.%20Paulista%2C%20S%C3%A3o%20Paulo%20-%20SP%2C%20Brazil!5e0!3m2!1sen!2sus!4v1618855675841!5m2!1sen!2sus"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                title="Google Maps Location"
              ></iframe>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;