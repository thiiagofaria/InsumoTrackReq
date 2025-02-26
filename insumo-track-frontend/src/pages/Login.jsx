import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Usuário ou senha inválidos");
        } else if (response.status === 404) {
          throw new Error("Usuário não encontrado");
        } else {
          throw new Error(data.detail || "Erro desconhecido");
        }
      }

      await login(email, password);
      const from = location.state?.from?.pathname || "/menu";
      navigate(from, { replace: true });
    } catch (error) {
      console.error("Erro no login", error);
      setError(error.message);
    }
  };

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

  const inputStyle = {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  };

  const buttonStyle = {
    padding: "10px 16px",
    fontSize: "1rem",
    cursor: "pointer",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    transition: "background-color 0.2s",
  };

  const errorStyle = {
    color: "red",
    fontWeight: "bold",
    marginBottom: "10px",
  };

  return (
    <div style={containerStyle}>
      <h1 style={{ fontSize: "2rem", marginBottom: "2rem", color: "#333" }}>
        Sistema Gerenciador de Requisições
      </h1>
      <div style={cardStyle}>
        <h2 style={titleStyle}>Login</h2>
        {error && <p style={errorStyle}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div>
            <label>Email:</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label>Senha:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
            />
          </div>
          <button type="submit" style={buttonStyle}>
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;