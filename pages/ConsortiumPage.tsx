import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ConsortiumPage: React.FC = () => {
    const [creditAmount, setCreditAmount] = useState<number>(80000);
    const [term, setTerm] = useState<number>(72);
    const [simulation, setSimulation] = useState<{ installment: number } | null>(null);

    const handleSimulate = (e: React.FormEvent) => {
        e.preventDefault();
        // Simple simulation logic (assuming a 15% administration fee)
        const adminFee = 0.15;
        const totalAmount = creditAmount * (1 + adminFee);
        const installmentValue = totalAmount / term;
        setSimulation({ installment: installmentValue });
    };

    return (
        <div className="bg-comp-light-gray py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-2xl"
                >
                    <h1 className="text-4xl font-bold text-center text-gray-800 mb-2">Simulação de Consórcio</h1>
                    <p className="text-center text-gray-600 mb-8">Planeje sua compra sem juros.</p>
                    
                    <form onSubmit={handleSimulate} className="space-y-6">
                        <div>
                            <label htmlFor="creditAmount" className="block text-lg font-medium text-gray-700">
                                Valor do Crédito: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(creditAmount)}
                            </label>
                            <input
                                type="range"
                                id="creditAmount"
                                min="30000"
                                max="300000"
                                step="1000"
                                value={creditAmount}
                                onChange={(e) => setCreditAmount(Number(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-main-red"
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="term" className="block text-lg font-medium text-gray-700">
                                Prazo em Meses: {term}
                            </label>
                            <input
                                type="range"
                                id="term"
                                min="24"
                                max="84"
                                step="1"
                                value={term}
                                onChange={(e) => setTerm(Number(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-main-red"
                            />
                        </div>

                        <button type="submit" className="w-full bg-main-red text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-red-700 transition-colors duration-300">
                            Simular
                        </button>
                    </form>

                    {simulation && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-8 text-center bg-secondary-blue/10 p-6 rounded-lg border border-secondary-blue"
                        >
                            <h2 className="text-2xl font-bold text-comp-dark-blue mb-4">Resultado da Simulação</h2>
                            <p className="text-lg text-gray-700">
                                <span className="font-semibold">Parcelas a partir de</span>
                            </p>
                            <p className="text-4xl font-extrabold text-comp-dark-blue my-2">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(simulation.installment)}
                            </p>
                            <p className="text-xs text-gray-400 mt-4">*Simulação sem considerar fundo de reserva e seguro. Sujeito a formação de grupo.</p>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default ConsortiumPage;