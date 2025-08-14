
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useVehicleData } from '../hooks/useVehicleData.tsx';
import { Vehicle } from '../types';
import { FiArrowLeft, FiLogOut, FiTrash2, FiUploadCloud } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth.tsx';

const carMakes = [
    'Fiat', 'Volkswagen', 'Chevrolet', 'Toyota', 'Hyundai', 'Renault', 'Jeep',
    'Honda', 'BYD', 'Nissan', 'Caoa Chery', 'Ford', 'Citroën', 'GWM', 'RAM',
    'Mitsubishi', 'Peugeot', 'BMW', 'Mercedes-Benz', 'Volvo'
];

const AdminVehicleFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { getVehicleById, addVehicle, updateVehicle } = useVehicleData();
    const { logout, token } = useAuth();
    const isEditing = Boolean(id);

    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');

    const [vehicle, setVehicle] = useState<Omit<Vehicle, 'id' | 'price' | 'year' | 'km' | 'doors'> & { price: string, year: string, km: string, doors: string }>({
        name: '', price: '', make: '', model: '', year: new Date().getFullYear().toString(), km: '',
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

    const handleArrayChange = (e: React.ChangeEvent<HTMLTextAreaElement>, field: 'optionals') => {
        const values = e.target.value.split(',').map(item => item.trim());
        setVehicle(prev => ({ ...prev, [field]: values }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const files = Array.from(e.target.files);
        const formData = new FormData();
        files.forEach(file => formData.append('images', file));
        formData.append('vehicleName', vehicle.name); // Send vehicle name to backend

        setIsUploading(true);
        setUploadError('');

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Falha no upload da imagem.');
            }

            const newImagePaths = await response.json();
            setVehicle(prev => ({ ...prev, images: [...prev.images, ...newImagePaths] }));
        } catch (error: any) {
            setUploadError(error.message);
        } finally {
            setIsUploading(false);
            e.target.value = ''; // Clear file input
        }
    };

    const handleDeleteImage = (imageUrl: string) => {
        if (window.confirm('Tem certeza que deseja remover esta imagem?')) {
            setVehicle(prev => ({ ...prev, images: prev.images.filter(url => url !== imageUrl) }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (vehicle.images.length === 0) {
            alert('Por favor, adicione pelo menos uma imagem.');
            return;
        }
        if (vehicle.make === '') {
            alert('Por favor, selecione uma marca.');
            return;
        }
        const vehicleDataToSubmit = {
            ...vehicle,
            price: Number(vehicle.price) || 0,
            year: Number(vehicle.year) || 0,
            km: Number(vehicle.km) || 0,
            doors: Number(vehicle.doors) || 0
        };

        try {
            if (isEditing && id) {
                await updateVehicle({ ...vehicleDataToSubmit, id });
            } else {
                await addVehicle(vehicleDataToSubmit);
            }
            navigate('/admin/vehicles');
        } catch (error) {
            console.error("Failed to save vehicle", error);
            alert("Falha ao salvar o veículo. Verifique o console para mais detalhes.");
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
                            <select name="make" value={vehicle.make} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2" required>
                                <option value="" disabled>Selecione uma marca</option>
                                {carMakes.map(make => (
                                    <option key={make} value={make}>{make}</option>
                                ))}
                            </select>
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
                        <label className="block text-sm font-medium text-gray-700">Imagens</label>
                        <div className="mt-2 p-4 border-2 border-dashed border-gray-300 rounded-md">
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 mb-4">
                                {vehicle.images.map(imageUrl => (
                                    <div key={imageUrl} className="relative group">
                                        <img src={imageUrl} alt="Preview do veículo" className="w-full h-24 object-cover rounded-md" />
                                        <button type="button" onClick={() => handleDeleteImage(imageUrl)} className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100">
                                            <FiTrash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-col items-center justify-center text-center p-4 bg-gray-50 rounded-md">
                                 <FiUploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-main-red hover:text-red-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-main-red">
                                    <span>Selecione as imagens</span>
                                    <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple accept="image/jpeg, image/png, image/webp" onChange={handleImageUpload} disabled={isUploading}/>
                                </label>
                                <p className="text-xs text-gray-500">ou arraste e solte</p>
                            </div>
                            {isUploading && <p className="text-sm text-gray-500 mt-2">Enviando imagens...</p>}
                            {uploadError && <p className="text-sm text-red-500 mt-2">{uploadError}</p>}
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Adicione pelo menos uma imagem (JPEG, PNG, WEBP). A primeira imagem será a capa do anúncio.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Informações Adicionais</label>
                        <textarea name="additionalInfo" value={vehicle.additionalInfo} onChange={handleChange} rows={3} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Opcionais (separados por vírgula)</label>
                        <textarea name="optionals" value={vehicle.optionals.join(', ')} onChange={(e) => handleArrayChange(e, 'optionals')} rows={3} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"></textarea>
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" disabled={isUploading} className="bg-main-red text-white font-bold py-2 px-6 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            {isUploading ? 'Enviando...' : (isEditing ? 'Atualizar Veículo' : 'Adicionar Veículo')}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default AdminVehicleFormPage;
