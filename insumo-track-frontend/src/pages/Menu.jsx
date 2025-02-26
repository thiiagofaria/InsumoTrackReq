import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

const Menu = () => {
  const { user } = useAuth();
  const [obraNome, setObraNome] = useState("Carregando...");

  useEffect(() => {
    if (user?.codigo_projeto) {
      fetch(`${API_URL}/obras/${user.codigo_projeto}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.nome) {
            setObraNome(data.nome);
          } else {
            setObraNome("Não definida");
          }
        })
        .catch(() => setObraNome("Erro ao carregar"));
    } else {
      setObraNome("Não definida");
    }
  }, [user]);

  const containerStyle = {
    width: "100vw",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: "50px",
    backgroundColor: "#f9f9f9",
    fontFamily: "Arial, sans-serif",
  };

  const systemTitleStyle = {
    fontSize: "2rem",
    marginBottom: "1rem",
    color: "#333",
    textAlign: "center",
  };

  const userInfoStyle = {
    fontSize: "1.2rem",
    marginBottom: "1.5rem",
    color: "#555",
    textAlign: "center",
  };

  const cardStyle = {
    backgroundColor: "#fff",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    borderRadius: "8px",
    padding: "30px 40px",
    textAlign: "center",
    maxWidth: "400px",
  };

  const titleStyle = {
    fontSize: "1.8rem",
    color: "#333",
    marginBottom: "1.5rem",
  };

  const navStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    marginTop: "2rem",
  };

  const buttonStyle = {
    padding: "1rem 2rem",
    fontSize: "1.2rem",
    cursor: "pointer",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    transition: "background-color 0.2s",
  };

  return (
    <div style={containerStyle}>
      <h1 style={systemTitleStyle}>Sistema Gerenciador de Requisições</h1>
      <p style={userInfoStyle}>Você está logado como: {user?.name || "Usuário"}</p>
      <p style={userInfoStyle}>Obra: {obraNome}</p>
      <div style={cardStyle}>
        <h2 style={titleStyle}>Selecione uma opção</h2>
        <nav style={navStyle}>
          <Link to="/criar-requisicao">
            <button style={buttonStyle}>Criar Requisição</button>
          </Link>
          <Link to="/filtrar-requisicoes">
            <button style={buttonStyle}>Buscar Requisições</button>
          </Link>
          <Link to="/filtrar-baixas">
            <button style={buttonStyle}>Buscar Baixas</button>
          </Link>
        </nav>
      </div>
    </div>
  );
};

export default Menu;
