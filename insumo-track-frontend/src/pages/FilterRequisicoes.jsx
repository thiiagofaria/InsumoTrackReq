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

  // Estilos simples
  const containerStyle = { maxWidth: "900px", margin: "30px auto", fontFamily: "sans-serif" };
  const cardStyle = { border: "1px solid #ddd", borderRadius: "6px", padding: "16px", marginBottom: "20px" };
  const formRowStyle = { display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "12px" };
  const labelContainerStyle = { display: "flex", flexDirection: "column", flex: "1 1 200px" };
  const inputStyle = { padding: "6px", borderRadius: "4px", border: "1px solid #ccc" };
  const buttonStyle = { padding: "8px 16px", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" };
  const thtdStyle = { border: "1px solid #ccc", padding: "8px", textAlign: "left" };

  // Carregar listas de empresas e status
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

  // Função para filtrar requisições
  const handleFilter = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setRequisicoes([]);

    // Cria os parâmetros da query
    const params = new URLSearchParams();

    // Se o número da requisição estiver preenchido, ele tem prioridade
    // e todos os outros filtros são ignorados.
    if (numeroRequisicao.trim() !== "") {
      params.append("req_id", numeroRequisicao.trim());
    } else {
      // Caso contrário, aplica os demais filtros
      if (dataCriacaoInicio.trim() !== "") params.append("data_criacao_inicio", dataCriacaoInicio);
      if (dataCriacaoFim.trim() !== "") params.append("data_criacao_fim", dataCriacaoFim);
      if (empresaSelecionada.trim() !== "") params.append("empresa", empresaSelecionada);
      if (statusSelecionado.trim() !== "") params.append("status", statusSelecionado);
      if (dataProgSubidaInicio.trim() !== "") params.append("data_programacao_subida_inicio", dataProgSubidaInicio);
      if (dataProgSubidaFim.trim() !== "") params.append("data_programacao_subida_fim", dataProgSubidaFim);
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

  // Função para navegar para a tela de baixa
  const handleBaixarClick = (reqId) => {
    navigate(`/baixa-itens?reqId=${reqId}`);
  };

  return (
    <div style={containerStyle}>
      <h1 style={{ textAlign: "center", marginBottom: "1rem" }}>Filtrar Requisições</h1>

      {/* Formulário de Filtros */}
      <div style={cardStyle}>
        <form onSubmit={handleFilter}>
          {/* Linha 0: Número da Requisição */}
          <div style={formRowStyle}>
            <div style={labelContainerStyle}>
              <label>Número da Requisição:</label>
              <input
                type="text"
                value={numeroRequisicao}
                onChange={(e) => setNumeroRequisicao(e.target.value)}
                style={inputStyle}
                placeholder="Ex: 41"
              />
            </div>
          </div>
          {/* Linha 1: Data Criação Início/Fim */}
          <div style={formRowStyle}>
            <div style={labelContainerStyle}>
              <label>Data Criação Início:</label>
              <input
                type="date"
                value={dataCriacaoInicio}
                onChange={(e) => setDataCriacaoInicio(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={labelContainerStyle}>
              <label>Data Criação Fim:</label>
              <input
                type="date"
                value={dataCriacaoFim}
                onChange={(e) => setDataCriacaoFim(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Linha 2: Empresa / Status */}
          <div style={formRowStyle}>
            <div style={labelContainerStyle}>
              <label>Empresa:</label>
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
              <label>Status:</label>
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

          {/* Linha 3: Data Prog. Subida Início/Fim */}
          <div style={formRowStyle}>
            <div style={labelContainerStyle}>
              <label>Data Prog. Subida Início:</label>
              <input
                type="date"
                value={dataProgSubidaInicio}
                onChange={(e) => setDataProgSubidaInicio(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={labelContainerStyle}>
              <label>Data Prog. Subida Fim:</label>
              <input
                type="date"
                value={dataProgSubidaFim}
                onChange={(e) => setDataProgSubidaFim(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Botão Filtrar */}
          <div style={{ textAlign: "right" }}>
            <button type="submit" style={buttonStyle}>
              Filtrar
            </button>
          </div>
        </form>
      </div>

      {/* Mensagens de loading e erro */}
      {loading && <p>Carregando...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Exibição dos resultados */}
      {requisicoes.length > 0 && (
        <div style={cardStyle}>
          <h2>Requisições Encontradas</h2>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#007bff", color: "#fff", textAlign: "left" }}>
                <th style={thtdStyle}>ID</th>
                <th style={thtdStyle}>Data Criação</th>
                <th style={thtdStyle}>Empresa</th>
                <th style={thtdStyle}>Status</th>
                <th style={thtdStyle}>Data Prog. Subida</th>
                <th style={thtdStyle}>Observação</th>
                <th style={thtdStyle}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {requisicoes.map((req) => (
                <tr key={req.id}>
                  <td style={thtdStyle}>{req.id}</td>
                  <td style={thtdStyle}>
                    {new Date(req.data_criacao).toLocaleString("pt-BR")}
                  </td>
                  <td style={thtdStyle}>{req.empresa?.nome || "N/A"}</td>
                  <td style={thtdStyle}>{req.status?.descricao || "N/A"}</td>
                  <td style={thtdStyle}>{req.data_programacao_subida || ""}</td>
                  <td style={thtdStyle}>{req.justificativa || ""}</td>
                  <td style={thtdStyle}>
                    <button
                      style={buttonStyle}
                      onClick={() => handleBaixarClick(req.id)}
                    >
                      Baixar
                    </button>
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
