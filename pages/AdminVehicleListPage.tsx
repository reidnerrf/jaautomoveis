import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useVehicleData } from '../hooks/useVehicleData.tsx';
import { FiEdit, FiTrash2, FiPlus, FiSearch, FiRefreshCw } from 'react-icons/fi';

const AdminVehicleListPage: React.FC = () => {
    const { vehicles, deleteVehicle, loading } = useVehicleData();

    const [nameFilter, setNameFilter] = useState('');
    const [yearFilter, setYearFilter] = useState('');
    const [colorFilter, setColorFilter] = useState('');

    const uniqueYears = useMemo(
        () => [...new Set(vehicles.map(v => v.year))].sort((a, b) => b - a),
        [vehicles]
    );
    const uniqueColors = useMemo(
        () => [...new Set(vehicles.map(v => v.color))],
        [vehicles]
    );

    const filteredVehicles = useMemo(() => {
        return vehicles.filter(vehicle => {
            const nameMatch = vehicle.name.toLowerCase().includes(nameFilter.toLowerCase());
            const yearMatch = !yearFilter || vehicle.year === parseInt(yearFilter, 10);
            const colorMatch = !colorFilter || vehicle.color === colorFilter;
            return nameMatch && yearMatch && colorMatch;
        });
    }, [vehicles, nameFilter, yearFilter, colorFilter]);

    const clearFilters = () => {
        setNameFilter('');
        setYearFilter('');
        setColorFilter('');
    };

    const handleDelete = (id: string, name: string) => {
        if (window.confirm(`Tem certeza que deseja excluir "${name}"?`)) {
            deleteVehicle(id);
        }
    };

    return (
        <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
            
            {/* Cabeçalho */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-3xl font-bold text-gray-800 tracking-tight">
                    📦 Estoque de Veículos <span className="text-primary">({filteredVehicles.length})</span>
                </h2>
                <Link
                    to="/admin/vehicles/new"
                    className="inline-flex items-center gap-2 rounded-lg bg-primary py-3 px-6 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                    <FiPlus size={20} /> Adicionar Novo
                </Link>
            </div>

            {/* Filtros */}
            <div className="rounded-lg border border-gray-200 bg-white shadow-md p-5 mb-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
                    <div className="flex items-center border border-gray-300 rounded-lg px-3 focus-within:border-primary transition">
                        <FiSearch className="text-gray-500" />
                        <input
                            type="text"
                            placeholder="Buscar por nome..."
                            value={nameFilter}
                            onChange={(e) => setNameFilter(e.target.value)}
                            className="w-full bg-transparent py-2 px-2 outline-none"
                        />
                    </div>

                    <select
                        value={yearFilter}
                        onChange={(e) => setYearFilter(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-transparent py-2 px-3 outline-none focus:border-primary transition"
                    >
                        <option value="">Filtrar por Ano</option>
                        {uniqueYears.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>

                    <select
                        value={colorFilter}
                        onChange={(e) => setColorFilter(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-transparent py-2 px-3 outline-none focus:border-primary transition"
                    >
                        <option value="">Filtrar por Cor</option>
                        {uniqueColors.map(color => (
                            <option key={color} value={color}>{color}</option>
                        ))}
                    </select>

                    <button
                        onClick={clearFilters}
                        className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 py-2 px-4 font-medium text-gray-600 hover:bg-gray-100 transition"
                    >
                        <FiRefreshCw /> Limpar
                    </button>
                </div>
            </div>

            {/* Tabela */}
            <div className="rounded-lg border border-gray-200 bg-white shadow-md overflow-hidden">
                <div className="max-w-full overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 text-left text-gray-700">
                                <th className="py-4 px-4 font-semibold">Veículo</th>
                                <th className="py-4 px-4 font-semibold">Marca / Modelo</th>
                                <th className="py-4 px-4 font-semibold">Preço</th>
                                <th className="py-4 px-4 font-semibold hidden sm:table-cell">Ano</th>
                                <th className="py-4 px-4 font-semibold">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-10 text-gray-500">
                                        Carregando veículos...
                                    </td>
                                </tr>
                            ) : filteredVehicles.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-10 text-gray-500">
                                        Nenhum veículo encontrado.
                                    </td>
                                </tr>
                            ) : (
                                filteredVehicles.map(vehicle => (
                                    <tr
                                        key={vehicle.id}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="border-t border-gray-200 py-4 px-4">
                                            <div className="flex items-center gap-4">
                                                <img
                                                    src={vehicle.images[0]}
                                                    alt={vehicle.name}
                                                    className="h-14 w-20 rounded-md object-cover shadow-sm"
                                                />
                                                <p className="font-medium text-gray-800">{vehicle.name}</p>
                                            </div>
                                        </td>
                                        <td className="border-t border-gray-200 py-4 px-4">
                                            {vehicle.make} / {vehicle.model}
                                        </td>
                                        <td className="border-t border-gray-200 py-4 px-4 font-semibold text-primary">
                                            {new Intl.NumberFormat('pt-BR', {
                                                style: 'currency',
                                                currency: 'BRL',
                                            }).format(vehicle.price)}
                                        </td>
                                        <td className="border-t border-gray-200 py-4 px-4 hidden sm:table-cell">
                                            {vehicle.year}
                                        </td>
                                        <td className="border-t border-gray-200 py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <Link
                                                    to={`/admin/vehicles/edit/${vehicle.id}`}
                                                    className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                                                >
                                                    <FiEdit size={18} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(vehicle.id, vehicle.name)}
                                                    className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                                                >
                                                    <FiTrash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminVehicleListPage;
