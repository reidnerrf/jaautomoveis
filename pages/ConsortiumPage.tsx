import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";
import SEOHead from "../components/SEOHead.tsx";

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
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();

    const adminTotal = (adminFee / 100) * creditAmount;
    const reserveTotal = (reserveFund / 100) * creditAmount;
    const insuranceTotal = (insurance / 100) * creditAmount * (term / 12); // seguro anual

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
    <div className="bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-16 transition-colors">
      <SEOHead
        title="Consórcio | JA Automóveis"
        description="Planeje sua compra com consórcio: sem juros bancários, taxas reduzidas e segurança."
        keywords="consórcio, carta de crédito, sem juros, taxas administrativas, JA Automóveis"
      >
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Início", item: typeof window !== "undefined" ? `${window.location.origin}/` : "" },
              { "@type": "ListItem", position: 2, name: "Consórcio", item: typeof window !== "undefined" ? `${window.location.origin}/consortium` : "" },
            ],
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "Como funciona o consórcio?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text:
                    "Um grupo de pessoas contribui mensalmente para formar crédito e, por sorteio ou lance, é contemplado com a carta para compra do bem.",
                },
              },
              {
                "@type": "Question",
                name: "Tem juros?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text:
                    "Não há juros como no financiamento; há taxa de administração e possíveis seguros conforme o plano.",
                },
              },
            ],
          })}
        </script>
      </SEOHead>
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
                📊 Simulação de Consórcio
              </h1>
              <p className="text-gray-500 dark:text-gray-300 mb-6">
                Planeje sua compra sem juros bancários.
              </p>

              <form onSubmit={handleSimulate} className="space-y-6">
                {/* Valor de crédito */}
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Valor do Crédito:{" "}
                    <span className="font-bold">{formatCurrency(creditAmount)}</span>
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
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Taxa de Administração (%):{" "}
                    <span className="font-bold">{adminFee.toFixed(2)}%</span>
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
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Fundo de Reserva (%):{" "}
                    <span className="font-bold">{reserveFund.toFixed(2)}%</span>
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
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
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

              {simulation ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-700 text-center"
                >
                  <h2 className="text-xl font-bold text-blue-900 dark:text-blue-300 mb-3">
                    Resultado da Simulação
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300">💳 Parcelas de:</p>
                  <p className="text-3xl font-extrabold text-blue-800 dark:text-blue-400">
                    {formatCurrency(simulation.installment)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Total a pagar: {formatCurrency(simulation.total)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Custo adicional: {formatCurrency(simulation.extra)}
                  </p>
                  <p className="text-xs text-gray-400 mt-3">
                    *Valores aproximados. Sujeitos à formação de grupo.
                  </p>
                </motion.div>
              ) : null}
            </motion.div>
          </div>

          {/* Texto informativo */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg"
            >
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
                Consórcio – Conquiste seu sonho sem pagar juros 🚀
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                O consórcio é a forma planejada de adquirir bens de alto valor, sem juros bancários
                e com taxas reduzidas.
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                Na JA Automóveis, você participa de um grupo, contribui mensalmente e pode ser
                contemplado por sorteio ou lance, recebendo sua carta de crédito para comprar à
                vista.
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h3 className="text-xl font-bold mb-3">Vantagens do consórcio</h3>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                    <li>✔ Sem juros, só taxa de administração</li>
                    <li>✔ Flexibilidade de prazo e valor</li>
                    <li>✔ Poder de compra à vista</li>
                    <li>✔ Possibilidade de antecipar com lances</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3">Por que fazer conosco</h3>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                    <li>➡ Atendimento personalizado</li>
                    <li>➡ Simulação sob medida</li>
                    <li>➡ Orientação para contemplação</li>
                    <li>➡ Transparência total</li>
                  </ul>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-6 rounded-lg mb-8 flex items-start gap-4">
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRIavnQKOtP3yeN9k5Qh6x-j4grMU0OsBZNhQ&s"
                  alt="Rodobens Logo"
                  className="h-10 mt-1"
                />
                <div>
                  <h3 className="text-lg font-bold text-blue-900 dark:text-blue-300">
                    Parceria com a Rodobens
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Representante autorizado Rodobens, garantindo credibilidade e segurança para sua
                    compra.
                  </p>
                </div>
              </div>

              {/* Exemplos de cartas contempladas */}
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/40">
                  <p className="text-sm text-gray-500">Crédito</p>
                  <p className="text-xl font-extrabold text-gray-900 dark:text-white">R$ 60.000</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Prazo: 60 meses</p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/40">
                  <p className="text-sm text-gray-500">Crédito</p>
                  <p className="text-xl font-extrabold text-gray-900 dark:text-white">R$ 90.000</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Prazo: 72 meses</p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/40">
                  <p className="text-sm text-gray-500">Crédito</p>
                  <p className="text-xl font-extrabold text-gray-900 dark:text-white">R$ 120.000</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Prazo: 84 meses</p>
                </div>
              </div>

              {/* Timeline do processo */}
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-3">Como funciona o processo</h3>
                <ol className="relative border-s border-gray-200 dark:border-gray-700 ms-4">
                  <li className="mb-6 ms-6">
                    <span className="absolute -start-3 flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full ring-8 ring-white dark:ring-gray-900 dark:bg-blue-900">1</span>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Adesão ao grupo</h4>
                    <p className="text-gray-600 dark:text-gray-300">Escolha a carta e entre no grupo com parcelas acessíveis.</p>
                  </li>
                  <li className="mb-6 ms-6">
                    <span className="absolute -start-3 flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full ring-8 ring-white dark:ring-gray-900 dark:bg-blue-900">2</span>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Sorteio ou lance</h4>
                    <p className="text-gray-600 dark:text-gray-300">Você pode ser contemplado por sorteio mensal ou oferecer um lance.</p>
                  </li>
                  <li className="mb-6 ms-6">
                    <span className="absolute -start-3 flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full ring-8 ring-white dark:ring-gray-900 dark:bg-blue-900">3</span>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Contemplação</h4>
                    <p className="text-gray-600 dark:text-gray-300">Ao ser contemplado, a carta fica disponível para compra do veículo.</p>
                  </li>
                  <li className="ms-6">
                    <span className="absolute -start-3 flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full ring-8 ring-white dark:ring-gray-900 dark:bg-blue-900">4</span>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Aquisição</h4>
                    <p className="text-gray-600 dark:text-gray-300">Utilize a carta para adquirir seu carro com nossa assessoria completa.</p>
                  </li>
                </ol>
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

        {/* Cross-links section */}
        <div className="mt-12 bg-gray-50 dark:bg-gray-900/40 rounded-xl p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Outras opções de financiamento
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <a
              href="/consignado"
              className="block p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-600 transition-colors"
            >
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Crédito Consignado</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Para servidores públicos e aposentados. Taxas reduzidas com desconto em folha.
              </p>
            </a>
            <a
              href="/financing"
              className="block p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-600 transition-colors"
            >
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Financiamento Tradicional</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Para quem não tem desconto em folha. Taxas competitivas e aprovação rápida.
              </p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsortiumPage;
