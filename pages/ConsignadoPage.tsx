import React from "react";
import { motion } from "framer-motion";
import { FaCheckCircle, FaUserShield, FaRegClock, FaPercentage, FaWhatsapp } from "react-icons/fa";
import SEOHead from "../components/SEOHead.tsx";

const ConsignadoPage: React.FC = () => {
  const [state, setState] = React.useState<{ amount: number; term: number; rate: number; income: number }>({
    amount: 10000,
    term: 48,
    rate: 1.8,
    income: 3500,
  });
  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-16 transition-colors">
      <SEOHead
        title="Consignado | JA Automóveis"
        description="Entenda o crédito consignado: taxas mais baixas, desconto em folha e contratação simples para servidores, aposentados e pensionistas."
        keywords="consignado, crédito consignado, desconto em folha, taxas baixas, JA Automóveis"
      >
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "Quem pode contratar o crédito consignado?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Servidores públicos, aposentados e pensionistas do INSS e trabalhadores CLT de empresas conveniadas."
                }
              },
              {
                "@type": "Question",
                "name": "Quais as vantagens do consignado?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Taxas menores, parcelas fixas descontadas em folha e prazos mais longos com contratação simples."
                }
              },
              {
                "@type": "Question",
                "name": "Posso quitar antecipadamente?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Sim. A quitação antecipada reduz os juros proporcionais ao período restante, conforme regras da instituição."
                }
              },
              {
                "@type": "Question",
                "name": "Como funciona o desconto em folha?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "A parcela é descontada automaticamente do benefício/salário, respeitando a margem consignável definida em lei."
                }
              }
            ]
          })}
        </script>
      </SEOHead>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-4">
            Crédito <span className="text-red-500">Consignado</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Uma forma prática e econômica de obter crédito com parcelas descontadas diretamente da folha de pagamento.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* O que é */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">O que é o Consignado?</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              O crédito consignado é um empréstimo em que as parcelas são descontadas
              automaticamente do salário, benefício do INSS ou holerite. Por ter menor risco de inadimplência,
              as taxas costumam ser mais baixas quando comparadas a outras modalidades.
            </p>
          </motion.div>

          {/* Vantagens */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Vantagens</h2>
            <ul className="space-y-3 text-gray-600 dark:text-gray-300">
              <li className="flex items-start gap-3"><FaPercentage className="text-red-500 mt-1" /> Taxas geralmente menores do que empréstimos tradicionais.</li>
              <li className="flex items-start gap-3"><FaCheckCircle className="text-red-500 mt-1" /> Parcelas fixas e previsíveis, descontadas direto da folha.</li>
              <li className="flex items-start gap-3"><FaRegClock className="text-red-500 mt-1" /> Prazos mais longos para pagar, com conforto no orçamento.</li>
              <li className="flex items-start gap-3"><FaUserShield className="text-red-500 mt-1" /> Contratação simples e mais segurança para ambas as partes.</li>
            </ul>
          </motion.div>

          {/* Quem pode fazer */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Quem pode contratar?</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-300">
              <li>Servidores públicos municipais, estaduais e federais (conveniados).</li>
              <li>Aposentados e pensionistas do INSS.</li>
              <li>Trabalhadores CLT de empresas com convênio para consignado.</li>
            </ul>
          </motion.div>

          {/* Por que fazer conosco */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Por que fazer o Consignado conosco?</h2>
            <ul className="space-y-3 text-gray-600 dark:text-gray-300">
              <li className="flex items-start gap-3"><FaCheckCircle className="text-red-500 mt-1" /> Atendimento consultivo para encontrar a melhor taxa e prazo.</li>
              <li className="flex items-start gap-3"><FaCheckCircle className="text-red-500 mt-1" /> Parcerias com instituições sérias e reconhecidas.</li>
              <li className="flex items-start gap-3"><FaCheckCircle className="text-red-500 mt-1" /> Agilidade na análise e na liberação do crédito.</li>
            </ul>
          </motion.div>
        </div>

        {/* Simulador simples */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-10 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg max-w-5xl mx-auto"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Simulação de Consignado</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Ajuste os valores para estimar a parcela.</p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
            className="grid md:grid-cols-2 gap-6"
          >
            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                Valor do Crédito: <span className="font-bold">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format((state as any)?.amount ?? 10000)}</span>
              </label>
              <input
                type="range"
                min="1000"
                max="200000"
                step="500"
                defaultValue={10000}
                onChange={(e) => setState({ ...(state as any), amount: Number(e.target.value) })}
                className="w-full accent-red-500"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                Prazo (meses): <span className="font-bold">{(state as any)?.term ?? 48}</span>
              </label>
              <input
                type="range"
                min="6"
                max="84"
                step="1"
                defaultValue={48}
                onChange={(e) => setState({ ...(state as any), term: Number(e.target.value) })}
                className="w-full accent-red-500"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                Taxa mensal (%): <span className="font-bold">{((state as any)?.rate ?? 1.8).toFixed(2)}%</span>
              </label>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.01"
                defaultValue={1.8}
                onChange={(e) => setState({ ...(state as any), rate: Number(e.target.value) })}
                className="w-full accent-red-500"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                Renda mensal: <span className="font-bold">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format((state as any)?.income ?? 3500)}</span>
              </label>
              <input
                type="range"
                min="1500"
                max="20000"
                step="100"
                defaultValue={3500}
                onChange={(e) => setState({ ...(state as any), income: Number(e.target.value) })}
                className="w-full accent-red-500"
              />
              <p className="text-xs text-gray-500 mt-1">Usado para verificar a margem consignável.</p>
            </div>
          </form>

          {(() => {
            const amount = (state as any)?.amount ?? 10000;
            const term = (state as any)?.term ?? 48;
            const rate = (state as any)?.rate ?? 1.8; // % ao mês
            const income = (state as any)?.income ?? 3500;
            const monthlyRate = rate / 100;
            const payment = amount === 0 ? 0 : (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -term));
            const margin = income * 0.35; // 35% de margem típica
            const ok = payment <= margin;
            return (
              <div className="mt-6 grid md:grid-cols-3 gap-6">
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl text-center">
                  <div className="text-sm text-gray-600 dark:text-gray-300">Parcela estimada</div>
                  <div className="text-2xl font-extrabold text-red-600 dark:text-red-400">
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(payment)}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl text-center">
                  <div className="text-sm text-gray-600 dark:text-gray-300">Margem estimada (35%)</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(margin)}
                  </div>
                </div>
                <div className={`p-4 rounded-xl text-center ${ok ? "bg-green-50 dark:bg-green-900/20" : "bg-yellow-50 dark:bg-yellow-900/20"}`}>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Adequação</div>
                  <div className={`text-lg font-bold ${ok ? "text-green-700 dark:text-green-300" : "text-yellow-700 dark:text-yellow-300"}`}>
                    {ok ? "Dentro da margem" : "Acima da margem"}
                  </div>
                </div>
              </div>
            );
          })()}
        </motion.div>

        {/* FAQ */}
        <section className="mt-12 max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Perguntas Frequentes</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Quem pode contratar?</h3>
              <p className="text-gray-600 dark:text-gray-300">Servidores, aposentados e pensionistas do INSS e CLT conveniados.</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Quais são as taxas?</h3>
              <p className="text-gray-600 dark:text-gray-300">Variam conforme convênio e instituição. Ajudamos a buscar a menor taxa.</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Desconto em folha</h3>
              <p className="text-gray-600 dark:text-gray-300">A parcela é debitada automaticamente do benefício/salário.</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Quitação antecipada</h3>
              <p className="text-gray-600 dark:text-gray-300">É possível quitar com redução proporcional de juros do período restante.</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href="https://wa.me/5524999037716"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            <FaWhatsapp /> Falar no WhatsApp
          </a>
          <span className="text-gray-500 dark:text-gray-400 text-sm">Tire suas dúvidas e faça sua simulação sem compromisso.</span>
        </motion.div>
      </div>
    </div>
  );
};

export default ConsignadoPage;

