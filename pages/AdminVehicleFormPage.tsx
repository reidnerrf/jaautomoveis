
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useVehicleData } from '../hooks/useVehicleData.tsx';
import { Vehicle } from '../types';
import { FiArrowLeft, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth.tsx';

const AdminVehicleFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { getVehicleById, addVehicle, updateVehicle } = useVehicleData();
    const { logout } = useAuth();
    const isEditing = Boolean(id);

    const [vehicle, setVehicle] = useState<Omit<Vehicle, 'id' | 'price' | 'year' | 'km' | 'doors'> & { price: string, year: string, km: string, doors: string }>({
        name: '', price: '0', make: '', model: '', year: new Date().getFullYear().toString(), km: '0',
        color: '', gearbox: 'Manual', fuel: 'Flex', doors: '4',
        additionalInfo: '', optionals: [], images: []
    });

    useEffect(() => {
        if (isEditing && id) {
            const fetchVehicle = async () => {
                const existingVehicle = await getVehicleById(id);
                if (existingVehicle) {
                    setVehicle({
                        ...existingVehicle,
                        price: existingVehicle.price.toString(),
                        year: existingVehicle.year.toString(),
                        km: existingVehicle.km.toString(),
                        doors: existingVehicle.doors.toString()
                    });
                }
            };
            fetchVehicle();
        }
    }, [id, isEditing, getVehicleById]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setVehicle(prev => ({ ...prev, [name]: value }));
    };

    const handleArrayChange = (e: React.ChangeEvent<HTMLTextAreaElement>, field: 'optionals' | 'images') => {
        const values = e.target.value.split(',').map(item => item.trim());
        setVehicle(prev => ({ ...prev, [field]: values }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const vehicleDataToSubmit = {
            ...vehicle,
            price: Number(vehicle.price),
            year: Number(vehicle.year),
            km: Number(vehicle.km),
            doors: Number(vehicle.doors)
        };

        if (isEditing && id) {
            await updateVehicle({ ...vehicleDataToSubmit, id });
        } else {
            await addVehicle(vehicleDataToSubmit);
        }
        navigate('/admin/vehicles');
    };

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    return (
        <div className="min-h-screen bg-gray-100">
             <header className="bg-white shadow-md">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">{isEditing ? 'Editar Veículo' : 'Adicionar Novo Veículo'}</h1>
                    <div className="flex items-center space-x-4">
                        <Link to="/admin/vehicles" className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-800">
                           <FiArrowLeft className="mr-1" /> Voltar para a Lista
                        </Link>
                        <button onClick={handleLogout} className="flex items-center text-sm font-medium text-red-600 hover:text-red-800">
                            <FiLogOut className="mr-1" /> Sair
                        </button>
                    </div>
                </div>
            </header>
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nome</label>
                            <input type="text" name="name" value={vehicle.name} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2" required />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Preço</label>
                            <input type="number" name="price" value={vehicle.price} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2" required />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Marca</label>
                            <input type="text" name="make" value={vehicle.make} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2" required />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Modelo</label>
                            <input type="text" name="model" value={vehicle.model} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2" required />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Ano</label>
                            <input type="number" name="year" value={vehicle.year} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2" required />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Quilometragem (km)</label>
                            <input type="number" name="km" value={vehicle.km} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2" required />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Cor</label>
                            <input type="text" name="color" value={vehicle.color} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Portas</label>
                            <input type="number" name="doors" value={vehicle.doors} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Câmbio</label>
                            <select name="gearbox" value={vehicle.gearbox} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2">
                                <option>Manual</option>
                                <option>Automático</option>
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Combustível</label>
                            <select name="fuel" value={vehicle.fuel} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2">
                                <option>Gasolina</option>
                                <option>Etanol</option>
                                <option>Flex</option>
                                <option>Diesel</option>
                                <option>Elétrico</option>
                                <option>Híbrido</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Informações Adicionais</label>
                        <textarea name="additionalInfo" value={vehicle.additionalInfo} onChange={handleChange} rows={3} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Opcionais (separados por vírgula)</label>
                        <textarea name="optionals" value={vehicle.optionals.join(', ')} onChange={(e) => handleArrayChange(e, 'optionals')} rows={3} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"></textarea>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">URLs das Imagens (separadas por vírgula)</label>
                        <textarea name="images" value={vehicle.images.join(', ')} onChange={(e) => handleArrayChange(e, 'images')} rows={3} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2" required></textarea>
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" className="bg-main-red text-white font-bold py-2 px-6 rounded-md hover:bg-red-700 transition-colors">
                            {isEditing ? 'Atualizar Veículo' : 'Adicionar Veículo'}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default AdminVehicleFormPage;