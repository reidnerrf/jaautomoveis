
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useVehicleData } from '../hooks/useVehicleData.tsx';
import { useAuth } from '../hooks/useAuth.tsx';
import { FiEdit, FiTrash2, FiPlus, FiArrowLeft, FiLogOut } from 'react-icons/fi';

const AdminVehicleListPage: React.FC = () => {
    const { vehicles, deleteVehicle, loading } = useVehicleData();
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleDelete = (id: string, name: string) => {
        if (window.confirm(`Tem certeza que deseja excluir "${name}"?`)) {
            deleteVehicle(id);
        }
    };
    
    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    return (
         <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow-md">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">Gerenciar Veículos</h1>
                     <div className="flex items-center space-x-4">
                        <Link to="/admin" className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-800">
                           <FiArrowLeft className="mr-1" /> Voltar ao Painel
                        </Link>
                        <button onClick={handleLogout} className="flex items-center text-sm font-medium text-red-600 hover:text-red-800">
                            <FiLogOut className="mr-1" /> Sair
                        </button>
                    </div>
                </div>
            </header>
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-end mb-6">
                    <Link to="/admin/vehicles/new" className="inline-flex items-center bg-green-500 text-white font-bold py-2 px-4 rounded-md hover:bg-green-600 transition-colors">
                        <FiPlus className="mr-2" /> Adicionar Veículo
                    </Link>
                </div>
                <div className="bg-white shadow-lg rounded-lg overflow-x-auto">
                    <table className="w-full table-auto">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Veículo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marca/Modelo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ano</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan={5} className="text-center py-4">Carregando...</td></tr>
                            ) : vehicles.map(vehicle => (
                                <tr key={vehicle.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <img className="h-10 w-10 rounded-full object-cover" src={vehicle.images[0]} alt={vehicle.name} />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{vehicle.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.make} / {vehicle.model}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(vehicle.price)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.year}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link to={`/admin/vehicles/edit/${vehicle.id}`} className="text-secondary-blue hover:text-comp-dark-blue mr-4"><FiEdit size={18}/></Link>
                                        <button onClick={() => handleDelete(vehicle.id, vehicle.name)} className="text-red-600 hover:text-red-900"><FiTrash2 size={18}/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
};

export default AdminVehicleListPage;