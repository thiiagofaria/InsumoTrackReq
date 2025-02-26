import React, { createContext, useState, useContext } from "react";

const AuthContext = createContext();

const API_URL = import.meta.env.VITE_API_URL; // Pega do .env


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async (email, password) => {
    // Faça a chamada ao endpoint de login
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: email, password }),
    });

    console.log("API_URL:", API_URL);


    if (!res.ok) {
      throw new Error("Falha no login");
    }
    const data = await res.json();
    // Atualize o estado com os dados do usuário
    setUser({
      id: data.id, // Adicionando o ID do usuário
      name: data.nome,
      obra: data.obra,
      codigo_projeto: data.codigo_projeto,
      token: data.token
    });
    
    setIsAuthenticated(true);
    // Se estiver retornando um token, salve-o (por exemplo, no state ou localStorage)
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
