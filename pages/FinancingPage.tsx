import React, { useState } from 'react';
import { motion } from 'framer-motion';

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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-2xl"
        >
          <h1 className="text-4xl font-bold text-center text-gray-800 mb-2">Simulação de Financiamento</h1>
          <p className="text-center text-gray-600 mb-8">Encontre o melhor plano para comprar seu carro novo.</p>
          
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
              <h2 className="text-2xl font-bold text-comp-dark-blue mb-4">Resultado da Simulação</h2>
              <p className="text-lg text-gray-700">
                <span className="font-semibold">{installments} parcelas de</span>
              </p>
              <p className="text-4xl font-extrabold text-comp-dark-blue my-2">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(simulation.monthly)}
              </p>
              <p className="text-sm text-gray-500">
                Valor total financiado: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(simulation.total)}
              </p>
              <p className="text-xs text-gray-400 mt-4">*Esta é apenas uma simulação. As taxas podem variar.</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default FinancingPage;