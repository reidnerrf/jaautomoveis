
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaWhatsapp } from 'react-icons/fa';

const ConsortiumPage: React.FC = () => {
    const [creditAmount, setCreditAmount] = useState<number>(80000);
    const [term, setTerm] = useState<number>(72);
    const [simulation, setSimulation] = useState<{ installment: number } | null>(null);

    const handleSimulate = (e: React.FormEvent) => {
        e.preventDefault();
        // Simple simulation logic (assuming a 15% administration fee)
        const adminFee = 0.15;
        const totalAmount = creditAmount * (1 + adminFee);
        const installmentValue = totalAmount / term;
        setSimulation({ installment: installmentValue });
    };

    return (
        <div className="bg-comp-light-gray py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-x-12 gap-y-8">

                    {/* Left Column: Simulator (Sticky) */}
                    <div className="lg:col-span-2">
                        <div className="sticky top-24">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6 }}
                                className="bg-white p-8 rounded-xl shadow-2xl"
                            >
                                <h1 className="text-3xl font-bold text-gray-800 mb-2">Simulação de Consórcio</h1>
                                <p className="text-gray-600 mb-8">Planeje sua compra sem juros.</p>
                                
                                <form onSubmit={handleSimulate} className="space-y-6">
                                    <div>
                                        <label htmlFor="creditAmount" className="block text-lg font-medium text-gray-700">
                                            Valor do Crédito: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(creditAmount)}
                                        </label>
                                        <input
                                            type="range"
                                            id="creditAmount"
                                            min="30000"
                                            max="300000"
                                            step="1000"
                                            value={creditAmount}
                                            onChange={(e) => setCreditAmount(Number(e.target.value))}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-main-red"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="term" className="block text-lg font-medium text-gray-700">
                                            Prazo em Meses: {term}
                                        </label>
                                        <input
                                            type="range"
                                            id="term"
                                            min="24"
                                            max="84"
                                            step="1"
                                            value={term}
                                            onChange={(e) => setTerm(Number(e.target.value))}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-main-red"
                                        />
                                    </div>

                                    <button type="submit" className="w-full bg-main-red text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-red-700 transition-colors duration-300">
                                        Simular
                                    </button>
                                </form>

                                {simulation && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="mt-8 text-center bg-secondary-blue/10 p-6 rounded-lg border border-secondary-blue"
                                    >
                                        <h2 className="text-2xl font-bold text-comp-dark-blue mb-4">Resultado da Simulação</h2>
                                        <p className="text-lg text-gray-700">
                                            <span className="font-semibold">Parcelas a partir de</span>
                                        </p>
                                        <p className="text-4xl font-extrabold text-comp-dark-blue my-2">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(simulation.installment)}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-4">*Simulação sem considerar fundo de reserva e seguro. Sujeito a formação de grupo.</p>
                                    </motion.div>
                                )}
                            </motion.div>
                        </div>
                    </div>

                    {/* Right Column: Informational Text */}
                    <div className="lg:col-span-3">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            className="bg-white p-8 rounded-xl shadow-2xl"
                        >
                            <h2 className="text-3xl font-bold text-gray-800 mb-4">
                                Consórcio – O jeito inteligente de conquistar seu carro, imóvel ou serviço 🚀
                            </h2>
                            <p className="text-gray-600 mb-6 leading-relaxed">
                                Quer realizar seu sonho sem pagar juros e com total segurança? O consórcio é a solução ideal para quem quer comprar de forma planejada, com parcelas que cabem no bolso e poder de compra à vista na hora da contemplação.
                            </p>
                            <p className="text-gray-600 mb-8 leading-relaxed">
                                Comigo na JA Automóveis, você participa de um grupo, contribui mensalmente e concorre todos os meses à contemplação por sorteio ou lance. Quando chegar a sua vez, recebe a carta de crédito e pode negociar seu bem à vista, garantindo as melhores condições.
                            </p>

                            <div className="grid md:grid-cols-2 gap-8 mb-8">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-4">Por que escolher o consórcio?</h3>
                                    <ul className="space-y-3 text-gray-600">
                                        <li className="flex items-start"><span className="text-green-500 mr-3 mt-1">&#10004;</span><span>Sem juros, apenas taxa de administração</span></li>
                                        <li className="flex items-start"><span className="text-green-500 mr-3 mt-1">&#10004;</span><span>Flexibilidade para escolher valor e prazo</span></li>
                                        <li className="flex items-start"><span className="text-green-500 mr-3 mt-1">&#10004;</span><span>Mais poder de negociação na hora da compra</span></li>
                                        <li className="flex items-start"><span className="text-green-500 mr-3 mt-1">&#10004;</span><span>Disciplina financeira para atingir seus objetivos</span></li>
                                        <li className="flex items-start"><span className="text-green-500 mr-3 mt-1">&#10004;</span><span>Possibilidade de antecipar a contemplação com lances</span></li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-4">Por que fazer com a gente?</h3>
                                    <ul className="space-y-3 text-gray-600">
                                        <li className="flex items-start"><span className="text-main-red mr-3 mt-1">&#10148;</span><span>Atendimento personalizado do início ao fim</span></li>
                                        <li className="flex items-start"><span className="text-main-red mr-3 mt-1">&#10148;</span><span>Simulação sob medida para o seu perfil</span></li>
                                        <li className="flex items-start"><span className="text-main-red mr-3 mt-1">&#10148;</span><span>Orientação para aumentar suas chances de contemplação</span></li>
                                        <li className="flex items-start"><span className="text-main-red mr-3 mt-1">&#10148;</span><span>Total transparência em cada etapa</span></li>
                                        <li className="flex items-start"><span className="text-main-red mr-3 mt-1">&#10148;</span><span>Acompanhamento até a realização do seu sonho</span></li>
                                    </ul>
                                </div>
                            </div>
                            
                            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg mb-8 flex flex-col md:flex-row items-center gap-6 text-center md:text-left" role="alert">
                                <div className="bg-white p-4 rounded-lg shadow-sm flex-shrink-0 w-full md:w-auto">
                                    <img 
                                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRIavnQKOtP3yeN9k5Qh6x-j4grMU0OsBZNhQ&s" 
                                        alt="Rodobens Logo" 
                                        className="h-9 mx-auto md:mx-0 mt-1" 
                                    />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-comp-dark-blue">Parceria de Confiança com a Rodobens</h3>
                                    <p className="mt-2 text-gray-700">
                                        Somos um representante autorizado Rodobens, uma das maiores e mais respeitadas administradoras de consórcio do Brasil. Conte com mais de 60 anos de credibilidade e segurança para planejar a sua conquista.
                                    </p>
                                </div>
                            </div>
                            
                            <div className="text-center border-t border-gray-200 pt-8 mt-8">
                                <p className="text-lg text-gray-700 font-semibold mb-4">
                                    📞 Fale agora com nossa equipe da JA Automóveis e descubra como é fácil conquistar seu carro novo, imóvel ou serviço dos sonhos!
                                </p>
                                <a 
                                  href="https://wa.me/5524999037716?text=Olá,%20vi%20a%20página%20de%20consórcio%20e%20gostaria%20de%20mais%20informações." 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center justify-center bg-green-500 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-green-600 transition-colors duration-300 shadow-md hover:shadow-lg"
                                >
                                  <FaWhatsapp className="mr-3" size={24} />
                                  📲 WhatsApp: (24) 99903-7716
                                </a>
                            </div>
                        </motion.div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ConsortiumPage;