import React from 'react';
import { motion } from 'framer-motion';
import { FiMapPin, FiPhone, FiMail } from 'react-icons/fi';

const ContactPage: React.FC = () => {
    return (
        <div className="bg-comp-light-gray py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                >
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">Fale Conosco</h1>
                    <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">Estamos prontos para te atender. Envie-nos uma mensagem ou faça-nos uma visita.</p>
                </motion.div>

                <div className="mt-16 bg-white p-8 rounded-xl shadow-2xl grid md:grid-cols-2 gap-12">
                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                    >
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Envie uma Mensagem</h2>
                        <form className="space-y-5">
                            <div>
                                <label htmlFor="name" className="font-medium text-gray-700">Nome</label>
                                <input type="text" id="name" className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-blue"/>
                            </div>
                            <div>
                                <label htmlFor="email" className="font-medium text-gray-700">Email</label>
                                <input type="email" id="email" className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-blue"/>
                            </div>
                            <div>
                                <label htmlFor="message" className="font-medium text-gray-700">Mensagem</label>
                                <textarea id="message" rows={5} className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-blue"></textarea>
                            </div>
                            <button type="submit" className="w-full bg-main-red text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-red-700 transition-colors duration-300">
                                Enviar
                            </button>
                        </form>
                    </motion.div>

                    {/* Contact Info & Map */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                    >
                         <h2 className="text-2xl font-bold text-gray-800 mb-6">Nossas Informações</h2>
                         <div className="space-y-4 text-gray-600">
                            <p className="flex items-center"><FiMapPin className="mr-3 text-main-red" size={20} /> Rua do Carro, 123, São Paulo, SP, 01310-200</p>
                            <p className="flex items-center"><FiPhone className="mr-3 text-main-red" size={20} /> (11) 99999-9999</p>
                            <p className="flex items-center"><FiMail className="mr-3 text-main-red" size={20} /> contato@jaautomoveis.com</p>
                         </div>
                         <div className="mt-8 h-80 rounded-lg overflow-hidden shadow-xl">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.197576594255!2d-46.65653638487473!3d-23.56133936754323!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce59c8da0aa315%3A0x266854b778b32b2f!2sAv.%20Paulista%2C%20S%C3%A3o%20Paulo%20-%20SP%2C%20Brazil!5e0!3m2!1sen!2sus!4v1618855675841!5m2!1sen!2sus"
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