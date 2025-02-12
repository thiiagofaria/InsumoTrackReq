// src/components/PrivateRoute.js
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();

  // Se o usuário não estiver autenticado, redirecione para o login
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  // Caso contrário, renderiza o conteúdo protegido
  return children;
};

export default PrivateRoute;
