
import React from 'react';
import { motion } from 'framer-motion';

const PrivacyPolicyPage: React.FC = () => {
  const textStyles = "mb-4 text-gray-700 leading-relaxed";
  const headingStyles = "text-2xl font-bold text-gray-800 mt-8 mb-4";

  return (
    <div className="bg-white py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-extrabold text-gray-900 mb-8 border-b pb-4">Política de Privacidade</h1>
          
          <p className={textStyles}>A sua privacidade é importante para nós. É política do JA Automóveis respeitar a sua privacidade em relação a qualquer informação sua que possamos coletar no site JA Automóveis, e outros sites que possuímos e operamos.</p>
          
          <p className={textStyles}>Solicitamos informações pessoais apenas quando realmente precisamos delas para lhe fornecer um serviço. Fazemo-lo por meios justos e legais, com o seu conhecimento e consentimento. Também informamos por que estamos coletando e como será usado.</p>

          <p className={textStyles}>Apenas retemos as informações coletadas pelo tempo necessário para fornecer o serviço solicitado. Quando armazenamos dados, protegemos dentro de meios comercialmente aceitáveis ​​para evitar perdas e roubos, bem como acesso, divulgação, cópia, uso ou modificação não autorizados.</p>

          <p className={textStyles}>Não compartilhamos informações de identificação pessoal publicamente ou com terceiros, exceto quando exigido por lei.</p>

          <p className={textStyles}>O nosso site pode ter links para sites externos que não são operados por nós. Esteja ciente de que não temos controle sobre o conteúdo e práticas desses sites e não podemos aceitar responsabilidade por suas respectivas políticas de privacidade.</p>
          
          <p className={textStyles}>Você é livre para recusar a nossa solicitação de informações pessoais, entendendo que talvez não possamos fornecer alguns dos serviços desejados.</p>

          <p className={textStyles}>O uso continuado de nosso site será considerado como aceitação de nossas práticas em torno de privacidade e informações pessoais. Se você tiver alguma dúvida sobre como lidamos com dados do usuário e informações pessoais, entre em contacto connosco.</p>

          <h2 className={headingStyles}>Google AdSense e Cookies</h2>
          <p className={textStyles}>O serviço Google AdSense que usamos para veicular publicidade usa um cookie DoubleClick para veicular anúncios mais relevantes em toda a Web e limitar o número de vezes que um determinado anúncio é exibido para você.</p>
          <p className={textStyles}>Para mais informações sobre o Google AdSense, consulte as FAQs oficiais sobre privacidade do Google AdSense.</p>
          <p className={textStyles}>Utilizamos anúncios para compensar os custos de funcionamento deste site e fornecer financiamento para futuros desenvolvimentos. Os cookies de publicidade comportamental usados ​​por este site foram projetados para garantir que você forneça os anúncios mais relevantes sempre que possível, rastreando anonimamente seus interesses e apresentando coisas semelhantes que possam ser do seu interesse.</p>
          <p className={textStyles}>Vários parceiros anunciam em nosso nome e os cookies de rastreamento de afiliados simplesmente nos permitem ver se nossos clientes acessaram o site através de um dos sites de nossos parceiros, para que possamos creditá-los adequadamente e, quando aplicável, permitir que nossos parceiros afiliados ofereçam qualquer promoção que pode fornecê-lo para fazer uma compra.</p>

          <h2 className={headingStyles}>Compromisso do Usuário</h2>
          <p className={textStyles}>O usuário se compromete a fazer uso adequado dos conteúdos e da informação que o JA Automóveis oferece no site e com caráter enunciativo, mas não limitativo:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>A) Não se envolver em atividades que sejam ilegais ou contrárias à boa fé a à ordem pública;</li>
            <li>B) Não difundir propaganda ou conteúdo de natureza racista, xenofóbica, jogos de sorte ou azar, qualquer tipo de pornografia ilegal, de apologia ao terrorismo ou contra os direitos humanos;</li>
            <li>C) Não causar danos aos sistemas físicos (hardwares) e lógicos (softwares) do JA Automóveis, de seus fornecedores ou terceiros, para introduzir ou disseminar vírus informáticos ou quaisquer outros sistemas de hardware ou software que sejam capazes de causar danos anteriormente mencionados.</li>
          </ul>

          <h2 className={headingStyles}>Mais informações</h2>
          <p className={textStyles}>Esperemos que esteja esclarecido e, como mencionado anteriormente, se houver algo que você não tem certeza se precisa ou não, geralmente é mais seguro deixar os cookies ativados, caso interaja com um dos recursos que você usa em nosso site.</p>
          <p className="text-sm text-gray-500 mt-8">Esta política é efetiva a partir de 14 August 2025 22:13.</p>

        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
