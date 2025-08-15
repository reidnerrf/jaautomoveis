import React from "react";
import { motion } from "framer-motion";
import { FiLock, FiInfo, FiShield, FiChevronRight } from "react-icons/fi";
import TopButton from "../components/TopButton.tsx";

const PrivacyPolicyPage: React.FC = () => {
  const textStyles = "mb-4 text-gray-700 leading-relaxed";
  const headingStyles =
    "flex items-center gap-2 text-2xl font-bold text-blue-800 mt-10 mb-4 border-l-4 border-blue-500 pl-3";

  return (
    <div className="bg-gradient-to-b from-white via-gray-50 to-white py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
        >
          <h1 className="text-4xl font-extrabold text-gray-900 mb-8 pb-4 flex items-center gap-3 border-b border-gray-200">
            <FiLock className="text-blue-600" /> Política de Privacidade
          </h1>

          <p className={textStyles}>
            A sua privacidade é importante para nós. É política do{" "}
            <strong>JA Automóveis</strong> respeitar a sua privacidade em
            relação a qualquer informação sua que possamos coletar no site JA
            Automóveis e outros sites que possuímos e operamos.
          </p>

          <p className={textStyles}>
            Solicitamos informações pessoais apenas quando realmente precisamos
            delas para lhe fornecer um serviço. Fazemos isso por meios justos e
            legais, com o seu conhecimento e consentimento, informando o motivo
            da coleta e como será utilizada.
          </p>

          <p className={textStyles}>
            Apenas retemos as informações pelo tempo necessário para fornecer o
            serviço solicitado, protegendo-as de forma segura contra perdas,
            roubos, acesso ou uso não autorizados.
          </p>

          <p className={textStyles}>
            Não compartilhamos informações de identificação pessoal, exceto
            quando exigido por lei.
          </p>

          <p className={textStyles}>
            Nosso site pode conter links para sites externos. Não temos controle
            sobre o conteúdo e políticas desses sites e não nos responsabilizamos
            por suas práticas.
          </p>

          <p className={textStyles}>
            Você pode recusar o fornecimento de informações pessoais, ciente de
            que isso pode limitar alguns serviços.
          </p>

          <h2 className={headingStyles}>
            <FiInfo /> Google AdSense e Cookies
          </h2>
          <p className={textStyles}>
            Utilizamos o Google AdSense para veicular anúncios mais relevantes e
            limitar a frequência com que você vê determinados anúncios, por meio
            do cookie DoubleClick.
          </p>
          <p className={textStyles}>
            Esses cookies ajudam a personalizar sua experiência, mostrando
            anúncios baseados em seus interesses.
          </p>
          <p className={textStyles}>
            Parceiros afiliados podem utilizar cookies para rastrear visitas e
            compras feitas por meio de seus links, garantindo créditos e ofertas
            promocionais.
          </p>

          <h2 className={headingStyles}>
            <FiShield /> Compromisso do Usuário
          </h2>
          <ul className="list-none space-y-3 text-gray-700">
            <li className="flex items-center gap-2">
              <FiChevronRight className="text-blue-500" /> Não realizar
              atividades ilegais ou contrárias à boa fé e à ordem pública.
            </li>
            <li className="flex items-center gap-2">
              <FiChevronRight className="text-blue-500" /> Não difundir conteúdo
              ofensivo, discriminatório ou ilegal.
            </li>
            <li className="flex items-center gap-2">
              <FiChevronRight className="text-blue-500" /> Não causar danos a
              sistemas físicos ou lógicos do JA Automóveis, fornecedores ou
              terceiros.
            </li>
          </ul>

          <h2 className={headingStyles}>
            <FiInfo /> Mais informações
          </h2>
          <p className={textStyles}>
            Se tiver dúvidas sobre privacidade, entre em contato conosco.
            Lembramos que manter os cookies ativados pode melhorar a sua
            experiência no site.
          </p>

          <p className="text-sm text-gray-500 mt-8">
            Esta política é efetiva a partir de 14 de agosto de 2025.
          </p>
        </motion.div>
      </div>

      <TopButton />
    </div>
  );
};

export default PrivacyPolicyPage;
