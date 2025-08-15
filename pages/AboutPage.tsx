import React from 'react';
import { motion } from 'framer-motion';
import { FiAward, FiEye, FiHeart } from 'react-icons/fi';
import TopButton from '../components/TopButton.tsx';

const AboutPage: React.FC = () => {

    const values = [
        { 
            icon: <FiHeart size={32} className="text-main-red" />, 
            title: 'Paixão por Automóveis', 
            description: 'Vivemos e respiramos o mundo dos carros, sempre buscando entregar a melhor experiência aos nossos clientes.' 
        },
        { 
            icon: <FiAward size={32} className="text-main-red" />, 
            title: 'Qualidade & Transparência', 
            description: 'Cada veículo é selecionado criteriosamente, garantindo procedência, segurança e honestidade em cada negociação.' 
        },
        { 
            icon: <FiEye size={32} className="text-main-red" />, 
            title: 'Foco no Cliente', 
            description: 'Nosso maior objetivo é ver nossos clientes satisfeitos e confiantes com sua escolha.' 
        }
    ];

    return (
        <div className="bg-gradient-to-b from-white to-gray-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
                
                {/* Cabeçalho */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                >
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">
                        Sobre a <span className="text-main-red">JA Automóveis</span>
                    </h1>
                    <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
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
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">Nossa História</h2>
                        <p className="text-gray-600 mb-4 leading-relaxed">
                            Localizada em Resende - RJ, a <strong>JA Automóveis</strong> atua há anos oferecendo veículos novos, seminovos e usados com qualidade e procedência garantida. 
                            Nosso compromisso vai além da venda: buscamos construir relacionamentos duradouros baseados na confiança e na transparência.
                        </p>
                        <p className="text-gray-600 leading-relaxed">
                            Ao longo do tempo, conquistamos espaço no mercado regional por meio de um atendimento humanizado, 
                            preços justos e um estoque diversificado que atende a todos os perfis e necessidades. 
                            Cada cliente que passa pela JA Automóveis se torna parte da nossa história.
                        </p>
                    </motion.div>
                </div>

                {/* Missão e Visão */}
                <div className="mt-20 bg-white rounded-xl shadow-lg p-10">
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">Missão & Visão</h2>
                    <p className="text-center text-gray-600 max-w-4xl mx-auto leading-relaxed">
                        Nossa missão é oferecer veículos de qualidade com atendimento diferenciado, 
                        tornando a experiência de compra simples, segura e prazerosa. 
                        Visamos ser referência no setor automotivo de Resende e região, 
                        reconhecidos pela credibilidade e excelência em cada negociação.
                    </p>
                </div>

                {/* Valores */}
                <div className="mt-20">
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Nossos Valores</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {values.map((value, index) => (
                            <motion.div 
                                key={index} 
                                className="text-center p-8 bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-2xl transition-shadow duration-300"
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.15 }}
                            >
                                <div className="flex justify-center mb-4">{value.icon}</div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">{value.title}</h3>
                                <p className="text-gray-600">{value.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
            <TopButton />
        </div>
    );
};

export default AboutPage;
