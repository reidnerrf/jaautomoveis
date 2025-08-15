import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar.tsx';
import AdminHeader from './AdminHeader.tsx';

const AdminLayout: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="bg-gray-100 text-body-color">
            <div className="flex h-screen overflow-hidden">
                <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                
                <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
                    <AdminHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                    <main>
                       <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;
