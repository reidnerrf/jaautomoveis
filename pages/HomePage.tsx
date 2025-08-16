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
} from "react-icons/fa";
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
      icon: <FaCar size={28} />,
      title: "Venda",
      description: "Os melhores veículos novos e seminovos do mercado.",
    },
    {
      icon: <FaHandshake size={28} />,
      title: "Compra",
      description: "Compramos seu carro com avaliação justa e rápida.",
    },
    {
      icon: <FaTags size={28} />,
      title: "Troca",
      description: "Use seu carro atual como entrada para um novo.",
    },
    {
      icon: <FaMoneyBillWave size={28} />,
      title: "Financiamento",
      description: "As melhores taxas para você realizar seu sonho.",
    },
  ];

  return (
    <div className="w-full">
      {/* HERO */}
      <section className="relative min-h-[80vh] md:min-h-[88vh] text-white flex items-center justify-center overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute z-0 w-auto min-w-full min-h-full max-w-none object-cover"
        >
          <source src="/assets/homevideo.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80 backdrop-blur-sm"></div>

        <motion.div
          className="relative z-10 text-center px-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 tracking-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
            Seu Próximo Carro Está Aqui na {" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-rose-400">JA Automóveis</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-200/90 max-w-3xl mx-auto mb-8">
            Ofertas exclusivas, financiamento facilitado e garantia de
            procedência.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/inventory">
              <motion.button
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-red-600 hover:bg-red-700 rounded-full text-white font-semibold shadow-lg ring-1 ring-white/10"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Ver Estoque
              </motion.button>
            </Link>
            <a
              href="https://api.whatsapp.com/send?phone=5524999037716&text=Ol%C3%A1%2C%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es"
              target="_blank"
              rel="noopener noreferrer"
            >
              <motion.button
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-green-600 hover:bg-green-700 rounded-full text-white font-semibold shadow-lg ring-1 ring-white/10"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaWhatsapp /> Fale no WhatsApp
              </motion.button>
            </a>
          </div>
        </motion.div>
      </section>

      {/* DESTAQUES */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.h2
            className="text-3xl font-bold text-center text-gray-800 mb-2"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            Destaques da Semana
          </motion.h2>
          <div className="h-1 w-20 bg-red-500 mx-auto rounded mb-8"></div>
          {vehicles.length > 0 ? (
            <VehicleCarousel vehicles={vehicles.slice(0, 5)} />
          ) : (
            <p className="text-center text-gray-500">Carregando veículos...</p>
          )}
          <div className="text-center mt-10">
            <Link to="/inventory">
              <motion.button
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Ver Estoque Completo
              </motion.button>
            </Link>
          </div>
          <div className="mt-4 text-center">
            <p className="text-gray-600">
              Acesse também nossas lojas em {" "}
              <a
                href="https://www.olx.com.br/perfil/jaautomoveis35-55485ae0"
                target="_blank"
                rel="noopener noreferrer"
                className="text-main-red font-semibold hover:underline transition-colors duration-200"
              >
                OLX
              </a>{" "}
              e {" "}
              <a
                href="https://www.icarros.com.br/ache/estoque.jsp?id=2183242"
                target="_blank"
                rel="noopener noreferrer"
                className="text-main-red font-semibold hover:underline transition-colors duration-200"
              >
                iCarros
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      {/* SOBRE */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-8 max-w-6xl grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <img
              src="/assets/homepageabout.webp"
              alt="JA Automóveis"
              className="shadow-xl rounded-2xl hover:scale-105 transition duration-500 object-cover max-h-[450px] w-full"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="pr-6"
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Sobre a <span className="text-red-500">JA Automóveis</span>
            </h2>
            <p className="text-gray-600 mb-4">
              Somos uma agência de veículos que oferece uma ampla gama de
              serviços automotivos. Com a venda e troca de veículos novos,
              seminovos e usados, além da venda de consórcios, nós nos
              destacamos por proporcionar aos clientes a comodidade de encontrar
              tudo em um só lugar.
            </p>
            <p className="text-gray-600 mb-6">
              Com um atendimento de qualidade, transparência e veículos
              devidamente inspecionados, a JA Automóveis busca oferecer a você
              uma experiência satisfatória na busca pelo carro ideal.
            </p>
            <Link
              to="/about"
              className="text-red-500 font-semibold hover:underline"
            >
              Saiba mais &rarr;
            </Link>
          </motion.div>
        </div>
      </section>

      {/* SERVIÇOS */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Nossos Serviços
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service) => (
              <motion.div
                key={service.title}
                className="text-center p-6 bg-gray-50 rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex justify-center mb-4">
                  <div className="p-4 rounded-full bg-gradient-to-tr from-red-500 to-red-400 text-white shadow-lg">
                    {service.icon}
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-2">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-2 text-gray-800">
            O que dizem nossos clientes
          </h2>
          <p className="text-center text-gray-600 mb-6">
            Avaliações reais do Google
          </p>
          <GoogleReviewsCarousel reviews={googleReviews} />
          <div className="mt-8">
            <GoogleReviewSummary
              rating={4.6}
              reviewCount={28}
              reviewsPageUrl="https://www.google.com/maps/place/JA+Autom%C3%B3veis"
            />
          </div>
        </div>
      </section>

      {/* LOCALIZAÇÃO */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4 text-gray-800">
            Venha nos visitar
          </h2>
          <p className="text-center text-gray-600 mb-10">
            Estamos prontos para te receber
          </p>
          <motion.div
            className="w-full h-96 rounded-2xl overflow-hidden shadow-2xl"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3686.0969984913757!2d-44.46753692566539!3d-22.47133702206713!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9e7f64ea81fb05%3A0xda764a546db009b0!2sJA%20Autom%C3%B3veis!5e0!3m2!1sen!2sbr!4v1722368940567!5m2!1sen!2sbr"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              title="Localização JA Automóveis"
            ></iframe>
          </motion.div>
        </div>
      </section>

      {/* CONTATO */}
      <section className="py-20 bg-gradient-to-r from-red-600 to-red-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Entre em Contato</h2>
          <p className="mb-6">
            Estamos aqui para ajudar você a encontrar o carro perfeito!
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <a
              href="https://api.whatsapp.com/send?phone=5524999037716"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-600 hover:bg-green-700 py-3 px-6 rounded-full font-bold flex items-center gap-2"
            >
              <FaWhatsapp /> WhatsApp
            </a>
            <Link
              to="/contact"
              className="bg-white text-red-600 hover:bg-gray-100 py-3 px-6 rounded-full font-bold"
            >
              Formulário de Contato
            </Link>
          </div>
        </div>
      </section>

      {/* Removed TopButton for cleaner UI */}
    </div>
  );
};

export default HomePage;
