import React from "react";
import { motion } from "framer-motion";
import SEOHead from "../components/SEOHead.tsx";

const ConsignadoPage: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-16 transition-colors">
      <SEOHead
        title="Crédito Consignado | JA Automóveis"
        description="Entenda o que é crédito consignado, suas vantagens e por que fazer seu consignado com a JA Automóveis."
        keywords="consignado, crédito consignado, desconto em folha, taxas baixas, JA Automóveis"
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
                name: "O que é crédito consignado?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text:
                    "É um empréstimo com parcelas descontadas diretamente da folha de pagamento ou benefício, oferecendo taxas menores e prazos maiores.",
                },
              },
              {
                "@type": "Question",
                name: "Quem pode contratar?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text:
                    "Servidores públicos, aposentados e pensionistas do INSS e colaboradores de empresas conveniadas.",
                },
              },
              {
                "@type": "Question",
                name: "Quais as vantagens?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text:
                    "Taxas reduzidas, desconto automático em folha (menos risco de atraso), prazos maiores e menos burocracia.",
                },
              },
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
            Crédito Consignado
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg mb-8">
            O crédito consignado é uma modalidade de empréstimo em que as parcelas são descontadas
            diretamente da sua folha de pagamento ou benefício. Por ter menor risco para as instituições,
            costuma oferecer taxas mais baixas e prazos mais longos.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 dark:bg-gray-900/40 rounded-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">O que é?</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Empréstimo com pagamento automático via desconto em folha para servidores públicos,
                aposentados e pensionistas do INSS, além de colaboradores de empresas conveniadas.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/40 rounded-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Vantagens</h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300">
                <li>Taxas de juros reduzidas</li>
                <li>Desconto direto em folha (menos risco de atraso)</li>
                <li>Prazos maiores e parcelas que cabem no bolso</li>
                <li>Menos burocracia e aprovação mais ágil</li>
              </ul>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/40 rounded-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Por que fazer?</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Ideal para quem busca organizar as finanças, trocar dívidas caras por uma opção mais
                barata e previsível, ou viabilizar um projeto com planejamento e segurança.
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href="https://wa.me/5524999037716"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-main-red hover:bg-red-700 text-white font-semibold shadow-lg transition-colors"
            >
              Falar no WhatsApp
            </a>
            <a
              href="/financing"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 font-semibold shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Ver opções de Financiamento
            </a>
            <a
              href="/consortium"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 font-semibold shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Conhecer Consórcio
            </a>
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

