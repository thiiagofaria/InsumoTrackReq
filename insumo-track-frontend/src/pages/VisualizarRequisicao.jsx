import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;


const VisualizarRequisicao = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [requisicao, setRequisicao] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

  const sectionTitleStyle = {
    marginTop: 0,
    borderBottom: "1px solid #ddd",
    paddingBottom: "8px",
    marginBottom: "16px",
    fontSize: "1.2rem",
    color: "#333"
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
    padding: "8px",
    textAlign: "left"
  };

  useEffect(() => {
    const reqId = searchParams.get("reqId");
    if (reqId) {
      fetchRequisicao(reqId);
    }
  }, [searchParams]);

  const fetchRequisicao = async (reqId) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/requisicoes/${reqId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Requisição não encontrada");
      }
      const data = await res.json();
      setRequisicao(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVoltar = () => {
    navigate("/filtrar-requisicoes");
  };

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>Visualizar Requisição</h1>

      {loading && <p style={{ fontStyle: "italic" }}>Carregando...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {requisicao && (
        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>Dados Gerais</h2>
          <p>
            <strong>ID:</strong> {requisicao.id}
          </p>
          <p>
            <strong>Data Criação:</strong>{" "}
            {new Date(requisicao.data_criacao).toLocaleString("pt-BR", {
              timeZone: "America/Sao_Paulo",
            })}
          </p>
          <p>
            <strong>Data Prog. Subida:</strong>{" "}
            {requisicao.data_programacao_subida
              ? new Date(requisicao.data_programacao_subida).toLocaleString("pt-BR", {
                  timeZone: "America/Sao_Paulo",
                })
              : "N/A"}
          </p>
          <p>
            <strong>Código do Projeto:</strong> {requisicao.codigo_projeto}
          </p>

          <h2 style={sectionTitleStyle}>Informações do Usuário e Empresa</h2>
          <p>
            <strong>Usuário Criador:</strong>{" "}
            {requisicao.usuario_criador?.nome || "N/A"}
          </p>
          {requisicao.usuario_aprovador_rel && (
            <p>
              <strong>Usuário Aprovador:</strong>{" "}
              {requisicao.usuario_aprovador_rel?.nome || "N/A"}
            </p>
          )}
          <p>
            <strong>Empresa:</strong> {requisicao.empresa?.nome || "N/A"}
          </p>

          <h2 style={sectionTitleStyle}>Detalhes da Requisição</h2>
          <p>
            <strong>Status:</strong> {requisicao.status?.descricao || "N/A"}
          </p>
          <p>
            <strong>Observação:</strong> {requisicao.justificativa || "N/A"}
          </p>

          {requisicao.itens && requisicao.itens.length > 0 && (
            <>
              <h2 style={sectionTitleStyle}>Itens da Requisição</h2>
              <table style={tableStyle}>
                <thead>
                  <tr style={tableHeaderStyle}>
                    <th style={thtdStyle}>Grupo de Serviço</th>
                    <th style={thtdStyle}>Material</th>
                    <th style={thtdStyle}>Unidade</th>
                    <th style={{ ...thtdStyle, textAlign: "center" }}>Quantidade</th>
                    <th style={thtdStyle}>Local de Aplicação</th>
                  </tr>
                </thead>
                <tbody>
                  {requisicao.itens.map((item, index) => (
                    <tr
                      key={index}
                      style={{
                        borderBottom: "1px solid #ddd",
                        backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#ffffff"
                      }}
                    >
                      <td style={thtdStyle}>{item.subgrupo_2}</td>
                      <td style={thtdStyle}>{item.descricao}</td>
                      <td style={thtdStyle}>{item.unidade_medida}</td>
                      <td style={{ ...thtdStyle, textAlign: "center" }}>
                        {item.quantidade_requisitada}
                      </td>
                      <td style={thtdStyle}>{item.local_aplicacao}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}

      <div style={{ textAlign: "right" }}>
        <button onClick={handleVoltar} style={buttonStyle}>
          Voltar
        </button>
      </div>
    </div>
  );
};

export default VisualizarRequisicao;
