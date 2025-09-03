import React from "react";
import { motion } from "framer-motion";
import { FaCheckCircle, FaUserShield, FaRegClock, FaPercentage, FaWhatsapp } from "react-icons/fa";
import SEOHead from "../components/SEOHead.tsx";

const ConsignadoPage: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-16 transition-colors">
      <SEOHead
        title="Carro Consignado | JA Automóveis"
        description="Venda seu carro em consignação com segurança, divulgação profissional e pagamento à vista após a venda. Você permanece como proprietário até a transferência."
        keywords="carro consignado, venda em consignação, consignação de veículos, vender carro, JA Automóveis"
      >
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "O que é carro consignado?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "É quando o proprietário entrega o carro à loja para divulgação, negociação e venda em seu nome. O dono segue como proprietário legal até a conclusão da venda."
                }
              },
              {
                "@type": "Question",
                "name": "Como funciona o pagamento?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Após a venda, o proprietário recebe o valor acordado à vista e a loja retém a comissão pelo serviço conforme contrato."
                }
              },
              {
                "@type": "Question",
                "name": "Quais documentos são necessários?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Documento do veículo (CRLV/CRV digital), documento com foto, comprovante de endereço e eventuais autorizações do proprietário."
                }
              },
              {
                "@type": "Question",
                "name": "Quem transfere a propriedade?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "A transferência é feita no momento da venda para o comprador. Até lá, o proprietário original continua como dono legal."
                }
              }
            ]
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Início",
                "item": typeof window !== "undefined" ? window.location.origin + "/" : "/"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Consignado",
                "item": typeof window !== "undefined" ? window.location.origin + "/consignado" : "/consignado"
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
            Carro <span className="text-red-500">Consignado</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Entregue seu veículo para nossa equipe vender em seu nome, com divulgação profissional e segurança. Você segue como proprietário até a venda e recebe à vista.
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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">O que é Consignação de Veículos?</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Um carro consignado é um veículo entregue à loja para que ela faça toda a divulgação, negociação e venda em nome do proprietário. O dono continua sendo o proprietário legal até a conclusão da venda e a transferência ao comprador.
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
              <li className="flex items-start gap-3"><FaCheckCircle className="text-red-500 mt-1" /> Divulgação profissional do veículo nos principais canais.</li>
              <li className="flex items-start gap-3"><FaUserShield className="text-red-500 mt-1" /> Negociação e segurança jurídica conduzidas pela loja.</li>
              <li className="flex items-start gap-3"><FaRegClock className="text-red-500 mt-1" /> Você não precisa parar sua rotina: cuidamos de todo o processo.</li>
              <li className="flex items-start gap-3"><FaPercentage className="text-red-500 mt-1" /> Pagamento ao proprietário à vista após a venda, com comissão transparente.</li>
            </ul>
          </motion.div>

          {/* Como funciona */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Como funciona na prática?</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-300">
              <li>Avaliamos o veículo e alinhamos o valor de venda e a comissão.</li>
              <li>Assinamos um termo de consignação com condições e prazos.</li>
              <li>Fazemos fotos, anúncios e cuidamos das visitas e propostas.</li>
              <li>Concretizada a venda, você recebe à vista e efetuamos a transferência.</li>
            </ul>
          </motion.div>

          {/* Por que consignar conosco */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Por que consignar com a JA Automóveis?</h2>
            <ul className="space-y-3 text-gray-600 dark:text-gray-300">
              <li className="flex items-start gap-3"><FaCheckCircle className="text-red-500 mt-1" /> Equipe experiente e reputação local.</li>
              <li className="flex items-start gap-3"><FaCheckCircle className="text-red-500 mt-1" /> Fotos profissionais e anúncios em múltiplos portais.</li>
              <li className="flex items-start gap-3"><FaCheckCircle className="text-red-500 mt-1" /> Processo transparente, contrato claro e segurança na transação.</li>
            </ul>
          </motion.div>
        </div>
        {/* FAQ */}
        <section className="mt-12 max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Perguntas Frequentes</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Há exclusividade?</h3>
              <p className="text-gray-600 dark:text-gray-300">Trabalhamos com termo de consignação definindo prazos e condições, normalmente com exclusividade pelo período acordado.</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Qual a comissão?</h3>
              <p className="text-gray-600 dark:text-gray-300">A comissão é previamente acordada e somente aplicada quando a venda for concluída.</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">E se eu quiser retirar o carro?</h3>
              <p className="text-gray-600 dark:text-gray-300">Você pode solicitar a retirada conforme condições do contrato; cuidamos da atualização dos anúncios.</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">O pagamento é seguro?</h3>
              <p className="text-gray-600 dark:text-gray-300">Sim. O repasse é feito à vista para o proprietário, e a transferência é realizada ao comprador com toda a documentação.</p>
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
            href="https://wa.me/5524999037716?text=Olá%2C%20quero%20consignar%20meu%20carro%20na%20JA%20Automóveis."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            <FaWhatsapp /> Falar no WhatsApp
          </a>
          <span className="text-gray-500 dark:text-gray-400 text-sm">Tire suas dúvidas e solicite a avaliação do seu veículo.</span>
        </motion.div>
      </div>
    </div>
  );
};

export default ConsignadoPage;

