import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";
import TopButton from '../components/TopButton.tsx';

const ConsortiumPage: React.FC = () => {
  const [creditAmount, setCreditAmount] = useState(80000);
  const [term, setTerm] = useState(72);
  const [adminFee, setAdminFee] = useState(15); // % taxa de administração
  const [reserveFund, setReserveFund] = useState(2); // % fundo de reserva
  const [insurance, setInsurance] = useState(0.3); // % seguro por mês
  const [simulation, setSimulation] = useState<{
    installment: number;
    total: number;
    extra: number;
  } | null>(null);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();

    const adminTotal = (adminFee / 100) * creditAmount;
    const reserveTotal = (reserveFund / 100) * creditAmount;
    const insuranceTotal = ((insurance / 100) * creditAmount) * (term / 12); // seguro anual

    const totalCost = creditAmount + adminTotal + reserveTotal + insuranceTotal;
    const installmentValue = totalCost / term;
    const extraCost = totalCost - creditAmount;

    setSimulation({
      installment: installmentValue,
      total: totalCost,
      extra: extraCost,
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
              <h1 className="text-3xl font-bold text-gray-800 mb-2">📊 Simulação de Consórcio</h1>
              <p className="text-gray-500 mb-6">Planeje sua compra sem juros bancários.</p>

              <form onSubmit={handleSimulate} className="space-y-6">
                {/* Valor de crédito */}
                <div>
                  <label className="block font-medium text-gray-700 mb-1">
                    Valor do Crédito: <span className="font-bold">{formatCurrency(creditAmount)}</span>
                  </label>
                  <input
                    type="range"
                    min="30000"
                    max="300000"
                    step="1000"
                    value={creditAmount}
                    onChange={(e) => setCreditAmount(Number(e.target.value))}
                    className="w-full accent-red-500"
                  />
                </div>

                {/* Prazo */}
                <div>
                  <label className="block font-medium text-gray-700 mb-1">
                    Prazo (meses): <span className="font-bold">{term}</span>
                  </label>
                  <input
                    type="range"
                    min="24"
                    max="84"
                    step="1"
                    value={term}
                    onChange={(e) => setTerm(Number(e.target.value))}
                    className="w-full accent-red-500"
                  />
                </div>

                {/* Taxa de administração */}
                <div>
                  <label className="block font-medium text-gray-700 mb-1">
                    Taxa de Administração (%): <span className="font-bold">{adminFee.toFixed(2)}%</span>
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="20"
                    step="0.1"
                    value={adminFee}
                    onChange={(e) => setAdminFee(Number(e.target.value))}
                    className="w-full accent-red-500"
                  />
                </div>

                {/* Fundo de reserva */}
                <div>
                  <label className="block font-medium text-gray-700 mb-1">
                    Fundo de Reserva (%): <span className="font-bold">{reserveFund.toFixed(2)}%</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.1"
                    value={reserveFund}
                    onChange={(e) => setReserveFund(Number(e.target.value))}
                    className="w-full accent-red-500"
                  />
                </div>

                {/* Seguro */}
                <div>
                  <label className="block font-medium text-gray-700 mb-1">
                    Seguro Anual (%): <span className="font-bold">{insurance.toFixed(2)}%</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.05"
                    value={insurance}
                    onChange={(e) => setInsurance(Number(e.target.value))}
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
                  <p className="text-gray-700">💳 Parcelas de:</p>
                  <p className="text-3xl font-extrabold text-blue-800">{formatCurrency(simulation.installment)}</p>
                  <p className="text-sm text-gray-500 mt-2">Total a pagar: {formatCurrency(simulation.total)}</p>
                  <p className="text-sm text-gray-500">Custo adicional: {formatCurrency(simulation.extra)}</p>
                  <p className="text-xs text-gray-400 mt-3">*Valores aproximados. Sujeitos à formação de grupo.</p>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Texto informativo */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="bg-white p-8 rounded-2xl shadow-lg"
            >
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Consórcio – Conquiste seu sonho sem pagar juros 🚀
              </h2>
              <p className="text-gray-600 mb-6">
                O consórcio é a forma planejada de adquirir bens de alto valor, sem juros bancários e com taxas reduzidas.
              </p>
              <p className="text-gray-600 mb-8">
                Na JA Automóveis, você participa de um grupo, contribui mensalmente e pode ser contemplado por sorteio ou lance, recebendo sua carta de crédito para comprar à vista.
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h3 className="text-xl font-bold mb-3">Vantagens do consórcio</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>✔ Sem juros, só taxa de administração</li>
                    <li>✔ Flexibilidade de prazo e valor</li>
                    <li>✔ Poder de compra à vista</li>
                    <li>✔ Possibilidade de antecipar com lances</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3">Por que fazer conosco</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>➡ Atendimento personalizado</li>
                    <li>➡ Simulação sob medida</li>
                    <li>➡ Orientação para contemplação</li>
                    <li>➡ Transparência total</li>
                  </ul>
                </div>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg mb-8 flex items-start gap-4">
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRIavnQKOtP3yeN9k5Qh6x-j4grMU0OsBZNhQ&s"
                  alt="Rodobens Logo"
                  className="h-10 mt-1"
                />
                <div>
                  <h3 className="text-lg font-bold text-blue-900">Parceria com a Rodobens</h3>
                  <p className="text-gray-700 text-sm">
                    Representante autorizado Rodobens, garantindo credibilidade e segurança para sua compra.
                  </p>
                </div>
              </div>

              <div className="text-center border-t pt-6">
                <p className="text-lg font-semibold mb-4">📞 Fale com nossa equipe agora mesmo</p>
                <a
                  href="https://wa.me/5524999037716?text=Olá,%20gostaria%20de%20simular%20um%20consórcio"
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

export default ConsortiumPage;
