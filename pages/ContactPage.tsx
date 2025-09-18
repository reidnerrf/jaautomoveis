import React from "react";
import { motion } from "framer-motion";
import { FiMapPin, FiPhone, FiMail, FiClock, FiMessageCircle, FiSend } from "react-icons/fi";
import { FaWhatsapp, FaInstagram, FaFacebook } from "react-icons/fa";
import SEOHead from "../components/SEOHead.tsx";
import { generatePageSEO } from "../utils/seo";
import GoogleReviewSummary from "../components/GoogleReviewSummary.tsx";

const ContactPage: React.FC = () => {
  const contactInfo = [
    {
      icon: <FiMapPin size={24} className="text-main-red" />,
      title: "Endereço",
      info: "Av. Brasília, n°35 - Vila Julieta, Resende - RJ",
      description: "Venha nos visitar!",
    },
    {
      icon: <FiPhone size={24} className="text-green-600" />,
      title: "Telefone",
      info: "(24) 99903-7716",
      description: "WhatsApp disponível",
    },
    {
      icon: <FiMail size={24} className="text-blue-600" />,
      title: "Email",
      info: "contato@jaautomoveisresende .com.br",
      description: "Respondemos rapidamente",
    },
    {
      icon: <FiClock size={24} className="text-purple-600" />,
      title: "Horário",
      info: "Seg - Sex: 8h às 18:30h",
      description: "Sáb: 8h às 13h",
    },
  ];

  const socialLinks = [
    {
      icon: <FaWhatsapp size={24} />,
      name: "WhatsApp",
      url: "https://wa.me/5524999037716",
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      icon: <FaInstagram size={24} />,
      name: "Instagram",
      url: "https://www.instagram.com/_jaautomoveis/",
      color: "bg-pink-500 hover:bg-pink-600",
    },
    {
      icon: <FaFacebook size={24} />,
      name: "Facebook",
      url: "https://www.facebook.com/jaautomoveisrj/",
      color: "bg-blue-600 hover:bg-blue-700",
    },
  ];

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-16 transition-colors">
      <SEOHead
        title={generatePageSEO("contact").title}
        description={generatePageSEO("contact").description}
        keywords={generatePageSEO("contact").keywords}
      >
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Início",
                item: typeof window !== "undefined" ? `${window.location.origin}/` : "/",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Contato",
                item:
                  typeof window !== "undefined" ? `${window.location.origin}/contact` : "/contact",
              },
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
                name: "Qual o horário de atendimento?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Segunda a sexta, das 8h às 18:30h, e sábado das 8h às 13h.",
                },
              },
              {
                "@type": "Question",
                name: "Posso ser atendido pelo WhatsApp?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Sim, nosso número oficial é (24) 99903-7716. Clique no botão do WhatsApp para iniciar a conversa.",
                },
              },
              {
                "@type": "Question",
                name: "Onde ficam localizados?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Av. Brasília, n°35 - Vila Julieta, Resende - RJ.",
                },
              },
            ],
          })}
        </script>
      </SEOHead>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Título e subtítulo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white">
            Fale Conosco
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Estamos prontos para te atender. Envie-nos uma mensagem ou faça-nos uma visita.
          </p>
        </motion.div>

        {/* Conteúdo */}
        <div className="mt-16 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl grid md:grid-cols-2 gap-12">
          {/* Formulário */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
              Envie uma Mensagem
            </h2>
            <form
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget as HTMLFormElement;
                const name = (form.elements.namedItem("name") as HTMLInputElement)?.value.trim();
                const email = (form.elements.namedItem("email") as HTMLInputElement)?.value.trim();
                const phone = (form.elements.namedItem("phone") as HTMLInputElement)?.value.trim();
                const message = (
                  form.elements.namedItem("message") as HTMLTextAreaElement
                )?.value.trim();
                const honey = (form.elements.namedItem("company") as HTMLInputElement)?.value;
                if (honey) return; // honeypot filled -> likely bot
                const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
                const phoneOk = /\(\d{2}\) \d{5}-\d{4}/.test(phone);
                if (!name || !emailOk || !phoneOk || !message) {
                  alert("Por favor, preencha os campos corretamente.");
                  return;
                }
                try {
                  (window as any).trackBusinessEvent?.("contact_form", { name, email });
                } catch {}
                fetch("/api/contact", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ name, email, phone, message }),
                }).then(() => alert("Mensagem enviada!"));
              }}
            >
              {[
                { id: "name", label: "Nome", type: "text", placeholder: "Seu nome completo" },
                { id: "email", label: "Email", type: "email", placeholder: "voce@email.com" },
              ].map(({ id, label, type, placeholder }) => (
                <div key={id}>
                  <label htmlFor={id} className="font-medium text-gray-700 dark:text-gray-300">
                    {label}
                  </label>
                  <input
                    type={type}
                    id={id}
                    name={id}
                    required
                    placeholder={placeholder}
                    className="w-full mt-1 p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-main-red shadow-sm transition-all duration-300 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              ))}

              {/* Telefone com máscara simples */}
              <div>
                <label htmlFor="phone" className="font-medium text-gray-700 dark:text-gray-300">
                  Telefone (WhatsApp)
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  inputMode="numeric"
                  placeholder="(24) 99999-9999"
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
                    const parts = digits.match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
                    if (!parts) return;
                    const [, a, b, c] = parts;
                    e.target.value = [a && `(${a})`, b && ` ${b}`, c && `-${c}`]
                      .filter(Boolean)
                      .join("");
                  }}
                  className="w-full mt-1 p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-main-red shadow-sm transition-all duration-300 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label htmlFor="message" className="font-medium text-gray-700 dark:text-gray-300">
                  Mensagem
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  className="w-full mt-1 p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-main-red shadow-sm transition-all duration-300 dark:bg-gray-700 dark:text-white"
                  required
                ></textarea>
              </div>

              {/* Honeypot anti-spam */}
              <div className="hidden" aria-hidden="true">
                <label htmlFor="company">Company</label>
                <input type="text" id="company" name="company" autoComplete="off" tabIndex={-1} />
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full bg-main-red text-white font-bold py-3 px-6 rounded-lg text-lg shadow-md hover:bg-red-700 transition-colors duration-300"
              >
                Enviar
              </motion.button>
            </form>
          </motion.div>

          {/* Informações & Mapa */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
              Nossas Informações
            </h2>
            {/* Cards de Informações */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={info.title}
                  className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-shadow duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">{info.icon}</div>
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-white text-sm">
                        {info.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 font-medium break-words">
                        {info.title === "Telefone" ? (
                          <a href="https://wa.me/5524999037716" className="underline decoration-dotted">
                            {info.info}
                          </a>
                        ) : info.title === "Email" ? (
                          <a href="mailto:contato@jaautomoveisresende.com.br" className="underline decoration-dotted">
                            contato@jaautomoveisresende.com.br
                          </a>
                        ) : (
                          info.info
                        )}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{info.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Redes Sociais */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Siga-nos nas Redes Sociais
              </h3>
              <div className="flex space-x-3">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${social.color} text-white p-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center space-x-2`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    {social.icon}
                    <span className="text-sm font-medium">{social.name}</span>
                  </motion.a>
                ))}
              </div>
            </div>
          {/* Resumo de Avaliações do Google */}
          <div className="mb-6">
            <GoogleReviewSummary
              rating={4.8}
              reviewCount={28}
              reviewsPageUrl="https://www.google.com/maps/place/JA+Autom%C3%B3veis/@-22.4514047,-44.4276196,15z/data=!4m8!3m7!1s0x9e7f64ea81fb05:0xda764a546db009b0!8m2!3d-22.471342!4d-44.464962!9m1!1b1!16s%2Fg%2F11h_4scynm?entry=ttu&g_ep=EgoyMDI1MDkwOC4wIKXMDSoASAFQAw%3D%3D"
            />
            <div className="mt-3">
              <a
                href="https://www.google.com/maps/place/JA+Autom%C3%B3veis/@-22.4514047,-44.4276196,15z/data=!4m8!3m7!1s0x9e7f64ea81fb05:0xda764a546db009b0!8m2!3d-22.471342!4d-44.464962!9m1!1b1!16s%2Fg%2F11h_4scynm?entry=ttu&g_ep=EgoyMDI1MDkwOC4wIKXMDSoASAFQAw%3D%3D"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block underline decoration-2 text-blue-700 dark:text-blue-300 font-semibold"
              >
                Ver todas as avaliações no Google ↗
              </a>
            </div>
          </div>
            {/* CTA WhatsApp */}
            <div className="mt-6">
              <a
                href="https://wa.me/5524999037716?text=Olá,%20tenho%20uma%20dúvida%20sobre%20os%20veículos"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-3 rounded-xl shadow-md transition-colors"
              >
                <FaWhatsapp /> Falar no WhatsApp agora
              </a>
            </div>
            <div className="mt-8 h-80 rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3686.0969984913757!2d-44.46753692566539!3d-22.47133702206713!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9e7f64ea81fb05%3A0xda764a546db009b0!2sJA%20Autom%C3%B5veis!5e0!3m2!1sen!2sbr!4v1722368940567!5m2!1sen!2sbr"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                title="Google Maps Location"
              ></iframe>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
