import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMenu, FiCalendar, FiLogOut, FiMapPin } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth.tsx';
import DarkModeToggle from './DarkModeToggle.tsx';

interface AdminHeaderProps {
	sidebarOpen: boolean;
	setSidebarOpen: (open: boolean) => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ sidebarOpen, setSidebarOpen }) => {
	const { logout } = useAuth();
	const navigate = useNavigate();

	const today = new Date().toLocaleDateString('pt-BR', {
		weekday: 'long',
		day: '2-digit',
		month: 'long',
		year: 'numeric',
	});

	const [currentCity, setCurrentCity] = React.useState<string>('');

	React.useEffect(() => {
		const fetchCity = async () => {
			try {
				const res = await fetch('/api/analytics/dashboard-stats', { credentials: 'include' });
				if (!res.ok) return;
				const data = await res.json();
				const top = (data.locationStats || []).find((l: any) => l._id && l._id !== 'unknown');
				setCurrentCity(top?._id || 'Desconhecido');
			} catch (e) {
				// ignore
			}
		};
		fetchCity();
	}, []);

	const handleLogout = async () => {
		await logout();
		navigate('/admin/login');
	};

	return (
		<header className="sticky top-0 z-40 flex w-full bg-white dark:bg-gray-900/85 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-800">
			<div className="flex flex-grow items-center justify-between py-4 px-4 md:px-6 2xl:px-11">
				
				{/* Botão menu e logo para mobile */}
				<div className="flex items-center gap-3 lg:hidden">
					<button
						aria-controls="sidebar"
						onClick={(e) => {
							e.stopPropagation();
							setSidebarOpen(!sidebarOpen);
						}}
						className="block rounded-md border border-gray-300 bg-white dark:bg-gray-800 p-1.5 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition"
					>
						<FiMenu size={22} />
					</button>
					<Link to="/admin" className="block">
						<img src="/assets/logo.png" alt="Logo" className="h-10 w-auto" />
					</Link>
				</div>

				{/* Informação do sistema */}
				<div className="hidden sm:flex items-center gap-4 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800">
					{/* Data */}
					<div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm font-medium">
						<FiCalendar size={18} className="text-gray-500" />
						<span>{today}</span>
					</div>

					{/* Local */}
					<div className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
						<FiMapPin size={16} className="text-red-500" />
						<span>{currentCity || 'Local não disponível'}</span>
					</div>

					{/* Status do sistema */}
					<div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
						<span className="relative flex h-2.5 w-2.5">
							<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
							<span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
						</span>
						Sistema Online
					</div>
				</div>

				{/* Ações (tema + perfil) */}
				<div className="flex items-center gap-3">
					<DarkModeToggle />
					<button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
						<FiLogOut />
						<span className="hidden sm:inline">Sair</span>
					</button>
					<div className="hidden lg:block text-right">
						<span className="block text-sm font-semibold text-gray-800 dark:text-white">
							Admin
						</span>
						<span className="block text-xs text-gray-500 dark:text-gray-400">
							Administrador
						</span>
					</div>
					<div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 font-bold">
						A
					</div>
				</div>
			</div>
		</header>
	);
};

export default AdminHeader;
