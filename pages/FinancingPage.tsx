
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaWhatsapp } from 'react-icons/fa';

const FinancingPage: React.FC = () => {
  const [amount, setAmount] = useState<number>(50000);
  const [installments, setInstallments] = useState<number>(48);
  const [simulation, setSimulation] = useState<{ monthly: number; total: number } | null>(null);

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple simulation logic (interest rate of 1.5% per month)
    const interestRate = 0.015;
    const monthlyPayment = (amount * interestRate) / (1 - Math.pow(1 + interestRate, -installments));
    setSimulation({
      monthly: monthlyPayment,
      total: monthlyPayment * installments,
    });
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
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Simulação Rápida</h1>
                <p className="text-gray-600 mb-8">Encontre o melhor plano para você.</p>
                
                <form onSubmit={handleSimulate} className="space-y-6">
                  <div>
                    <label htmlFor="amount" className="block text-lg font-medium text-gray-700">
                      Valor a Financiar: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)}
                    </label>
                    <input
                      type="range"
                      id="amount"
                      min="10000"
                      max="250000"
                      step="1000"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-main-red"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="installments" className="block text-lg font-medium text-gray-700">
                      Número de Parcelas: {installments}
                    </label>
                    <input
                      type="range"
                      id="installments"
                      min="12"
                      max="60"
                      step="1"
                      value={installments}
                      onChange={(e) => setInstallments(Number(e.target.value))}
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
                    <h2 className="text-xl font-bold text-comp-dark-blue mb-4">Resultado da Simulação</h2>
                    <p className="text-base text-gray-700">
                      <span className="font-semibold">{installments} parcelas de</span>
                    </p>
                    <p className="text-3xl font-extrabold text-comp-dark-blue my-2">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(simulation.monthly)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Valor total: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(simulation.total)}
                    </p>
                    <p className="text-xs text-gray-400 mt-4">*Esta é apenas uma simulação. As taxas podem variar.</p>
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
                Financie seu carro com facilidade e segurança
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Na JA Automóveis, você encontra condições especiais para realizar o sonho do seu carro novo ou seminovo. Trabalhamos com as principais instituições financeiras do mercado para oferecer parcelas que cabem no seu bolso e um processo rápido, seguro e sem burocracia.
              </p>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Como funciona</h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start"><span className="text-main-red mr-3 mt-1">&#10148;</span><span>Escolha seu veículo no nosso estoque.</span></li>
                    <li className="flex items-start"><span className="text-main-red mr-3 mt-1">&#10148;</span><span>Simule seu financiamento com a nossa equipe.</span></li>
                    <li className="flex items-start"><span className="text-main-red mr-3 mt-1">&#10148;</span><span>Defina a entrada e o número de parcelas.</span></li>
                    <li className="flex items-start"><span className="text-main-red mr-3 mt-1">&#10148;</span><span>Aprove o crédito junto ao banco parceiro.</span></li>
                    <li className="flex items-start"><span className="text-main-red mr-3 mt-1">&#10148;</span><span>Leve seu carro para casa no mesmo dia.</span></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Vantagens de financiar com a gente</h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start"><span className="text-green-500 mr-3 mt-1">&#10004;</span><span>Aprovação de crédito rápida.</span></li>
                    <li className="flex items-start"><span className="text-green-500 mr-3 mt-1">&#10004;</span><span>Opções com taxas competitivas.</span></li>
                    <li className="flex items-start"><span className="text-green-500 mr-3 mt-1">&#10004;</span><span>Planos flexíveis de pagamento.</span></li>
                    <li className="flex items-start"><span className="text-green-500 mr-3 mt-1">&#10004;</span><span>Atendimento personalizado do início ao fim.</span></li>
                    <li className="flex items-start"><span className="text-green-500 mr-3 mt-1">&#10004;</span><span>Segurança e transparência em todo o processo.</span></li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-lg mb-8" role="alert">
                <p><span className="font-bold">💡 Dica:</span> Quanto maior for a entrada, menores serão as parcelas e o valor final do veículo.</p>
              </div>
              
              <div className="text-center border-t border-gray-200 pt-8 mt-8">
                <p className="text-lg text-gray-700 font-semibold mb-4">
                  📞 Fale agora com nossa equipe e descubra como é fácil sair de carro novo hoje mesmo!
                </p>
                <a 
                  href="https://wa.me/5524999037716?text=Olá,%20vi%20a%20página%20de%20financiamento%20e%20gostaria%20de%20mais%20informações." 
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

export default FinancingPage;
