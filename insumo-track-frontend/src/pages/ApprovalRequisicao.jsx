// pages/ApprovalRequisicao.jsx
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

const ApprovalRequisicao = () => {
  const { user } = useAuth();
  const [reqId, setReqId] = useState("");
  const [requisicao, setRequisicao] = useState(null);
  const [observacao, setObservacao] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Estilos
  const containerStyle = {
    maxWidth: "900px",
    margin: "30px auto",
    fontFamily: "sans-serif",
  };

  const cardStyle = {
    border: "1px solid #ddd",
    borderRadius: "6px",
    padding: "16px",
    marginBottom: "20px",
  };

  const formRowStyle = {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    marginBottom: "12px",
  };

  const labelContainerStyle = {
    display: "flex",
    flexDirection: "column",
    flex: "1 1 200px",
  };

  const inputStyle = {
    padding: "6px",
    borderRadius: "4px",
    border: "1px solid #ccc",
  };

  const buttonStyle = {
    padding: "8px 16px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  };

  const thtdStyle = {
    border: "1px solid #ccc",
    padding: "8px",
    textAlign: "left",
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "10px",
    backgroundColor: "#fff",
  };

  // Função para resetar o estado da tela
  const resetTela = () => {
    setReqId("");
    setRequisicao(null);
    setObservacao("");
    setError("");
  };

  // Função para buscar a requisição pelo ID
  const handleBuscar = async () => {
    setLoading(true);
    setError("");
    setRequisicao(null);
    try {
      const res = await fetch(`http://127.0.0.1:8000/requisicoes/${reqId}`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`,
        },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Requisição não encontrada");
      }
      const data = await res.json();
      // Verifica se a requisição pertence à obra do usuário logado
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

  // Função para aprovar ou reprovar a requisição
  const handleAprovacao = async (aprovado) => {
    // Se a requisição não estiver pendente, não permite a intervenção.
    if (requisicao.status_id !== 1) {
      return;
    }
    setLoading(true);
    setError("");
    try {
      const payload = {
        aprovado,
        observacao,
      };
      const res = await fetch(`http://127.0.0.1:8000/requisicoes/${requisicao.id}/aprovar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Erro ao atualizar requisição");
      }
      const updatedReq = await res.json();
      alert(`Requisição ${aprovado ? "APROVADA" : "REPROVADA"} com sucesso!`);
      // Após a ação, resetar a tela
      resetTela();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <h1>Aprovação de Requisições</h1>

      {/* Campo para inserir o número da requisição e buscar */}
      <div style={cardStyle}>
        <div style={formRowStyle}>
          <div style={labelContainerStyle}>
            <label>Número da Requisição:</label>
            <input
              type="text"
              value={reqId}
              onChange={(e) => setReqId(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={labelContainerStyle}>
            <label>&nbsp;</label>
            <button onClick={handleBuscar} style={buttonStyle}>
              Buscar
            </button>
          </div>
        </div>
        {loading && <p>Carregando...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>

      {/* Exibição dos detalhes da requisição, se encontrada */}
      {requisicao && (
        <div style={cardStyle}>
          <h2>Detalhes da Requisição</h2>
          <p><strong>ID:</strong> {requisicao.id}</p>
          <p>
            <strong>Data:</strong>{" "}
            {new Date(requisicao.data_criacao).toLocaleString("pt-BR", {
              timeZone: "America/Sao_Paulo",
            })}
          </p>
          <p>
            <strong>Usuário Criador:</strong>{" "}
            {requisicao.usuario_criador?.nome || "N/A"}
          </p>
          <p>
            <strong>Empresa:</strong>{" "}
            {requisicao.empresa?.nome || "N/A"}
          </p>
          <p>
            <strong>Observação da Requisição:</strong>{" "}
            {requisicao.justificativa}
          </p>

          {/* Verifica o status da requisição */}
          {requisicao.status_id !== 1 ? (
            <p style={{ color: "blue", fontWeight: "bold" }}>
              {requisicao.status_id === 2
                ? "Requisição já foi aprovada"
                : "Requisição já foi reprovada"}
            </p>
          ) : (
            <>
              {/* Tabela de Itens Requisitados */}
              <h3>Itens Requisitados</h3>
              {requisicao.itens && requisicao.itens.length > 0 ? (
                <table style={tableStyle}>
                  <thead>
                    <tr style={{ backgroundColor: "#007bff", color: "#fff", textAlign: "left" }}>
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
                          backgroundColor: index % 2 === 0 ? "#f2f2f2" : "white",
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
                <label>Observação (opcional):</label>
                <textarea
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  style={{ width: "100%", padding: "6px" }}
                  rows={3}
                />
              </div>
              <div style={{ marginTop: "20px" }}>
                <button
                  onClick={() => handleAprovacao(true)}
                  style={{ ...buttonStyle, marginRight: "10px" }}
                >
                  Aprovar
                </button>
                <button onClick={() => handleAprovacao(false)} style={buttonStyle}>
                  Reprovar
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ApprovalRequisicao;
