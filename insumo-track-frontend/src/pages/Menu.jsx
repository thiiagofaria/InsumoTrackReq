import React from "react";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL; // Pega do .env


const Menu = () => {
  // Estilos gerais
  const containerStyle = {
    width: "100vw",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f9f9f9",
    fontFamily: "Arial, sans-serif",
  };

  const systemTitleStyle = {
    fontSize: "2rem",
    marginBottom: "2rem",
    color: "#333",
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
