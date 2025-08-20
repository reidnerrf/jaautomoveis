import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar.tsx";
import AdminHeader from "./AdminHeader.tsx";

const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div
      className="bg-gray-100 dark:bg-main-dark text-body-color"
      onClick={() => sidebarOpen && setSidebarOpen(false)}
    >
      <div className="flex h-screen overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Backdrop for mobile when sidebar is open */}
        {sidebarOpen ? (
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        ) : null}
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
