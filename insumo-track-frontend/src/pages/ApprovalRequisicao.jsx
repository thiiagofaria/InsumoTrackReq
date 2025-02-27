import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useSearchParams, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const ApprovalRequisicao = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [requisicao, setRequisicao] = useState(null);
  const [observacao, setObservacao] = useState("");
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
    transition: "background-color 0.2s",
    marginRight: "10px"
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

  const textAreaStyle = {
    width: "100%",
    padding: "8px",
    fontSize: "0.95rem",
    borderRadius: "4px",
    border: "1px solid #ccc",
    marginTop: "6px"
  };

  useEffect(() => {
    const reqId = searchParams.get("reqId");
    if (reqId) {
      handleBuscar(reqId);
    }
  }, [searchParams]);

  const handleBuscar = async (reqId) => {
    setLoading(true);
    setError("");
    setRequisicao(null);
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
      if (data.codigo_projeto !== user.codigo_projeto) {
        throw new Error("Você não tem permissão para ver essa requisição.");
      }
      setRequisicao(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAprovacao = async (aprovado) => {
    if (requisicao.status_id !== 1) return;
    setLoading(true);
    setError("");

    try {
      const payload = { aprovado, observacao };
      const res = await fetch(`${API_URL}/requisicoes/${requisicao.id}/aprovar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Erro ao atualizar requisição");
      }
      await res.json();
      alert(`Requisição ${aprovado ? "APROVADA" : "REPROVADA"} com sucesso!`);
      navigate("/filtrar-requisicoes");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>Aprovação de Requisições</h1>

      {loading && <p style={{ fontStyle: "italic" }}>Carregando...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {requisicao ? (
        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>Detalhes da Requisição</h2>
          <p><strong>ID:</strong> {requisicao.id}</p>
          <p>
            <strong>Data:</strong>{" "}
            {new Date(requisicao.data_criacao).toLocaleString("pt-BR", {
              timeZone: "America/Sao_Paulo",
            })}
          </p>
          <p><strong>Usuário Criador:</strong> {requisicao.usuario_criador?.nome || "N/A"}</p>
          <p><strong>Empresa:</strong> {requisicao.empresa?.nome || "N/A"}</p>
          <p><strong>Observação da Requisição:</strong> {requisicao.justificativa || "N/A"}</p>

          {requisicao.status_id !== 1 ? (
            <p style={{ color: "blue", fontWeight: "bold" }}>
              {requisicao.status_id === 2
                ? "Requisição já foi aprovada"
                : "Requisição já foi reprovada"}
            </p>
          ) : (
            <>
              <h3 style={{ marginBottom: "10px" }}>Itens Requisitados</h3>
              {requisicao.itens && requisicao.itens.length > 0 ? (
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
              ) : (
                <p>Nenhum item adicionado.</p>
              )}

              <div style={{ marginTop: "20px" }}>
                <label style={{ fontWeight: "bold" }}>Observação (opcional):</label>
                <textarea
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  style={textAreaStyle}
                  rows={3}
                />
              </div>

              <div style={{ marginTop: "20px" }}>
                <button onClick={() => handleAprovacao(true)} style={buttonStyle}>
                  Aprovar
                </button>
                <button
                  onClick={() => handleAprovacao(false)}
                  style={{ ...buttonStyle, marginRight: 0 }}
                >
                  Reprovar
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        !loading && <p>Nenhuma requisição encontrada.</p>
      )}
    </div>
  );
};

export default ApprovalRequisicao;
