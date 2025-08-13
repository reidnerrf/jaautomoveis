
import React, { useState, useMemo } from 'react';
import { useVehicleData } from '../hooks/useVehicleData.tsx';
import VehicleCard from '../components/VehicleCard.tsx';
import { motion } from 'framer-motion';

const InventoryPage: React.FC = () => {
  const { vehicles, loading } = useVehicleData();
  
  const [makeFilter, setMakeFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState('');

  const uniqueMakes = useMemo(() => [...new Set(vehicles.map(v => v.make))], [vehicles]);
  const uniqueYears = useMemo(() => [...new Set(vehicles.map(v => v.year))].sort((a, b) => b - a), [vehicles]);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(vehicle => {
      const passesMake = !makeFilter || vehicle.make === makeFilter;
      const passesYear = !yearFilter || vehicle.year === parseInt(yearFilter, 10);
      const passesPrice = !priceFilter || (
        (priceFilter === '50000' && vehicle.price < 50000) ||
        (priceFilter === '50000-100000' && vehicle.price >= 50000 && vehicle.price <= 100000) ||
        (priceFilter === '100000' && vehicle.price > 100000)
      );
      return passesMake && passesYear && passesPrice;
    });
  }, [vehicles, makeFilter, yearFilter, priceFilter]);

  const resetFilters = () => {
    setMakeFilter('');
    setYearFilter('');
    setPriceFilter('');
  };

  return (
    <div className="bg-white py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">Nosso Estoque</h1>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">Explore nossa seleção de veículos de qualidade. O carro ideal para você está aqui.</p>
        </motion.div>

        {/* Filters */}
        <div className="bg-comp-light-gray p-6 rounded-xl shadow-md mb-12 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700">Marca</label>
            <select onChange={(e) => setMakeFilter(e.target.value)} value={makeFilter} className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm focus:ring-secondary-blue focus:border-secondary-blue">
              <option value="">Todas</option>
              {uniqueMakes.map(make => <option key={make} value={make}>{make}</option>)}
            </select>
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700">Ano</label>
            <select onChange={(e) => setYearFilter(e.target.value)} value={yearFilter} className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm focus:ring-secondary-blue focus:border-secondary-blue">
              <option value="">Todos</option>
              {uniqueYears.map(year => <option key={year} value={year}>{year}</option>)}
            </select>
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700">Preço</label>
            <select onChange={(e) => setPriceFilter(e.target.value)} value={priceFilter} className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm focus:ring-secondary-blue focus:border-secondary-blue">
              <option value="">Qualquer</option>
              <option value="50000">Abaixo de R$50.000</option>
              <option value="50000-100000">R$50.000 - R$100.000</option>
              <option value="100000">Acima de R$100.000</option>
            </select>
          </div>
          <button 
            onClick={resetFilters}
            className="w-full bg-gray-500 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
          >
            Limpar Filtros
          </button>
        </div>
        
        {/* Vehicle Grid */}
        {loading ? (
          <div className="text-center py-16">Carregando veículos...</div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.05
                }
              }
            }}
          >
            {filteredVehicles.length > 0 ? (
              filteredVehicles.map(vehicle => (
                <motion.div key={vehicle.id} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                  <VehicleCard vehicle={vehicle} />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-16">
                <p className="text-gray-600 text-lg">Nenhum veículo encontrado com os filtros selecionados.</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default InventoryPage;
