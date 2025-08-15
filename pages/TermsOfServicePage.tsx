import React from "react";
import { motion } from "framer-motion";
import { FiFileText, FiLink, FiShield, FiAlertTriangle, FiCheckCircle } from "react-icons/fi";
import TopButton from "../components/TopButton.tsx";

const TermsOfServicePage: React.FC = () => {
  const sectionClasses = "bg-gray-50 rounded-2xl shadow-sm p-6 mb-6 border border-gray-100";
  const headingClasses = "flex items-center gap-2 text-2xl font-semibold text-gray-800 mb-4";
  const textClasses = "text-gray-700 leading-relaxed";

  return (
    <div className="bg-white py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-10 border-b-4 border-blue-500 pb-4">
            Termos de Serviço
          </h1>

          {/* 1 */}
          <div className={sectionClasses}>
            <h2 className={headingClasses}>
              <FiFileText className="text-blue-500" /> 1. Termos
            </h2>
            <p className={textClasses}>
              Ao acessar ao site JA Automóveis, concorda em cumprir estes termos de serviço, todas as leis e regulamentos aplicáveis e concorda que é responsável pelo cumprimento de todas as leis locais aplicáveis...
            </p>
          </div>

          {/* 2 */}
          <div className={sectionClasses}>
            <h2 className={headingClasses}>
              <FiCheckCircle className="text-green-500" /> 2. Uso de Licença
            </h2>
            <p className={textClasses}>
              É concedida permissão para baixar temporariamente uma cópia dos materiais (informações ou software) no site JA Automóveis...
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-3">
              <li>Modificar ou copiar os materiais</li>
              <li>Usar para fins comerciais sem permissão</li>
              <li>Engenharia reversa do software</li>
              <li>Remover direitos autorais</li>
              <li>Transferir ou espelhar em outro servidor</li>
            </ul>
          </div>

          {/* 3 */}
          <div className={sectionClasses}>
            <h2 className={headingClasses}>
              <FiShield className="text-purple-500" /> 3. Isenção de responsabilidade
            </h2>
            <p className={textClasses}>
              Os materiais no site da JA Automóveis são fornecidos "como estão". JA Automóveis não oferece garantias, expressas ou implícitas...
            </p>
          </div>

          {/* 4 */}
          <div className={sectionClasses}>
            <h2 className={headingClasses}>
              <FiAlertTriangle className="text-red-500" /> 4. Limitações
            </h2>
            <p className={textClasses}>
              Em nenhum caso o JA Automóveis ou seus fornecedores serão responsáveis por quaisquer danos...
            </p>
          </div>

          {/* 5 */}
          <div className={sectionClasses}>
            <h2 className={headingClasses}>
              <FiFileText className="text-blue-500" /> 5. Precisão dos materiais
            </h2>
            <p className={textClasses}>
              Os materiais exibidos no site podem conter erros técnicos, tipográficos ou fotográficos...
            </p>
          </div>

          {/* 6 */}
          <div className={sectionClasses}>
            <h2 className={headingClasses}>
              <FiLink className="text-indigo-500" /> 6. Links
            </h2>
            <p className={textClasses}>
              O JA Automóveis não é responsável pelo conteúdo de sites vinculados...
            </p>
          </div>

          {/* Final */}
          <div className={sectionClasses}>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Modificações</h3>
            <p className={textClasses}>
              O JA Automóveis pode revisar estes termos de serviço a qualquer momento, sem aviso prévio...
            </p>
            <h3 className="text-xl font-bold text-gray-800 mt-6 mb-2">Lei aplicável</h3>
            <p className={textClasses}>
              Estes termos e condições são regidos pelas leis aplicáveis...
            </p>
          </div>
        </motion.div>
      </div>
      <TopButton />
    </div>
  );
};

export default TermsOfServicePage;
