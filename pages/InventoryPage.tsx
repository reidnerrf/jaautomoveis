
import React, { useState, useMemo, useEffect } from 'react';
import { useVehicleData } from '../hooks/useVehicleData.tsx';
import VehicleCard from '../components/VehicleCard.tsx';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFilter, FiX, FiSearch, FiGrid, FiList, FiChevronDown, FiMapPin, FiClock, FiTag, FiTrendingUp } from 'react-icons/fi';
import { FaCarSide, FaGasPump, FaCog, FaCalendarAlt } from 'react-icons/fa';
import TopButton from '../components/TopButton.tsx';

const InventoryPage: React.FC = () => {
  const { vehicles, loading } = useVehicleData();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [makeFilter, setMakeFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  const [colorFilter, setColorFilter] = useState('');
  const [fuelFilter, setFuelFilter] = useState('');
  const [transmissionFilter, setTransmissionFilter] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const itemsPerPage = 12;

  const uniqueMakes = useMemo(() => [...new Set(vehicles.map(v => v.make))].sort(), [vehicles]);
  const uniqueYears = useMemo(() => [...new Set(vehicles.map(v => v.year))].sort((a, b) => b - a), [vehicles]);
  const uniqueColors = useMemo(() => [...new Set(vehicles.map(v => v.color))].sort(), [vehicles]);
  const uniqueFuels = useMemo(() => [...new Set(vehicles.map(v => v.fuel || 'Flex'))], [vehicles]);
  const uniqueTransmissions = useMemo(() => [...new Set(vehicles.map(v => v.transmission || 'Manual'))], [vehicles]);

  const filteredAndSortedVehicles = useMemo(() => {
    let tempVehicles = vehicles.filter(vehicle => {
      const matchesSearch = vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           vehicle.model.toLowerCase().includes(searchTerm.toLowerCase());
      const passesMake = !makeFilter || vehicle.make === makeFilter;
      const passesYear = !yearFilter || vehicle.year === parseInt(yearFilter, 10);
      const passesColor = !colorFilter || vehicle.color === colorFilter;
      const passesFuel = !fuelFilter || (vehicle.fuel || 'Flex') === fuelFilter;
      const passesTransmission = !transmissionFilter || (vehicle.transmission || 'Manual') === transmissionFilter;
      const passesPrice = !priceFilter || (
        (priceFilter === '30000' && vehicle.price < 30000) ||
        (priceFilter === '30000-60000' && vehicle.price >= 30000 && vehicle.price <= 60000) ||
        (priceFilter === '60000-100000' && vehicle.price >= 60000 && vehicle.price <= 100000) ||
        (priceFilter === '100000' && vehicle.price > 100000)
      );
      
      return matchesSearch && passesMake && passesYear && passesColor && passesFuel && passesTransmission && passesPrice;
    });

    // Sorting
    switch (sortBy) {
      case 'price-asc': tempVehicles.sort((a, b) => a.price - b.price); break;
      case 'price-desc': tempVehicles.sort((a, b) => b.price - a.price); break;
      case 'km-asc': tempVehicles.sort((a, b) => a.km - b.km); break;
      case 'km-desc': tempVehicles.sort((a, b) => b.km - a.km); break;
      case 'year-desc': tempVehicles.sort((a, b) => b.year - a.year); break;
      case 'year-asc': tempVehicles.sort((a, b) => a.year - b.year); break;
      case 'name': tempVehicles.sort((a, b) => a.name.localeCompare(b.name)); break;
      default: break;
    }

    return tempVehicles;
  }, [vehicles, searchTerm, makeFilter, yearFilter, colorFilter, fuelFilter, transmissionFilter, priceFilter, sortBy]);

  const totalPages = Math.ceil(filteredAndSortedVehicles.length / itemsPerPage);
  const currentVehicles = filteredAndSortedVehicles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const resetFilters = () => {
    setSearchTerm('');
    setMakeFilter('');
    setYearFilter('');
    setPriceFilter('');
    setColorFilter('');
    setFuelFilter('');
    setTransmissionFilter('');
    setSortBy('recent');
    setCurrentPage(1);
  };

  const filterCount = [makeFilter, yearFilter, priceFilter, colorFilter, fuelFilter, transmissionFilter].filter(Boolean).length;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, makeFilter, yearFilter, priceFilter, colorFilter, fuelFilter, transmissionFilter, sortBy]);

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-12 text-white shadow-2xl"
        >
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10">
            <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">
              Encontre o Carro dos Seus
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Sonhos
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto mb-8 leading-relaxed">
              {filteredAndSortedVehicles.length} veículos selecionados com qualidade garantida e preços imperdíveis
            </p>
            <div className="flex flex-wrap justify-center items-center gap-6 text-blue-100">
              <div className="flex items-center gap-2">
                <FiTag className="text-yellow-300" />
                <span>Melhores Preços</span>
              </div>
              <div className="flex items-center gap-2">
                <FaCarSide className="text-green-300" />
                <span>Qualidade Garantida</span>
              </div>
              <div className="flex items-center gap-2">
                <FiTrendingUp className="text-pink-300" />
                <span>Financiamento Fácil</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search and View Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 flex flex-col lg:flex-row gap-4 items-center justify-between"
        >
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
            <input
              type="text"
              placeholder="Buscar por marca, modelo ou nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 text-lg rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 shadow-lg"
            />
          </div>

          <div className="flex items-center gap-4">
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-6 py-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 shadow-lg relative"
            >
              <FiFilter className="text-xl" />
              <span className="font-semibold">Filtros</span>
              {filterCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                  {filterCount}
                </span>
              )}
              <FiChevronDown className={`transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {/* View Mode Toggle */}
            <div className="flex bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-1 shadow-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  viewMode === 'grid' 
                    ? 'bg-blue-500 text-white shadow-md' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <FiGrid className="text-xl" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  viewMode === 'list' 
                    ? 'bg-blue-500 text-white shadow-md' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <FiList className="text-xl" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Advanced Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 overflow-hidden"
            >
              <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-3xl p-8 shadow-xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                  {/* Marca */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <FaCarSide className="text-blue-500" />
                      Marca
                    </label>
                    <select
                      value={makeFilter}
                      onChange={(e) => setMakeFilter(e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300"
                    >
                      <option value="">Todas as Marcas</option>
                      {uniqueMakes.map(make => (
                        <option key={make} value={make}>{make}</option>
                      ))}
                    </select>
                  </div>

                  {/* Ano */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <FaCalendarAlt className="text-green-500" />
                      Ano
                    </label>
                    <select
                      value={yearFilter}
                      onChange={(e) => setYearFilter(e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-4 focus:ring-green-500/30 focus:border-green-500 transition-all duration-300"
                    >
                      <option value="">Todos os Anos</option>
                      {uniqueYears.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>

                  {/* Preço */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <FiTag className="text-yellow-500" />
                      Faixa de Preço
                    </label>
                    <select
                      value={priceFilter}
                      onChange={(e) => setPriceFilter(e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-4 focus:ring-yellow-500/30 focus:border-yellow-500 transition-all duration-300"
                    >
                      <option value="">Qualquer Valor</option>
                      <option value="30000">Até R$ 30.000</option>
                      <option value="30000-60000">R$ 30.000 - R$ 60.000</option>
                      <option value="60000-100000">R$ 60.000 - R$ 100.000</option>
                      <option value="100000">Acima de R$ 100.000</option>
                    </select>
                  </div>

                  {/* Cor */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-r from-red-500 to-blue-500"></div>
                      Cor
                    </label>
                    <select
                      value={colorFilter}
                      onChange={(e) => setColorFilter(e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-300"
                    >
                      <option value="">Todas as Cores</option>
                      {uniqueColors.map(color => (
                        <option key={color} value={color}>{color}</option>
                      ))}
                    </select>
                  </div>

                  {/* Combustível */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <FaGasPump className="text-red-500" />
                      Combustível
                    </label>
                    <select
                      value={fuelFilter}
                      onChange={(e) => setFuelFilter(e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-4 focus:ring-red-500/30 focus:border-red-500 transition-all duration-300"
                    >
                      <option value="">Todos</option>
                      {uniqueFuels.map(fuel => (
                        <option key={fuel} value={fuel}>{fuel}</option>
                      ))}
                    </select>
                  </div>

                  {/* Transmissão */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <FaCog className="text-indigo-500" />
                      Transmissão
                    </label>
                    <select
                      value={transmissionFilter}
                      onChange={(e) => setTransmissionFilter(e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-300"
                    >
                      <option value="">Todas</option>
                      {uniqueTransmissions.map(transmission => (
                        <option key={transmission} value={transmission}>{transmission}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Filter Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 pt-6 border-t-2 border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-4">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300"
                    >
                      <option value="recent">Mais Recentes</option>
                      <option value="price-asc">Menor Preço</option>
                      <option value="price-desc">Maior Preço</option>
                      <option value="km-asc">Menor KM</option>
                      <option value="km-desc">Maior KM</option>
                      <option value="year-desc">Mais Novo</option>
                      <option value="year-asc">Mais Antigo</option>
                      <option value="name">Nome A-Z</option>
                    </select>
                  </div>
                  
                  <button
                    onClick={resetFilters}
                    className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <FiX />
                    Limpar Todos
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4"
        >
          <div className="text-gray-600 dark:text-gray-400">
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {filteredAndSortedVehicles.length}
            </span> {filteredAndSortedVehicles.length === 1 ? 'veículo encontrado' : 'veículos encontrados'}
          </div>
          
          {totalPages > 1 && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Página {currentPage} de {totalPages}
            </div>
          )}
        </motion.div>

        {/* Vehicle Grid/List */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <FaCarSide className="text-blue-500 text-xl animate-pulse" />
              </div>
            </div>
          </div>
        ) : currentVehicles.length > 0 ? (
          <motion.div
            className={`${
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8'
                : 'space-y-6'
            }`}
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.03
                }
              }
            }}
          >
            {currentVehicles.map((vehicle, index) => (
              <motion.div
                key={vehicle.id}
                variants={{ 
                  hidden: { opacity: 0, y: 30, scale: 0.95 }, 
                  visible: { opacity: 1, y: 0, scale: 1 } 
                }}
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 200, 
                  damping: 20,
                  delay: index * 0.05 
                }}
              >
                <VehicleCard vehicle={vehicle} viewMode={viewMode} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-24"
          >
            <div className="text-8xl mb-6">🔍</div>
            <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-4">
              Nenhum veículo encontrado
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Tente ajustar seus filtros ou faça uma nova busca para encontrar o carro ideal.
            </p>
            <button
              onClick={resetFilters}
              className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Ver Todos os Veículos
            </button>
          </motion.div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 flex justify-center"
          >
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                Anterior
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + Math.max(1, Math.min(currentPage - 2, totalPages - 4));
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      currentPage === page
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                Próxima
              </button>
            </div>
          </motion.div>
        )}
      </div>
      <TopButton />
    </div>
  );
};

export default InventoryPage;
