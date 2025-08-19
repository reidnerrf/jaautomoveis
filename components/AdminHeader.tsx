import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMenu, FiLogOut, FiCalendar, FiMapPin } from "react-icons/fi";
import { useAuth } from "../hooks/useAuth.tsx";
import DarkModeToggle from "./DarkModeToggle.tsx";

interface AdminHeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({
  sidebarOpen,
  setSidebarOpen,
}) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  // Função para lidar com o logout
  // Redireciona para a página de login após o logout

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  const adminName = "Admin";