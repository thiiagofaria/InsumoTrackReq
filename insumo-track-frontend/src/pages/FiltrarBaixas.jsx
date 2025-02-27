import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;


function FilterBaixas() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [requisicaoId, setRequisicaoId] = useState("");
  const [dataBaixaInicio, setDataBaixaInicio] = useState("");
  const [dataBaixaFim, setDataBaixaFim] = useState("");

  const [baixas, setBaixas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const containerStyle = {
    maxWidth: "1000px",
    margin: "30px auto",
    fontFamily: "Arial, sans-serif",
    padding: "0 20px"
  };

  const titleStyle = {
    textAlign: "center",
    marginBottom: "1rem",
    fontSize: "1.8rem",
    color: "#333"
  };

  const cardStyle = {
    backgroundColor: "#fff",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "20px"
  };

  const formRowStyle = {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    marginBottom: "12px"
  };

  const labelContainerStyle = {
    display: "flex",
    flexDirection: "column",
    flex: "1 1 200px"
  };

  const labelStyle = {
    fontWeight: "bold",
    marginBottom: "4px"
  };

  const inputStyle = {
    padding: "6px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "0.95rem"
  };

  const buttonStyle = {
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "1rem",
    transition: "background-color 0.2s"
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "10px",
    fontSize: "0.95rem"
  };

  const tableHeaderStyle = {
    backgroundColor: "#007bff",
    color: "#fff",
    textAlign: "left"
  };

  const thtdStyle = {
    border: "1px solid #ccc",
    padding: "8px"
  };

  const handleFilter = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setBaixas([]);

    const params = new URLSearchParams();
    if (requisicaoId.trim() !== "") {
      params.append("requisicao_id", requisicaoId.trim());
    }
    if (dataBaixaInicio.trim() !== "") {
      params.append("data_baixa_inicio", dataBaixaInicio);
    }
    if (dataBaixaFim.trim() !== "") {
      params.append("data_baixa_fim", dataBaixaFim);
    }

    try {
      const res = await fetch(`${API_URL}/requisicoes/baixas?${params.toString()}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`
        }
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Erro ao buscar baixas");
      }
      const data = await res.json();
      setBaixas(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>Filtrar Baixas de Itens</h1>

      <div style={cardStyle}>
        <form onSubmit={handleFilter}>
          <div style={formRowStyle}>
            <div style={labelContainerStyle}>
              <label style={labelStyle}>Requisição ID:</label>
              <input
                type="text"
                value={requisicaoId}
                onChange={(e) => setRequisicaoId(e.target.value)}
                style={inputStyle}
                placeholder="Ex: 51"
              />
            </div>
          </div>

          <div style={formRowStyle}>
            <div style={labelContainerStyle}>
              <label style={labelStyle}>Data Baixa Início:</label>
              <input
                type="date"
                value={dataBaixaInicio}
                onChange={(e) => setDataBaixaInicio(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={labelContainerStyle}>
              <label style={labelStyle}>Data Baixa Fim:</label>
              <input
                type="date"
                value={dataBaixaFim}
                onChange={(e) => setDataBaixaFim(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ textAlign: "right", marginTop: "10px" }}>
            <button type="submit" style={buttonStyle}>
              Filtrar
            </button>
          </div>
        </form>
      </div>

      {loading && <p style={{ fontStyle: "italic" }}>Carregando...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {baixas.length > 0 && (
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0, marginBottom: "16px" }}>Baixas Encontradas</h2>
          <table style={tableStyle}>
            <thead>
              <tr style={tableHeaderStyle}>
                <th style={thtdStyle}>ID</th>
                <th style={thtdStyle}>Requisição ID</th>
                <th style={thtdStyle}>Material</th>
                <th style={thtdStyle}>Unidade</th>
                <th style={thtdStyle}>Empresa</th>
                <th style={thtdStyle}>Quantidade Baixada</th>
                <th style={thtdStyle}>Data Baixa</th>
                <th style={thtdStyle}>Usuário Baixa</th>
                <th style={thtdStyle}>Local de Aplicação</th>
              </tr>
            </thead>
            <tbody>
              {baixas.map((baixa, index) => (
                <tr key={baixa.id} style={{ backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#ffffff" }}>
                  <td style={thtdStyle}>{baixa.id}</td>
                  <td style={thtdStyle}>{baixa.requisicao_id}</td>
                  <td style={thtdStyle}>{baixa.item_descricao || "N/A"}</td>
                  <td style={thtdStyle}>{baixa.unidade_medida || "N/A"}</td>
                  <td style={thtdStyle}>{baixa.empresa || "N/A"}</td>
                  <td style={thtdStyle}>{baixa.quantidade_baixada}</td>
                  <td style={thtdStyle}>
                    {new Date(baixa.data_baixa).toLocaleString("pt-BR", {
                      timeZone: "America/Sao_Paulo"
                    })}
                  </td>
                  <td style={thtdStyle}>{baixa.usuario_baixa_nome || "N/A"}</td>
                  <td style={thtdStyle}>{baixa.local_aplicacao || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <button style={buttonStyle} onClick={() => navigate("/menu")}>
          Voltar
        </button>
      </div>
    </div>
  );
}

export default FilterBaixas;
