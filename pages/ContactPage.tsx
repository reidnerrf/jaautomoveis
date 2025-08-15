import React from 'react';
import { motion } from 'framer-motion';
import { FiMapPin, FiPhone, FiMail } from 'react-icons/fi';
import TopButton from '../components/TopButton.tsx';

const ContactPage: React.FC = () => {
    return (
        <div className="bg-gradient-to-b from-gray-100 to-white py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Título e subtítulo */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center"
                >
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">
                        Fale Conosco
                    </h1>
                    <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                        Estamos prontos para te atender. Envie-nos uma mensagem ou faça-nos uma visita.
                    </p>
                </motion.div>

                {/* Conteúdo */}
                <div className="mt-16 bg-white p-8 rounded-2xl shadow-xl grid md:grid-cols-2 gap-12">
                    
                    {/* Formulário */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                    >
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">
                            Envie uma Mensagem
                        </h2>
                        <form className="space-y-5">
                            {[
                                { id: "name", label: "Nome", type: "text" },
                                { id: "email", label: "Email", type: "email" }
                            ].map(({ id, label, type }) => (
                                <div key={id}>
                                    <label htmlFor={id} className="font-medium text-gray-700">{label}</label>
                                    <input
                                        type={type}
                                        id={id}
                                        className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-main-red shadow-sm transition-all duration-300"
                                    />
                                </div>
                            ))}

                            <div>
                                <label htmlFor="message" className="font-medium text-gray-700">Mensagem</label>
                                <textarea
                                    id="message"
                                    rows={5}
                                    className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-main-red shadow-sm transition-all duration-300"
                                ></textarea>
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
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Nossas Informações</h2>
                        <div className="space-y-4 text-gray-600">
                            {[
                                { icon: FiMapPin, text: "Av. Brasília, n°35 - Vila Julieta, Resende - RJ, 27521-060" },
                                { icon: FiPhone, text: "(24) 99903-7716" },
                                { icon: FiMail, text: "contato@jaautomoveis.com" }
                            ].map(({ icon: Icon, text }, idx) => (
                                <p key={idx} className="flex items-center group">
                                    <Icon className="mr-3 text-main-red group-hover:text-red-700 transition-colors duration-300" size={20} />
                                    {text}
                                </p>
                            ))}
                        </div>
                        <div className="mt-8 h-80 rounded-xl overflow-hidden shadow-lg border border-gray-200">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3686.0969984913757!2d-44.46753692566539!3d-22.47133702206713!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9e7f64ea81fb05%3A0xda764a546db009b0!2sJA%20Autom%C3%B3veis!5e0!3m2!1sen!2sbr!4v1722368940567!5m2!1sen!2sbr"
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
            <TopButton />
        </div>
    );
};

export default ContactPage;
