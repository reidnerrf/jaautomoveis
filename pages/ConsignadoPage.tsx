import React from "react";
import { motion } from "framer-motion";
import SEOHead from "../components/SEOHead.tsx";

const ConsignadoPage: React.FC = () => {
  const [amount, setAmount] = React.useState<number>(20000);
  const [term, setTerm] = React.useState<number>(48);
  const [margin, setMargin] = React.useState<number>(30); // % da renda comprometida
  const [income, setIncome] = React.useState<number>(4000);
  const monthlyRate = 1.2; // % ao mês (exemplo)

  const simulate = React.useMemo(() => {
    const maxInstallment = (income * (margin / 100)) || 0;
    const monthly = amount > 0 && term > 0
      ? (amount * (monthlyRate / 100)) / (1 - Math.pow(1 + monthlyRate / 100, -term))
      : 0;
    const fits = monthly <= maxInstallment;
    return { monthly, maxInstallment, fits };
  }, [amount, term, margin, income]);

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-16 transition-colors">
      <SEOHead
        title="Venda de Carro Consignado | JA Automóveis"
        description="Entenda como funciona a venda de carros em consignação: você deixa seu veículo na loja, nós vendemos e você recebe com segurança e transparência."
        keywords="consignado, venda consignada, consignação de veículos, vender carro consignado, JA Automóveis"
      >
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Início", item: typeof window !== "undefined" ? `${window.location.origin}/` : "" },
              { "@type": "ListItem", position: 2, name: "Consignado", item: typeof window !== "undefined" ? `${window.location.origin}/consignado` : "" },
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
                name: "O que é venda de carro consignado?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text:
                    "É quando o proprietário deixa o veículo na loja (consignatário) para que esta realize a venda por um valor e prazo acordados, sem transferência de propriedade para a loja.",
                },
              },
              {
                "@type": "Question",
                name: "Quais as vantagens da consignação?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text:
                    "Loja cuida da divulgação, negociação, segurança e documentação; você evita golpes, ganha visibilidade e negocia melhor, pagando uma comissão sobre a venda.",
                },
              },
              {
                "@type": "Question",
                name: "Como funciona a comissão?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text:
                    "A loja cobra uma comissão acordada sobre o valor de venda do veículo, somente quando a venda é concluída.",
                },
              }
            ],
          })}
        </script>
      </SEOHead>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12"
        >
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
            Venda de Carro Consignado
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg mb-8">
            A venda de carros em consignação é um processo em que o proprietário (consignante) deixa um
            veículo em nossa loja (consignatário) para que realizemos a venda por um preço acordado e em um
            prazo estipulado, sem que a propriedade seja transferida para a loja. Nós assumimos a
            responsabilidade pela venda, conduzimos a negociação com segurança e cobramos uma comissão
            apenas quando o negócio é concluído.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 dark:bg-gray-900/40 rounded-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">O que é?</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Você deixa seu veículo na loja para venda com preço e prazo combinados. A propriedade
                permanece com você até a venda ser concluída.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/40 rounded-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Vantagens</h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300">
                <li>Divulgação profissional e qualificada</li>
                <li>Segurança na negociação e documentação</li>
                <li>Avaliação justa e orientação sobre preço</li>
                <li>Você recebe e paga comissão apenas quando vender</li>
              </ul>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/40 rounded-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Por que fazer?</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Ideal para quem quer vender com comodidade e segurança, evitando riscos de golpes e
                aumentando a visibilidade do veículo para alcançar o melhor valor.
              </p>
            </div>
          </div>

          {/* Como funciona a consignação */}
          <div className="mt-10 grid md:grid-cols-5 gap-6">
            <div className="md:col-span-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Como funciona</h3>
              <ol className="list-decimal pl-5 space-y-2 text-gray-700 dark:text-gray-200">
                <li>Avaliamos o veículo e definimos preço e prazo em acordo com você.</li>
                <li>O carro fica exposto e divulgado pela loja para potenciais compradores.</li>
                <li>Realizamos a negociação, vistorias e documentos com segurança.</li>
                <li>Venda concluída: você recebe o valor combinado menos a comissão acordada.</li>
              </ol>
              <div className="mt-4 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 text-sm text-yellow-900 dark:text-yellow-200">
                Comissão: cobrada apenas quando a venda é efetivada. Todos os custos são informados com transparência.
              </div>
            </div>

            <div className="md:col-span-2 flex flex-col gap-4">
              <a
                href="https://wa.me/5524999037716?text=Olá! Quero vender meu carro na consignação"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-main-red hover:bg-red-700 text-white font-semibold shadow-lg transition-colors"
              >
                Avaliar meu carro (WhatsApp)
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 font-semibold shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Falar com a loja
              </a>
            </div>
          </div>

          {/* Cross-links section */}
          <div className="mt-12 bg-gray-50 dark:bg-gray-900/40 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Outras opções de financiamento
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <a
                href="/financing"
                className="block p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-600 transition-colors"
              >
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Financiamento Tradicional</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Para quem não tem desconto em folha. Taxas competitivas e aprovação rápida.
                </p>
              </a>
              <a
                href="/consortium"
                className="block p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-600 transition-colors"
              >
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Consórcio</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Sem juros bancários. Planeje sua compra com segurança e condições especiais.
                </p>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ConsignadoPage;

