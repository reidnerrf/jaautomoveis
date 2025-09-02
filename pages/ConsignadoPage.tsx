import React from "react";
import { motion } from "framer-motion";
import { FaCheckCircle, FaUserShield, FaRegClock, FaPercentage, FaWhatsapp } from "react-icons/fa";
import SEOHead from "../components/SEOHead.tsx";

const ConsignadoPage: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-16 transition-colors">
      <SEOHead
        title="Consignado | JA Automóveis"
        description="Entenda o crédito consignado: taxas mais baixas, desconto em folha e contratação simples para servidores, aposentados e pensionistas."
        keywords="consignado, crédito consignado, desconto em folha, taxas baixas, JA Automóveis"
      />

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

