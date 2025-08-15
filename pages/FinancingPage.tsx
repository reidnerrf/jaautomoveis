import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";
import TopButton from '../components/TopButton.tsx';

const FinancingPage: React.FC = () => {
  const [amount, setAmount] = useState(50000);
  const [installments, setInstallments] = useState(48);
  const [rate, setRate] = useState(1.39); // taxa ao mês (%)
  const [simulation, setSimulation] = useState<{ monthly: number; total: number; interest: number } | null>(null);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();

    // Fórmula de juros compostos com PMT (prestação)
    const monthlyRate = rate / 100;
    const monthlyPayment = (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -installments));
    const totalPayment = monthlyPayment * installments;
    const totalInterest = totalPayment - amount;

    setSimulation({
      monthly: monthlyPayment,
      total: totalPayment,
      interest: totalInterest,
    });
  };

  return (
    <div className="bg-gray-50 py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

          {/* Simulador */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white p-8 rounded-2xl shadow-lg sticky top-24"
            >
              <h1 className="text-3xl font-bold text-gray-800 mb-2">💰 Simulação Rápida</h1>
              <p className="text-gray-500 mb-6">Veja quanto ficará seu financiamento.</p>

              <form onSubmit={handleSimulate} className="space-y-6">
                {/* Valor */}
                <div>
                  <label htmlFor="amount" className="block font-medium text-gray-700 mb-1">
                    Valor a Financiar: <span className="font-bold">{formatCurrency(amount)}</span>
                  </label>
                  <input
                    type="range"
                    id="amount"
                    min="10000"
                    max="250000"
                    step="1000"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full accent-red-500"
                  />
                </div>

                {/* Parcelas */}
                <div>
                  <label htmlFor="installments" className="block font-medium text-gray-700 mb-1">
                    Parcelas: <span className="font-bold">{installments}</span>
                  </label>
                  <input
                    type="range"
                    id="installments"
                    min="12"
                    max="72"
                    step="1"
                    value={installments}
                    onChange={(e) => setInstallments(Number(e.target.value))}
                    className="w-full accent-red-500"
                  />
                </div>

                {/* Taxa de juros */}
                <div>
                  <label htmlFor="rate" className="block font-medium text-gray-700 mb-1">
                    Taxa de Juros (% ao mês): <span className="font-bold">{rate.toFixed(2)}%</span>
                  </label>
                  <input
                    type="range"
                    id="rate"
                    min="0.5"
                    max="3"
                    step="0.01"
                    value={rate}
                    onChange={(e) => setRate(Number(e.target.value))}
                    className="w-full accent-red-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-red-500 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-red-600 transition-all"
                >
                  Simular
                </button>
              </form>

              {simulation && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-200 text-center"
                >
                  <h2 className="text-xl font-bold text-blue-900 mb-3">Resultado da Simulação</h2>
                  <p className="text-gray-700">💳 {installments} parcelas de</p>
                  <p className="text-3xl font-extrabold text-blue-800">{formatCurrency(simulation.monthly)}</p>
                  <p className="text-sm text-gray-500 mt-2">Total: {formatCurrency(simulation.total)}</p>
                  <p className="text-sm text-gray-500">Juros Totais: {formatCurrency(simulation.interest)}</p>
                  <p className="text-xs text-gray-400 mt-3">*Valores aproximados, sujeitos à aprovação.</p>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Conteúdo informativo */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="bg-white p-8 rounded-2xl shadow-lg"
            >
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Financie seu carro com segurança
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Trabalhamos com as principais instituições financeiras, oferecendo planos sob medida para o seu orçamento.
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h3 className="text-xl font-bold mb-3">Como funciona</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>➡ Escolha seu veículo</li>
                    <li>➡ Simule seu financiamento</li>
                    <li>➡ Defina entrada e parcelas</li>
                    <li>➡ Aguarde aprovação</li>
                    <li>➡ Leve seu carro no mesmo dia</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3">Vantagens</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>✔ Aprovação rápida</li>
                    <li>✔ Taxas competitivas</li>
                    <li>✔ Planos flexíveis</li>
                    <li>✔ Atendimento personalizado</li>
                  </ul>
                </div>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg mb-8">
                💡 <span className="font-bold">Dica:</span> Quanto maior a entrada, menores as parcelas.
              </div>

              <div className="text-center border-t pt-6">
                <p className="text-lg font-semibold mb-4">📞 Fale com nossa equipe agora mesmo</p>
                <a
                  href="https://wa.me/5524999037716?text=Olá,%20gostaria%20de%20simular%20um%20financiamento"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center bg-green-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-600 shadow-md"
                >
                  <FaWhatsapp className="mr-3" size={24} /> WhatsApp: (24) 99903-7716
                </a>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
      <TopButton />
    </div>
  );
};

export default FinancingPage;
