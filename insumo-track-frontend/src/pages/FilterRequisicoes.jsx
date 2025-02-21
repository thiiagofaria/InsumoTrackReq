// pages/FilterRequisicoes.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function FilterRequisicoes() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Estados para listas (empresas e status) carregadas do backend
  const [empresas, setEmpresas] = useState([]);
  const [listaStatus, setListaStatus] = useState([]);

  // Filtros que o usuário digita ou seleciona
  const [numeroRequisicao, setNumeroRequisicao] = useState("");
  const [dataCriacaoInicio, setDataCriacaoInicio] = useState("");
  const [dataCriacaoFim, setDataCriacaoFim] = useState("");
  const [empresaSelecionada, setEmpresaSelecionada] = useState("");
  const [statusSelecionado, setStatusSelecionado] = useState("");
  const [dataProgSubidaInicio, setDataProgSubidaInicio] = useState("");
  const [dataProgSubidaFim, setDataProgSubidaFim] = useState("");

  // Estado para resultado, loading e erros
  const [requisicoes, setRequisicoes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ======================================================
  // Estilos
  // ======================================================
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

  // Ações
  const actionButtonContainer = { display: "flex", gap: "8px" };
  const actionButtonBase = {
    padding: "6px 12px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.9rem",
    transition: "background-color 0.2s"
  };

  const baixarButtonStyle = {
    ...actionButtonBase,
    backgroundColor: "#28a745",
    color: "#fff"
  };

  const visualizarButtonStyle = {
    ...actionButtonBase,
    backgroundColor: "#17a2b8",
    color: "#fff"
  };

  const acessarButtonStyle = {
    ...actionButtonBase,
    backgroundColor: "#ffc107",
    color: "#000"
  };

  // ======================================================
  // Efeitos: Carregar empresas e status
  // ======================================================
  useEffect(() => {
    if (!user?.token) return;

    // Buscar empresas
    fetch("http://127.0.0.1:8000/empresas", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao buscar lista de empresas");
        return res.json();
      })
      .then((data) => setEmpresas(data))
      .catch((err) => console.error("Erro ao buscar empresas:", err));

    // Buscar lista de status
    fetch("http://127.0.0.1:8000/status-requisicao", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao buscar lista de status");
        return res.json();
      })
      .then((data) => setListaStatus(data))
      .catch((err) => console.error("Erro ao buscar status:", err));
  }, [user?.token]);

  // ======================================================
  // Função de Filtro
  // ======================================================
  const handleFilter = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setRequisicoes([]);

    // Cria os parâmetros da query
    const params = new URLSearchParams();

    if (numeroRequisicao.trim() !== "") {
      params.append("req_id", numeroRequisicao.trim());
    } else {
      if (dataCriacaoInicio.trim() !== "") {
        params.append("data_criacao_inicio", dataCriacaoInicio);
      }
      if (dataCriacaoFim.trim() !== "") {
        params.append("data_criacao_fim", dataCriacaoFim);
      }
      if (empresaSelecionada.trim() !== "") {
        params.append("empresa", empresaSelecionada);
      }
      if (statusSelecionado.trim() !== "") {
        params.append("status", statusSelecionado);
      }
      if (dataProgSubidaInicio.trim() !== "") {
        params.append("data_programacao_subida_inicio", dataProgSubidaInicio);
      }
      if (dataProgSubidaFim.trim() !== "") {
        params.append("data_programacao_subida_fim", dataProgSubidaFim);
      }
    }

    try {
      const res = await fetch(`http://127.0.0.1:8000/requisicoes/filter?${params.toString()}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`
        }
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Erro ao buscar requisições");
      }
      const data = await res.json();
      setRequisicoes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // Ações de Navegação
  // ======================================================
  const handleBaixarClick = (reqId) => {
    navigate(`/baixa-itens?reqId=${reqId}`);
  };

  const handleAcessarClick = (reqId) => {
    navigate(`/approval-requisicao?reqId=${reqId}`);
  };

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>Filtrar Requisições</h1>

      {/* CARD DE FILTROS */}
      <div style={cardStyle}>
        <form onSubmit={handleFilter}>
          <div style={formRowStyle}>
            <div style={labelContainerStyle}>
              <label style={labelStyle}>Número da Requisição:</label>
              <input
                type="text"
                value={numeroRequisicao}
                onChange={(e) => setNumeroRequisicao(e.target.value)}
                style={inputStyle}
                placeholder="Ex: 41"
              />
            </div>
          </div>

          <div style={formRowStyle}>
            <div style={labelContainerStyle}>
              <label style={labelStyle}>Data Criação Início:</label>
              <input
                type="date"
                value={dataCriacaoInicio}
                onChange={(e) => setDataCriacaoInicio(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={labelContainerStyle}>
              <label style={labelStyle}>Data Criação Fim:</label>
              <input
                type="date"
                value={dataCriacaoFim}
                onChange={(e) => setDataCriacaoFim(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={formRowStyle}>
            <div style={labelContainerStyle}>
              <label style={labelStyle}>Empresa:</label>
              <select
                style={inputStyle}
                value={empresaSelecionada}
                onChange={(e) => setEmpresaSelecionada(e.target.value)}
              >
                <option value="">Selecione...</option>
                {empresas.map((emp) => (
                  <option key={emp.id} value={emp.nome}>
                    {emp.nome}
                  </option>
                ))}
              </select>
            </div>
            <div style={labelContainerStyle}>
              <label style={labelStyle}>Status:</label>
              <select
                style={inputStyle}
                value={statusSelecionado}
                onChange={(e) => setStatusSelecionado(e.target.value)}
              >
                <option value="">Selecione...</option>
                {listaStatus.map((st) => (
                  <option key={st.id} value={st.descricao}>
                    {st.descricao}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={formRowStyle}>
            <div style={labelContainerStyle}>
              <label style={labelStyle}>Data Prog. Subida Início:</label>
              <input
                type="date"
                value={dataProgSubidaInicio}
                onChange={(e) => setDataProgSubidaInicio(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={labelContainerStyle}>
              <label style={labelStyle}>Data Prog. Subida Fim:</label>
              <input
                type="date"
                value={dataProgSubidaFim}
                onChange={(e) => setDataProgSubidaFim(e.target.value)}
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

      {/* MENSAGENS DE FEEDBACK */}
      {loading && <p style={{ fontStyle: "italic" }}>Carregando...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* TABELA DE RESULTADOS */}
      {requisicoes.length > 0 && (
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0, marginBottom: "16px" }}>Requisições Encontradas</h2>
          <table style={tableStyle}>
            <thead>
              <tr style={tableHeaderStyle}>
                <th style={thtdStyle}>ID</th>
                <th style={thtdStyle}>Data Criação</th>
                <th style={thtdStyle}>Empresa</th>
                <th style={thtdStyle}>Usuário Criado</th>
                <th style={thtdStyle}>Status</th>
                <th style={thtdStyle}>Data Prog. Subida</th>
                <th style={thtdStyle}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {requisicoes.map((req, index) => (
                <tr
                  key={req.id}
                  // Zebra stripes: cor de fundo diferente para linhas pares e ímpares
                  style={{
                    backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#ffffff"
                  }}
                >
                  <td style={thtdStyle}>{req.id}</td>
                  <td style={thtdStyle}>
                    {new Date(req.data_criacao).toLocaleDateString("pt-BR")}
                  </td>
                  <td style={thtdStyle}>{req.empresa?.nome || "N/A"}</td>
                  <td style={thtdStyle}>{req.usuario_criador?.nome || "N/A"}</td>
                  <td style={thtdStyle}>{req.status?.descricao || "N/A"}</td>
                  <td style={thtdStyle}>
                    {req.data_programacao_subida
                      ? new Date(req.data_programacao_subida).toLocaleDateString("pt-BR")
                      : ""}
                  </td>
                  <td style={thtdStyle}>
                    <div style={actionButtonContainer}>
                      <button style={baixarButtonStyle} onClick={() => handleBaixarClick(req.id)}>
                        Baixar Itens
                      </button>
                      <button
                        style={visualizarButtonStyle}
                        onClick={() => navigate(`/visualizar-requisicao?reqId=${req.id}`)}
                      >
                        Visualizar
                      </button>
                      <button
                        style={acessarButtonStyle}
                        onClick={() => handleAcessarClick(req.id)}
                      >
                        Aprovação
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default FilterRequisicoes;
