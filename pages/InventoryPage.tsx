import React, { useState, useMemo } from 'react';
import { useVehicleData } from '../hooks/useVehicleData.tsx';
import VehicleCard from '../components/VehicleCard.tsx';
import { motion } from 'framer-motion';
import { FiFilter, FiX } from 'react-icons/fi';
import TopButton from '../components/TopButton.tsx';

const InventoryPage: React.FC = () => {
  const { vehicles, loading } = useVehicleData();

  const [makeFilter, setMakeFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  const uniqueMakes = useMemo(() => [...new Set(vehicles.map(v => v.make))], [vehicles]);
  const uniqueYears = useMemo(() => [...new Set(vehicles.map(v => v.year))].sort((a, b) => b - a), [vehicles]);

  const filteredAndSortedVehicles = useMemo(() => {
    let tempVehicles = vehicles.filter(vehicle => {
      const passesMake = !makeFilter || vehicle.make === makeFilter;
      const passesYear = !yearFilter || vehicle.year === parseInt(yearFilter, 10);
      const passesPrice = !priceFilter || (
        (priceFilter === '50000' && vehicle.price < 50000) ||
        (priceFilter === '50000-100000' && vehicle.price >= 50000 && vehicle.price <= 100000) ||
        (priceFilter === '100000' && vehicle.price > 100000)
      );
      return passesMake && passesYear && passesPrice;
    });

    if (sortBy === 'price-asc') tempVehicles.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-desc') tempVehicles.sort((a, b) => b.price - a.price);
    else if (sortBy === 'km-asc') tempVehicles.sort((a, b) => a.km - b.km);
    else if (sortBy === 'km-desc') tempVehicles.sort((a, b) => b.km - a.km);

    return tempVehicles;
  }, [vehicles, makeFilter, yearFilter, priceFilter, sortBy]);

  const resetFilters = () => {
    setMakeFilter('');
    setYearFilter('');
    setPriceFilter('');
    setSortBy('recent');
  };

  return (
    <div className="bg-gray-50 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-500 text-transparent bg-clip-text">
            Nosso Estoque
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            Explore nossa seleção de veículos de qualidade. O carro ideal para você está aqui.
          </p>
        </motion.div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-md mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700">Marca</label>
            <select
              onChange={(e) => setMakeFilter(e.target.value)}
              value={makeFilter}
              className="mt-1 block w-full p-2 border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todas</option>
              {uniqueMakes.map(make => <option key={make} value={make}>{make}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Ano</label>
            <select
              onChange={(e) => setYearFilter(e.target.value)}
              value={yearFilter}
              className="mt-1 block w-full p-2 border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos</option>
              {uniqueYears.map(year => <option key={year} value={year}>{year}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Preço</label>
            <select
              onChange={(e) => setPriceFilter(e.target.value)}
              value={priceFilter}
              className="mt-1 block w-full p-2 border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Qualquer</option>
              <option value="50000">Abaixo de R$50.000</option>
              <option value="50000-100000">R$50.000 - R$100.000</option>
              <option value="100000">Acima de R$100.000</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Ordenar por</label>
            <select
              onChange={(e) => setSortBy(e.target.value)}
              value={sortBy}
              className="mt-1 block w-full p-2 border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="recent">Mais Recentes</option>
              <option value="price-asc">Menor Preço</option>
              <option value="price-desc">Maior Preço</option>
              <option value="km-asc">Menor KM</option>
              <option value="km-desc">Maior KM</option>
            </select>
          </div>

          <button
            onClick={resetFilters}
            className="flex items-center justify-center gap-2 w-full bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
          >
            <FiX /> Limpar
          </button>
        </div>

        {/* Summary */}
        <div className="mb-12 text-sm text-gray-600" aria-live="polite">
          {loading ? 'Carregando resultados...' : `${filteredAndSortedVehicles.length} veículo(s) encontrado(s).`}
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
            {filteredAndSortedVehicles.length > 0 ? (
              filteredAndSortedVehicles.map(vehicle => (
                <motion.div
                  key={vehicle.id}
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
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
      <TopButton />
    </div>
  );
};

export default InventoryPage;
