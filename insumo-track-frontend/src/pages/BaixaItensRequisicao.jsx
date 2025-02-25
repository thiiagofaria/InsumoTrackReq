import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useSearchParams, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL; // Pega do .env


const BaixaItensRequisicao = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [reqId, setReqId] = useState("");
  const [requisicao, setRequisicao] = useState(null);
  const [baixasInput, setBaixasInput] = useState({}); // { item_id: novaBaixa }
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resumo, setResumo] = useState(null); // exibe resumo da baixa

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
    marginTop: "20px",
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

  const inputStyle = {
    padding: "6px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    width: "70px",
    textAlign: "center",
    fontSize: "0.95rem"
  };

  // ======================================================
  // useEffect: pegar reqId da query string e buscar a requisição
  // ======================================================
  useEffect(() => {
    const paramId = searchParams.get("reqId");
    if (paramId) {
      setReqId(paramId);
      handleBuscar(paramId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // ======================================================
  // Buscar a requisição
  // ======================================================
  const handleBuscar = async (forcadoId = null) => {
    const idBusca = forcadoId || reqId;
    if (!idBusca) return;
    setLoading(true);
    setError("");
    setRequisicao(null);
    setBaixasInput({});
    setResumo(null);

    try {
      const res = await fetch(`${API_URL}/requisicoes/${idBusca}`, {
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

      // Permite somente requisições aprovadas (status_id = 2)
      if (data.status_id !== 2) {
        throw new Error(
          data.status_id === 1
            ? "A requisição está pendente e não pode ser baixada."
            : "A requisição foi reprovada e não pode ser baixada."
        );
      }
      setRequisicao(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // Calcula total baixado e saldo
  // ======================================================
  const calcularBaixasESaldo = (item) => {
    const totalBaixado = item.baixas
      ? item.baixas.reduce((acc, baixa) => acc + baixa.quantidade_baixada, 0)
      : 0;
    const saldoAtual = item.quantidade_requisitada - totalBaixado;
    return { totalBaixado, saldoAtual };
  };

  // ======================================================
  // Atualiza o valor de nova baixa no estado
  // ======================================================
  const handleInputBaixa = (itemId, value, saldoAtual) => {
    const novaBaixa = parseFloat(value);
    if (isNaN(novaBaixa) || novaBaixa < 0) return;
    if (novaBaixa > saldoAtual) {
      alert("A quantidade para baixa não pode ser maior que o saldo atual.");
      return;
    }
    setBaixasInput({ ...baixasInput, [itemId]: novaBaixa });
  };

  // ======================================================
  // Realiza a baixa
  // ======================================================
  const handleRealizarBaixa = async () => {
    if (!requisicao) return;

    // Monta o payload com as baixas informadas (> 0)
    const payload = requisicao.itens
      .filter((item) => {
        const novaBaixa = baixasInput[item.id];
        return novaBaixa && novaBaixa > 0;
      })
      .map((item) => ({
        requisicao_id: requisicao.id,
        item_requisicao_id: item.id,
        usuario_baixa_id: user.id,
        quantidade_baixada: parseFloat(baixasInput[item.id]),
      }));

    if (payload.length === 0) {
      alert("Nenhuma quantidade para baixa foi informada.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/requisicoes/${requisicao.id}/baixa`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Erro ao realizar a baixa");
      }
      // "result" é a lista dos itens baixados, cada um com data_baixa
      const result = await res.json();
      setResumo(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // Voltar para a lista de requisições
  // ======================================================
  const handleVoltar = () => {
    navigate("/filtrar-requisicoes");
  };

  // ======================================================
  // Renderiza o resumo para impressão
  // ======================================================
  const renderResumoImpressao = () => {
    const itensResumo = resumo.map((baixa) => {
      const itemEncontrado = requisicao.itens.find(
        (it) => it.id === baixa.item_requisicao_id
      );
      return {
        descricao: itemEncontrado ? itemEncontrado.descricao : "N/A",
        quantidade_baixada: baixa.quantidade_baixada,
        data_baixa: baixa.data_baixa,
        local_aplicacao: itemEncontrado ? itemEncontrado.local_aplicacao : "N/A",
      };
    });
  

    return (
      <div>
        <h2 style={{ marginTop: 0 }}>Detalhes da Requisição</h2>
        <p><strong>ID:</strong> {requisicao.id}</p>
        <p>
          <strong>Data:</strong>{" "}
          {new Date(requisicao.data_criacao).toLocaleString("pt-BR", {
            timeZone: "America/Sao_Paulo",
          })}
        </p>
        <p>
          <strong>Usuário Criador:</strong> {requisicao.usuario_criador?.nome || "N/A"}
        </p>
        <p>
          <strong>Empresa:</strong> {requisicao.empresa?.nome || "N/A"}
        </p>
        <p>
          <strong>Observação da Requisição:</strong> {requisicao.justificativa || "N/A"}
        </p>

        <h3>Itens Baixados</h3>
        <table style={tableStyle}>
          <thead>
            <tr style={tableHeaderStyle}>
              <th style={thtdStyle}>Material</th>
              <th style={thtdStyle}>Quantidade Baixada</th>
              <th style={thtdStyle}>Local de Aplicação</th>
              <th style={thtdStyle}>Data/Hora da Baixa</th>
            </tr>
          </thead>
          <tbody>
            {itensResumo.map((item, index) => (
              <tr
                key={index}
                style={{
                  backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#ffffff"
                }}
              >
                <td style={thtdStyle}>{item.descricao}</td>
                <td style={thtdStyle}>{item.quantidade_baixada}</td>
                <td style={thtdStyle}>{item.local_aplicacao}</td>
                <td style={thtdStyle}>
                  {new Date(item.data_baixa).toLocaleString("pt-BR", {
                    timeZone: "America/Sao_Paulo",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // ======================================================
  // Render principal
  // ======================================================
  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>Baixa de Itens da Requisição</h1>

      {loading && <p style={{ fontStyle: "italic" }}>Carregando...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Se a requisição não está carregada e não há erro, exibimos um aviso */}
      {!requisicao && !loading && !error && (
        <p>Nenhuma requisição carregada. Volte e selecione uma requisição.</p>
      )}

      {/* Se houver resumo, mostra a tela de impressão */}
      {resumo ? (
        <div style={cardStyle}>
          {renderResumoImpressao()}
          <div style={{ marginTop: "20px" }}>
            <button
              onClick={() => window.print()}
              style={buttonStyle}
            >
              Imprimir Resumo
            </button>
            <button onClick={handleVoltar} style={buttonStyle}>
              Voltar
            </button>
          </div>
        </div>
      ) : (
        // Senão, exibe a tela normal de baixa
        requisicao && (
          <div style={cardStyle}>
            <button onClick={handleVoltar} style={buttonStyle}>
              Voltar
            </button>

            <h2 style={{ marginTop: "16px" }}>Detalhes da Requisição</h2>
            <p><strong>ID:</strong> {requisicao.id}</p>
            <p>
              <strong>Data:</strong>{" "}
              {new Date(requisicao.data_criacao).toLocaleString("pt-BR", {
                timeZone: "America/Sao_Paulo",
              })}
            </p>
            <p>
              <strong>Usuário Criador:</strong> {requisicao.usuario_criador?.nome || "N/A"}
            </p>
            <p>
              <strong>Empresa:</strong> {requisicao.empresa?.nome || "N/A"}
            </p>
            <p>
              <strong>Observação da Requisição:</strong> {requisicao.justificativa || "N/A"}
            </p>

            <h3 style={{ marginTop: "20px" }}>Itens da Requisição</h3>
            {requisicao.itens && requisicao.itens.length > 0 ? (
              <table style={tableStyle}>
                <thead>
                  <tr style={tableHeaderStyle}>
                    <th style={thtdStyle}>Grupo de Serviço</th>
                    <th style={thtdStyle}>Material</th>
                    <th style={thtdStyle}>Unidade</th>
                    <th style={{ ...thtdStyle, textAlign: "center" }}>Qtd Requisitada</th>
                    <th style={thtdStyle}>Local de Aplicação</th>
                    <th style={{ ...thtdStyle, textAlign: "center" }}>Total Baixado</th>
                    <th style={{ ...thtdStyle, textAlign: "center" }}>Saldo Atual</th>
                    <th style={{ ...thtdStyle, textAlign: "center" }}>Nova Baixa</th>
                    <th style={{ ...thtdStyle, textAlign: "center" }}>Novo Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {requisicao.itens.map((item, index) => {
                    const { totalBaixado, saldoAtual } = calcularBaixasESaldo(item);
                    const novaBaixa = baixasInput[item.id] || 0;
                    const novoSaldo = saldoAtual - novaBaixa;

                    return (
                      <tr
                        key={index}
                        style={{
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
                        <td style={{ ...thtdStyle, textAlign: "center" }}>
                          {totalBaixado}
                        </td>
                        <td style={{ ...thtdStyle, textAlign: "center" }}>
                          {saldoAtual}
                        </td>
                        <td style={{ ...thtdStyle, textAlign: "center" }}>
                          <input
                            type="number"
                            min="0"
                            max={saldoAtual}
                            value={novaBaixa}
                            onChange={(e) =>
                              handleInputBaixa(item.id, e.target.value, saldoAtual)
                            }
                            style={inputStyle}
                          />
                        </td>
                        <td style={{ ...thtdStyle, textAlign: "center" }}>
                          {novoSaldo}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p>Nenhum item encontrado.</p>
            )}

            <div style={{ marginTop: "20px" }}>
              <button onClick={handleRealizarBaixa} style={buttonStyle}>
                Realizar Baixa
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default BaixaItensRequisicao;
