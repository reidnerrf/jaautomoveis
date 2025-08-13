
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useVehicleData } from '../hooks/useVehicleData.tsx';
import { useAuth } from '../hooks/useAuth.tsx';
import { FiGrid, FiPlusCircle, FiLogOut, FiList } from 'react-icons/fi';

const AdminDashboardPage: React.FC = () => {
    const { vehicles } = useVehicleData();
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow-md">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">Painel Administrativo</h1>
                    <button onClick={handleLogout} className="flex items-center text-sm font-medium text-red-600 hover:text-red-800">
                        <FiLogOut className="mr-1" /> Sair
                    </button>
                </div>
            </header>
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Stat Card */}
                    <div className="bg-white p-6 rounded-lg shadow-lg flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total de Veículos</p>
                            <p className="text-3xl font-bold text-gray-900">{vehicles.length}</p>
                        </div>
                        <div className="bg-secondary-blue text-white p-3 rounded-full">
                           <FiGrid size={24} />
                        </div>
                    </div>
                    {/* Add other stat cards here if needed */}
                </div>

                <div className="mt-12">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Gerenciamento</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Link to="/admin/vehicles" className="block bg-white p-6 rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all transform">
                            <FiList size={32} className="text-main-red mb-2" />
                            <h3 className="text-lg font-bold text-gray-800">Gerenciar Veículos</h3>
                            <p className="text-gray-600 mt-1">Veja, edite ou exclua veículos existentes.</p>
                        </Link>
                         <Link to="/admin/vehicles/new" className="block bg-white p-6 rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all transform">
                            <FiPlusCircle size={32} className="text-green-500 mb-2" />
                            <h3 className="text-lg font-bold text-gray-800">Adicionar Novo Veículo</h3>
                            <p className="text-gray-600 mt-1">Cadastre um novo veículo no estoque.</p>
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboardPage;