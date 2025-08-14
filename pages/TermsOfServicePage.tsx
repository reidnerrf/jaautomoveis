
import React from 'react';
import { motion } from 'framer-motion';

const TermsOfServicePage: React.FC = () => {
  const textStyles = "mb-4 text-gray-700 leading-relaxed";
  const headingStyles = "text-2xl font-bold text-gray-800 mt-8 mb-4";

  return (
    <div className="bg-white py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-extrabold text-gray-900 mb-8 border-b pb-4">Termos de Serviço</h1>
          
          <h2 className={headingStyles}>1. Termos</h2>
          <p className={textStyles}>Ao acessar ao site JA Automóveis, concorda em cumprir estes termos de serviço, todas as leis e regulamentos aplicáveis ​​e concorda que é responsável pelo cumprimento de todas as leis locais aplicáveis. Se você não concordar com algum desses termos, está proibido de usar ou acessar este site. Os materiais contidos neste site são protegidos pelas leis de direitos autorais e marcas comerciais aplicáveis.</p>
          
          <h2 className={headingStyles}>2. Uso de Licença</h2>
          <p className={textStyles}>É concedida permissão para baixar temporariamente uma cópia dos materiais (informações ou software) no site JA Automóveis , apenas para visualização transitória pessoal e não comercial. Esta é a concessão de uma licença, não uma transferência de título e, sob esta licença, você não pode: </p>
           <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>modificar ou copiar os materiais;</li>
              <li>usar os materiais para qualquer finalidade comercial ou para exibição pública (comercial ou não comercial);</li>
              <li>tentar descompilar ou fazer engenharia reversa de qualquer software contido no site JA Automóveis;</li>
              <li>remover quaisquer direitos autorais ou outras notações de propriedade dos materiais; ou</li>
              <li>transferir os materiais para outra pessoa ou 'espelhe' os materiais em qualquer outro servidor.</li>
          </ul>
          <p className={textStyles + " mt-4"}>Esta licença será automaticamente rescindida se você violar alguma dessas restrições e poderá ser rescindida por JA Automóveis a qualquer momento. Ao encerrar a visualização desses materiais ou após o término desta licença, você deve apagar todos os materiais baixados em sua posse, seja em formato eletrónico ou impresso.</p>

          <h2 className={headingStyles}>3. Isenção de responsabilidade</h2>
          <p className={textStyles}>Os materiais no site da JA Automóveis são fornecidos 'como estão'. JA Automóveis não oferece garantias, expressas ou implícitas, e, por este meio, isenta e nega todas as outras garantias, incluindo, sem limitação, garantias implícitas ou condições de comercialização, adequação a um fim específico ou não violação de propriedade intelectual ou outra violação de direitos.</p>
          <p className={textStyles}>Além disso, o JA Automóveis não garante ou faz qualquer representação relativa à precisão, aos resultados prováveis ​​ou à confiabilidade do uso dos materiais em seu site ou de outra forma relacionado a esses materiais ou em sites vinculados a este site.</p>
          
          <h2 className={headingStyles}>4. Limitações</h2>
          <p className={textStyles}>Em nenhum caso o JA Automóveis ou seus fornecedores serão responsáveis ​​por quaisquer danos (incluindo, sem limitação, danos por perda de dados ou lucro ou devido a interrupção dos negócios) decorrentes do uso ou da incapacidade de usar os materiais em JA Automóveis, mesmo que JA Automóveis ou um representante autorizado da JA Automóveis tenha sido notificado oralmente ou por escrito da possibilidade de tais danos. Como algumas jurisdições não permitem limitações em garantias implícitas, ou limitações de responsabilidade por danos conseqüentes ou incidentais, essas limitações podem não se aplicar a você.</p>
          
          <h2 className={headingStyles}>5. Precisão dos materiais</h2>
          <p className={textStyles}>Os materiais exibidos no site da JA Automóveis podem incluir erros técnicos, tipográficos ou fotográficos. JA Automóveis não garante que qualquer material em seu site seja preciso, completo ou atual. JA Automóveis pode fazer alterações nos materiais contidos em seu site a qualquer momento, sem aviso prévio. No entanto, JA Automóveis não se compromete a atualizar os materiais.</p>

          <h2 className={headingStyles}>6. Links</h2>
          <p className={textStyles}>O JA Automóveis não analisou todos os sites vinculados ao seu site e não é responsável pelo conteúdo de nenhum site vinculado. A inclusão de qualquer link não implica endosso por JA Automóveis do site. O uso de qualquer site vinculado é por conta e risco do usuário.</p>
          
          <h3 className="text-xl font-bold text-gray-800 mt-6 mb-2">Modificações</h3>
          <p className={textStyles}>O JA Automóveis pode revisar estes termos de serviço do site a qualquer momento, sem aviso prévio. Ao usar este site, você concorda em ficar vinculado à versão atual desses termos de serviço.</p>

          <h3 className="text-xl font-bold text-gray-800 mt-6 mb-2">Lei aplicável</h3>
          <p className={textStyles}>Estes termos e condições são regidos e interpretados de acordo com as leis do JA Automóveis e você se submete irrevogavelmente à jurisdição exclusiva dos tribunais naquele estado ou localidade.</p>

        </motion.div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
