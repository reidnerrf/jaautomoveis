import React from 'react';
import { motion } from 'framer-motion';
import { FiAward, FiEye, FiHeart } from 'react-icons/fi';

const AboutPage: React.FC = () => {

    const values = [
        { icon: <FiHeart size={30} className="text-main-red"/>, title: 'Paixão por Carros', description: 'Somos entusiastas dedicados a entender e servir o mundo automotivo.' },
        { icon: <FiAward size={30} className="text-main-red"/>, title: 'Qualidade & Integridade', description: 'Oferecemos apenas veículos que atendem aos nossos rigorosos padrões de qualidade, sempre com transparência.' },
        { icon: <FiEye size={30} className="text-main-red"/>, title: 'Foco no Cliente', description: 'Nossa maior conquista é a satisfação de quem confia em nosso trabalho.' }
    ];

    return (
        <div className="bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                >
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">Sobre a <span className="text-main-red">JA Automóveis</span></h1>
                    <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">Mais do que vender carros, realizamos sonhos. Conheça nossa jornada.</p>
                </motion.div>

                <div className="mt-16 grid md:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                    >
                        <img src="https://picsum.photos/seed/about-team/800/600" alt="Equipe JA Automóveis" className="rounded-lg shadow-2xl"/>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                    >
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">Nossa História</h2>
                        <p className="text-gray-600 mb-4 leading-relaxed">
                            Fundada em 2005 por dois amigos apaixonados por carros, a JA Automóveis nasceu do desejo de criar uma concessionária diferente. Um lugar onde os clientes se sentissem acolhidos, respeitados e confiantes para fazer uma das compras mais importantes de suas vidas.
                        </p>
                        <p className="text-gray-600 leading-relaxed">
                            Ao longo dos anos, crescemos e solidificamos nossa presença no mercado, mas nunca perdemos nossa essência: o atendimento personalizado e o compromisso real com a qualidade. Hoje, temos orgulho de ter atendido milhares de clientes que se tornaram parte da nossa grande família.
                        </p>
                    </motion.div>
                </div>

                <div className="mt-20">
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">Nossa Missão e Visão</h2>
                    <p className="text-center text-gray-600 max-w-4xl mx-auto leading-relaxed">
                        Nossa missão é ser referência no mercado automotivo, reconhecida pela qualidade de nossos veículos e pela excelência no atendimento, criando relacionamentos duradouros com nossos clientes. Vislumbramos um futuro onde a compra de um carro seja uma experiência fácil, segura e emocionante para todos.
                    </p>
                </div>

                <div className="mt-20">
                     <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Nossos Valores</h2>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {values.map((value, index) => (
                             <motion.div 
                                key={index} 
                                className="text-center p-8 bg-comp-light-gray rounded-lg shadow-lg"
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
        </div>
    );
};

export default AboutPage;