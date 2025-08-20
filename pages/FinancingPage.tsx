import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";

const FinancingPage: React.FC = () => {
  const [amount, setAmount] = useState(50000); // Valor do veículo
  const [downPayment, setDownPayment] = useState(10000); // Entrada
  const [installments, setInstallments] = useState(48);
  const [rate, setRate] = useState(1.39); // taxa ao mês (%)
  const [simulation, setSimulation] = useState<{
    monthly: number;
    total: number;
    interest: number;
    financedAmount: number;
    consortium?: {
      monthly: number;
      total: number;
      savings: number;
    };
  } | null>(null);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();

    const financedAmount = Math.max(0, amount - downPayment);

    // Fórmula de juros compostos com PMT (prestação)
    const monthlyRate = rate / 100;
    const monthlyPayment =
      financedAmount === 0
        ? 0
        : (financedAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -installments));
    const totalPayment = monthlyPayment * installments;
    const totalInterest = Math.max(0, totalPayment - financedAmount);

    // Simulação de consórcio (sem juros, apenas taxa administrativa)
    const consortiumMonthlyRate = 0.5 / 100; // 0.5% taxa administrativa
    const consortiumMonthlyPayment =
      financedAmount === 0
        ? 0
        : (financedAmount * consortiumMonthlyRate) /
          (1 - Math.pow(1 + consortiumMonthlyRate, -installments));
    const consortiumTotalPayment = consortiumMonthlyPayment * installments;
    const consortiumSavings = Math.max(0, totalPayment - consortiumTotalPayment);

    setSimulation({
      monthly: monthlyPayment,
      total: totalPayment,
      interest: totalInterest,
      financedAmount,
      consortium: {
        monthly: consortiumMonthlyPayment,
        total: consortiumTotalPayment,
        savings: consortiumSavings,
      },
    });
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-16 transition-colors">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Simulador */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg sticky top-24"
            >
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                💰 Simulação Rápida
              </h1>
              <p className="text-gray-500 dark:text-gray-300 mb-6">
                Veja quanto ficará seu financiamento.
              </p>

              <form onSubmit={handleSimulate} className="space-y-6">
                {/* Valor */}
                <div>
                  <label
                    htmlFor="amount"
                    className="block font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Valor do Veículo: <span className="font-bold">{formatCurrency(amount)}</span>
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

                {/* Entrada */}
                <div>
                  <label
                    htmlFor="downPayment"
                    className="block font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Entrada: <span className="font-bold">{formatCurrency(downPayment)}</span>
                  </label>
                  <input
                    type="range"
                    id="downPayment"
                    min="0"
                    max={amount}
                    step="1000"
                    value={Math.min(downPayment, amount)}
                    onChange={(e) => setDownPayment(Math.min(Number(e.target.value), amount))}
                    className="w-full accent-red-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Financiado:{" "}
                    <span className="font-semibold">
                      {formatCurrency(Math.max(0, amount - Math.min(downPayment, amount)))}
                    </span>
                  </p>
                </div>

                {/* Parcelas */}
                <div>
                  <label
                    htmlFor="installments"
                    className="block font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
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
                  <label
                    htmlFor="rate"
                    className="block font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
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

              {simulation ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 space-y-6"
                >
                  {/* Financiamento */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-700 text-center">
                    <h2 className="text-xl font-bold text-blue-900 dark:text-blue-300 mb-3">
                      💰 Financiamento
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                      Valor financiado:{" "}
                      <span className="font-semibold">
                        {formatCurrency(simulation.financedAmount)}
                      </span>
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      💳 {installments} parcelas de
                    </p>
                    <p className="text-3xl font-extrabold text-blue-800 dark:text-blue-400">
                      {formatCurrency(simulation.monthly)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Total: {formatCurrency(simulation.total)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Juros Totais: {formatCurrency(simulation.interest)}
                    </p>
                  </div>

                  {/* Consórcio */}
                  {simulation.consortium ? (
                    <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-700 text-center">
                      <h2 className="text-xl font-bold text-green-900 dark:text-green-300 mb-3">
                        🏦 Consórcio
                      </h2>
                      <p className="text-gray-700 dark:text-gray-300">
                        💳 {installments} parcelas de
                      </p>
                      <p className="text-3xl font-extrabold text-green-800 dark:text-green-400">
                        {formatCurrency(simulation.consortium.monthly)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Total: {formatCurrency(simulation.consortium.total)}
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-400 font-semibold">
                        Economia: {formatCurrency(simulation.consortium.savings)}
                      </p>
                    </div>
                  ) : null}

                  <p className="text-xs text-gray-400 text-center">
                    *Valores aproximados, sujeitos à aprovação.
                  </p>
                </motion.div>
              ) : null}
            </motion.div>
          </div>

          {/* Conteúdo informativo */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg"
            >
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
                Financie seu carro com segurança
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                Trabalhamos com as principais instituições financeiras, oferecendo planos sob medida
                para o seu orçamento.
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h3 className="text-xl font-bold mb-3">Como funciona</h3>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                    <li>➡ Escolha seu veículo</li>
                    <li>➡ Simule seu financiamento</li>
                    <li>➡ Defina entrada e parcelas</li>
                    <li>➡ Aguarde aprovação</li>
                    <li>➡ Leve seu carro no mesmo dia</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3">Vantagens</h3>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                    <li>✔ Aprovação rápida</li>
                    <li>✔ Taxas competitivas</li>
                    <li>✔ Planos flexíveis</li>
                    <li>✔ Atendimento personalizado</li>
                  </ul>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded-lg mb-8">
                💡 <span className="font-bold">Dica:</span> Quanto maior a entrada, menores as
                parcelas.
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
    </div>
  );
};

export default FinancingPage;
